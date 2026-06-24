import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'

const API = () => import.meta.env.VITE_API_URL || 'http://localhost:5000'

const CoordinatorTopbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [messageDropdownOpen, setMessageDropdownOpen] = useState(false)
  const msgDropdownRef = useRef(null)
  const [socket, setSocket] = useState(null)

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const userId = adminUser?.id || adminUser?._id
  const unreadCount = conversations.reduce((sum, c) => sum + (c.unread || 0), 0)

  useEffect(() => {
    const handleClick = (e) => {
      if (msgDropdownRef.current && !msgDropdownRef.current.contains(e.target)) {
        setMessageDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) return

    const s = io(API(), { auth: { token }, transports: ['websocket', 'polling'] })
    setSocket(s)

    s.on('receiveMessage', (data) => {
      setConversations(prev => {
        const updated = prev.map(c =>
          c.conversationId === data.conversationId
            ? { ...c, lastMessage: data.text, time: formatTimeAgo(data.timestamp), unread: data.senderId !== userId ? (c.unread || 0) + 1 : c.unread }
            : c
        )
        localStorage.setItem('adminConversations', JSON.stringify(updated))
        return updated
      })
    })

    return () => s.close()
  }, [userId])

  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) return
      const res = await fetch(`${API()}/api/conversations/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (data.success) {
        setConversations(data.data)
        localStorage.setItem('adminConversations', JSON.stringify(data.data))
      }
    } catch {
      const stored = localStorage.getItem('adminConversations')
      if (stored) setConversations(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 30000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary/40 hover:text-primary lg:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <label className="relative hidden w-full max-w-lg sm:block">
          <span className="sr-only">Search</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search students, mentors, events..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-12 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
          />
        </label>
        <label className="relative flex-1 sm:hidden">
          <span className="sr-only">Search</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
          />
        </label>
      </div>
      <div className="relative" ref={msgDropdownRef}>
        <button
          onClick={() => setMessageDropdownOpen(prev => !prev)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary/40 hover:text-primary"
          aria-label="Messages"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M21 14a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
        {messageDropdownOpen && (
          <MessageDropdown
            conversations={conversations.slice(0, 3)}
            currentUserId={userId}
onViewAll={() => { navigate('/admin/messages'); setMessageDropdownOpen(false); }}
onSelectConversation={() => { navigate('/admin/messages'); setMessageDropdownOpen(false); }}
            formatTime={formatTimeAgo}
          />
        )}
      </div>
    </header>
  )
}

const formatTimeAgo = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const MessageDropdown = ({ conversations, currentUserId, onViewAll, onSelectConversation, formatTime }) => (
  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-100 bg-white shadow-xl z-50">
    <div className="p-4">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-3">
        <span>Messages</span>
        {conversations.length > 0 && (
          <span className="text-xs text-slate-400">{conversations.length} recent</span>
        )}
      </div>
      {conversations.length > 0 ? (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = conv.participants?.find((p) => p.userId !== currentUserId)
            const name = other?.userName || conv.name || 'User'
            const avatar = other?.userAvatar || conv.avatar || ''
            return (
              <button
                key={conv.conversationId || conv._id}
                onClick={() => onSelectConversation(conv.conversationId)}
                className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition hover:border-primary/40 hover:bg-slate-50"
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
                    <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">{conv.time || formatTime(conv.updatedAt) || ''}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                </div>
                {conv.unread > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-400 py-4">No conversations yet</p>
      )}
    </div>
    {conversations.length > 0 && (
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={onViewAll}
          className="w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-primary transition hover:bg-slate-200"
        >
          View All Messages
        </button>
      </div>
    )}
  </div>
)

const IconBase = ({ children, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
)

const SearchIcon = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </IconBase>
)

const MenuIcon = (props) => (
  <IconBase {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </IconBase>
)

export default CoordinatorTopbar