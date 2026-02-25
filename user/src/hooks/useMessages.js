import { useCallback, useEffect, useRef, useState } from 'react'

import { io } from 'socket.io-client'

import { get, post } from '../utils/api'

import { getAuthToken } from '../utils/api'

import useToast from './useToast'



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



const formatConversation = (conversation) => {

  if (!conversation) return null

  return {

    ...conversation,

    _id: conversation._id?.toString?.() ?? conversation._id,

    createdAt: normalizeISO(conversation.createdAt),

    updatedAt: normalizeISO(conversation.updatedAt),

    lastMessage: conversation.lastMessage

      ? {

          ...conversation.lastMessage,

          createdAt: normalizeISO(conversation.lastMessage.createdAt),

          preview: conversation.lastMessage.preview ?? conversation.lastMessage.body ?? '',

        }

      : null,

    participants: Array.isArray(conversation.participants)

      ? conversation.participants.map(formatParticipant).filter(Boolean)

      : [],

  }

}



export const useMessages = () => {

  const [conversations, setConversations] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)

  const [socket, setSocket] = useState(null)

  const [unreadCount, setUnreadCount] = useState(0)

  const addToast = useToast()

  const socketRef = useRef(null)



  const connectSocket = useCallback(() => {

    if (!SOCKETS_ENABLED) {

      return

    }



    const token = getAuthToken()

    if (!token) return



    const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    const socketUrl = rawBaseUrl.replace(/\/api\/?$/, '')



    const newSocket = io(socketUrl, {

      auth: { token },

      transports: ['websocket', 'polling'],

      reconnectionAttempts: 3,

    })



    newSocket.on('connect', () => {

      console.log('Socket connected')

    })



    newSocket.on('message:new', ({ conversationId, message }) => {

      const formatted = formatMessage(message)

      if (!formatted) return



      setConversations((prev) => {

        const conv = prev.find((c) => c._id === conversationId)

        if (conv) {

          return prev.map((c) =>

            c._id === conversationId

              ? {

                  ...c,

                  lastMessage: formatted,

                  updatedAt: formatted.createdAt,

                }

              : c

          )

        }

        return prev

      })



      addToast?.({

        title: 'New message',

        description: formatted.body?.slice(0, 80),

        tone: 'info',

      })

    })



    newSocket.on('close', () => {

      if (socketRef.current === newSocket) {

        newSocket.removeAllListeners()

      }

    })



    newSocket.on('conversation:updated', ({ conversationId, lastMessage }) => {

      setConversations((prev) =>

        prev.map((c) =>

          c._id === conversationId

            ? {

                ...c,

                lastMessage,

                updatedAt: lastMessage?.createdAt || c.updatedAt,

              }

            : c

        )

      )

    })



    newSocket.on('connect_error', (err) => {

      console.warn('Socket connect error:', err.message)

      if (err.message?.includes('Invalid namespace')) {

        console.warn('Ensure backend socket server is running without namespace requirements.')

      }

      if (socketRef.current === newSocket) {

        newSocket.removeAllListeners()

        newSocket.disconnect()

        socketRef.current = null

        setSocket(null)

      }

    })



    newSocket.on('disconnect', (reason) => {

      console.log('Socket disconnected:', reason)

    })



    socketRef.current = newSocket

    setSocket(newSocket)

  }, [addToast])



  const disconnectSocket = useCallback(() => {

    if (socketRef.current) {

      socketRef.current.removeAllListeners()

      socketRef.current.disconnect()

      socketRef.current = null

      setSocket(null)

    }

  }, [])



  useEffect(() => {

    connectSocket()

    return () => disconnectSocket()

  }, [connectSocket, disconnectSocket])



  const fetchConversations = useCallback(async () => {

    setLoading(true)

    setError(null)

    try {

      const response = await get('/messages')

      const data = Array.isArray(response?.data) ? response.data : []

      const formatted = data.map(formatConversation).filter(Boolean)

      setConversations(formatted)

      setUnreadCount(formatted.length)

    } catch (fetchError) {

      setError(fetchError)

      addToast?.({

        title: 'Unable to load conversations',

        description: fetchError.message ?? 'Please try again later.',

        tone: 'error',

      })

    } finally {

      setLoading(false)

    }

  }, [addToast])



  useEffect(() => {

    fetchConversations()

  }, [fetchConversations])



  const sendMessage = useCallback(

    async ({ conversationId, recipientId, recipientRole, body }) => {

      if (!body?.trim()) throw new Error('Message body is required')

      try {

        const response = await post('/messages/send', {

          conversationId,

          recipientId,

          recipientRole,

          body: body.trim(),

        })

        const { conversation, message } = response?.data ?? {}

        if (conversation) {

          const formattedConv = formatConversation(conversation)

          if (formattedConv) {

            setConversations((prev) => {

              const exists = prev.some((c) => c._id === formattedConv._id)

              if (!exists) return [formattedConv, ...prev]

              return prev.map((c) => (c._id === formattedConv._id ? formattedConv : c))

            })

          }

        }

        if (message && socketRef.current) {

          socketRef.current.emit('joinConversation', conversationId)

        }

        return { conversation, message }

      } catch (sendError) {

        addToast?.({

          title: 'Message not sent',

          description: sendError.message ?? 'Please try again.',

          tone: 'error',

        })

        throw sendError

      }

    },

    [addToast]

  )



  const getConversationWith = useCallback(

    async ({ recipientId, recipientRole }) => {

      if (!recipientId || !recipientRole) return null

      try {

        const response = await get(`/messages/with/${recipientRole}/${recipientId}`)

        const data = response?.data

        if (!data) return null

        const formatted = formatConversation(data)

        if (formatted) {

          setConversations((prev) => {

            const exists = prev.some((c) => c._id === formatted._id)

            if (!exists) return [formatted, ...prev]

            return prev.map((c) => (c._id === formatted._id ? formatted : c))

          })

        }

        return formatted

      } catch (err) {

        console.warn('Failed to get conversation with:', err)

        return null

      }

    },

    []

  )



  const getConversationMessages = useCallback(async (conversationId) => {

    if (!conversationId) return []

    try {

      const response = await get(`/messages/${conversationId}/messages`)

      const data = Array.isArray(response?.data) ? response.data : []

      return data.map(formatMessage).filter(Boolean)

    } catch (err) {

      console.warn('Failed to fetch messages:', err)

      return []

    }

  }, [])



  const joinConversation = useCallback(

    (conversationId) => {

      if (socketRef.current && conversationId) {

        socketRef.current.emit('joinConversation', conversationId)

      }

    },

    []

  )



  const leaveConversation = useCallback(

    (conversationId) => {

      if (socketRef.current && conversationId) {

        socketRef.current.emit('leaveConversation', conversationId)

      }

    },

    []

  )



  return {

    conversations,

    loading,

    error,

    unreadCount,

    socket,

    sendMessage,

    getConversationWith,

    getConversationMessages,

    joinConversation,

    leaveConversation,

    refresh: fetchConversations,

  }

}



export default useMessages

