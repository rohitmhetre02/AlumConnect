const mongoose = require('mongoose')

const eventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    userId: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['alumni', 'student'],
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    passoutYear: {
      type: Number,
      min: 1950,
      max: new Date().getFullYear() + 10,
    },
    currentYear: {
      type: String,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    registrationType: {
      type: String,
      enum: ['link', 'popup'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Create compound index to prevent duplicate registrations
eventRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true })

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema)
