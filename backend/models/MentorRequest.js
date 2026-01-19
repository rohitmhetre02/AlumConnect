const mongoose = require('mongoose')

const mentorRequestSchema = new mongoose.Schema(
  {
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
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
    scheduledDateTime: {
      type: Date,
    },
    scheduledMode: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    proposedSlots: {
      type: [
        new mongoose.Schema(
          {
            slotDate: {
              type: Date,
              required: true,
            },
            mode: {
              type: String,
              enum: ['online', 'offline', 'hybrid'],
              default: 'online',
              lowercase: true,
              trim: true,
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'confirmed', 'rejected'],
      default: 'pending',
      lowercase: true,
      trim: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MentorSession',
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
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  },
)

mentorRequestSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString()
    delete ret._id
    return ret
  },
})

module.exports = mongoose.model('MentorRequest', mentorRequestSchema)
