const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const Message = require('./models/Message')

let ioInstance = null

// Temporary in-memory storage until database models are properly set up
const messageStorage = new Map() // conversationId -> [messages]
const conversationStorage = new Map() // conversationId -> conversation data

const initSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || '*',
      credentials: true,
    },
  })

  const secret = process.env.JWT_SECRET

  ioInstance.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token

      if (!token) {
        return next(new Error('Unauthorized'))
      }

      if (!secret) {
        return next(new Error('JWT secret is not configured'))
      }

      const decoded = jwt.verify(token, secret)
      console.log('🔐 JWT decoded:', decoded);
      
      // Create user object with all available data
      socket.user = { 
        id: decoded.id,
        email: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        name: decoded.name,
        role: decoded.role,
        department: decoded.department,
        // Try to construct full name if not provided
        fullName: decoded.name || 
                 (decoded.firstName && decoded.lastName ? 
                   `${decoded.firstName} ${decoded.lastName}` : 
                   decoded.firstName || 'User')
      }
      
      console.log('👤 Socket user object created:', socket.user);
      socket.join(`user:${decoded.id}`)

      return next()
    } catch (error) {
      console.error('❌ JWT verification error:', error);
      return next(new Error('Unauthorized'))
    }
  })

  ioInstance.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.user.id);

    socket.on('joinConversation', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`👥 User ${socket.user.id} joined conversation ${conversationId}`);
        
        // Send existing messages for this conversation from memory
        const messages = messageStorage.get(conversationId) || [];
        messages.forEach(msg => {
          socket.emit('receiveMessage', {
            ...msg,
            type: msg.senderId === socket.user.id ? 'sent' : 'received'
          });
        });
        
        console.log(`📨 Sent ${messages.length} messages to user ${socket.user.id}`);
      }
    });

    socket.on('testConnection', (data) => {
      console.log('🧪 [Backend] Test connection received:', data);
      socket.emit('testConnectionResponse', { 
        message: 'Connection test successful',
        conversationId: data.conversationId,
        userId: socket.user.id
      });
    });

    socket.on('leaveConversation', (conversationId) => {
      if (conversationId) {
        socket.leave(conversationId);
        console.log(`👋 User ${socket.user.id} left conversation ${conversationId}`);
      }
    });

    // Handle sending messages
    socket.on('sendMessage', async (data) => {
      try {
        console.log('📨 Message received from client:', data);
        console.log('📨 Socket user info:', socket.user);
        
        // Get conversation data to use participant info if available
        const conversation = conversationStorage.get(data.conversationId);
        const participantInfo = conversation?.participants?.[socket.user.id];
        
        // Use the best available name source
        const senderName = participantInfo?.name || 
                          socket.user.fullName || 
                          socket.user.name || 
                          'User';
        
        const senderRole = participantInfo?.role || 
                          socket.user.role || 
                          'User';

        // Create message object for database
        const messageData = {
          conversationId: data.conversationId,
          senderId: socket.user.id,
          senderName: senderName,
          recipientId: data.recipientId,
          recipientName: data.recipientName || 'Unknown User',
          text: data.text.trim(),
          timestamp: new Date(),
          isRead: false
        };

        console.log('💾 [Socket] Saving message to database:', messageData);

        // Save message to database
        const savedMessage = await Message.create(messageData);
        console.log('✅ [Socket] Message saved to database with ID:', savedMessage._id);

        // Prepare message for frontend (include _id from database)
        const messageForClient = {
          _id: savedMessage._id,
          conversationId: savedMessage.conversationId,
          senderId: savedMessage.senderId,
          senderName: savedMessage.senderName,
          recipientId: savedMessage.recipientId,
          text: savedMessage.text,
          timestamp: savedMessage.timestamp,
          isRead: savedMessage.isRead,
          type: 'message'
        };

        console.log('📨 [Socket] Emitting message to room:', data.conversationId);

        // Emit message to all clients in the conversation room
        ioInstance.to(data.conversationId).emit('receiveMessage', messageForClient);

        // Also store in memory for backup (optional)
        if (!messageStorage.has(data.conversationId)) {
          messageStorage.set(data.conversationId, []);
        }
        const conversationMessages = messageStorage.get(data.conversationId) || [];
        messageStorage.set(data.conversationId, [...conversationMessages, messageForClient]);

      } catch (error) {
        console.error('❌ [Socket] Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle marking messages as read
    socket.on('markMessagesAsRead', (data) => {
      try {
        console.log('📖 Messages marked as read:', data);
        
        // Update conversation unread count
        const conversation = conversationStorage.get(data.conversationId);
        if (conversation) {
          conversation.unread = 0;
        }
        
        // Mark all messages in this conversation as read for this user
        const messages = messageStorage.get(data.conversationId) || [];
        messages.forEach(msg => {
          if (msg.recipientId === socket.user.id) {
            msg.isRead = true;
          }
        });
        
        // Broadcast read status to conversation room
        ioInstance.to(data.conversationId).emit('messageRead', {
          userId: socket.user.id,
          conversationId: data.conversationId,
          timestamp: new Date().toISOString()
        });
        
        // Also send updated messages back to sender to show read status
        ioInstance.to(data.conversationId).emit('messagesUpdated', {
          conversationId: data.conversationId,
          messages: messages
        });
        
        console.log('✅ Messages marked as read and notifications sent');
        
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.user.id}`);
    });
  });

  return ioInstance
}

// Helper function to store conversation data
const storeConversation = (conversationId, conversationData) => {
  conversationStorage.set(conversationId, conversationData);
};

// Helper function to get conversation data
const getConversation = (conversationId) => {
  return conversationStorage.get(conversationId);
};

// Helper function to get message storage
const getMessageStorage = () => {
  return messageStorage;
};

// Helper function to get conversation storage
const getConversationStorage = () => {
  return conversationStorage;
};

const getSocket = () => ioInstance

module.exports = {
  initSocket,
  getSocket,
  storeConversation,
  getConversation,
  getMessageStorage,
  getConversationStorage
}
