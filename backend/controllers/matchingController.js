const BloodRequest = require('../models/BloodRequest');
const DonorProfile = require('../models/DonorProfile');
const {
  scoreAndRankDonors,
  getCompatibleDonorGroups,
  RBC_COMPATIBILITY_RECIPIENT,
  RBC_COMPATIBILITY_DONOR
} = require('../services/matchingService');

// @desc    Match donors for a specific blood request ID
// @route   GET /api/matching/request/:id
// @access  Private (Requester, Admin)
const matchDonorsForRequest = async (req, res, next) => {
  try {
    const bloodRequest = await BloodRequest.findById(req.params.id);
    if (!bloodRequest) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.'
      });
    }

    // Find all donors with user info
    const donors = await DonorProfile.find()
      .populate('user', 'name phone email city state status');

    const rankedDonors = scoreAndRankDonors(bloodRequest, donors);

    res.status(200).json({
      success: true,
      request: bloodRequest,
      recipientBloodGroup: bloodRequest.bloodGroup,
      compatibleGroups: getCompatibleDonorGroups(bloodRequest.bloodGroup),
      totalMatches: rankedDonors.length,
      donors: rankedDonors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match donors by custom input criteria (e.g. blood group, city, urgency)
// @route   POST /api/matching/find
// @access  Public / Private
const matchDonorsByCriteria = async (req, res, next) => {
  try {
    const { bloodGroup, city = '', urgency = 'Normal' } = req.body;

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Please provide recipient bloodGroup.'
      });
    }

    const donors = await DonorProfile.find()
      .populate('user', 'name phone email city state status');

    const fakeRequest = { bloodGroup, city, urgency };
    const rankedDonors = scoreAndRankDonors(fakeRequest, donors);

    const isAuthenticated = Boolean(req.user);

    // Sanitize phone numbers if unauthenticated
    const sanitizedResults = rankedDonors.map((item) => {
      const u = item.donor.user || {};
      return {
        ...item,
        donor: {
          ...item.donor.toObject(),
          user: {
            name: u.name,
            city: u.city,
            state: u.state,
            phone: isAuthenticated
              ? u.phone
              : u.phone
                ? `${u.phone.slice(0, 3)}****${u.phone.slice(-3)}`
                : 'Log in to view'
          }
        }
      };
    });

    res.status(200).json({
      success: true,
      recipientBloodGroup: bloodGroup,
      compatibleGroups: getCompatibleDonorGroups(bloodGroup),
      totalMatches: sanitizedResults.length,
      donors: sanitizedResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete RBC compatibility matrix
// @route   GET /api/matching/compatibility-matrix
// @access  Public
const getCompatibilityMatrix = async (req, res) => {
  res.status(200).json({
    success: true,
    title: 'Red Blood Cell (RBC) ABO & Rh Compatibility Matrix',
    disclaimer:
      'This matrix represents standard Red Blood Cell compatibility. It is strictly for reference and does not guarantee medical eligibility or safe transfusion without physical examination, infectious disease screening, and laboratory cross-matching.',
    recipientCompatibility: RBC_COMPATIBILITY_RECIPIENT,
    donorCompatibility: RBC_COMPATIBILITY_DONOR
  });
};

module.exports = {
  matchDonorsForRequest,
  matchDonorsByCriteria,
  getCompatibilityMatrix
};
