const mongoose = require('mongoose')
const { CONTENT_APPROVAL_STATUS } = require('../utils/contentApprovalStatus')

const campaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    goalAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    deadline: {
      type: Date,
    },
    category: {
      type: String,
      required: true,
      enum: ['scholarship', 'infrastructure', 'equipment', 'research', 'community', 'emergency', 'other'],
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    donations: [{
      donorName: {
        type: String,
        required: true,
        trim: true,
      },
      donorEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 1,
      },
      message: {
        type: String,
        trim: true,
        default: '',
      },
      donatedAt: {
        type: Date,
        default: Date.now,
      },
      anonymous: {
        type: Boolean,
        default: false,
      },
      paymentMethod: {
        type: String,
        enum: ['offline', 'razorpay', 'stripe', 'paypal', 'upi', 'paytm'],
        default: 'offline',
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending',
      },
      paymentTransactionId: {
        type: String,
        trim: true,
      },
    }],
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
    featured: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: Number,
      default: 0,
    },
    // Approval system fields
    approvalStatus: {
      type: String,
      enum: Object.values(CONTENT_APPROVAL_STATUS),
      default: CONTENT_APPROVAL_STATUS.PENDING,
    },
    approvalDepartment: {
      type: String,
      trim: true,
      default: '',
    },
    approvalDecisions: [{
      status: {
        type: String,
        enum: Object.values(CONTENT_APPROVAL_STATUS),
        required: true,
      },
      decidedByRole: {
        type: String,
        required: true,
      },
      decidedByName: {
        type: String,
        required: true,
      },
      decidedById: {
        type: String,
        required: true,
      },
      decidedAt: {
        type: Date,
        required: true,
      },
      reason: {
        type: String,
        trim: true,
        default: '',
      },
    }],
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
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

// Create indexes for better performance
campaignSchema.index({ status: 1, deadline: 1 })
campaignSchema.index({ createdBy: 1 })
campaignSchema.index({ category: 1 })
campaignSchema.index({ featured: 1, priority: -1 })
campaignSchema.index({ tags: 1 })

module.exports = mongoose.model('Campaign', campaignSchema)
