const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  setupInitialAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validator');

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/setup-admin', setupInitialAdmin);

module.exports = router;
