import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const actionsRef = useRef(null)

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
            placeholder="Search users, events, campaigns..."
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
      <div className="flex items-center gap-2 sm:gap-3" ref={actionsRef}>
        <DropdownTrigger
          label="notifications"
          activeKey={openDropdown}
          onToggle={setOpenDropdown}
          indicator={notificationItems.length}
          icon={BellIcon}
        >
          <NotificationDropdown
            items={notificationItems}
            onViewAll={() => navigate('/admin/analytics')}
          />
        </DropdownTrigger>
        <DropdownTrigger
          label="messages"
          activeKey={openDropdown}
          onToggle={setOpenDropdown}
          indicator={messageItems.length}
          icon={MessageIcon}
        >
          <MessageDropdown
            items={messageItems}
            onViewAll={() => navigate('/admin/mentorship')}
          />
        </DropdownTrigger>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenDropdown((prev) => (prev === 'profile' ? null : 'profile'))}
            className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-2 py-1.5 text-left shadow-sm transition hover:border-primary/40 sm:gap-3 sm:px-3"
            aria-haspopup="menu"
            aria-expanded={openDropdown === 'profile'}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary sm:h-10 sm:w-10">
              {avatarInitial}
            </span>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">{displayRole}</p>
            </div>
            <ChevronDownIcon className={`h-4 w-4 text-slate-400 transition ${openDropdown === 'profile' ? 'rotate-180 text-slate-500' : ''}`} />
          </button>
          {openDropdown === 'profile' && (
            <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{displayEmail}</p>
                <p className="text-xs font-medium text-primary">{displayRole}</p>
              </div>
              <DropdownItem icon={UserIcon} label="Profile Settings" onClick={handleProfileSelect} />
              <DropdownItem icon={LogoutIcon} label="Logout" onClick={handleLogout} />
            </div>
          )}
        </div>
      </div>
    </header>
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

const MessageDropdown = ({ items, onViewAll }) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
    <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
      <span>Messages</span>
      <button className="text-xs text-primary">Start new chat</button>
    </div>
    <div className="mt-3 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border border-slate-100 px-3 py-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">{item.sender}</p>
            <span className="text-xs text-slate-400">{item.time}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{item.snippet}</p>
        </div>
      ))}
    </div>
    <button
      type="button"
      onClick={onViewAll}
      className="mt-3 w-full rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200"
    >
      View Inbox
    </button>
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

export default AdminTopbar
