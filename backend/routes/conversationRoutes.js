const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// Get all conversations for a user
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📋 [Backend] Getting conversations for user:', userId);
    
    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true
    }).sort({ updatedAt: -1 }).lean();
    
    const data = conversations.map((c) => {
      const other = c.participants?.find((p) => p.userId !== userId);
      const lm = c.lastMessage || {};
      return {
        id: other?.userId || '',
        conversationId: c._id.toString(),
        name: other?.userName || 'User',
        avatar: other?.userAvatar || '',
        role: other?.userRole || '',
        department: other?.userDepartment || '',
        lastMessage: lm.text || '',
        time: lm.timestamp ? formatTime(lm.timestamp) : '',
        unread: (c.unreadCounts && c.unreadCounts[userId]) || 0,
        participants: c.participants || [],
        updatedAt: c.updatedAt,
      };
    });
    
    console.log('💬 [Backend] Found conversations:', data.length);
    
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('❌ [Backend] Error getting conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations: ' + error.message
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    console.log('📨 [Backend] Getting messages for conversation:', conversationId, 'User:', userId);
    
    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId,
      isActive: true
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    const messages = await Message.find({
      conversationId: conversationId
    })
    .sort({ timestamp: 1 })
    .lean();
    
    console.log('📝 [Backend] Found messages:', messages.length);
    
    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: conversationId,
        recipientId: userId,
        isRead: false
      },
      { isRead: true }
    );
    
    // Reset unread count
    conversation.unreadCounts.set(userId, 0);
    await conversation.save();
    
    res.json({
      success: true,
      data: messages
    });
    
  } catch (error) {
    console.error('❌ [Backend] Error getting messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get messages'
    });
  }
});

// Create or get conversation
router.post('/conversations', async (req, res) => {
  try {
    const { userId, userName, userAvatar, userRole, userDepartment } = req.body;
    
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'alumconnect-development-secret');
    const currentUserId = decoded.id;

    // Look up the current user's real name from DB
    const Admin = require('../models/Admin');
    const Coordinator = require('../models/Coordinator');
    let currentUserData = await Admin.findById(currentUserId).lean();
    if (!currentUserData) currentUserData = await Coordinator.findById(currentUserId).lean();
    const currentUserName = currentUserData
      ? currentUserData.name || [currentUserData.firstName, currentUserData.lastName].filter(Boolean).join(' ').trim() || decoded.name || decoded.firstName || 'Admin'
      : decoded.name || decoded.firstName || 'Admin';
    
    // Check if conversation already exists between these two users
    let existing = await Conversation.findOne({
      'participants.userId': { $all: [currentUserId, userId] },
      isActive: true
    });
    
    if (existing) {
      const other = existing.participants.find((p) => p.userId !== currentUserId);
      const lm = existing.lastMessage || {};
      const data = {
        id: other?.userId || userId,
        conversationId: existing._id.toString(),
        name: other?.userName || userName || 'User',
        avatar: other?.userAvatar || userAvatar || '',
        role: other?.userRole || userRole || '',
        department: other?.userDepartment || userDepartment || '',
        lastMessage: lm.text || '',
        time: lm.timestamp ? formatTime(lm.timestamp) : '',
        unread: existing.unreadCounts?.get?.(currentUserId) || 0,
        participants: existing.participants || [],
        updatedAt: existing.updatedAt,
      };
      return res.json({ success: true, data });
    }
    
    // Create new conversation
    const conversation = await Conversation.create({
      participants: [
        {
          userId: currentUserId,
          userName: currentUserName,
          userAvatar: decoded.avatar || currentUserData?.avatar || '',
          userRole: decoded.role || currentUserData?.role || 'Admin',
          userDepartment: decoded.department || currentUserData?.department || ''
        },
        {
          userId,
          userName: userName || `User ${userId}`,
          userAvatar: userAvatar || '',
          userRole: userRole || 'User',
          userDepartment: userDepartment || ''
        }
      ],
      lastMessage: { text: 'Start a conversation', timestamp: new Date() },
      unreadCounts: new Map([[currentUserId, 0], [userId, 0]])
    });
    
    const convId = conversation._id.toString();
    const other = conversation.participants.find((p) => p.userId !== currentUserId);
    const data = {
      id: other?.userId || userId,
      conversationId: convId,
      name: other?.userName || userName || 'User',
      avatar: other?.userAvatar || userAvatar || '',
      role: other?.userRole || userRole || '',
      department: other?.userDepartment || userDepartment || '',
      lastMessage: 'Start a conversation',
      time: 'Just now',
      unread: 0,
      participants: conversation.participants,
      updatedAt: conversation.updatedAt,
    };
    
    // Store in memory for socket
    try {
      const { getConversationStorage } = require('../socket');
      const cs = getConversationStorage();
      if (cs) cs.set(convId, data);
    } catch {}
    
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('❌ [Backend] Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation: ' + error.message
    });
  }
});

// Helper function to format time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + ' min ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' hours ago';
  return Math.floor(diff / 86400000) + ' days ago';
}

module.exports = router;
