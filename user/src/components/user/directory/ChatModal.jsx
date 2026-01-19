import { useEffect, useRef, useState } from 'react'
import Modal from '../../ui/Modal'
import useMessages from '../../../hooks/useMessages'
import useToast from '../../../hooks/useToast'
import { useAuth } from '../../../context/AuthContext'

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const ChatModal = ({ isOpen, onClose, recipient, onViewAllMessages }) => {
  const { user } = useAuth()
  const { sendMessage, getConversationMessages, joinConversation, leaveConversation, getConversationWith } = useMessages()
  const addToast = useToast()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const endRef = useRef(null)

  const recipientId = recipient?._id ?? recipient?.id
  const recipientRole = recipient?.role
  const recipientName = recipient?.name || recipient?.fullName || 'Conversation'

  useEffect(() => {
    if (!isOpen || !recipientId || !recipientRole) {
      setMessages([])
      setConversationId(null)
      setDraft('')
      return
    }

    const load = async () => {
      setLoading(true)
      try {
        const conv = await getConversationWith({ recipientId, recipientRole })
        if (conv?._id) {
          setConversationId(conv._id)
          joinConversation(conv._id)
          const msgs = await getConversationMessages(conv._id)
          setMessages(msgs)
        } else {
          setConversationId(null)
          setMessages([])
        }
      } catch (err) {
        console.error('Failed to load conversation:', err)
        addToast?.({ title: 'Could not load messages', tone: 'error' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isOpen, recipientId, recipientRole, getConversationWith, joinConversation, getConversationMessages, addToast])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleClose = () => {
    if (conversationId) {
      leaveConversation(conversationId)
    }
    setMessages([])
    setConversationId(null)
    setDraft('')
    onClose?.()
  }

  const handleSend = async (e) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || !recipientId || !recipientRole) return

    try {
      const { message } = await sendMessage({
        conversationId,
        recipientId,
        recipientRole,
        body: trimmed,
      })
      if (message) {
        setMessages((prev) => [...prev, message])
      }
      if (!conversationId && message?.conversationId) {
        setConversationId(message.conversationId)
        joinConversation(message.conversationId)
      }
      setDraft('')
    } catch (err) {
      console.error('Send failed:', err)
    }
  }

  const handleViewAll = () => {
    if (onViewAllMessages) {
      onViewAllMessages(conversationId)
    }
  }

  const otherParticipant = recipient

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={recipientName} width="max-w-2xl">
      <div className="flex h-[500px] flex-col">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            {recipientName ? (
              <p className="text-sm font-semibold text-slate-900">{recipientName}</p>
            ) : null}
            {otherParticipant?.role ? (
              <p className="text-xs text-slate-400 capitalize">{otherParticipant.role}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={handleViewAll}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:border-primary/40 hover:text-primary"
          >
            View All Messages
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
          {loading ? (
            <p className="text-center text-sm text-slate-400">Loading messages...</p>
          ) : messages.length > 0 ? (
            messages.map((msg) => {
              const isMe = msg.senderId === user?.id
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                    isMe ? 'bg-primary text-white' : 'bg-slate-100 text-slate-800'
                  }`}>
                    <p>{msg.body}</p>
                    <p className={`mt-1 text-xs ${isMe ? 'text-primary/80' : 'text-slate-400'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-center text-sm text-slate-400">No messages yet. Start the conversation!</p>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} className="border-t border-slate-100 px-4 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim() || loading}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}

export default ChatModal
