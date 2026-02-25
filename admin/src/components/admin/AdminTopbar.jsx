import { useEffect, useRef, useState } from 'react'

import { useNavigate } from 'react-router-dom'

import { Bell, Search, LogOut, Settings, User } from 'lucide-react'

import AdminMessagesPanel from '../AdminMessagesPanelPlaceholder'

// import useMessages from '../hooks/useMessages'



const notificationItems = [

  {

    id: 1,

    title: 'Mentorship request approved',

    time: '2 min ago',

    type: 'success',

  },

  {

    id: 2,

    title: 'Upcoming faculty sync tomorrow',

    time: '1 hr ago',

    type: 'reminder',

  },

  {

    id: 3,

    title: 'New alumni signup pending review',

    time: '3 hrs ago',

    type: 'info',

  },

]



const messageItems = [

  {

    id: 1,

    sender: 'Emily Chen',

    snippet: 'Hi! Could we confirm the mentor roster for...',

    time: '5 min ago',

  },

  {

    id: 2,

    sender: 'Alumni Relations',

    snippet: 'Final assets for the campaign launch attached.',

    time: '45 min ago',

  },

  {

    id: 3,

    sender: 'Placement Cell',

    snippet: 'Requesting review of updated opportunities list.',

    time: 'Yesterday',

  },

]



const AdminTopbar = ({ onToggleSidebar }) => {

  const navigate = useNavigate()

  const [openDropdown, setOpenDropdown] = useState(null)

  const [selectedMessage, setSelectedMessage] = useState(null)

  const [showMessageDetails, setShowMessageDetails] = useState(false)

  const [showMessagesPanel, setShowMessagesPanel] = useState(false)

  const [messagesViewMode, setMessagesViewMode] = useState('list')

  const [activeConversationId, setActiveConversationId] = useState(null)

  const actionsRef = useRef(null)

  

  // Temporarily disable messaging hook to isolate error

  // const { conversations, unreadCount, sendMessage, getConversationMessages, joinConversation, leaveConversation } = useMessages()

  const conversations = []

  const unreadCount = 0

  const sendMessage = () => {}

  const getConversationMessages = () => []

  const joinConversation = () => {}

  const leaveConversation = () => {}

  

  // Create conversation map for MessagesPanel

  const conversationMap = {}



  // Get admin user data from localStorage

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')

  const displayName = adminUser.name || 'Admin User'

  const displayRole = adminUser.role ? adminUser.role.toString().toUpperCase() : 'ADMIN'

  const displayEmail = adminUser.email || 'admin@alumconnect.com'

  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : 'A'



  useEffect(() => {

    const handleClick = (event) => {

      if (actionsRef.current?.contains(event.target)) {

        return

      }

      setOpenDropdown(null)

    }

    document.addEventListener('mousedown', handleClick)

    return () => document.removeEventListener('mousedown', handleClick)

  }, [])



  const handleProfileSelect = () => {

    navigate('/admin/settings')

    setOpenDropdown(null)

  }



  const handleLogout = () => {

    localStorage.removeItem('adminToken')

    localStorage.removeItem('adminUser')

    navigate('/login')

    setOpenDropdown(null)

  }



  const handleMessageClick = (message) => {

    setSelectedMessage(message)

    setShowMessageDetails(true)

    setOpenDropdown(null)

  }



  const handleCloseMessageDetails = () => {

    setShowMessageDetails(false)

    setSelectedMessage(null)

  }



  // Messaging functions

  const showConversation = (conversationId) => {

    if (!conversationId) return

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



  const closeMessagesPanel = () => {

    setShowMessagesPanel(false)

    setActiveConversationId(null)

    setMessagesViewMode('list')

  }



  const handleConversationSelect = (conversationId) => {

    if (!conversationId) return

    showConversation(conversationId)

  }



  const handleSendMessage = async (conversationId, text) => {

    if (!conversationId || !text?.trim()) return

    try {

      const { message } = await sendMessage({ conversationId, body: text.trim() })

      // Message will be automatically updated via the hook

    } catch (error) {

      console.error('Failed to send message:', error)

    }

  }



  return (

    <>

      <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">

        {/* Logo */}

        <div className="flex items-center gap-3">

          <button

            type="button"

            onClick={onToggleSidebar}

            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary/40 hover:text-primary lg:hidden"

            aria-label="Open navigation"

          >

            <MenuIcon className="h-5 w-5" />

          </button>

          <div className="flex items-center">

            <h1 className="text-2xl font-bold text-primary">APCORE Alumni</h1>

          </div>

        </div>



        {/* Search Bar */}

        <div className="flex-1 max-w-lg">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input

              type="text"

              placeholder="Search alumni, jobs, events..."

              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"

            />

          </div>

        </div>



        {/* Right Side Actions */}

        <div className="flex items-center gap-3" ref={actionsRef}>

          {/* Notifications */}

          <DropdownTrigger

            label="notifications"

            activeKey={openDropdown}

            onToggle={setOpenDropdown}

            indicator={notificationItems.length}

            icon={Bell}

          >

            <NotificationDropdown

              items={notificationItems}

              onViewAll={() => navigate('/admin/analytics')}

            />

          </DropdownTrigger>



          {/* Messages */}

          <DropdownTrigger

            label="messages"

            activeKey={openDropdown}

            onToggle={setOpenDropdown}

            indicator={unreadCount}

            icon={MessageIcon}

          >

            <MessageDropdown

              conversations={conversations}

              onViewAllMessages={() => openMessagesPanel(null)}

              onSelectConversation={openMessagesPanel}

            />

          </DropdownTrigger>



          {/* Profile Dropdown */}

          <div className="relative">

            <button

              type="button"

              onClick={() => setOpenDropdown((prev) => (prev === 'profile' ? null : 'profile'))}

              className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-3 py-2 text-left shadow-sm transition hover:border-primary/40"

              aria-haspopup="menu"

              aria-expanded={openDropdown === 'profile'}

            >

              <span className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">

                {avatarInitial}

              </span>

              <div className="hidden sm:block">

                <p className="text-sm font-medium text-slate-900">{displayName}</p>

                <p className="text-xs text-slate-500">{displayRole}</p>

              </div>

            </button>

            {openDropdown === 'profile' && (

              <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">

                <div className="px-4 py-3 border-b border-slate-100">

                  <p className="text-sm font-medium text-slate-900">{displayName}</p>

                  <p className="text-xs text-slate-500">{displayEmail}</p>

                  <p className="text-xs font-medium text-primary">{displayRole}</p>

                </div>

                <button

                  onClick={() => navigate('/admin/settings')}

                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"

                >

                  <Settings className="h-4 w-4" />

                  <span className="font-medium">Settings</span>

                </button>

                <button

                  onClick={handleLogout}

                  className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"

                >

                  <LogOut className="h-4 w-4" />

                  <span className="font-medium">Logout</span>

                </button>

              </div>

            )}

          </div>

        </div>

      </header>

      

      <MessageDetails

        message={selectedMessage}

        isOpen={showMessageDetails}

        onClose={handleCloseMessageDetails}

      />

      

      <AdminMessagesPanel

        isOpen={showMessagesPanel}

        onClose={closeMessagesPanel}

      />

    </>

  )

}



const DropdownTrigger = ({ label, icon: Icon, indicator, activeKey, onToggle, children }) => (

  <div className="relative">

    <button

      type="button"

      onClick={() => onToggle((prev) => (prev === label ? null : label))}

      className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-primary/40 hover:text-primary ${

        activeKey === label ? 'border-primary/40 text-primary' : ''

      }`}

      aria-haspopup="menu"

      aria-expanded={activeKey === label}

    >

      <Icon className="h-5 w-5" />

      {indicator ? (

        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-bold text-white">

          {indicator}

        </span>

      ) : null}

    </button>

    {activeKey === label ? <div className="absolute right-0 mt-3 w-80">{children}</div> : null}

  </div>

)



const NotificationDropdown = ({ items, onViewAll }) => (

  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">

    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">

      <span>Notifications</span>

      <button className="text-xs text-primary">Mark all as read</button>

    </div>

    <div className="mt-3 space-y-3">

      {items.map((item) => (

        <div key={item.id} className="flex items-start gap-3 rounded-2xl bg-slate-50/70 px-3 py-2">

          <span className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${notificationTypeColors[item.type]}`}>

            •

          </span>

          <div>

            <p className="text-sm font-medium text-slate-900">{item.title}</p>

            <p className="text-xs text-slate-400">{item.time}</p>

          </div>

        </div>

      ))}

    </div>

    <button

      type="button"

      onClick={onViewAll}

      className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"

    >

      View All Activity

    </button>

  </div>

)



const MessageDropdown = ({ conversations, onViewAllMessages, onSelectConversation }) => {

  const formatTime = (dateStr) => {

    if (!dateStr) return ''

    const date = new Date(dateStr)

    if (Number.isNaN(date.getTime())) return ''

    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  }



  const otherParticipant = (conv) => {

    if (!conv?.participants) return null

    return conv.participants.find(p => p.userId !== conv.participants[0]?.userId) || conv.participants[0]

  }



  return (

    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">

      <div className="flex items-center justify-between text-sm font-semibold text-slate-700">

        <span>Messages</span>

        <button className="text-xs text-primary">Start new chat</button>

      </div>

      <div className="mt-3 space-y-3">

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

        onClick={onViewAllMessages}

        className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-primary transition hover:bg-slate-200"

      >

        View All Messages

      </button>

    </div>

  )

}



const notificationTypeColors = {

  success: 'bg-emerald-100 text-emerald-600',

  reminder: 'bg-amber-100 text-amber-600',

  info: 'bg-blue-100 text-blue-600',

}



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



const MenuIcon = (props) => (

  <IconBase {...props}>

    <line x1="4" y1="6" x2="20" y2="6" />

    <line x1="4" y1="12" x2="20" y2="12" />

    <line x1="4" y1="18" x2="20" y2="18" />

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



const BellIcon = (props) => (

  <IconBase {...props}>

    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />

    <path d="M13.73 21a2 2 0 01-3.46 0" />

  </IconBase>

)



const MessageIcon = (props) => (

  <IconBase {...props}>

    <path d="M21 14a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />

  </IconBase>

)



const MessageDetails = ({ message, isOpen, onClose }) => {

  if (!isOpen || !message) return null



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">

      <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">

              {message.sender.charAt(0).toUpperCase()}

            </div>

            <div>

              <h3 className="text-lg font-semibold text-slate-900">{message.sender}</h3>

              <p className="text-sm text-slate-500">{message.time}</p>

            </div>

          </div>

          <button

            type="button"

            onClick={onClose}

            className="rounded-full p-2 hover:bg-slate-100 transition"

          >

            <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">

              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

            </svg>

          </button>

        </div>



        {/* Message Content */}

        <div className="px-6 py-4">

          <div className="space-y-4">

            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-sm text-slate-700 leading-relaxed">{message.snippet}</p>

            </div>

            

            {/* Additional message details could go here */}

            <div className="border-t border-slate-100 pt-4">

              <h4 className="text-sm font-semibold text-slate-900 mb-2">Conversation Details</h4>

              <div className="space-y-2 text-sm text-slate-600">

                <div className="flex justify-between">

                  <span>Status:</span>

                  <span className="text-green-600 font-medium">Active</span>

                </div>

                <div className="flex justify-between">

                  <span>Category:</span>

                  <span>Mentorship</span>

                </div>

                <div className="flex justify-between">

                  <span>Priority:</span>

                  <span className="text-amber-600 font-medium">Medium</span>

                </div>

              </div>

            </div>

          </div>

        </div>



        {/* Actions */}

        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">

          <button

            type="button"

            onClick={onClose}

            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"

          >

            Close

          </button>

          <div className="flex gap-2">

            <button

              type="button"

              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"

            >

              Archive

            </button>

            <button

              type="button"

              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"

            >

              Reply

            </button>

          </div>

        </div>

      </div>

    </div>

  )

}



export default AdminTopbar

