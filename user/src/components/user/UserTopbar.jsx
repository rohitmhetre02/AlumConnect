import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notifications } from '../../data/notifications'
import NotificationDropdown from './topbar/NotificationDropdown'
import MessageDropdown from './topbar/MessageDropdown'
import useMessages from '../../hooks/useMessages'

const UserTopbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { conversations, unreadCount, sendMessage, getConversationMessages, joinConversation, leaveConversation } = useMessages()
  const displayName =
    user?.name ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
    user?.profile?.fullName ||
    user?.email?.split('@')[0] ||
    ''
  const rawRole = user?.role ?? user?.profile?.role ?? ''
  const displayRole = rawRole ? rawRole.toString().toUpperCase() : ''
  const displayEmail = user?.email ?? user?.profile?.email ?? ''
  const avatarUrl = user?.avatar || user?.profile?.avatar || ''
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : user?.email?.charAt(0)?.toUpperCase() || 'A'
  const [openDropdown, setOpenDropdown] = useState(null)
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const [showMessagesPanel, setShowMessagesPanel] = useState(false)
  const [messagesViewMode, setMessagesViewMode] = useState('list')
  const [conversationMap, setConversationMap] = useState({})
  const [activeConversationId, setActiveConversationId] = useState(null)
  const notificationRef = useRef(null)
  const messageRef = useRef(null)
  const profileRef = useRef(null)

  useEffect(() => {
    const handleClick = (event) => {
      if (
        notificationRef.current?.contains(event.target) ||
        messageRef.current?.contains(event.target) ||
        profileRef.current?.contains(event.target)
      ) {
        return
      }
      setOpenDropdown(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleProfileSelect = () => {
    navigate('/dashboard/profile')
    setOpenDropdown(null)
  }

  const handleLogout = () => {
    logout()
    setOpenDropdown(null)
  }

  const ensureConversationLoaded = async (conversationId) => {
    if (!conversationId || conversationMap[conversationId]) return
    try {
      const msgs = await getConversationMessages(conversationId)
      setConversationMap((prev) => ({ ...prev, [conversationId]: msgs }))
    } catch (err) {
      console.warn('Failed to load messages for conversation:', conversationId, err)
    }
  }

  const showConversation = (conversationId) => {
    if (!conversationId) return
    ensureConversationLoaded(conversationId)
    setActiveConversationId(conversationId)
    setMessagesViewMode('conversation')
    return conversationId
  }

  const showConversationList = () => {
    setMessagesViewMode('list')
  }

  const openMessagesPanel = (conversationId) => {
    if (conversationId) {
      showConversation(conversationId)
    } else {
      setActiveConversationId(null)
      setMessagesViewMode('list')
    }
    setShowMessagesPanel(true)
    setOpenDropdown(null)
  }

  const handleConversationSelect = (conversationId) => {
    if (!conversationId) return
    showConversation(conversationId)
  }

  const closeMessagesPanel = () => {
    setShowMessagesPanel(false)
    setActiveConversationId(null)
    setMessagesViewMode('list')
  }

  const handleSendMessage = async (conversationId, text) => {
    if (!conversationId || !text?.trim()) return
    try {
      const { message } = await sendMessage({ conversationId, body: text.trim() })
      if (message) {
        setConversationMap((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] ?? []), message],
        }))
      }
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  return (
    <>
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
              placeholder="Search alumni, jobs, events..."
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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative" ref={notificationRef}>
            <IconButton
              label="Notifications"
              badge="2"
              onClick={() => setOpenDropdown((prev) => (prev === 'notifications' ? null : 'notifications'))}
              aria-expanded={openDropdown === 'notifications'}
            >
              <BellIcon className="h-5 w-5" />
            </IconButton>
            {openDropdown === 'notifications' && (
              <div className="absolute right-0 mt-3">
                <NotificationDropdown
                  onViewAllActivity={() => {
                    setShowActivityPanel(true)
                    setOpenDropdown(null)
                  }}
                />
              </div>
            )}
          </div>

          <div className="relative" ref={messageRef}>
            <IconButton
              label="Messages"
              badge={unreadCount > 0 ? unreadCount.toString() : null}
              onClick={() => setOpenDropdown((prev) => (prev === 'messages' ? null : 'messages'))}
              aria-expanded={openDropdown === 'messages'}
            >
              <MessageIcon className="h-5 w-5" />
            </IconButton>
            {openDropdown === 'messages' && (
              <div className="absolute right-0 mt-3">
                <MessageDropdown
                  conversations={conversations}
                  onViewAllMessages={() => openMessagesPanel(null)}
                  onSelectConversation={openMessagesPanel}
                />
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setOpenDropdown((prev) => (prev === 'profile' ? null : 'profile'))}
              className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-primary/40 sm:gap-3 sm:px-3"
              aria-haspopup="menu"
              aria-expanded={openDropdown === 'profile'}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName || 'Profile avatar'}
                  className="h-9 w-9 rounded-full object-cover sm:h-10 sm:w-10"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary sm:h-10 sm:w-10">
                  {avatarInitial}
                </span>
              )}
              <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition ${openDropdown === 'profile' ? 'rotate-180 text-slate-500' : ''}`} />
            </button>
            {openDropdown === 'profile' && (
              <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
                <div className="my-1 border-t border-slate-100" />
                <DropdownItem icon={UserIcon} label="Profile" onClick={handleProfileSelect} />
                <DropdownItem icon={LogoutIcon} label="Logout" onClick={handleLogout} />
              </div>
            )}
          </div>
        </div>
      </header>
      <ActivityPanel isOpen={showActivityPanel} onClose={() => setShowActivityPanel(false)} />
      <MessagesPanel
        isOpen={showMessagesPanel}
        onClose={closeMessagesPanel}
        contacts={conversations}
        conversations={conversationMap}
        activeConversationId={activeConversationId}
        viewMode={messagesViewMode}
        onShowList={showConversationList}
        onSelectConversation={handleConversationSelect}
        onSendMessage={handleSendMessage}
        onJoinConversation={joinConversation}
        onLeaveConversation={leaveConversation}
      />
    </>
  )
}

const IconButton = ({ children, label, badge, onClick, ...props }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-primary"
    aria-label={label}
    {...props}
  >
    {children}
    {badge && (
      <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-white">
        {badge}
      </span>
    )}
  </button>
)

const DropdownItem = ({ icon: Icon, label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"
    role="menuitem"
  >
    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </span>
    <span className="font-medium">{label}</span>
  </button>
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

const BellIcon = (props) => (
  <IconBase {...props}>
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </IconBase>
)

const MessageIcon = (props) => (
  <IconBase {...props}>
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 018.5-8.5h.5a8.5 8.5 0 018.5 8.5z" />
  </IconBase>
)

const MenuIcon = (props) => (
  <IconBase {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </IconBase>
)

const ChevronLeftIcon = (props) => (
  <IconBase {...props}>
    <polyline points="15 18 9 12 15 6" />
  </IconBase>
)

const ChevronDownIcon = (props) => (
  <IconBase {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconBase>
)

const UserIcon = (props) => (
  <IconBase {...props}>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconBase>
)

const LogoutIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </IconBase>
)

const ActivityPanel = ({ isOpen, onClose }) => (
  <SlideOverBase
    isOpen={isOpen}
    label="Activity"
    title="All Notifications"
    subtitle="Stay updated with your mentorship requests, reminders, and announcements."
    onClose={onClose}
  >
    <div className="space-y-4">
      {notifications.map((item) => (
        <article key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
            <span className="text-xs font-medium text-slate-400">{item.time}</span>
          </div>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-primary">{item.type}</p>
        </article>
      ))}
    </div>
  </SlideOverBase>
)

const CloseIcon = (props) => (
  <IconBase {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconBase>
)

const SlideOverBase = ({
  isOpen,
  onClose,
  label,
  title,
  subtitle,
  children,
  footer,
  headerActions,
  contentClassName = '',
}) => (
  <div
    className={`fixed inset-0 z-30 flex justify-end transition pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}
    aria-hidden={!isOpen}
  >
    <div
      className={`flex-1 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ease-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    />
    <aside
      className={`relative flex h-full w-full max-w-sm flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-primary/40 hover:text-primary"
        aria-label="Close panel"
      >
        <CloseIcon className="h-4 w-4" />
      </button>
      <div className="flex h-full flex-col pt-16">
        <div className={`flex-1 overflow-y-auto px-6 pb-8 ${contentClassName}`}>
          <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              {label ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{label}</p> : null}
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
            </div>
            {headerActions ? <div className="flex-shrink-0">{headerActions}</div> : null}
          </header>
          {children}
        </div>
        {footer ? <div className="border-t border-slate-100 bg-white px-6 py-4">{footer}</div> : null}
      </div>
    </aside>
  </div>
)

const MessagesPanel = ({
  isOpen,
  onClose,
  contacts,
  conversations,
  activeConversationId,
  viewMode,
  onShowList,
  onSelectConversation,
  onSendMessage,
}) => {
  const [draft, setDraft] = useState('')
  const endRef = useRef(null)

  const activeContact = contacts.find((item) => item.id === activeConversationId)
  const conversation = activeConversationId ? conversations[activeConversationId] ?? [] : []

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation, isOpen])

  useEffect(() => {
    setDraft('')
  }, [activeConversationId, isOpen])

  const handleClose = () => {
    setDraft('')
    onClose()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!draft.trim()) return
    onSendMessage(activeConversationId, draft)
    setDraft('')
  }

  const showChat = viewMode === 'conversation' && activeContact
  const showList = viewMode === 'list'

  const composer = showChat ? (
    <form className="flex items-end gap-3" onSubmit={handleSubmit}>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
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
      <ChevronLeftIcon className="h-3 w-3" />
      Back to all messages
    </button>
  ) : null

  const listCards = contacts.map((contact) => (
    <button
      key={`contact-${contact.id}`}
      type="button"
      onClick={() => onSelectConversation(contact.id)}
      className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-primary/40 hover:shadow-md"
    >
      <img src={contact.avatar} alt={contact.sender} className="h-12 w-12 rounded-full object-cover" />
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-slate-900">{contact.sender}</p>
          <span className="text-xs text-slate-400">{contact.time}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{contact.preview}</p>
      </div>
    </button>
  ))

  return (
    <SlideOverBase
      isOpen={isOpen}
      onClose={handleClose}
      label="Messages"
      title={showChat ? activeContact.sender : 'Your conversations'}
      subtitle={
        showChat
          ? `Last active ${activeContact.time}.`
          : 'Catch up on your latest mentorship conversations.'
      }
      headerActions={conversationHeader}
      contentClassName={showList ? 'bg-slate-50/60' : ''}
      footer={composer}
    >
      {showList ? (
        <div className="space-y-3">
          {listCards.length ? listCards : <p className="text-sm text-slate-500">No conversations yet.</p>}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3">
            <img src={activeContact.avatar} alt={activeContact.sender} className="h-11 w-11 rounded-full object-cover" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{activeContact.sender}</p>
              <p className="text-xs text-slate-500">You connected recently · {activeContact.time}</p>
            </div>
          </div>

          <div className="space-y-3">
            {conversation.length ? (
              conversation.map((entry) => (
                <div key={entry.id} className={`flex ${entry.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                        entry.direction === 'outgoing'
                          ? 'rounded-br-md bg-primary text-white'
                          : 'rounded-bl-md bg-white text-slate-700'
                      }`}
                    >
                      {entry.text}
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        entry.direction === 'outgoing' ? 'text-right text-primary/80' : 'text-slate-400'
                      }`}
                    >
                      {entry.timestamp}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No messages yet. Start the conversation below.</p>
            )}
            <div ref={endRef} />
          </div>
        </div>
      )}
    </SlideOverBase>
  )
}

export default UserTopbar
