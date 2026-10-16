const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateRejection } = require('../middleware/validator');

// All admin routes strictly require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

// Requests management
router.get('/requests', getAllRequests);
router.patch('/requests/:id/approve', approveRequest);
router.patch('/requests/:id/reject', validateRejection, rejectRequest);
router.patch('/requests/:id/fulfill', fulfillRequest);

// Donations management
router.get('/donations', getAllDonations);
router.patch('/donations/:id/approve', approveDonation);
router.patch('/donations/:id/reject', validateRejection, rejectDonation);

// Donors and Users
router.get('/donors', getAllDonors);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);

// Audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
