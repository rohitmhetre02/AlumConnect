const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// Get all conversations for a user
router.get('/conversations', async (req, res) => {
  try {
    // Simple token verification for now
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const userId = decoded.id;
    
    console.log('📋 [Backend] Getting conversations for user:', userId);
    
    // For now, return empty conversations array until models are properly set up
    // TODO: Implement proper database queries once models are working
    const conversations = [];
    
    console.log('💬 [Backend] Found conversations:', conversations.length);
    
    res.json({
      success: true,
      data: conversations
    });
    
  } catch (error) {
    console.error('❌ [Backend] Error getting conversations:', error);
    console.error('❌ Stack trace:', error.stack);
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
    console.log('📝 [Backend] POST /conversations request received');
    
    const { userId, userName, userAvatar, userRole, userDepartment } = req.body;
    
    // Simple token verification for now
    const token = req.headers.authorization?.replace('Bearer ', '');
    console.log('📝 [Backend] Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      console.log('❌ [Backend] No token provided');
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      console.log('✅ [Backend] Token verified, user ID:', decoded.id);
      console.log('📋 [Backend] JWT decoded data:', decoded);
    } catch (jwtError) {
      console.log('❌ [Backend] JWT verification failed:', jwtError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid token: ' + jwtError.message
      });
    }
    
    const currentUserId = decoded.id;
    
    // Extract current user info from JWT
    const currentUserInfo = {
      name: decoded.name || 
            (decoded.firstName && decoded.lastName ? 
              `${decoded.firstName} ${decoded.lastName}` : 
              decoded.firstName || 'You'),
      role: decoded.role || 'User',
      department: decoded.department || ''
    };
    
    console.log('👤 [Backend] Current user info extracted:', currentUserInfo);
    
    console.log('💬 [Backend] Creating conversation between:', currentUserId, 'and', userId);
    
    // Create conversation object
    const conversationId = `conv_${currentUserId}_${userId}_${Date.now()}`;
    const conversation = {
      id: userId,
      name: userName || `User ${userId}`,
      avatar: userAvatar || `https://i.pravatar.cc/150?img=${userId.slice(-2)}`,
      role: userRole || 'User',
      department: userDepartment || '',
      lastMessage: 'Start a conversation',
      time: 'Just now',
      unread: 0,
      isOnline: false,
      conversationId: conversationId,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      // Store participant info for message display
      participants: {
        [currentUserId]: {
          name: currentUserInfo.name,
          role: currentUserInfo.role,
          department: currentUserInfo.department
        },
        [userId]: {
          name: userName || `User ${userId}`,
          role: userRole || 'User',
          department: userDepartment || ''
        }
      }
    };
    
    // Store conversation in memory using the socket helper
    try {
      // Get the conversation storage directly
      const { getConversationStorage } = require('../socket');
      const conversationStorage = getConversationStorage();
      if (conversationStorage) {
        conversationStorage.set(conversationId, conversation);
        console.log('✅ [Backend] Conversation stored in memory');
      } else {
        console.log('⚠️ [Backend] Conversation storage not available');
      }
    } catch (storeError) {
      console.log('⚠️ [Backend] Error storing conversation in memory:', storeError.message);
    }
    
    console.log('✅ [Backend] Created conversation:', conversationId);
    console.log('📝 [Backend] Sending response:', conversation);
    
    res.json({
      success: true,
      data: conversation
    });
    
  } catch (error) {
    console.error('❌ [Backend] Error creating conversation:', error);
    console.error('❌ [Backend] Stack trace:', error.stack);
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
