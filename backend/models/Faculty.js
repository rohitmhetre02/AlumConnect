const mongoose = require('mongoose')

const facultySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['faculty'],
      default: 'faculty',
      immutable: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      default: '',
    },
    interests: {
      type: [String],
      default: [],
    },
    careerGoals: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    certifications: {
      type: [
        new mongoose.Schema(
          {
            title: { type: String, trim: true, default: '' },
            organization: { type: String, trim: true, default: '' },
            date: { type: String, trim: true, default: '' },
            fileName: { type: String, trim: true, default: '' },
            fileType: { type: String, trim: true, default: '' },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    experiences: {
      type: [
        new mongoose.Schema(
          {
            title: { type: String, trim: true, default: '' },
            company: { type: String, trim: true, default: '' },
            type: { type: String, trim: true, default: '' },
            startDate: { type: String, trim: true, default: '' },
            endDate: { type: String, trim: true, default: '' },
            isCurrent: { type: Boolean, default: false },
            description: { type: String, trim: true, default: '' },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    education: {
      type: [
        new mongoose.Schema(
          {
            school: { type: String, trim: true, default: '' },
            degree: { type: String, trim: true, default: '' },
            otherDegree: { type: String, trim: true, default: '' },
            field: { type: String, trim: true, default: '' },
            department: { type: String, trim: true, default: '' },
            admissionYear: { type: Number },
            passoutYear: { type: Number },
            expectedPassoutYear: { type: Number },
            isCurrent: { type: Boolean, default: false },
            cgpa: { type: String, trim: true, default: '' },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    socials: {
      type: Map,
      of: String,
      default: {},
    },
    avatar: {
      type: String,
      trim: true,
      default: '',
    },
    cover: {
      type: String,
      trim: true,
      default: '',
    },
    isProfileApproved: {
      type: Boolean,
      default: false,
    },
    profileApprovalStatus: {
      type: String,
      enum: ['IN_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'IN_REVIEW',
      uppercase: true,
      set: (value) => {
        if (!value) return 'IN_REVIEW'
        const normalized = String(value).trim().toUpperCase()
        if (normalized === 'PENDING') return 'IN_REVIEW'
        if (['IN_REVIEW', 'APPROVED', 'REJECTED'].includes(normalized)) {
          return normalized
        }
        return 'IN_REVIEW'
      },
    },
    profileReviewedAt: {
      type: Date,
    },
    profileReviewedBy: {
      type: String,
    },
    profileRejectionReason: {
      type: String,
    },
    postedOpportunities: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Opportunity',
      default: [],
    },
    events: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Event',
      default: [],
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Faculty', facultySchema)
