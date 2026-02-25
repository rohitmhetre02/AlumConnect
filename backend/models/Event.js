const mongoose = require('mongoose')
const { CONTENT_APPROVAL_STATUS, normalizeContentApprovalStatus } = require('../utils/contentApprovalStatus')
const { normalizeDepartment } = require('../utils/departments')

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['online', 'in-person', 'hybrid'],
      default: 'in-person',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    registrationLink: {
      type: String,
      trim: true,
      default: '',
    },
    startAt: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
    },
    organization: {
      type: String,
      enum: ['alumni', 'college', 'department'],
      required: true,
    },
    department: {
      type: String,
      trim: true,
      set: normalizeDepartment,
    },
    branch: {
      type: String,
      trim: true,
    },
    registrations: [
      {
        userId: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          trim: true,
          required: true,
        },
        name: {
          type: String,
          trim: true,
          required: true,
        },
        department: {
          type: String,
          trim: true,
          default: '',
        },
        academicYear: {
          type: String,
          trim: true,
          default: '',
        },
        graduationYear: {
          type: String,
          trim: true,
          default: '',
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      required: false,
    },
    createdByRole: {
      type: String,
      trim: true,
    },
    createdByName: {
      type: String,
      trim: true,
      default: '',
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
      set: normalizeDepartment,
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

module.exports = mongoose.model('Event', eventSchema)
