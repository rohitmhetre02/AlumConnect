const mongoose = require('mongoose')

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
      enum: ['active', 'closed', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Opportunity', opportunitySchema)
