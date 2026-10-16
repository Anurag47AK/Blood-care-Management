const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  searchDonors,
  getMyDonorProfile,
  updateAvailability,
  submitDonation,
  getMyDonations,
  getMatchingRequestsForDonor
} = require('../controllers/donorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Optional auth helper to safely check if visitor is logged in for unmasking
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'blood_care_default_secret_key');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token failure for public route
    }
  }
  next();
};

// Public search
router.get('/search', optionalAuth, searchDonors);

// Donor protected routes
router.get('/profile/me', protect, authorize('donor'), getMyDonorProfile);
router.patch('/availability', protect, authorize('donor'), updateAvailability);
router.post('/donations', protect, authorize('donor'), submitDonation);
router.get('/donations/my', protect, authorize('donor'), getMyDonations);
router.get('/matching-requests', protect, authorize('donor'), getMatchingRequestsForDonor);

module.exports = router;
