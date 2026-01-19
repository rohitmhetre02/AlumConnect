import { NavLink } from 'react-router-dom'

const AdminMobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-100 bg-white lg:hidden">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {[
          { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
          { label: 'Users', path: '/admin/users', icon: UsersIcon },
          { label: 'Events', path: '/admin/events', icon: CalendarIcon },
          { label: 'Analytics', path: '/admin/analytics', icon: BarChartIcon },
          { label: 'More', path: '/admin/settings', icon: MoreIcon },
        ].map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition ${
                isActive ? 'text-red-600' : 'text-slate-500 hover:text-slate-700'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function IconBase({ children, className }) {
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

function BarChartIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="10" width="4" height="11" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="2" width="4" height="19" rx="1" />
    </IconBase>
  )
}

function MoreIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </IconBase>
  )
}

export default AdminMobileNav
