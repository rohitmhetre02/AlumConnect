const mongoose = require('mongoose')

const mentorshipRequestSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumni',
    required: true,
    index: true,
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorService',
  },
  serviceName: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  serviceDuration: {
    type: String,
    trim: true,
    default: '',
  },
  serviceMode: {
    type: String,
    trim: true,
    lowercase: true,
    default: 'online',
  },
  servicePrice: {
    type: Number,
    default: 0,
  },
  menteeName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120,
  },
  menteeEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 160,
    default: '',
  },
  menteeAvatar: {
    type: String,
    trim: true,
    default: '',
  },
  menteeSkills: {
    type: [String],
    default: [],
  },
  menteeDepartment: {
    type: String,
    trim: true,
    default: '',
  },
  menteeRole: {
    type: String,
    trim: true,
    default: '',
  },
  currentYear: {
    type: String,
    trim: true,
    default: '',
  },
  passoutYear: {
    type: String,
    trim: true,
    default: '',
  },
  requestMessage: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500,
  },
  preferredDateTime: {
    type: Date,
  },
  preferredMode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
    default: 'online',
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
    lowercase: true,
    trim: true,
  },
  sessionDetails: {
    sessionDate: {
      type: Date,
    },
    sessionStartTime: {
      type: Date,
    },
    sessionEndTime: {
      type: Date,
    },
    sessionTime: {
      type: String,
    },
    meetingLink: {
      type: String,
    },
    mentorMessage: {
      type: String,
    },
  },
  sessionOutcome: {
    type: String,
    enum: ['completed', 'missed'],
  },
  remark: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  reviewSubmitted: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  mentorName: {
    type: String,
    trim: true,
    default: '',
  },
  mentorEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  mentorAvatar: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true })

mentorshipRequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('MentorRequest', mentorshipRequestSchema)
