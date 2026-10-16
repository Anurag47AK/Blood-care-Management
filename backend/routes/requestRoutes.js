const express = require('express');
const router = express.Router();
const {
  createBloodRequest,
  getMyRequests,
  cancelBloodRequest,
  getUrgentPublicRequests,
  getRequestDetails
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { validateBloodRequest } = require('../middleware/validator');

// Public route
router.get('/urgent', getUrgentPublicRequests);

// Protected routes
router.post('/', protect, validateBloodRequest, createBloodRequest);
router.get('/my', protect, getMyRequests);
router.patch('/:id/cancel', protect, cancelBloodRequest);
router.get('/:id', protect, getRequestDetails);

module.exports = router;
