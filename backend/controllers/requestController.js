const BloodRequest = require('../models/BloodRequest');
const DonorProfile = require('../models/DonorProfile');
const User = require('../models/User');
const { scoreAndRankDonors } = require('../services/matchingService');
const { recordAuditLog } = require('../services/auditService');
const { createNotification, notifyMatchingDonors } = require('../services/notificationService');

// @desc    Submit a new blood request
// @route   POST /api/requests
// @access  Private (requester, donor, admin)
const createBloodRequest = async (req, res, next) => {
  try {
    const {
      patientName,
      bloodGroup,
      unitsRequired,
      hospitalName,
      hospitalAddress,
      city,
      urgency = 'Normal',
      requiredDate,
      contactName,
      contactPhone,
      reason
    } = req.body;

    const bloodRequest = await BloodRequest.create({
      requester: req.user._id,
      patientName,
      bloodGroup,
      unitsRequired: Number(unitsRequired),
      hospitalName,
      hospitalAddress,
      city,
      urgency,
      requiredDate,
      contactName,
      contactPhone,
      reason
    });

    await recordAuditLog({
      action: 'BLOOD_REQUEST_CREATED',
      user: req.user,
      targetEntity: 'BloodRequest',
      targetId: bloodRequest._id.toString(),
      details: {
        requestId: bloodRequest.requestId,
        bloodGroup,
        unitsRequired,
        urgency,
        hospitalName
      }
    });

    // Notify user confirmation
    await createNotification({
      recipient: req.user._id,
      title: `Blood Request ${bloodRequest.requestId} Submitted`,
      message: `Your request for ${unitsRequired} unit(s) of ${bloodGroup} at ${hospitalName} is currently in review.`,
      type: 'REQUEST_UPDATE',
      relatedEntity: 'BloodRequest',
      relatedId: bloodRequest.requestId
    });

    // Match candidate donors in background and alert if urgent/critical
    try {
      const allDonors = await DonorProfile.find({ isAvailable: true }).populate('user');
      const ranked = scoreAndRankDonors(bloodRequest, allDonors);
      if (urgency === 'Urgent' || urgency === 'Critical') {
        await notifyMatchingDonors({ request: bloodRequest, donors: ranked });
      }
    } catch (matchErr) {
      console.warn('Non-blocking matching alert notification error:', matchErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Blood request submitted successfully and queued for review.',
      bloodRequest,
      request: bloodRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's blood requests with pagination and filters
// @route   GET /api/requests/my
// @access  Private
const getMyRequests = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = { requester: req.user._id };
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await BloodRequest.countDocuments(query);
    const requests = await BloodRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a pending blood request
// @route   PATCH /api/requests/:id/cancel
// @access  Private (Owner or Admin)
const cancelBloodRequest = async (req, res, next) => {
  try {
    const { cancellationReason = 'Cancelled by requester' } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.'
      });
    }

    // Permission check: only owner or admin can cancel
    const isOwner = request.requester.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this blood request.'
      });
    }

    // Only Pending or Approved requests can be cancelled
    if (['Fulfilled', 'Rejected', 'Cancelled'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${request.status}.`
      });
    }

    request.status = 'Cancelled';
    request.cancelledDate = new Date();
    request.cancellationReason = cancellationReason;
    await request.save();

    await recordAuditLog({
      action: 'BLOOD_REQUEST_CANCELLED',
      user: req.user,
      targetEntity: 'BloodRequest',
      targetId: request._id.toString(),
      details: { requestId: request.requestId, cancellationReason }
    });

    await createNotification({
      recipient: request.requester,
      title: `Blood Request ${request.requestId} Cancelled`,
      message: `Your blood request has been successfully cancelled.`,
      type: 'REQUEST_UPDATE',
      relatedEntity: 'BloodRequest',
      relatedId: request.requestId
    });

    res.status(200).json({
      success: true,
      message: 'Blood request cancelled successfully.',
      request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public urgent blood requests (for homepage ticker)
// @route   GET /api/requests/urgent
// @access  Public
const getUrgentPublicRequests = async (req, res, next) => {
  try {
    const urgentRequests = await BloodRequest.find({
      status: { $in: ['Pending', 'Approved'] },
      urgency: { $in: ['Urgent', 'Critical'] }
    })
      .select('requestId patientName bloodGroup unitsRequired hospitalName city urgency requiredDate createdAt')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: urgentRequests.length,
      requests: urgentRequests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single request details with matched donors
// @route   GET /api/requests/:id
// @access  Private
const getRequestDetails = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone city')
      .populate('approvedBy', 'name');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.'
      });
    }

    // Load candidate donors for matching
    const allDonors = await DonorProfile.find()
      .populate('user', 'name phone email city state status');

    const matchedDonors = scoreAndRankDonors(request, allDonors);

    res.status(200).json({
      success: true,
      request,
      matchedDonors
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBloodRequest,
  getMyRequests,
  cancelBloodRequest,
  getUrgentPublicRequests,
  getRequestDetails
};
