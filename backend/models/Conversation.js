const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    userRole: { type: String },
    userDepartment: { type: String }
  }],
  lastMessage: {
    text: { type: String, default: 'Start a conversation' },
    timestamp: { type: Date, default: Date.now },
    senderId: { type: String },
    senderName: { type: String }
  },
  unreadCounts: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
conversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Conversation', conversationSchema);
