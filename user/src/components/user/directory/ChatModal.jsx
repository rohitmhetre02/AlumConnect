import { useEffect, useRef, useState } from 'react'
import Modal from '../../ui/Modal'
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
  const addToast = useToast()
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  const recipientId = recipient?._id ?? recipient?.id
  const recipientName = recipient?.name || recipient?.fullName || 'Conversation'

  const handleSend = async () => {
    const trimmed = draft.trim()
    if (!trimmed || !recipientId) return

    try {
      // Simple message handling - replace with actual implementation later
      const newMessage = {
        _id: Date.now().toString(),
        senderId: user?._id,
        senderName: user?.name || 'You',
        recipientId: recipientId,
        body: trimmed,
        createdAt: new Date().toISOString(),
      }
      
      setMessages(prev => [...prev, newMessage])
      setDraft('')
      addToast('Message sent successfully!')
    } catch (err) {
      console.error('Failed to send message:', err)
      addToast('Failed to send message', 'error')
    }
  }

  const handleClose = () => {
    setMessages([])
    setDraft('')
    onClose()
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (!recipient) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={recipientName}
      subtitle="Start a conversation"
    >
      <div className="flex h-96 flex-col">
        <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-slate-400">No messages yet. Start the conversation!</p>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                      msg.senderId === user?._id
                        ? 'bg-primary text-white'
                        : 'bg-white text-slate-700'
                    }`}
                  >
                    <p>{msg.body}</p>
                    <p className={`mt-1 text-xs ${
                      msg.senderId === user?._id ? 'text-primary/80' : 'text-slate-400'
                    }`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type a message..."
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || loading}
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => onViewAllMessages?.()}
            className="text-xs text-primary transition hover:text-primary/80"
          >
            View All Messages
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ChatModal
