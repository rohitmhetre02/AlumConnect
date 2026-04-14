const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['application', 'mentorship', 'connection', 'content_approval', 'event', 'opportunity', 'campaign', 'general'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  redirectUrl: {
    type: String
  },
  data: {
    type: mongoose.Schema.Types.Mixed // Additional data related to the notification
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
