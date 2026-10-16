const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in to proceed.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'blood_care_default_secret_key'
    );
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated or suspended. Please contact the administrator.'
      });
    }

    // Check if token was issued before the latest logout/invalidation timestamp
    if (user.tokensInvalidBefore && decoded.iat) {
      const tokenIssuedAt = decoded.iat * 1000;
      const invalidBefore = new Date(user.tokensInvalidBefore).getTime();
      if (tokenIssuedAt < invalidBefore) {
        return res.status(401).json({
          success: false,
          message: 'Token has been invalidated by a logout event. Please log in again.'
        });
      }
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token.'
    });
  }
};

module.exports = { protect };
