const mongoose = require('mongoose')
const { REGISTRATION_STATUS, normalizeRegistrationStatus } = require('../utils/registrationStatus')

const coordinatorSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['coordinator'],
      default: 'coordinator',
      immutable: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    registrationStatus: {
      type: String,
      enum: Object.values(REGISTRATION_STATUS),
      default: REGISTRATION_STATUS.PENDING,
      uppercase: true,
      set: normalizeRegistrationStatus,
    },
    registrationReviewedAt: {
      type: Date,
    },
    registrationReviewedBy: {
      type: String,
    },
    registrationDecisionByRole: {
      type: String,
      trim: true,
      default: '',
    },
    registrationRejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    // Profile approval fields
    profileApprovalStatus: {
      type: String,
      enum: ['IN_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'IN_REVIEW',
      uppercase: true,
    },
    isProfileApproved: {
      type: Boolean,
      default: false,
    },
    profileReviewedAt: {
      type: Date,
    },
    profileReviewedBy: {
      type: String,
    },
    profileRejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Coordinator', coordinatorSchema)
