const BloodRequest = require('../models/BloodRequest');
const BloodInventory = require('../models/BloodInventory');
const InventoryTransaction = require('../models/InventoryTransaction');
const DonationRecord = require('../models/DonationRecord');
const DonorProfile = require('../models/DonorProfile');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { recordAuditLog } = require('../services/auditService');
const { executeWithTransactionOrFallback } = require('../services/transactionService');
const { createNotification } = require('../services/notificationService');

// @desc    Get all blood requests with filtering, search, pagination, and sorting
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getAllRequests = async (req, res, next) => {
  try {
    const {
      status,
      bloodGroup,
      urgency,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (urgency) query.urgency = urgency;
    if (search) {
      query.$or = [
        { requestId: { $regex: search.trim(), $options: 'i' } },
        { patientName: { $regex: search.trim(), $options: 'i' } },
        { hospitalName: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await BloodRequest.countDocuments(query);
    const requests = await BloodRequest.find(query)
      .populate('requester', 'name email phone')
      .populate('approvedBy', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve a blood request
// @route   PATCH /api/admin/requests/:id/approve
// @access  Private (Admin)
const approveRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending requests can be approved. Current status: ${request.status}`
      });
    }

    request.status = 'Approved';
    request.approvedBy = req.user._id;
    request.approvalDate = new Date();
    await request.save();

    await recordAuditLog({
      action: 'REQUEST_APPROVED',
      user: req.user,
      targetEntity: 'BloodRequest',
      targetId: request._id.toString(),
      details: { requestId: request.requestId, bloodGroup: request.bloodGroup }
    });

    // Notify requester
    await createNotification({
      recipient: request.requester,
      title: `Blood Request ${request.requestId} Approved`,
      message: `Your request for ${request.unitsRequired} unit(s) of ${request.bloodGroup} at ${request.hospitalName} has been approved by blood bank staff.`,
      type: 'REQUEST_UPDATE',
      relatedEntity: 'BloodRequest',
      relatedId: request.requestId
    });

    res.status(200).json({
      success: true,
      message: `Request ${request.requestId} has been approved.`,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject a blood request with mandatory reason
// @route   PATCH /api/admin/requests/:id/reject
// @access  Private (Admin)
const rejectRequest = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory when rejecting a blood request.'
      });
    }

    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (['Fulfilled', 'Cancelled'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject a request that is already ${request.status}.`
      });
    }

    request.status = 'Rejected';
    request.rejectionReason = rejectionReason.trim();
    await request.save();

    await recordAuditLog({
      action: 'REQUEST_REJECTED',
      user: req.user,
      targetEntity: 'BloodRequest',
      targetId: request._id.toString(),
      details: { requestId: request.requestId, rejectionReason }
    });

    // Notify requester
    await createNotification({
      recipient: request.requester,
      title: `Blood Request ${request.requestId} Rejected`,
      message: `Your blood request was reviewed and rejected. Reason: "${rejectionReason.trim()}".`,
      type: 'REQUEST_UPDATE',
      relatedEntity: 'BloodRequest',
      relatedId: request.requestId
    });

    res.status(200).json({
      success: true,
      message: `Request ${request.requestId} has been rejected.`,
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fulfill request (deducts stock atomically within transaction or atomic fallback)
// @route   PATCH /api/admin/requests/:id/fulfill
// @access  Private (Admin)
const fulfillRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;

    // Check existing request before transaction
    const initialRequest = await BloodRequest.findById(requestId);
    if (!initialRequest) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (initialRequest.status === 'Fulfilled') {
      return res.status(400).json({
        success: false,
        message: 'This blood request has already been fulfilled. Duplicate fulfillment prevented.'
      });
    }

    if (['Rejected', 'Cancelled'].includes(initialRequest.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot fulfill a ${initialRequest.status} request.`
      });
    }

    const units = initialRequest.unitsRequired;
    const bloodGroup = initialRequest.bloodGroup;

    const result = await executeWithTransactionOrFallback(async (session) => {
      const opts = session ? { session } : {};

      // 1. Re-check request under session to prevent concurrent race condition double fulfillment
      const requestInSession = await BloodRequest.findOne(
        { _id: requestId, status: { $ne: 'Fulfilled' } },
        null,
        opts
      );

      if (!requestInSession) {
        const err = new Error('Request has already been fulfilled or was modified concurrently.');
        err.statusCode = 400;
        throw err;
      }

      // 2. Atomic inventory deduction with $gte constraint
      const updatedInventory = await BloodInventory.findOneAndUpdate(
        { bloodGroup, unitsAvailable: { $gte: units } },
        {
          $inc: { unitsAvailable: -units },
          $set: { lastUpdated: new Date(), lastUpdatedBy: req.user._id }
        },
        { new: false, ...opts }
      );

      if (!updatedInventory) {
        const stock = await BloodInventory.findOne({ bloodGroup }, null, opts);
        const currentAvailable = stock ? stock.unitsAvailable : 0;
        const err = new Error(
          `Insufficient blood stock. Required: ${units} units of ${bloodGroup}, Available: ${currentAvailable} units.`
        );
        err.statusCode = 400;
        throw err;
      }

      const previousStock = updatedInventory.unitsAvailable;
      const newStock = previousStock - units;

      // 3. Mark request fulfilled
      requestInSession.status = 'Fulfilled';
      requestInSession.fulfilledDate = new Date();
      await requestInSession.save(opts);

      // 4. Create immutable inventory transaction
      const [transaction] = await InventoryTransaction.create(
        [
          {
            bloodGroup,
            type: 'DEDUCTION',
            units,
            previousStock,
            newStock,
            reason: `Fulfilled blood request ${requestInSession.requestId} for patient ${requestInSession.patientName}`,
            relatedRequest: requestInSession._id,
            performedBy: req.user._id
          }
        ],
        opts
      );

      return { request: requestInSession, transaction, previousStock, newStock };
    });

    await recordAuditLog({
      action: 'REQUEST_FULFILLED',
      user: req.user,
      targetEntity: 'BloodRequest',
      targetId: result.request._id.toString(),
      details: {
        requestId: result.request.requestId,
        bloodGroup,
        units,
        previousStock: result.previousStock,
        newStock: result.newStock
      }
    });

    // Notify requester
    await createNotification({
      recipient: result.request.requester,
      title: `Blood Request ${result.request.requestId} Fulfilled!`,
      message: `${units} unit(s) of ${bloodGroup} blood have been issued from the blood bank for patient ${result.request.patientName}.`,
      type: 'REQUEST_UPDATE',
      relatedEntity: 'BloodRequest',
      relatedId: result.request.requestId
    });

    res.status(200).json({
      success: true,
      message: `Request ${result.request.requestId} successfully fulfilled. ${units} unit(s) deducted from ${bloodGroup} stock.`,
      request: result.request,
      inventoryRemaining: result.newStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donation records with pagination and filters
// @route   GET /api/admin/donations
// @access  Private (Admin)
const getAllDonations = async (req, res, next) => {
  try {
    const { status, bloodGroup, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await DonationRecord.countDocuments(query);
    const donations = await DonationRecord.find(query)
      .populate('donor', 'name email phone city')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: donations.length,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve donation (adds unit to inventory and updates donor profile in atomic transaction)
// @route   PATCH /api/admin/donations/:id/approve
// @access  Private (Admin)
const approveDonation = async (req, res, next) => {
  try {
    const donationId = req.params.id;

    const initialDonation = await DonationRecord.findById(donationId);
    if (!initialDonation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    if (initialDonation.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending donations can be approved. Current status: ${initialDonation.status}`
      });
    }

    const units = initialDonation.units || 1;
    const bloodGroup = initialDonation.bloodGroup;

    const result = await executeWithTransactionOrFallback(async (session) => {
      const opts = session ? { session } : {};

      // 1. Add units to blood inventory
      let item = await BloodInventory.findOne({ bloodGroup }, null, opts);
      if (!item) {
        item = new BloodInventory({ bloodGroup, unitsAvailable: 0 });
      }

      const previousStock = item.unitsAvailable;
      const newStock = previousStock + units;

      item.unitsAvailable = newStock;
      item.lastUpdated = new Date();
      item.lastUpdatedBy = req.user._id;
      await item.save(opts);

      // 2. Update donation record
      const donationInSession = await DonationRecord.findById(donationId, null, opts);
      donationInSession.status = 'Approved';
      donationInSession.reviewedBy = req.user._id;
      donationInSession.inventoryUpdated = true;
      await donationInSession.save(opts);

      // 3. Update donor profile
      await DonorProfile.findByIdAndUpdate(
        donationInSession.donorProfile,
        {
          $set: { lastDonationDate: new Date() },
          $inc: { totalDonations: 1 }
        },
        opts
      );

      // 4. Record inventory transaction
      const [transaction] = await InventoryTransaction.create(
        [
          {
            bloodGroup,
            type: 'ADDITION',
            units,
            previousStock,
            newStock,
            reason: `Verified donor donation ${donationInSession.donationId}`,
            relatedDonation: donationInSession._id,
            performedBy: req.user._id
          }
        ],
        opts
      );

      return { donation: donationInSession, transaction, previousStock, newStock };
    });

    await recordAuditLog({
      action: 'DONATION_APPROVED',
      user: req.user,
      targetEntity: 'DonationRecord',
      targetId: result.donation._id.toString(),
      details: {
        donationId: result.donation.donationId,
        bloodGroup,
        units,
        previousStock: result.previousStock,
        newStock: result.newStock
      }
    });

    // Notify donor
    await createNotification({
      recipient: result.donation.donor,
      title: `Blood Donation ${result.donation.donationId} Approved!`,
      message: `Your voluntary blood donation has been verified and added to the official blood bank inventory. Thank you for saving lives!`,
      type: 'DONATION_UPDATE',
      relatedEntity: 'DonationRecord',
      relatedId: result.donation.donationId
    });

    res.status(200).json({
      success: true,
      message: `Donation ${result.donation.donationId} approved. ${units} unit(s) added to ${bloodGroup} stock.`,
      donation: result.donation,
      newStock: result.newStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject donation with reason
// @route   PATCH /api/admin/donations/:id/reject
// @access  Private (Admin)
const rejectDonation = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A rejection reason is mandatory (e.g. low hemoglobin, medical deferral).'
      });
    }

    const donation = await DonationRecord.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation record not found.' });
    }

    if (donation.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Only pending donations can be rejected. Current status: ${donation.status}`
      });
    }

    donation.status = 'Rejected';
    donation.reviewedBy = req.user._id;
    donation.rejectionReason = rejectionReason.trim();
    await donation.save();

    await recordAuditLog({
      action: 'DONATION_REJECTED',
      user: req.user,
      targetEntity: 'DonationRecord',
      targetId: donation._id.toString(),
      details: { donationId: donation.donationId, rejectionReason }
    });

    // Notify donor
    await createNotification({
      recipient: donation.donor,
      title: `Blood Donation ${donation.donationId} Review Status`,
      message: `Your donation entry was reviewed. Note: "${rejectionReason.trim()}".`,
      type: 'DONATION_UPDATE',
      relatedEntity: 'DonationRecord',
      relatedId: donation.donationId
    });

    res.status(200).json({
      success: true,
      message: `Donation ${donation.donationId} has been rejected.`,
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all donors for admin management with pagination
// @route   GET /api/admin/donors
// @access  Private (Admin)
const getAllDonors = async (req, res, next) => {
  try {
    const { bloodGroup, city, availability, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (city) query.city = { $regex: new RegExp(city.trim(), 'i') };
    if (availability !== undefined && availability !== '') {
      query.isAvailable = availability === 'true';
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await DonorProfile.countDocuments(query);
    const donors = await DonorProfile.find(query)
      .populate('user', 'name email phone city state status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: donors.length,
      donors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users with pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (e.g. active, inactive, suspended)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user status. Allowed: active, inactive, suspended.'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Protect self-deactivation of logged-in admin
    if (user._id.toString() === req.user._id.toString() && status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account.'
      });
    }

    user.status = status;
    if (status !== 'active') {
      user.tokensInvalidBefore = new Date(); // Revoke active sessions
    }
    await user.save();

    await recordAuditLog({
      action: 'USER_STATUS_UPDATED',
      user: req.user,
      targetEntity: 'User',
      targetId: user._id.toString(),
      details: { targetEmail: user.email, newStatus: status }
    });

    res.status(200).json({
      success: true,
      message: `User ${user.email} status updated to ${status}.`,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audit logs with pagination and search
// @route   GET /api/admin/audit-logs
// @access  Private (Admin)
const getAuditLogs = async (req, res, next) => {
  try {
    const { search, action, page = 1, limit = 50 } = req.query;

    const query = {};
    if (action) query.action = action;
    if (search) {
      query.$or = [
        { action: { $regex: search.trim(), $options: 'i' } },
        { userEmail: { $regex: search.trim(), $options: 'i' } },
        { targetEntity: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: logs.length,
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRequests,
  approveRequest,
  rejectRequest,
  fulfillRequest,
  getAllDonations,
  approveDonation,
  rejectDonation,
  getAllDonors,
  getAllUsers,
  updateUserStatus,
  getAuditLogs
};
