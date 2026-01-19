const mongoose = require('mongoose')

const opportunityReferralSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true,
    },
    proposal: {
      type: String,
      trim: true,
      required: true,
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    resumePublicId: {
      type: String,
      trim: true,
      default: '',
    },
    resumeFileName: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'accepted', 'declined'],
      default: 'submitted',
    },
    reviewedAt: {
      type: Date,
    },
    reviewerNote: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

opportunityReferralSchema.index({ opportunity: 1, student: 1 }, { unique: true })

module.exports = mongoose.model('OpportunityReferral', opportunityReferralSchema)
