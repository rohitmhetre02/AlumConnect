const mongoose = require('mongoose')
const { CONTENT_APPROVAL_STATUS, normalizeContentApprovalStatus } = require('../utils/contentApprovalStatus')
const { normalizeDepartment } = require('../utils/departments')

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['full-time', 'internship', 'part-time', 'contract'],
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
      set: normalizeDepartment,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
      type: String,
      trim: true,
      required: true,
    },
    createdByRole: {
      type: String,
      enum: ['alumni', 'faculty', 'admin', 'coordinator'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'closed', 'expired'],
      default: 'active',
    },
    isPushed: {
      type: Boolean,
      default: false,
    },
    pushedAt: {
      type: Date,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(CONTENT_APPROVAL_STATUS),
      default: CONTENT_APPROVAL_STATUS.PENDING,
      uppercase: true,
      set: normalizeContentApprovalStatus,
    },
    approvalDepartment: {
      type: String,
      trim: true,
      default: '',
    },
    approvalDecisions: {
      type: [
        new mongoose.Schema(
          {
            status: {
              type: String,
              enum: Object.values(CONTENT_APPROVAL_STATUS),
              required: true,
            },
            decidedByRole: {
              type: String,
              trim: true,
              default: '',
            },
            decidedByName: {
              type: String,
              trim: true,
              default: '',
            },
            decidedById: {
              type: String,
              trim: true,
              default: '',
            },
            decidedAt: {
              type: Date,
              default: Date.now,
            },
            reason: {
              type: String,
              trim: true,
              default: '',
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    applicants: {
      type: Number,
      default: 0,
    },
    approvedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    approvalRejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Opportunity', opportunitySchema)
