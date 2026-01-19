import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth, buildDisplayName } from '../../context/AuthContext'
import { normalizeProfileStatus, PROFILE_STATUS } from '../../utils/profileStatus'

const directoryItems = [
  { label: 'Students', path: '/dashboard/directory/students' },
  { label: 'Alumni', path: '/dashboard/directory/alumni' },
  { label: 'Faculty', path: '/dashboard/directory/faculty' },
]

const activityItems = [
  { label: 'My Applications', path: '/dashboard/applications', icon: ClipboardIcon },
  {
    label: 'Post Contents',
    path: '/dashboard/posts',
    icon: DocumentIcon,
    requiresNonStudent: true,
  },
  { label: 'Requests', path: '/dashboard/requests', icon: MessageIcon },
  { label: 'Insights', path: '/dashboard/insights', icon: BarChartIcon },
]

const mentorItems = [
  { label: 'Dashboard', path: '/dashboard/mentorship/dashboard', icon: DashboardIcon },
  { label: 'Manage Profile', path: '/dashboard/mentorship/profile', icon: UserIcon },
  { label: 'Mentees & Requests', path: '/dashboard/mentorship/mentees', icon: UsersIcon },
  { label: 'Services Management', path: '/dashboard/mentorship/services', icon: SettingsIcon },
  { label: 'Sessions', path: '/dashboard/mentorship/sessions', icon: CalendarIcon },
  { label: 'Resources', path: '/dashboard/mentorship/resources', icon: BookmarkIcon },
  { label: 'History', path: '/dashboard/mentorship/history', icon: HistoryIcon },
]

const secondaryItems = []

const isAlumniRole = (role) => {
  if (!role) return false
  return String(role).trim().toLowerCase() === 'alumni'
}

const isStudentRole = (role) => {
  if (!role) return false
  return String(role).trim().toLowerCase() === 'student'
}

const NAV_BASE = 'flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition'
const NAV_ACTIVE = 'bg-sky-100 text-sky-700 shadow-sm'
const NAV_INACTIVE = 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'

const COLLAPSED_BASE = 'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs transition'
const COLLAPSED_ACTIVE = 'bg-sky-100 text-sky-700'
const COLLAPSED_INACTIVE = 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'

const UserSidebar = ({ isMobile = false, onClose }) => {
  const { user } = useAuth()
  const [expandedSection, setExpandedSection] = useState('directory')

  const directoryOpen = expandedSection === 'directory'
  const activityOpen = expandedSection === 'activity'
  const mentorOpen = expandedSection === 'mentor'

  const toggleSection = (key) => {
    setExpandedSection((prev) => (prev === key ? null : key))
  }

  const status = normalizeProfileStatus(user?.profileApprovalStatus)
  const isProfilePending = [PROFILE_STATUS.IN_REVIEW, PROFILE_STATUS.REJECTED].includes(status)
  const rawRole = user?.role ?? user?.profile?.role
  const normalizedRole = rawRole ? String(rawRole).trim().toLowerCase() : ''
  const showMentorSection = !isProfilePending && isAlumniRole(normalizedRole)

  const fallbackEmail = user?.email ?? user?.profile?.email ?? ''
  const displayName =
    buildDisplayName(user?.profile, fallbackEmail) || user?.name || 'Your Profile'
  const avatarUrl = user?.avatar ?? user?.profile?.avatar ?? ''
  const initials = displayName?.trim()?.charAt(0)?.toUpperCase() || 'Y'

  const limitedSecondaryItems = isProfilePending ? [] : secondaryItems
  const filteredActivityItems = activityItems.filter(
    ({ requiresNonStudent }) => !(isStudentRole(normalizedRole) && requiresNonStudent),
  )

  return (
    <aside
      className={`flex h-full max-h-screen w-56 flex-col border-r border-slate-100 bg-white px-3 py-5 ${
        isMobile ? 'shadow-2xl' : ''
      }`}
    >
      <div className="flex items-center gap-3 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500 text-lg font-bold text-white">
          A
        </span>
        <div>
          <p className="text-lg font-semibold text-slate-900">AlumConnect</p>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Community</p>
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-sky-400 hover:text-sky-500"
            aria-label="Close sidebar"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="mt-6 flex-1 pr-1 text-xs font-medium text-slate-600">
        <section>
          <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
            Your Dashboards
          </p>
          <div className="mt-3 space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_INACTIVE}`}
            >
              <DashboardIcon className="h-4 w-4" />
              <span className="truncate text-[inherit]">My Dashboard</span>
            </NavLink>
          </div>

          {!isProfilePending && (
            <div className="mt-3 space-y-4">
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('activity')}
                  className={`${NAV_BASE} justify-between text-left font-semibold ${
                    activityOpen ? NAV_ACTIVE : NAV_INACTIVE
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <ActivityIcon className="h-4 w-4" />
                    My Activity
                  </span>
                  <ChevronIcon className={`h-3.5 w-3.5 transition ${activityOpen ? 'rotate-180' : ''}`} />
                </button>
                {activityOpen && (
                  <div className="mt-3 space-y-1 border-l border-slate-200 pl-5">
                    {filteredActivityItems.map(({ label, path, icon: Icon }) => (
                      <NavLink
                        key={label}
                        to={path}
                        className={({ isActive }) =>
                          `${COLLAPSED_BASE} ${isActive ? COLLAPSED_ACTIVE : COLLAPSED_INACTIVE}`
                        }
                      >
                        <Icon className="h-4 w-4" />
                        <span className="truncate">{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {showMentorSection && (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection('mentor')}
                    className={`${NAV_BASE} justify-between text-left font-semibold ${
                      mentorOpen ? NAV_ACTIVE : NAV_INACTIVE
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <MentorIcon className="h-4 w-4" />
                      Mentor
                    </span>
                    <ChevronIcon className={`h-3.5 w-3.5 transition ${mentorOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {mentorOpen && (
                    <div className="mt-3 space-y-1 border-l border-slate-200 pl-5">
                      {mentorItems.map(({ label, path, icon: Icon }) => (
                        <NavLink
                          key={label}
                          to={path}
                          className={({ isActive }) =>
                            `${COLLAPSED_BASE} ${isActive ? COLLAPSED_ACTIVE : COLLAPSED_INACTIVE}`
                          }
                        >
                          <Icon className="h-4 w-4" />
                          <span className="truncate">{label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="mt-6 border-t border-slate-100" />

        <section className="mt-6 space-y-2">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_INACTIVE}`}
          >
            <UserIcon className="h-4 w-4" />
            <span className="truncate text-[inherit]">My Profile</span>
          </NavLink>

          {!isProfilePending && (
            <div className="space-y-2">
              <div>
                <button
                  type="button"
                  onClick={() => toggleSection('directory')}
                  className={`${NAV_BASE} justify-between text-left ${
                    directoryOpen ? NAV_ACTIVE : NAV_INACTIVE
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <UsersIcon className="h-4 w-4" />
                    Directory
                  </span>
                  <ChevronIcon className={`h-3.5 w-3.5 transition ${directoryOpen ? 'rotate-180' : ''}`} />
                </button>
                {directoryOpen && (
                  <div className="mt-2 space-y-1 pl-8">
                    {directoryItems.map(({ label, path }) => (
                      <NavLink
                        key={label}
                        to={path}
                        className={({ isActive }) =>
                          `${COLLAPSED_BASE} ${isActive ? COLLAPSED_ACTIVE : COLLAPSED_INACTIVE}`
                        }
                      >
                        {label} Directory
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>

              {[{ label: 'Opportunities', path: '/dashboard/opportunities', icon: BriefcaseIcon },
                { label: 'Mentorship', path: '/dashboard/mentorship', icon: LightbulbIcon },
                { label: 'Events', path: '/dashboard/events', icon: CalendarIcon },
                { label: 'Donations', path: '/dashboard/donations', icon: HeartIcon },
                { label: 'News', path: '/dashboard/news', icon: NewsIcon },
                { label: 'Gallery', path: '/dashboard/gallery', icon: GalleryIcon },
                { label: 'Insights', path: '/dashboard/insights', icon: BarChartIcon }].map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={label}
                    to={path}
                    className={({ isActive }) => `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_INACTIVE}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{label}</span>
                  </NavLink>
                ))}
            </div>
          )}
        </section>

        {limitedSecondaryItems.length > 0 && (
          <div className="mt-6 space-y-1 border-t border-slate-100 pt-4">
            {limitedSecondaryItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) => `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_INACTIVE}`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="mt-auto pt-6">
        <NavLink
          to="/dashboard/profile"
          className="flex items-center gap-3 rounded-2xl border border-slate-100 px-3 py-3 transition hover:border-sky-200 hover:bg-sky-50"
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-sky-100 text-sm font-semibold text-sky-600">
              {initials}
            </span>
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="text-xs font-semibold text-slate-700">{displayName}</p>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-slate-400" />
        </NavLink>
      </div>
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

function UserIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconBase>
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

function LightbulbIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M12 2a7 7 0 00-3 13.3V18h6v-2.7A7 7 0 0012 2z" />
    </IconBase>
  )
}

function CalendarIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4" />
      <path d="M12 2a7 7 0 00-3 13.3V18h6v-2.7A7 7 0 0012 2z" />
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

function BriefcaseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 7h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <path d="M10 7V5a2 2 0 012-2h0a2 2 0 012 2v2" />
      <path d="M3 12h18" />
    </IconBase>
  )
}

function ClipboardIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="4" y="5" width="16" height="16" rx="2" />
      <path d="M9 3h6a1 1 0 011 1v3H8V4a1 1 0 011-1z" />
    </IconBase>
  )
}

function DocumentIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M6 2h9l5 5v13a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
      <path d="M14 2v6h6" />
    </IconBase>
  )
}

function MessageIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
    </IconBase>
  )
}

function BookmarkIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M6 4h12a1 1 0 011 1v16l-7-4-7 4V5a1 1 0 011-1z" />
    </IconBase>
  )
}

function HistoryIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </IconBase>
  )
}

function ActivityIcon(props) {
  return (
    <IconBase {...props}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </IconBase>
  )
}

function MentorIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="8" cy="7" r="3" />
      <path d="M2 21v-2a4 4 0 014-4h4" />
      <circle cx="17" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 00-4-4h-4" />
    </IconBase>
  )
}

function ChevronIcon(props) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M6 8l4 4 4-4" />
    </svg>
  )
}

function MoreIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </IconBase>
  )
}

function ArrowRightIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </IconBase>
  )
}

export default UserSidebar
