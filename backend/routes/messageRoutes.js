const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/messages - Save message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { conversationId, senderId, senderName, recipientId, text } = req.body;

    // Validate required fields
    if (!conversationId || !senderId || !senderName || !recipientId || !text) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    // Create and save message
    const message = new Message({
      conversationId,
      senderId,
      senderName,
      recipientId,
      text: text.trim(),
      timestamp: new Date()
    });

    await message.save();

    console.log('💾 [Backend] Message saved to database:', message._id);
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ [Backend] Error saving message:', error);
    res.status(500).json({
      success: false,
      message: "Failed to save message"
    });
  }
});

// GET /api/messages/:conversationId - Get messages by conversation
router.get("/:conversationId", authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    // Fetch messages sorted by timestamp (oldest first)
    const messages = await Message.find({
      conversationId: conversationId
    }).sort({ timestamp: 1 });

    console.log(`📨 [Backend] Retrieved ${messages.length} messages for conversation ${conversationId}`);
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('❌ [Backend] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages"
    });
  }
});

// PUT /api/messages/:messageId/read - Mark message as read
router.put("/:messageId/read", authMiddleware, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findByIdAndUpdate(
      messageId,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('❌ [Backend] Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: "Failed to mark message as read"
    });
  }
});

module.exports = router;
