import { useEffect, useRef, useState, useCallback } from 'react'

import { useNavigate } from 'react-router-dom'

import { Search, LogOut, Settings, User } from 'lucide-react'

import AdminMessagesPanel from '../AdminMessagesPanel'
import io from 'socket.io-client'



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

  const msgDropdownRef = useRef(null)

  const [conversations, setConversations] = useState([])
  const [messageDropdownOpen, setMessageDropdownOpen] = useState(false)
  const [socket, setSocket] = useState(null)

  // Get admin user data from localStorage

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')

  const userId = adminUser?.id || adminUser?._id;
  const unreadCount = conversations.reduce((sum, c) => sum + (c.unread || 0), 0);

  // Create conversation map for MessagesPanel

  const conversationMap = {}

  const displayName = adminUser.name || 'Admin User'

  const displayRole = adminUser.role ? adminUser.role.toString().toUpperCase() : 'ADMIN'

  const displayEmail = adminUser.email || 'admin@alumconnect.com'

  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : 'A'



  useEffect(() => {

    const handleClick = (event) => {

      if (actionsRef.current?.contains(event.target) || msgDropdownRef.current?.contains(event.target)) {

        return

      }

      setOpenDropdown(null)
      setMessageDropdownOpen(false)

    }

    document.addEventListener('mousedown', handleClick)

    return () => document.removeEventListener('mousedown', handleClick)

  }, [])

  // Socket connection for real-time messaging
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const s = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    setSocket(s);

    s.on('receiveMessage', (data) => {
      setConversations(prev => {
        const updated = prev.map(c =>
          c.conversationId === data.conversationId
            ? { ...c, lastMessage: data.text, time: formatTimeAgo(data.timestamp), unread: data.senderId !== userId ? (c.unread || 0) + 1 : c.unread }
            : c
        );
        localStorage.setItem('adminConversations', JSON.stringify(updated));
        return updated;
      });
    });

    return () => s.close();
  }, [userId]);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/conversations/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
        localStorage.setItem('adminConversations', JSON.stringify(data.data));
      }
    } catch {
      const stored = localStorage.getItem('adminConversations');
      if (stored) setConversations(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [fetchConversations]);



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
        </div>

        {/* Right Side Actions */}

        <div className="flex items-center gap-3" ref={actionsRef}>
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



const MessageDropdown = ({ conversations, currentUserId, onViewAll, onSelectConversation, formatTime }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
    <div className="flex items-center justify-between text-sm font-semibold text-slate-700 mb-3">
      <span>Messages</span>
      {conversations.length > 0 && (
        <span className="text-xs text-slate-400">{conversations.length} recent</span>
      )}
    </div>
    <div className="space-y-3">
      {conversations.length > 0 ? (
        conversations.map((conv) => {
          const other = conv.participants?.find((p) => p.userId !== currentUserId);
          const name = other?.userName || conv.name || 'User';
          const avatar = other?.userAvatar || conv.avatar || '';
          return (
            <button
              key={conv.conversationId || conv._id}
              type="button"
              onClick={() => onSelectConversation(conv.conversationId)}
              className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition hover:border-primary/40 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {avatar ? (
                <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold text-slate-900 truncate">{name}</p>
                  <span className="text-xs text-slate-400 ml-2 whitespace-nowrap">{conv.time || formatTime(conv.updatedAt) || ''}</span>
                </div>
                <p className="truncate text-xs text-slate-500">{conv.lastMessage || 'No messages yet'}</p>
              </div>
              {conv.unread > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                  {conv.unread}
                </span>
              )}
            </button>
          );
        })
      ) : (
        <p className="text-center text-sm text-slate-400 py-4">No conversations yet</p>
      )}
    </div>
    {conversations.length > 0 && (
      <button
        type="button"
        onClick={onViewAll}
        className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-primary transition hover:bg-slate-200"
      >
        View All Messages
      </button>
    )}
  </div>
)



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



// Helper function for time formatting used in MessageDropdown
const formatTimeAgo = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  if (diff < 604800000) return Math.floor(diff / 86400000) + 'd ago';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default AdminTopbar

