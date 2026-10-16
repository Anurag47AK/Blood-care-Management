const AuditLog = require('../models/AuditLog');

/**
 * Record an action in the system audit log
 */
const recordAuditLog = async ({
  action,
  user,
  targetEntity,
  targetId = '',
  details = {},
  ipAddress = '127.0.0.1'
}) => {
  try {
    await AuditLog.create({
      action,
      performedBy: user ? user._id : null,
      userEmail: user ? user.email : 'System',
      userRole: user ? user.role : 'system',
      targetEntity,
      targetId,
      details,
      ipAddress
    });
  } catch (err) {
    console.error('Failed to create audit log entry:', err.message);
  }
};

module.exports = {
  recordAuditLog
};
