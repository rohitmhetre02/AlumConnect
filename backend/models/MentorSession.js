const mongoose = require('mongoose')

const feedbackSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    submittedAt: {
      type: Date,
    },
  },
  { _id: false },
)

const mentorSessionSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
      required: true,
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorService',
    },
    serviceName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
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
    sessionDate: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled',
      lowercase: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'online',
      lowercase: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    feedback: feedbackSchema,
  },
  {
    timestamps: true,
  },
)

mentorSessionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('MentorSession', mentorSessionSchema)
