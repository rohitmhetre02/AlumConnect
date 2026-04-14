const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromRole: {
    type: String,
    enum: ['student', 'students', 'alumni', 'faculty', 'coordinator'],
    required: true
  },
  toRole: {
    type: String,
    enum: ['student', 'students', 'alumni', 'faculty', 'coordinator'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'students', 'alumni', 'faculty', 'coordinator'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  currentYear: {
    type: String
  },
  passoutYear: {
    type: String
  },
  avatar: {
    type: String,
    default: 'https://i.pravatar.cc/150?img=1'
  },
  status: {
    type: String,
    enum: ['accepted', 'active'],
    default: 'accepted'
  },
  acceptedAt: {
    type: Date,
    default: Date.now
  },
  originalRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ConnectionRequest'
  }
}, {
  timestamps: true
});

// Index for efficient queries
connectionSchema.index({ fromUserId: 1, toUserId: 1 });
connectionSchema.index({ fromUserId: 1, status: 1 });
connectionSchema.index({ toUserId: 1, status: 1 });

module.exports = mongoose.model('Connection', connectionSchema);
