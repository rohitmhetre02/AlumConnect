const mongoose = require('mongoose')

const mentorApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      required: true,
    },
    // Step 1: Basic Profile Details
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      required: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
      required: true,
    },
    degree: {
      type: String,
      trim: true,
      required: true,
    },
    department: {
      type: String,
      trim: true,
      required: true,
    },
    currentLocation: {
      type: String,
      trim: true,
      required: true,
    },
    profilePhoto: {
      type: String,
      trim: true,
    },
    
    // Step 2: Professional & Mentorship Details
    currentJobTitle: {
      type: String,
      trim: true,
      required: true,
    },
    company: {
      type: String,
      trim: true,
      required: true,
    },
    industry: {
      type: String,
      trim: true,
      required: true,
    },
    mentorshipAreas: [
      {
        type: String,
        trim: true,
      },
    ],
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    
    // Step 3: Availability & Consent
    mentorshipMode: {
      type: String,
      trim: true,
      required: true,
    },
    availableDays: {
      type: String,
      trim: true,
      required: true,
    },
    timeCommitment: {
      type: String,
      trim: true,
      required: true,
    },
    mentorshipPreference: {
      type: String,
      trim: true,
      required: true,
    },
    maxMentees: {
      type: String,
      trim: true,
      required: true,
    },
    
    // Consent checkboxes
    consent1: {
      type: Boolean,
      required: true,
    },
    consent2: {
      type: Boolean,
      required: true,
    },
    consent3: {
      type: Boolean,
      required: true,
    },
    
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('MentorApplication', mentorApplicationSchema)
