const MessageDropdown = ({ conversations, onViewAllMessages, onSelectConversation }) => {
  const otherParticipant = (conv) => {
    if (!conv?.participants) return null
    return conv.participants.find((p) => p.userId !== conv.participants[0].userId) ?? conv.participants[0]
  }

  const formatTime = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="w-80 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
        <span>Messages</span>
        <button className="text-xs text-primary">⋯</button>
      </div>
      <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
        <input
          type="search"
          placeholder="Search conversations..."
          className="w-full rounded-full border border-slate-100 bg-white px-4 py-2 text-sm text-slate-600 focus:border-primary focus:outline-none"
        />
      </div>
      <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conv) => {
            const participant = otherParticipant(conv)
            return (
              <button
                key={conv._id}
                type="button"
                onClick={() => onSelectConversation?.(conv._id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-primary/40 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {participant?.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-slate-900">{participant?.name ?? 'Unknown'}</p>
                    <span className="text-xs text-slate-400">{formatTime(conv.lastMessage?.createdAt)}</span>
                  </div>
                  <p className="truncate text-xs text-slate-500">{conv.lastMessage?.preview ?? 'No messages yet'}</p>
                </div>
              </button>
            )
          })
        ) : (
          <p className="text-center text-sm text-slate-400">No conversations yet</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onViewAllMessages?.()}
        className="mt-4 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-primary transition hover:bg-slate-200"
      >
        View All Messages
      </button>
    </div>
  )
}

export default MessageDropdown
