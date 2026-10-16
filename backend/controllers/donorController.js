const DonorProfile = require('../models/DonorProfile');
const DonationRecord = require('../models/DonationRecord');
const BloodRequest = require('../models/BloodRequest');
const {
  isRBCCompatible,
  checkDonationEligibility,
  RBC_COMPATIBILITY_DONOR
} = require('../services/matchingService');
const { recordAuditLog } = require('../services/auditService');

// @desc    Search public donors with bloodGroup, city, availability filters
// @route   GET /api/donors/search
// @access  Public
const searchDonors = async (req, res, next) => {
  try {
    const { bloodGroup, city, availability } = req.query;

    const query = {};
    if (bloodGroup) {
      query.bloodGroup = bloodGroup.replace(/\s+/g, '+').trim();
    }
    if (city) {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }
    if (availability !== undefined && availability !== '') {
      query.isAvailable = availability === 'true';
    }

    const donors = await DonorProfile.find(query)
      .populate('user', 'name city state status phone email')
      .sort({ updatedAt: -1 })
      .limit(50);

    // Format output and mask phone number for unauthenticated users
    const isAuthenticated = Boolean(req.user);
    const sanitizedDonors = donors
      .filter((d) => d.user && d.user.status === 'active')
      .map((d) => {
        const eligibility = checkDonationEligibility(d.lastDonationDate);
        return {
          id: d._id,
          name: d.user.name,
          bloodGroup: d.bloodGroup,
          city: d.city || d.user.city,
          state: d.user.state,
          gender: d.gender,
          age: d.age,
          isAvailable: d.isAvailable,
          lastDonationDate: d.lastDonationDate,
          eligibilityStatus: d.eligibilityStatus,
          eligibilityMessage: eligibility.message,
          isEligible: eligibility.isEligible,
          // Mask phone if not logged in
          phone: isAuthenticated
            ? d.user.phone
            : d.user.phone
              ? `${d.user.phone.slice(0, 3)}****${d.user.phone.slice(-3)}`
              : 'Log in to view'
        };
      });

    res.status(200).json({
      success: true,
      count: sanitizedDonors.length,
      donors: sanitizedDonors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current donor's profile
// @route   GET /api/donors/profile/me
// @access  Private (Donor)
const getMyDonorProfile = async (req, res, next) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone city state'
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found.'
      });
    }

    const eligibility = checkDonationEligibility(profile.lastDonationDate);

    res.status(200).json({
      success: true,
      profile: {
        ...profile.toObject(),
        eligibilityCheck: eligibility
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle donor availability
// @route   PATCH /api/donors/availability
// @access  Private (Donor)
const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;

    if (isAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide isAvailable boolean.'
      });
    }

    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found.'
      });
    }

    profile.isAvailable = Boolean(isAvailable);
    await profile.save();

    await recordAuditLog({
      action: 'DONOR_AVAILABILITY_TOGGLED',
      user: req.user,
      targetEntity: 'DonorProfile',
      targetId: profile._id.toString(),
      details: { isAvailable: profile.isAvailable }
    });

    res.status(200).json({
      success: true,
      message: `Availability updated to ${profile.isAvailable ? 'Available' : 'Unavailable'}.`,
      isAvailable: profile.isAvailable,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Donor submits a donation entry / appointment
// @route   POST /api/donors/donations
// @access  Private (Donor)
const submitDonation = async (req, res, next) => {
  try {
    const { hospitalOrCamp, units = 1, diseaseOrHealthNotes } = req.body;

    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found. Please complete donor registration.'
      });
    }

    // Eligibility check
    const eligibility = checkDonationEligibility(profile.lastDonationDate);
    if (!eligibility.isEligible) {
      return res.status(400).json({
        success: false,
        message: `Donation ineligible: ${eligibility.message}`
      });
    }

    const donation = await DonationRecord.create({
      donor: req.user._id,
      donorProfile: profile._id,
      bloodGroup: profile.bloodGroup,
      units: Number(units) || 1,
      hospitalOrCamp: hospitalOrCamp || 'Central Blood Bank & Donation Center',
      diseaseOrHealthNotes: diseaseOrHealthNotes || 'None reported'
    });

    await recordAuditLog({
      action: 'DONATION_RECORD_SUBMITTED',
      user: req.user,
      targetEntity: 'DonationRecord',
      targetId: donation._id.toString(),
      details: {
        bloodGroup: profile.bloodGroup,
        units,
        donationId: donation.donationId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Donation request submitted successfully. It will be verified by blood bank administrators.',
      donation
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current donor's donation history
// @route   GET /api/donors/donations/my
// @access  Private (Donor)
const getMyDonations = async (req, res, next) => {
  try {
    const donations = await DonationRecord.find({ donor: req.user._id })
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: donations.length,
      donations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active blood requests compatible with this donor
// @route   GET /api/donors/matching-requests
// @access  Private (Donor)
const getMatchingRequestsForDonor = async (req, res, next) => {
  try {
    const profile = await DonorProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found.'
      });
    }

    // Find recipient blood groups that this donor's blood can be given to
    const compatibleRecipientGroups = RBC_COMPATIBILITY_DONOR[profile.bloodGroup] || [];

    // Find pending or approved requests for those blood groups
    const requests = await BloodRequest.find({
      bloodGroup: { $in: compatibleRecipientGroups },
      status: { $in: ['Pending', 'Approved'] }
    })
      .populate('requester', 'name phone')
      .sort({ urgency: -1, createdAt: -1 })
      .limit(20);

    const formattedRequests = requests.map((r) => {
      const isExact = r.bloodGroup === profile.bloodGroup;
      const isSameCity = (r.city || '').toLowerCase() === (profile.city || '').toLowerCase();

      return {
        id: r._id,
        requestId: r.requestId,
        patientName: r.patientName,
        bloodGroup: r.bloodGroup,
        unitsRequired: r.unitsRequired,
        hospitalName: r.hospitalName,
        hospitalAddress: r.hospitalAddress,
        city: r.city,
        urgency: r.urgency,
        requiredDate: r.requiredDate,
        contactName: r.contactName,
        contactPhone: r.contactPhone,
        status: r.status,
        createdAt: r.createdAt,
        isExactMatch: isExact,
        isSameCity
      };
    });

    res.status(200).json({
      success: true,
      count: formattedRequests.length,
      donorBloodGroup: profile.bloodGroup,
      requests: formattedRequests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchDonors,
  getMyDonorProfile,
  updateAvailability,
  submitDonation,
  getMyDonations,
  getMatchingRequestsForDonor
};
