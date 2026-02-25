import { useCallback, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { get, post } from '../utils/api'
import { getAuthToken } from '../utils/api'

const SOCKETS_ENABLED = (import.meta.env.VITE_ENABLE_MESSAGES ?? 'false') === 'true'

const normalizeISO = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const formatMessage = (message) => {
  if (!message) return null
  return {
    ...message,
    _id: message._id?.toString?.() ?? message._id,
    senderId: message.senderId?.toString?.() ?? message.senderId,
    createdAt: normalizeISO(message.createdAt),
  }
}

const formatParticipant = (participant) => {
  if (!participant) return null
  return {
    ...participant,
    userId: participant.userId?.toString?.() ?? participant.userId,
  }
}

const useMessages = () => {
  const [conversations, setConversations] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const socketRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!SOCKETS_ENABLED) return

    const token = getAuthToken()
    if (!token) return

    const newSocket = io('http://localhost:5000', {
      auth: {
        token: token
      }
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      socketRef.current = newSocket
      console.log('Connected to messaging server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      socketRef.current = null
      console.log('Disconnected from messaging server')
    })

    newSocket.on('message', (message) => {
      const formattedMessage = formatMessage(message)
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === formattedMessage.conversationId) {
            return {
              ...conv,
              messages: [...(conv.messages || []), formattedMessage],
              lastMessage: formattedMessage,
              lastMessagePreview: formattedMessage.body?.slice(0, 50) + '...',
              updatedAt: formattedMessage.createdAt
            }
          }
          return conv
        })
        return updated
      })
    })

    newSocket.on('conversation_updated', (conversation) => {
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === conversation._id) {
            return {
              ...conv,
              ...conversation
            }
          }
          return conv
        })
        return updated
      })
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
      setSocket(null)
      socketRef.current = null
    }
  }, [])

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = useCallback(async () => {
    try {
      const response = await get('/conversations')
      const conversationList = Array.isArray(response?.data) ? response.data : []
      
      const formattedConversations = conversationList.map(conv => ({
        ...conv,
        _id: conv._id?.toString?.() ?? conv._id,
        participants: (conv.participants || []).map(formatParticipant),
        messages: (conv.messages || []).map(formatMessage),
        lastMessage: conv.lastMessage ? formatMessage(conv.lastMessage) : null,
        lastMessagePreview: conv.lastMessage?.body?.slice(0, 50) + '...' || 'No messages yet',
        updatedAt: conv.updatedAt ? normalizeISO(conv.updatedAt) : null
      }))

      setConversations(formattedConversations)
      
      // Calculate unread count
      const unread = formattedConversations.reduce((count, conv) => {
        return count + (conv.unreadCount || 0)
      }, 0)
      setUnreadCount(unread)
      
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
      console.log('Failed to load conversations')
    }
  }, [])

  const sendMessage = useCallback(async ({ conversationId, body }) => {
    try {
      const response = await post('/conversations/send', {
        conversationId,
        body
      })
      
      if (response?.data?.message) {
        const formattedMessage = formatMessage(response.data.message)
        setConversations(prev => {
          const updated = prev.map(conv => {
            if (conv._id === conversationId) {
              return {
                ...conv,
                messages: [...(conv.messages || []), formattedMessage],
                lastMessage: formattedMessage,
                lastMessagePreview: formattedMessage.body?.slice(0, 50) + '...',
                updatedAt: formattedMessage.createdAt
              }
            }
            return conv
          })
          return updated
        })
        
        // Send via socket if available
        if (socketRef.current) {
          socketRef.current.emit('message', response.data.message)
        }
        
        return response.data
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      console.log('Failed to send message')
      throw error
    }
  }, [socket])

  const getConversationMessages = useCallback(async (conversationId) => {
    try {
      const response = await get(`/conversations/${conversationId}/messages`)
      const messages = Array.isArray(response?.data?.messages) ? response.data.messages : []
      
      return messages.map(formatMessage)
    } catch (error) {
      console.error('Failed to get conversation messages:', error)
      return []
    }
  }, [])

  const joinConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_conversation', { conversationId })
    }
  }, [])

  const leaveConversation = useCallback((conversationId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_conversation', { conversationId })
    }
  }, [])

  return {
    conversations,
    unreadCount,
    sendMessage,
    getConversationMessages,
    joinConversation,
    leaveConversation,
    isConnected
  }
}

export default useMessages
