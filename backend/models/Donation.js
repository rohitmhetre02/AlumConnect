const mongoose = require('mongoose')

const donationSchema = new mongoose.Schema(
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
    contributions: {
      type: [
        {
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
          contributorId: {
            type: String,
            default: null,
          },
          contributorRole: {
            type: String,
            trim: true,
            default: '',
          },
          contributorName: {
            type: String,
            trim: true,
            default: '',
          },
          contributedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    coverImage: {
      type: String,
      trim: true,
      default: '',
    },
    deadline: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      required: true,
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
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Donation', donationSchema)
