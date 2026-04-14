const Notification = require('../models/Notification');
const { ensureAuthenticated } = require('../middleware/auth');

// Get notifications for the authenticated user
const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(50); // Limit to last 50 notifications

    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    ).populate('sender', 'firstName lastName name email');

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('notificationRead', notificationId);
    }

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

// Mark all notifications as read
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const result = await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(userId.toString()).emit('allNotificationsRead');
    }

    res.json({ message: 'All notifications marked as read', count: result.modifiedCount });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
};

// Create notification (helper function)
const createNotification = async (recipientId, message, type, data = {}, senderId = null) => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      message,
      type,
      data,
      redirectUrl: getRedirectUrl(type, data)
    });

    await notification.save();
    console.log(`Notification created: ${message} for user: ${recipientId}`);

    // Emit real-time notification via Socket.io
    // Get io from global instance or socket module
    const io = global.io || require('../socket').getSocket();
    if (io) {
      io.to(`user:${recipientId.toString()}`).emit('newNotification', {
        _id: notification._id,
        message,
        type,
        data,
        createdAt: notification.createdAt,
        redirectUrl: notification.redirectUrl
      });
      console.log(`Real-time notification emitted to user: ${recipientId}`);
    } else {
      console.warn('Socket.io not available for real-time notification');
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get redirect URL based on notification type
const getRedirectUrl = (type, data) => {
  switch (type) {
    case 'application':
      return '/dashboard/applications';
    case 'mentorship':
      return '/dashboard/mentorship-requests';
    case 'connection':
      return '/dashboard/connections';
    case 'content_approval':
      return '/dashboard/content-posted';
    case 'event':
      return '/dashboard/events';
    case 'opportunity':
      return '/dashboard/opportunities';
    case 'campaign':
      return '/dashboard/donations';
    default:
      return '/dashboard/activity';
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  deleteNotification
};
