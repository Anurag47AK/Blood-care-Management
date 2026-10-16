const Notification = require('../models/Notification');

/**
 * Create a new notification for a user
 */
const createNotification = async ({
  recipient,
  title,
  message,
  type = 'SYSTEM',
  relatedEntity = null,
  relatedId = null
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      relatedEntity,
      relatedId
    });
    return notification;
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Bulk alert matching donors about an urgent blood request
 */
const notifyMatchingDonors = async ({ request, donors }) => {
  try {
    const notifications = donors
      .filter((d) => d.donor?.user?._id)
      .slice(0, 5) // Alert top 5 candidate matches
      .map((d) => ({
        recipient: d.donor.user._id,
        title: `Urgent Blood Need: ${request.bloodGroup} in ${request.city}`,
        message: `Patient ${request.patientName} at ${request.hospitalName} requires ${request.unitsRequired} unit(s) of compatible blood. Your match score is ${d.score}%.`,
        type: 'MATCH_ALERT',
        relatedEntity: 'BloodRequest',
        relatedId: request.requestId
      }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('[NotificationService] Failed to notify matching donors:', error.message);
  }
};

module.exports = {
  createNotification,
  notifyMatchingDonors
};
