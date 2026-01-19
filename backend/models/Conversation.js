const mongoose = require('mongoose')

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'alumni', 'faculty'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
)

const lastMessageSchema = new mongoose.Schema(
  {
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    preview: {
      type: String,
      default: '',
      trim: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    senderRole: {
      type: String,
      enum: ['student', 'alumni', 'faculty'],
    },
    createdAt: {
      type: Date,
    },
  },
  { _id: false }
)

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [participantSchema],
      validate: {
        validator(value) {
          return Array.isArray(value) && value.length >= 2
        },
        message: 'A conversation requires at least two participants.',
      },
    },
    lastMessage: {
      type: lastMessageSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
)

conversationSchema.index({ 'participants.userId': 1 })
conversationSchema.index({ updatedAt: -1 })

module.exports = mongoose.model('Conversation', conversationSchema)
