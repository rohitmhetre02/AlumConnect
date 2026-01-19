import { get, post } from './api'

export const fetchConversations = async () => {
  const response = await get('/messages')
  return response?.data ?? []
}

export const fetchConversationWith = async ({ recipientId, recipientRole }) => {
  if (!recipientId || !recipientRole) {
    throw new Error('recipientId and recipientRole are required')
  }
  const normalizedRole = recipientRole.toLowerCase()
  const response = await get(`/messages/with/${normalizedRole}/${recipientId}`)
  return response?.data ?? null
}

export const fetchConversationMessages = async (conversationId) => {
  if (!conversationId) return []
  const response = await get(`/messages/${conversationId}/messages`)
  return response?.data ?? []
}

export const sendMessage = async ({ conversationId, recipientId, recipientRole, body }) => {
  const response = await post('/messages/send', {
    conversationId,
    recipientId,
    recipientRole,
    body,
  })
  return response?.data ?? null
}
