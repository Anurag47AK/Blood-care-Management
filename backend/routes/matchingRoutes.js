const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  matchDonorsForRequest,
  matchDonorsByCriteria,
  getCompatibilityMatrix
} = require('../controllers/matchingController');
const { protect } = require('../middleware/auth');

// Optional auth helper
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

router.get('/compatibility-matrix', getCompatibilityMatrix);
router.post('/find', optionalAuth, matchDonorsByCriteria);
router.get('/request/:id', protect, matchDonorsForRequest);

module.exports = router;
