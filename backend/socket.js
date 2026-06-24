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

    socket.on('joinConversation', async (conversationId) => {
      if (conversationId) {
        socket.join(conversationId);
        console.log(`👥 User ${socket.user.id} joined conversation ${conversationId}`);
        
        // Load messages from database
        try {
          const dbMessages = await Message.find({ conversationId })
            .sort({ timestamp: 1 })
            .lean();
          
          if (dbMessages.length > 0) {
            dbMessages.forEach(msg => {
              socket.emit('receiveMessage', {
                ...msg,
                type: msg.senderId === socket.user.id ? 'sent' : 'received'
              });
            });
            console.log(`📨 Sent ${dbMessages.length} messages from DB to user ${socket.user.id}`);
          } else {
            // Fall back to memory storage
            const memMessages = messageStorage.get(conversationId) || [];
            memMessages.forEach(msg => {
              socket.emit('receiveMessage', {
                ...msg,
                type: msg.senderId === socket.user.id ? 'sent' : 'received'
              });
            });
            if (memMessages.length > 0) {
              console.log(`📨 Sent ${memMessages.length} messages from memory to user ${socket.user.id}`);
            }
          }
        } catch (err) {
          console.error('❌ Error loading messages from DB:', err);
          const memMessages = messageStorage.get(conversationId) || [];
          memMessages.forEach(msg => {
            socket.emit('receiveMessage', {
              ...msg,
              type: msg.senderId === socket.user.id ? 'sent' : 'received'
            });
          });
        }
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
        const participantInfo = conversation?.participants?.find?.(p => p.userId === socket.user.id);
        
        // Use the JWT-authenticated user's identity, not client-provided data
        const senderName = socket.user.fullName || 
                          socket.user.name || 
                          participantInfo?.userName || 
                          data.senderName || 
                          'User';
        
        const senderRole = socket.user.role || 
                          participantInfo?.userRole || 
                          data.senderRole || 
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

        // Update conversation's lastMessage and unread count
        try {
          const Conversation = require('./models/Conversation');
          await Conversation.findOneAndUpdate(
            { _id: data.conversationId },
            {
              $set: { lastMessage: { text: data.text, timestamp: new Date() }, updatedAt: new Date() },
              $inc: { [`unreadCounts.${data.recipientId}`]: 1 }
            }
          );
        } catch (convErr) {
          console.error('❌ [Socket] Error updating conversation:', convErr.message);
        }

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

        // Also emit to recipient's personal room for reliable delivery
        // (in case they haven't joined the conversation room yet)
        if (data.recipientId) {
          ioInstance.to(`user:${data.recipientId}`).emit('receiveMessage', messageForClient);
        }

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
    socket.on('markMessagesAsRead', async (data) => {
      try {
        console.log('📖 Messages marked as read:', data);
        
        // Update MongoDB: mark all incoming messages as read
        try {
          await Message.updateMany(
            { conversationId: data.conversationId, recipientId: socket.user.id, isRead: false },
            { $set: { isRead: true } }
          );
          
          await require('./models/Conversation').findOneAndUpdate(
            { _id: data.conversationId },
            { $set: { [`unreadCounts.${socket.user.id}`]: 0 } }
          );
        } catch (dbErr) {
          console.error('❌ [Socket] Error marking read in DB:', dbErr.message);
        }
        
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
