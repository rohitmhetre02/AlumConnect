const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { ensureAuthenticated } = require('../middleware/auth');

// GET /api/notifications - Get all notifications for the authenticated user
router.get('/', ensureAuthenticated, getNotifications);

// PUT /api/notifications/:notificationId/read - Mark notification as read
router.put('/:notificationId/read', ensureAuthenticated, markNotificationAsRead);

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', ensureAuthenticated, markAllNotificationsAsRead);

// DELETE /api/notifications/:notificationId - Delete notification
router.delete('/:notificationId', ensureAuthenticated, deleteNotification);

module.exports = router;
