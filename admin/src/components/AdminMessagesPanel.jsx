import { useEffect, useRef, useState } from 'react'

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }
}

const AdminMessagesPanel = ({ 
  isOpen, 
  onClose, 
  contacts = [], 
  conversations = {}, 
  activeConversationId,
  viewMode = 'list',
  onShowList,
  onSelectConversation,
  onSendMessage,
}) => {
  const [draft, setDraft] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const endRef = useRef(null)

  // Use the messages from the conversations prop if available
  const messages = conversations[activeConversationId] || []

  // Filter conversations based on search term
  const filteredContacts = contacts.filter(contact => {
    const participant = contact.participants?.find(p => p.userId !== contact.participants[0]?.userId) || contact.participants?.[0]
    return participant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleSelectConversation = (conversationId) => {
    onSelectConversation?.(conversationId)
  }

  const handleBackToList = () => {
    onShowList?.()
    setDraft('')
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    const trimmed = draft.trim()
    if (!trimmed || !activeConversationId) return

    try {
      onSendMessage?.(activeConversationId, trimmed)
      setDraft('')
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const showChat = viewMode === 'conversation' && activeConversationId
  const showList = viewMode === 'list'

  const composer = showChat ? (
    <form className="flex items-end gap-3" onSubmit={handleSendMessage}>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        placeholder="Type your message..."
        className="flex-1 resize-none rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
      />
      <button
        type="submit"
        className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
        disabled={!draft.trim()}
      >
        Send
      </button>
    </form>
  ) : null

  const conversationHeader = showChat ? (
    <button
      type="button"
      onClick={onShowList}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
    >
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Back to all messages
    </button>
  ) : null

  // Helper function to get the other participant
  const getOtherParticipant = (contact) => {
    if (!contact?.participants) return null
    return contact.participants.find(p => p.userId !== contact.participants[0]?.userId) || contact.participants[0]
  }

  const listCards = filteredContacts.map((contact) => {
    const participant = getOtherParticipant(contact)
    return (
      <button
        key={`contact-${contact._id}`}
        type="button"
        onClick={() => handleSelectConversation(contact._id)}
        className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
      >
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {participant?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm">
            <p className="font-semibold text-slate-900">{participant?.name || 'Unknown'}</p>
            <span className="text-xs text-slate-400">
              {contact.lastMessage?.createdAt ? new Date(contact.lastMessage.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
            {contact.lastMessage?.preview || 'No messages yet'}
          </p>
        </div>
      </button>
    )
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl lg:inset-y-0 lg:right-auto lg:left-0 lg:w-96">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            {showChat && (
              <button
                onClick={handleBackToList}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                <ArrowLeft size={20} className="text-slate-600" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-slate-900">
              {showChat ? 'Chat' : 'Messages'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100"
          >
            <svg className="h-5 w-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {viewMode === 'list' ? (
          /* Message List View */
          <div className="flex h-full flex-col">
            {/* Search */}
            <div className="border-b border-slate-200 p-4">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-full border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const participant = getOtherParticipant(contact)
                  return (
                    <button
                      key={contact._id}
                      onClick={() => handleSelectConversation(contact._id)}
                      className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left hover:bg-slate-50 focus:outline-none"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                        {participant?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900 truncate">
                            {participant?.name || 'Unknown'}
                          </p>
                          <span className="text-xs text-slate-400">
                            {formatTime(contact.lastMessage?.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {contact.lastMessage?.preview || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <p className="text-slate-600 font-medium">No conversations yet</p>
                  <p className="text-sm text-slate-400 mt-1">Start messaging people to see them here</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Message Detail View */
          <div className="flex h-full flex-col">
            {/* Chat Header */}
            <div className="border-b border-slate-200 px-4 py-3">
              {(() => {
                const conversation = contacts.find(c => c._id === activeConversationId)
                const participant = getOtherParticipant(conversation)
                return (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                      {participant?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {participant?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {participant?.role || 'User'}
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length > 0 ? (
                messages.map((entry) => {
                  const isMe = entry.senderId === 'admin' // Admin user ID - this should be dynamic
                  return (
                    <div key={entry._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[85%]">
                        <div
                          className={`rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? 'rounded-br-md bg-primary text-white'
                              : 'rounded-bl-md bg-white text-slate-700'
                          }`}
                        >
                          {entry.body}
                        </div>
                        <p
                          className={`mt-1 text-xs ${
                            isMe ? 'text-right text-primary/80' : 'text-slate-400'
                          }`}
                        >
                          {formatTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-slate-500">No messages yet. Start the conversation below.</p>
              )}
              <div ref={endRef} />
            </div>
          </div>
        )}

        {/* Message Composer */}
        {composer}
      </div>
    </div>
  )
}

export default AdminMessagesPanel
