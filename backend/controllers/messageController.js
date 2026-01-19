const mongoose = require('mongoose')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const { getModelByRole } = require('../utils/roleModels')
const { getSocket } = require('../socket')

const ensureObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid identifier')
  }
  return new mongoose.Types.ObjectId(value)
}

const ROLE_ALIAS_MAP = {
  student: 'student',
  students: 'student',
  alumni: 'alumni',
  alumnus: 'alumni',
  alumna: 'alumni',
  faculty: 'faculty',
  faculties: 'faculty',
}

const normalizeRole = (role = '') => {
  if (typeof role !== 'string') return null
  const normalized = role.trim().toLowerCase()
  return ROLE_ALIAS_MAP[normalized] ?? null
}

const buildParticipantPayload = (doc) => ({
  userId: doc._id,
  role: doc.role,
  name: `${doc.firstName ?? ''} ${doc.lastName ?? ''}`.trim() || doc.email || 'Member',
  avatar: doc.avatar ?? '',
})

const findOrCreateConversation = async ({ userObjectId, userRole }, recipientId, recipientRole) => {
  const recipientObjectId = ensureObjectId(recipientId)
  const normalizedUserRole = normalizeRole(userRole)
  const normalizedRecipientRole = normalizeRole(recipientRole)

  if (!normalizedUserRole) {
    throw new Error('Unsupported user role for messaging')
  }

  if (!normalizedRecipientRole) {
    throw new Error('Unsupported recipient role for messaging')
  }

  const existing = await Conversation.findOne({
    'participants.userId': { $all: [userObjectId, recipientObjectId] },
  })

  if (existing) {
    return existing
  }

  const RecipientModel = getModelByRole(normalizedRecipientRole)
  if (!RecipientModel) {
    throw new Error('Recipient role not supported')
  }

  const recipientDoc = await RecipientModel.findById(recipientObjectId).select('firstName lastName email avatar role')
  if (!recipientDoc) {
    throw new Error('Recipient not found')
  }

  const UserModel = getModelByRole(normalizedUserRole)
  if (!UserModel) {
    throw new Error('User role not supported')
  }
  const userDoc = await UserModel.findById(userObjectId).select('firstName lastName email avatar role')

  if (!userDoc) {
    throw new Error('User record not found')
  }

  const participants = [userDoc, recipientDoc].map(buildParticipantPayload)

  const conversation = await Conversation.create({ participants })
  return conversation
}

const listConversations = async (req, res) => {
  try {
    const userObjectId = ensureObjectId(req.user.id)

    const conversations = await Conversation.find({ 'participants.userId': userObjectId })
      .sort({ updatedAt: -1 })
      .lean()

    return res.status(200).json({ success: true, data: conversations })
  } catch (error) {
    console.error('listConversations error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch conversations.' })
  }
}

const getConversationWith = async (req, res) => {
  try {
    const { role, userId } = req.params
    const normalizedRecipientRole = normalizeRole(role)
    if (!normalizedRecipientRole) {
      return res.status(400).json({ success: false, message: 'Invalid recipient role.' })
    }

    const userObjectId = ensureObjectId(req.user.id)
    const recipientObjectId = ensureObjectId(userId)

    const conversation = await Conversation.findOne({
      'participants.userId': { $all: [userObjectId, recipientObjectId] },
    })
      .sort({ updatedAt: -1 })
      .lean()

    return res.status(200).json({ success: true, data: conversation ?? null })
  } catch (error) {
    console.error('getConversationWith error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch conversation.' })
  }
}

const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    ensureObjectId(conversationId)

    const userObjectId = ensureObjectId(req.user.id)

    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userObjectId,
    })

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' })
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 }).lean()
    return res.status(200).json({ success: true, data: messages })
  } catch (error) {
    console.error('getConversationMessages error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch messages.' })
  }
}

const sendMessage = async (req, res) => {
  try {
    const { conversationId, recipientId, recipientRole, body } = req.body

    if (!conversationId && (!recipientId || !recipientRole)) {
      return res.status(400).json({ success: false, message: 'recipientId and recipientRole are required when conversationId is missing.' })
    }

    let conversation
    const userObjectId = ensureObjectId(req.user.id)

    if (conversationId) {
      ensureObjectId(conversationId)
      conversation = await Conversation.findOne({
        _id: conversationId,
        'participants.userId': userObjectId,
      })
      if (!conversation) {
        return res.status(404).json({ success: false, message: 'Conversation not found.' })
      }
    } else {
      conversation = await findOrCreateConversation({ userObjectId, userRole: req.user.role }, recipientId, recipientRole)
    }

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: userObjectId,
      senderRole: req.user.role,
      body: body ?? '',
    })

    conversation.lastMessage = {
      messageId: message._id,
      preview: body?.slice(0, 200) ?? '',
      senderId: userObjectId,
      senderRole: req.user.role,
      createdAt: message.createdAt,
    }

    await conversation.save()

    const conversationData = conversation.toObject()
    const messageData = message.toObject()

    const socket = getSocket()
    if (socket) {
      socket.to(`conversation:${conversation._id}`).emit('message:new', {
        conversationId: conversation._id,
        message: messageData,
      })

      conversation.participants
        .filter((participant) => participant.userId.toString() !== userObjectId.toString())
        .forEach((participant) => {
          socket.to(`user:${participant.userId}`).emit('conversation:updated', {
            conversationId: conversation._id,
            lastMessage: conversationData.lastMessage,
          })
        })
    }

    return res.status(201).json({
      success: true,
      data: {
        conversation: conversationData,
        message: messageData,
      },
    })
  } catch (error) {
    console.error('sendMessage error:', error)
    return res.status(500).json({ success: false, message: 'Unable to send message.' })
  }
}

module.exports = {
  listConversations,
  getConversationMessages,
  getConversationWith,
  sendMessage,
}
