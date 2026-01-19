import { NavLink } from 'react-router-dom'

const primaryItems = [
  { label: 'Student Management', path: '/admin/users', icon: UsersIcon },
  { label: 'Faculty Management', path: '/admin/mentors', icon: MentorIcon },
  { label: 'Alumni Management', path: '/admin/alumni', icon: AlumniIcon },
  { label: 'Events', path: '/admin/events', icon: CalendarIcon },
  { label: 'Opportunities', path: '/admin/opportunities', icon: BriefcaseIcon },
  { label: 'Campaigns', path: '/admin/campaigns', icon: CampaignIcon },
  { label: 'Donations', path: '/admin/donations', icon: HeartIcon },
  { label: 'Mentorship', path: '/admin/mentorship', icon: MentorIcon },
  { label: 'News', path: '/admin/news', icon: NewsIcon },
  { label: 'Gallery', path: '/admin/gallery', icon: GalleryIcon },
  { label: 'Profile Approval', path: '/admin/profile-approval', icon: UsersIcon },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChartIcon },
]

const secondaryItems = [
  { label: 'Settings', path: '/admin/settings', icon: SettingsIcon },
]

const AdminSidebar = ({ isMobile = false, onClose }) => {
  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/login'
    onClose?.()
  }

  return (
    <aside
      className={`flex h-full w-64 flex-col border-r border-slate-100 bg-white px-4 py-6 ${
        isMobile ? 'shadow-2xl' : ''
      }`}
    >
      <div className="flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-lg font-bold text-white">A</span>
        <div>
          <p className="text-lg font-semibold text-slate-900">AlumConnect</p>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Admin Portal</p>
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-primary hover:text-primary"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="mt-8 flex-1 space-y-6 text-sm font-medium text-slate-600">
        <div className="space-y-1">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <DashboardIcon className="h-4 w-4" />
            Admin Dashboard
          </NavLink>
          {primaryItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="space-y-1 border-t border-slate-100 pt-4">
          {secondaryItems.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={label}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 transition ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        <LogoutIcon className="h-4 w-4" />
        Logout
      </button>
    </aside>
  )
}

const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function IconBase({ className, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  )
}

function DashboardIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 13h6V4H4z" />
      <path d="M14 20h6v-9h-6z" />
      <path d="M4 20h6v-4H4z" />
      <path d="M14 4v5h6V4z" />
    </IconBase>
  )
}

function UsersIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M16 18v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 18v-1a4 4 0 00-3-3.87" />
      <path d="M16 4.13a4 4 0 010 7.75" />
    </IconBase>
  )
}

function MentorIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M9 18v-1a4 4 0 00-4-4H5a4 4 0 00-4 4v1" />
      <circle cx="5" cy="7" r="3" />
      <path d="M22 18v-1a4 4 0 00-3-3.87" />
      <path d="M16 4.13a4 4 0 010 7.75" />
      <path d="M18 8h1a3 3 0 013 3v1" />
    </IconBase>
  )
}

function AlumniIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
      <path d="M12 14v7" />
    </IconBase>
  )
}

function CalendarIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </IconBase>
  )
}

function BriefcaseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 7h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2" />
      <path d="M3 12h18" />
    </IconBase>
  )
}

function CampaignIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
      <path d="M12 2v4" />
    </IconBase>
  )
}

function HeartIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z" />
    </IconBase>
  )
}

function NewsIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 19h16" />
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h4" />
      <path d="M8 13h8" />
    </IconBase>
  )
}

function GalleryIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 15l4-4 3 3 4-4 5 5" />
      <circle cx="8" cy="9" r="1.5" />
    </IconBase>
  )
}

function BarChartIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="10" width="4" height="11" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="2" width="4" height="19" rx="1" />
    </IconBase>
  )
}

function SettingsIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82c-.09-.33-.09-.69 0-1.02a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.02A1.65 1.65 0 009 5.09V5a2 2 0 014 0v.09c0 .7.39 1.33 1 1.51h.02a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82c.09.33.09.69 0 1.02z" />
    </IconBase>
  )
}

function LogoutIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </IconBase>
  )
}

export default AdminSidebar
