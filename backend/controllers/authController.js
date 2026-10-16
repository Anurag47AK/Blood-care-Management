const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DonorProfile = require('../models/DonorProfile');
const { recordAuditLog } = require('../services/auditService');

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'blood_care_default_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Register a new user (donor or requester)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'donor',
      phone,
      city,
      state,
      // Donor-specific fields (if role is donor)
      bloodGroup,
      age,
      gender,
      weight,
      medicalConditions
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Role safety: Public registration can only register 'donor' or 'requester'.
    // Admin registration through this endpoint is restricted.
    const userRole = role === 'admin' ? 'donor' : role;

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      phone,
      city,
      state: state || ''
    });

    let donorProfile = null;
    if (userRole === 'donor') {
      if (!bloodGroup || !age || !gender || !weight) {
        // Rollback user creation if donor fields are missing
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Donor registration requires Blood Group, Age, Gender, and Weight.'
        });
      }

      donorProfile = await DonorProfile.create({
        user: user._id,
        bloodGroup,
        age: Number(age),
        gender,
        weight: Number(weight),
        city,
        medicalConditions: Array.isArray(medicalConditions) ? medicalConditions : []
      });
    }

    const token = generateToken(user._id);

    await recordAuditLog({
      action: 'USER_REGISTER',
      user,
      targetEntity: 'User',
      targetId: user._id.toString(),
      details: { role: user.role, email: user.email }
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        state: user.state,
        donorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found with this email.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact the administrator.'
      });
    }

    const token = generateToken(user._id);

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
    }

    await recordAuditLog({
      action: 'USER_LOGIN',
      user,
      targetEntity: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, role: user.role }
    });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        state: user.state,
        donorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let donorProfile = null;

    if (user.role === 'donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        state: user.state,
        status: user.status,
        donorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, city, state, bloodGroup, age, gender, weight, isAvailable, address } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (city) user.city = city;
    if (state !== undefined) user.state = state;

    await user.save();

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await DonorProfile.findOne({ user: user._id });
      if (donorProfile) {
        if (bloodGroup) donorProfile.bloodGroup = bloodGroup;
        if (age) donorProfile.age = Number(age);
        if (gender) donorProfile.gender = gender;
        if (weight) donorProfile.weight = Number(weight);
        if (city) donorProfile.city = city;
        if (address !== undefined) donorProfile.address = address;
        if (isAvailable !== undefined) donorProfile.isAvailable = Boolean(isAvailable);
        await donorProfile.save();
      }
    }

    await recordAuditLog({
      action: 'PROFILE_UPDATED',
      user,
      targetEntity: 'User',
      targetId: user._id.toString(),
      details: { updatedFields: req.body }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        state: user.state,
        donorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    user.password = newPassword;
    user.tokensInvalidBefore = new Date(); // Invalidate all prior active tokens
    await user.save();

    await recordAuditLog({
      action: 'PASSWORD_CHANGED',
      user,
      targetEntity: 'User',
      targetId: user._id.toString()
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. Prior sessions invalidated.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user and invalidate all tokens issued before this timestamp
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.tokensInvalidBefore = new Date();
      await user.save();

      await recordAuditLog({
        action: 'USER_LOGOUT',
        user,
        targetEntity: 'User',
        targetId: user._id.toString()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Prior tokens have been invalidated.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Safe development-only administrator creation (requires explicit config secret)
// @route   POST /api/auth/setup-admin
// @access  Restricted (Development only & requires X-Admin-Setup-Secret header)
const setupInitialAdmin = async (req, res, next) => {
  try {
    // 1. Strictly block in production environments
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Endpoint permanently disabled in production environment.'
      });
    }

    // 2. Require configured setup secret
    const configuredSecret = process.env.ADMIN_SETUP_SECRET;
    const providedSecret = req.headers['x-admin-setup-secret'] || req.body.setupSecret;

    if (!configuredSecret || providedSecret !== configuredSecret) {
      return res.status(401).json({
        success: false,
        message: 'Access denied: Valid X-Admin-Setup-Secret configuration header is required.'
      });
    }

    // 3. Ensure no existing admin exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: 'An administrator account already exists. Setup endpoint is permanently locked.'
      });
    }

    const { name, email, password, phone, city } = req.body;

    if (!name || !email || !password || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, phone, and city for the initial administrator.'
      });
    }

    const admin = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'admin',
      phone,
      city,
      status: 'active'
    });

    const token = generateToken(admin._id);

    await recordAuditLog({
      action: 'INITIAL_ADMIN_SETUP',
      user: admin,
      targetEntity: 'User',
      targetId: admin._id.toString(),
      details: { email: admin.email }
    });

    res.status(201).json({
      success: true,
      message: 'Primary administrator created successfully.',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
        city: admin.city
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  setupInitialAdmin
};
