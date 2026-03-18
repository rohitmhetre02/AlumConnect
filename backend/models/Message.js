const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderName: { type: String, required: true },
  recipientId: { type: String, required: true },
  recipientName: { type: String, required: false, default: 'Unknown User' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, default: 'message' },
  isRead: { type: Boolean, default: false }
});

// Create compound index for efficient queries
messageSchema.index({ conversationId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
