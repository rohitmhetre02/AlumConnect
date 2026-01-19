const mongoose = require('mongoose')

const mentorApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      required: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    linkedin: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    jobRole: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    expertise: [
      {
        type: String,
        trim: true,
      },
    ],
    skills: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    motivation: {
      type: String,
      trim: true,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    availability: {
      type: String,
      trim: true,
    },
    modes: [
      {
        type: String,
        trim: true,
      },
    ],
    preferredStudents: {
      type: String,
      trim: true,
    },
    maxStudents: {
      type: String,
      trim: true,
    },
    weeklyHours: {
      type: String,
      trim: true,
    },
    workExperience: [
      {
        company: { type: String, trim: true },
        role: { type: String, trim: true },
        startDate: { type: String, trim: true },
        endDate: { type: String, trim: true },
        isCurrentJob: { type: Boolean, default: false },
        description: { type: String, trim: true },
      },
    ],
    education: [
      {
        institution: { type: String, trim: true },
        degree: { type: String, trim: true },
        field: { type: String, trim: true },
        department: { type: String, trim: true },
        admissionYear: { type: String, trim: true },
        passoutYear: { type: String, trim: true },
        cgpa: { type: String, trim: true },
        isCurrentlyPursuing: { type: Boolean, default: false },
        description: { type: String, trim: true },
      },
    ],
    termsAccepted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
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
