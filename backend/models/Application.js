const mongoose = require('mongoose')

const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected', 'Withdrawn'],
      default: 'Applied',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    resume: {
      type: String, // URL to resume file
      trim: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    // Application tracking
    reviewedAt: {
      type: Date,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    interviewDate: {
      type: Date,
    },
    interviewLocation: {
      type: String,
      trim: true,
    },
    interviewMode: {
      type: String,
      enum: ['online', 'in-person', 'phone'],
      default: 'online',
    },
    // Final decision
    selectedAt: {
      type: Date,
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    // Communication
    emailsSent: {
      type: Number,
      default: 0,
    },
    lastEmailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true })
applicationSchema.index({ applicant: 1 })
applicationSchema.index({ opportunity: 1 })
applicationSchema.index({ status: 1 })
applicationSchema.index({ appliedAt: -1 })

// Pre-save middleware to ensure one application per opportunity per applicant
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingApplication = await this.constructor.findOne({
      opportunity: this.opportunity,
      applicant: this.applicant,
    })
    
    if (existingApplication) {
      const error = new Error('You have already applied to this opportunity')
      error.code = 'DUPLICATE_APPLICATION'
      return next(error)
    }
  }
  next()
})

module.exports = mongoose.model('Application', applicationSchema)
