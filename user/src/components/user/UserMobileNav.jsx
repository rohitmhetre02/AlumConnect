import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Home', path: '/dashboard', icon: HomeIcon },
  { label: 'Directory', path: '/dashboard/directory/students', icon: UsersIcon },
  { label: 'Events', path: '/dashboard/events', icon: CalendarIcon },
  { label: 'News', path: '/dashboard/news', icon: NewsIcon },
  { label: 'Profile', path: '/dashboard/profile', icon: UserIcon },
]

const UserMobileNav = () => {
  const location = useLocation()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur [@supports(backdrop-filter:blur(0))]:bg-white/75 lg:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {navItems.map(({ label, path, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))

          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive: linkActive }) =>
                `flex flex-col items-center justify-center gap-1 py-3 text-xs font-semibold transition ${
                  isActive || linkActive ? 'text-primary' : 'text-slate-500 hover:text-primary'
                }`
              }
            >
              <span
                className={`grid h-9 w-9 place-items-center rounded-full border ${
                  isActive ? 'border-primary/40 bg-primary/10 text-primary' : 'border-slate-200 bg-white'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span>{label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

const IconBase = ({ children, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
)

function HomeIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 11l9-8 9 8" />
      <path d="M5 12v8a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-8" />
    </IconBase>
  )
}

function UsersIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M20 8a4 4 0 11-3-7.39" />
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

function NewsIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 5h16v14H4z" />
      <path d="M8 9h5" />
      <path d="M8 13h8" />
      <path d="M4 19h16" />
    </IconBase>
  )
}

function UserIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="7" r="4" />
      <path d="M5.5 21a8.38 8.38 0 0113 0" />
    </IconBase>
  )
}

export default UserMobileNav
