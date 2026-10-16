const express = require('express');
const router = express.Router();
const { getPublicStats, getAdminStats } = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public live statistics
router.get('/public', getPublicStats);

// Admin dashboard metrics
router.get('/admin', protect, authorize('admin'), getAdminStats);

module.exports = router;
