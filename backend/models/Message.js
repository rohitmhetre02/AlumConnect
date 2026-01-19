const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderRole: {
      type: String,
      enum: ['student', 'alumni', 'faculty'],
      required: true,
    },
    body: {
      type: String,
      trim: true,
      default: '',
    },
    attachments: {
      type: [
        new mongoose.Schema(
          {
            url: { type: String, trim: true, required: true },
            type: { type: String, trim: true, default: 'file' },
            name: { type: String, trim: true, default: '' },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    readBy: {
      type: [
        new mongoose.Schema(
          {
            userId: { type: mongoose.Schema.Types.ObjectId, required: true },
            readAt: { type: Date, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Message', messageSchema)
