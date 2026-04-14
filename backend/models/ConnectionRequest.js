const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
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
  fromUserName: {
    type: String,
    required: true
  },
  toUserName: {
    type: String,
    required: true
  },
  fromDepartment: {
    type: String,
    required: true
  },
  toDepartment: {
    type: String,
    required: true
  },
  fromCurrentYear: {
    type: String
  },
  toCurrentYear: {
    type: String
  },
  fromPassoutYear: {
    type: String
  },
  toPassoutYear: {
    type: String
  },
  fromUserAvatar: {
    type: String,
    default: 'https://i.pravatar.cc/150?img=1'
  },
  toUserAvatar: {
    type: String,
    default: 'https://i.pravatar.cc/150?img=2'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 }, { unique: true });
connectionRequestSchema.index({ toUserId: 1, status: 1 });
connectionRequestSchema.index({ fromUserId: 1, status: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
