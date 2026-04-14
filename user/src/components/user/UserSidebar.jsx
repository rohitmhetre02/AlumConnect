import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { normalizeProfileStatus, PROFILE_STATUS } from '../../utils/profileStatus'
import { normalizeRegistrationStatus, REGISTRATION_STATUS } from '../../utils/registrationStatus'
import { useMentors } from '../../hooks/useMentors'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGear, faSignOutAlt, faUser, faCog, faRightFromBracket } from "@fortawesome/free-solid-svg-icons"

// Icons
const LayoutDashboard = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const Activity = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const UserCircle = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const Users = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const Briefcase = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
)

const GraduationCap = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-5" />
  </svg>
)

const Calendar = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const Heart = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const Connections = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="9" r="2" />
    <path d="M21 9v6M2 9v6M14 9v6M14 4h6M4 4h6M4 4h6M4 4h6" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="8.22" x2="5.78" y2="16.22" />
    <line x1="18.78" y1="8.22" x2="20.22" y2="16.22" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="16" y2="16" />
  </svg>
)

const Newspaper = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2z" />
    <path d="M6 7h12M6 11h8M6 15h8" />
  </svg>
)

const Image = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
)

const ChevronDown = (props) => (
  <svg {...props} width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${props.expanded ? 'rotate-180' : ''}`}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const ChevronRight = (props) => (
  <svg {...props} width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${props.expanded === "true" ? 'rotate-90' : ''}`}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

const Document = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
)

const MessageSquare = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 14a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)

const UserCheck = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8l-2 2-2-2" />
  </svg>
)

const BookOpen = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
)

const History = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const Clipboard = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1" ry="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2 2V6a2 2 0 0 1 2-2h2" />
  </svg>
)

const BarChart = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
)

const UserProfile = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const LogOut = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 21 12 17" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const Menu = (props) => (
  <svg {...props} width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
)

const X = (props) => (
  <svg {...props} width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const Share2 = (props) => (
  <svg {...props} width={props.size || 20} height={props.size || 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <path d="M15 12v3" />
    <path d="M15 15l-3-3" />
    <path d="M12 15l-3-3" />
    <path d="M9 15l-3-3" />
    <path d="M9 12v3" />
  </svg>
)

const UserSidebar = ({ isMobile = false, onClose }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { items: mentors } = useMentors()
  const [expandedMenus, setExpandedMenus] = useState({
    'My Activity': false,
    'Directory': false,
    'Mentor': false
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const userMenuRef = useRef(null)

  const profileStatus = normalizeProfileStatus(user?.profileApprovalStatus)
  const registrationStatus = normalizeRegistrationStatus(user?.registrationStatus)
  const isProfilePending = [PROFILE_STATUS.IN_REVIEW, PROFILE_STATUS.REJECTED].includes(profileStatus)
  const isRegistrationPending = user?.role?.toLowerCase() !== 'admin' && registrationStatus !== REGISTRATION_STATUS.APPROVED
  const isApprovalBlocked = isProfilePending || isRegistrationPending
  const rawRole = user?.role ?? user?.profile?.role
  const normalizedRole = rawRole ? String(rawRole).trim().toLowerCase() : ''
  const showMentorSection = !isApprovalBlocked && normalizedRole === 'alumni'
  const isAlumniOrFaculty = ['alumni', 'faculty'].includes(normalizedRole)

  // Status-based navigation restrictions
  const isProfileApproved = profileStatus === PROFILE_STATUS.APPROVED
  const isProfileRejected = profileStatus === PROFILE_STATUS.REJECTED
  const isProfileInReview = profileStatus === PROFILE_STATUS.IN_REVIEW

  // Enhanced mentor status detection
  const userProfileId = user?.profile?._id || user?.profile?.id || user?.id || null
  const currentMentorProfile = mentors?.find((mentor) =>
    mentor.profileId === userProfileId ||
    mentor.applicationId === userProfileId ||
    mentor.id === userProfileId
  )
  const isMentor = Boolean(user?.isMentor || user?.profile?.isMentor || currentMentorProfile)

  // Build activity sub-options based on user role
  const activitySubOptions = [
    { label: 'Applications', path: '/dashboard/applications', icon: <Clipboard size={18} /> },
    { label: 'Mentorship Requests', path: '/dashboard/mentorship-requests', icon: <MessageSquare size={18} /> },
    { label: 'Registered Events', path: '/dashboard/registered-events', icon: <Calendar size={18} /> },
    { label: 'Connections', path: '/dashboard/connections', icon: <Connections size={18} /> },
    { label: 'My Campaigns', path: '/dashboard/my-campaigns', icon: <Heart size={18} /> },
    // { label: 'Insights', path: '/dashboard/insights', icon: <BarChart size={18} /> }
  ]

  // Add Content Posted for alumni and faculty
  if (isAlumniOrFaculty) {
    activitySubOptions.splice(4, 0, { label: 'Content Posted', path: '/dashboard/activity/content', icon: <Document size={18} /> })
  }

  // Add coordinator-specific options for approved coordinators
  if (normalizedRole === 'coordinator' && isProfileApproved) {
    activitySubOptions.push(
      { label: 'Event Management', path: '/dashboard/coordinator/events', icon: <Calendar size={18} /> },
      { label: 'Student Assignments', path: '/dashboard/coordinator/students', icon: <Users size={18} /> },
      { label: 'Department Reports', path: '/dashboard/coordinator/reports', icon: <BarChart size={18} /> }
    )
  }

  const toggleMenu = (label) => {
    // Accordion behavior: only one menu can be open at a time
    setExpandedMenus(prev => {
      const newState = {}
      // Close all menus first
      Object.keys(prev).forEach(key => {
        newState[key] = false
      })
      // Open only the clicked menu
      newState[label] = !prev[label]
      return newState
    })
  }

  const isActive = (path) => location.pathname === path

  const displayName = user?.name || `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`.trim() || 'User'
  const avatarUrl = user?.avatar ?? user?.profile?.avatar ?? ''

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the user menu container
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      // Close share modal when clicking outside
      if (showShareModal && !event.target.closest('.share-modal-content')) {
        setShowShareModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareModal])

  const handleUserMenuClick = (e) => {
    e.stopPropagation()
    setShowUserMenu(!showUserMenu)
  }

  const handleProfileClick = () => {
    setShowUserMenu(false)
    // Navigate to profile page using React Router
    navigate('/dashboard/profile')
    // Auto-close sidebar on mobile after navigation
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleSettingsClick = (e) => {
    e.stopPropagation()
    setShowUserMenu(!showUserMenu)
  }

  const handleSettingsNavigate = () => {
    setShowUserMenu(false)
    // Navigate to settings page using React Router
    navigate('/dashboard/settings')
    // Auto-close sidebar on mobile after navigation
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleLogoutClick = () => {
    setShowUserMenu(false)
    logout()
    // Auto-close sidebar on mobile after logout
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Handle navigation with auto-close on mobile
  const handleNavigationClick = (path) => {
    navigate(path)
    // Auto-close sidebar on mobile after navigation
    if (isMobile && onClose) {
      onClose()
    }
  }

  // Share functionality
  const handleShareClick = () => {
    setShowUserMenu(false)
    setShowShareModal(true)
  }

  const shareProfile = () => {
    const shareUrl = `${window.location.origin}/dashboard/profile/${user?.profile?._id || user?.id || ''}`
    const shareText = `Check out ${displayName}'s profile on APCOER Alumni Community!`

    if (navigator.share) {
      navigator.share({
        title: `${displayName}'s Profile`,
        text: shareText,
        url: shareUrl
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareUrl)
      alert('Profile link copied to clipboard!')
    }
    setShowShareModal(false)
  }

  const NavItem = ({ icon, label, path, subOptions, id, isDisabled = false }) => {
    const isExpanded = expandedMenus[label]
    const hasSub = subOptions && subOptions.length > 0

    return (
      <div className="mb-2">
        <div
          onClick={() => hasSub && !isDisabled ? toggleMenu(label) : null}
          className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${isDisabled
            ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400'
            : isActive(path) && !hasSub
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-lg'
              : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
            }`}
        >
          <NavLink
            to={hasSub || isDisabled ? '#' : path}
            className="flex items-center flex-1"
            onClick={(e) => {
              if (isDisabled) {
                e.preventDefault()
              } else if (!hasSub && isMobile && onClose) {
                // Auto-close sidebar on mobile for direct navigation
                setTimeout(() => onClose(), 100)
              }
              // Close all sub-menus when clicking on main navigation items
              if (!hasSub) {
                setExpandedMenus({
                  'My Activity': false,
                  'Directory': false,
                  'Mentor': false
                })
              }
            }}
          >
            <span className={`mr-3 transition-colors duration-200 ${isDisabled
              ? 'text-slate-400'
              : isActive(path) && !hasSub
                ? 'text-white'
                : 'text-slate-500 group-hover:text-blue-600'
              }`}>
              {icon}
            </span>
            <span className="font-medium text-base">{label}</span>
          </NavLink>
          {hasSub && (
            <span className="text-slate-400 transition-transform duration-200">
              <ChevronDown size={16} expanded={isExpanded ? "true" : undefined} />
            </span>
          )}
        </div>

        {hasSub && (
          <div className={`ml-4 mt-1 space-y-1 border-l-2 border-blue-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}>
            <div className="pl-4 py-2">
              {subOptions.map((sub, idx) => (
                <NavLink
                  key={idx}
                  to={sub.path}
                  className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${isActive(sub.path)
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                    }`}
                  onClick={() => {
                    // Auto-close sidebar on mobile for sub-navigation
                    if (isMobile && onClose) {
                      setTimeout(() => onClose(), 100)
                    }
                  }}
                >
                  {sub.icon && <span className="mr-3 text-slate-400">{sub.icon}</span>}
                  <span className="text-sm font-medium">{sub.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <aside className={`
  fixed inset-y-0 left-0 z-40 w-72 bg-white transform transition-transform duration-300

  ${isMobile ? 'translate-x-0' : '-translate-x-full'}

  lg:translate-x-0 lg:static 
`}>
        <div className="flex flex-col h-full">
          {/* Logo with Close Icon for Mobile */}
          <div className="p-3 flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">APCOER Alumni</h1>
                <p className="text-xs text-slate-500 tracking-widest uppercase font-semibold">Community</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={onClose}
                className="lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-3 rounded-xl transition-all duration-200"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {/* Navigation Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-hide">
            <div className="">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Your Dashboards</p>
              <NavItem icon={<LayoutDashboard size={15} />} label="My Dashboard" path="/dashboard" />
            </div>

            <div className="">
              <NavItem
                icon={<Activity size={15} />}
                label="My Activity"
                path="/activity"
                subOptions={activitySubOptions}
                isDisabled={isApprovalBlocked}
              />
            </div>

            {/* Mentor section for alumni */}
            {isAlumniOrFaculty && (
              <div className="">
                <NavItem
                  icon={<UserCheck size={15} />}
                  label="Mentor"
                  path="/mentor"
                  isDisabled={isApprovalBlocked}
                  subOptions={
                    isMentor && !isApprovalBlocked
                      ? [
                        { label: 'Mentorship Dashboard', path: '/dashboard/mentorship/dashboard', icon: <LayoutDashboard size={18} /> },
                        { label: 'Manage Profile', path: '/dashboard/mentorship/profile', icon: <UserCircle size={18} /> },
                        { label: 'Mentees & Requests', path: '/dashboard/mentorship/mentees', icon: <Users size={18} /> },
                        { label: 'Services Management', path: '/dashboard/mentorship/services', icon: <FontAwesomeIcon icon={faCog} size={18} /> },
                        { label: 'Sessions', path: '/dashboard/mentorship/sessions', icon: <Calendar size={18} /> },
                        { label: 'Resources', path: '/dashboard/mentorship/resources', icon: <BookOpen size={18} /> },
                        { label: 'History', path: '/dashboard/mentorship/history', icon: <History size={18} /> }
                      ]
                      : [
                        { label: 'Become a Mentor', path: '/dashboard/mentorship/become', icon: <UserCheck size={18} /> }
                      ]
                  }
                />
              </div>
            )}

            <div className="">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest ">Network & Explore</p>
              <NavItem
                icon={<Users size={15} />}
                label="Directory"
                path="/directory"
                isDisabled={isApprovalBlocked}
                subOptions={[
                  { label: 'Students Directory', path: '/dashboard/directory/students', icon: <UserCircle size={18} /> },
                  { label: 'Alumni Directory', path: '/dashboard/directory/alumni', icon: <UserCheck size={18} /> },
                  { label: 'Faculty Directory', path: '/dashboard/directory/faculty', icon: <BookOpen size={18} /> },
                  { label: 'Coordinators Directory', path: '/dashboard/directory/coordinators', icon: <Clipboard size={18} /> }
                ]}
              />
              <NavItem
                icon={<Briefcase size={15} />}
                label="Opportunities"
                path="/dashboard/opportunities"
                isDisabled={isApprovalBlocked}
              />
              <NavItem
                icon={<GraduationCap size={15} />}
                label="Mentorship"
                path="/dashboard/mentorship"
                isDisabled={isApprovalBlocked}
              />
              <NavItem
                icon={<Calendar size={15} />}
                label="Events"
                path="/dashboard/events"
                isDisabled={isApprovalBlocked}
              />
              <NavItem
                icon={<Heart size={15} />}
                label="Campaigns"
                path="/dashboard/campaigns"
                isDisabled={isApprovalBlocked}
              />
              <NavItem
                icon={<Newspaper size={15} />}
                label="News"
                path="/dashboard/news"
                isDisabled={isApprovalBlocked}
              />
              <NavItem
                icon={<Image size={15} />}
                label="Gallery"
                path="/dashboard/gallery"
                isDisabled={isApprovalBlocked}
              />
            </div>
          </div>

          {/* User Status/Logout Section */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 p-1 shadow-lg">
            <div className="relative" ref={userMenuRef}>
              <div
                className="flex items-center space-x-4 px-4 py-3 cursor-pointer hover:bg-slate-50 rounded-xl transition-all duration-200"
                onClick={handleUserMenuClick}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} className="w-12 h-12 rounded-full border-2 border-white shadow-lg" alt="User" />
                ) : (
                  <div className="w-12 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 overflow-hidden">
                  {/* Name */}
                  <p className="text-base font-semibold text-slate-900 truncate">
                    {displayName || 'User'}
                  </p>

                  {/* Role + Status (One Line) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 capitalize whitespace-nowrap overflow-hidden">
                    <span className="truncate">{normalizedRole || 'user'}</span>

                    <span className="text-slate-400">•</span>

                    <span
                      className={`font-medium ${isProfileApproved
                          ? 'text-green-600'
                          : isProfileInReview
                            ? 'text-amber-600'
                            : isProfileRejected
                              ? 'text-red-600'
                              : 'text-slate-500'
                        }`}
                    >
                      {isProfileApproved
                        ? 'Approved'
                        : isProfileInReview
                          ? 'Pending'
                          : isProfileRejected
                            ? 'Rejected'
                            : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={handleSettingsClick}
                    className="p-3 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  >
                    <FontAwesomeIcon icon={faCog} size={18} />
                  </button>

                </div>
              </div>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 w-64">
                  <div className="py-2">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center w-full px-4 py-3 text-base text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    >
                      <UserProfile size={18} className="mr-3 text-slate-400" />
                      Profile
                    </button>
                    <button
                      onClick={handleSettingsNavigate}
                      className="flex items-center w-full px-4 py-3 text-base text-slate-700 hover:bg-slate-100 transition-all duration-200"
                    >
                      <FontAwesomeIcon icon={faCog} size={18} className="mr-3 text-slate-400" />
                      Settings
                    </button>
                    <hr className="my-2 border-slate-200" />
                    <button
                      onClick={handleLogoutClick}
                      className="flex items-center w-full px-4 py-3 text-base text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} size={18} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      
      
    </>
  )
}

export default UserSidebar
