import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

// Icons
const LayoutDashboard = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/>
    <rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
  </svg>
)

const Users = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

const UserCheck = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="8.5" cy="7" r="4"/>
    <polyline points="20 4 20 14 20 14"/>
    <path d="M20 10v-6"/>
  </svg>
)

const Briefcase = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
)

const GraduationCap = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
  </svg>
)

const Calendar = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const Heart = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)

const Newspaper = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2z"/>
    <path d="M6 7h12"/>
    <path d="M6 11h8"/>
    <path d="M6 15h8"/>
  </svg>
)

const Image = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="M21 15l-5-5L5 21"/>
  </svg>
)

const BarChart = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/>
    <line x1="18" y1="20" x2="18" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
)

const MessageSquare = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)

const Settings = (props) => (
  <svg {...props} width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6m4.22-13.22l4.24 4.24M1.54 1.54l4.24 4.24M20.46 20.46l-4.24-4.24M1.54 20.46l4.24-4.24"/>
  </svg>
)

const ChevronDown = (props) => (
  <svg {...props} width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const ChevronRight = (props) => (
  <svg {...props} width={props.size || 14} height={props.size || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)

const AdminSidebar = ({ isMobile = false, onClose }) => {
  const [expandedMenus, setExpandedMenus] = useState({})
  const [userRole, setUserRole] = useState('admin')
  const [userName, setUserName] = useState('Admin User')
  const [userAvatar, setUserAvatar] = useState('A')
  const [profileApprovalStatus, setProfileApprovalStatus] = useState('APPROVED')
  const location = useLocation()

  useEffect(() => {
    // Get user information from localStorage
    const storedUser = localStorage.getItem('adminUser')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserRole(user.role || 'admin')
      setUserName(user.name || 'Admin User')
      setUserAvatar(user.name ? user.name.charAt(0).toUpperCase() : 'A')
      setProfileApprovalStatus(user.profileApprovalStatus || 'APPROVED')
      console.log('Sidebar user data loaded:', { name: user.name, role: user.role, profileApprovalStatus: user.profileApprovalStatus })
    } else {
      console.log('No stored user found in localStorage')
    }
  }, [])

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    window.location.href = '/login'
    onClose?.()
  }

  const NavItem = ({ icon, label, path, subOptions, id, isDisabled = false }) => {
    const isExpanded = expandedMenus[label]
    const hasSub = subOptions && subOptions.length > 0
    const isAccessBlocked = isDisabled || (userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED')

    return (
      <div className="mb-1">
        <div 
          onClick={() => hasSub && !isAccessBlocked ? toggleMenu(label) : null}
          className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all cursor-pointer group ${
            isAccessBlocked 
              ? 'opacity-50 cursor-not-allowed text-slate-400' 
              : isActive(path) && !hasSub 
                ? 'bg-blue-50 text-blue-600 font-medium' 
                : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <NavLink to={hasSub || isAccessBlocked ? '#' : path} className="flex items-center flex-1" onClick={(e) => isAccessBlocked && e.preventDefault()}>
            <span className={`mr-3 ${
              isAccessBlocked 
                ? 'text-slate-400' 
                : isActive(path) && !hasSub 
                  ? 'text-blue-600' 
                  : 'text-slate-400 group-hover:text-slate-600'
            }`}>
              {icon}
            </span>
            <span className="text-sm">{label}</span>
          </NavLink>
          {hasSub && (
            <span className={`text-slate-400 ${isAccessBlocked ? 'opacity-50' : ''}`}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </div>
        
        {hasSub && isExpanded && !isAccessBlocked && (
          <div className="ml-9 mt-1 space-y-1 border-l border-slate-200">
            {subOptions.map((sub, idx) => (
              <NavLink
                key={idx}
                to={sub.path}
                className={`flex items-center px-4 py-2 text-xs rounded-r-lg transition-colors ${
                  isActive(sub.path)
                    ? 'text-blue-600 font-semibold bg-blue-50/50'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {sub.icon && <span className="mr-2 text-slate-400">{sub.icon}</span>}
                {sub.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {isMobile && (
        <button 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close sidebar"
        />
      )}
      
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-xl lg:relative lg:shadow-none lg:z-auto transform transition-transform duration-300 ease-in-out ${
        isMobile ? 'translate-x-0' : 'translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">A</div>
              <div>
                <h1 className="text-slate-900 font-bold text-lg leading-tight">APCORE Alumni</h1>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase font-semibold">Admin Portal</p>
              </div>
            </div>
            {isMobile && (
              <button onClick={onClose} className="lg:hidden text-slate-400">
                <ChevronDown size={20} />
              </button>
            )}
          </div>

          {/* Navigation Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-4 pb-10">
            <div className="mb-6">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Admin Dashboard</p>
              <NavItem icon={<LayoutDashboard size={18} />} label="My Dashboard" path="/admin/dashboard" />
            </div>

            <div className="mb-6">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Management</p>
              <NavItem 
                icon={<Users size={18} />} 
                label="User Management" 
                path="/users" 
                isDisabled={userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED'}
                subOptions={[
                  { label: 'Students', path: '/admin/users', icon: <Users size={14} /> },
                  { label: 'Faculty', path: '/admin/mentors', icon: <UserCheck size={14} /> },
                  { label: 'Alumni', path: '/admin/alumni', icon: <UserCheck size={14} /> },
                  { label: 'Coordinators', path: '/admin/coordinators', icon: <UserCheck size={14} /> }
                ]}
              />
              <NavItem 
                icon={<Calendar size={18} />} 
                label="Events" 
                path="/admin/events" 
                isDisabled={userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED'}
              />
              <NavItem 
                icon={<Briefcase size={18} />} 
                label="Opportunities" 
                path="/admin/opportunities" 
                isDisabled={userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED'}
              />
              <NavItem 
                icon={<Heart size={18} />} 
                label="Campaigns" 
                path="/admin/campaigns" 
                isDisabled={userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED'}
              />
              <NavItem 
                icon={<GraduationCap size={18} />} 
                label="Mentorship" 
                path="/admin/mentorship" 
                isDisabled={userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED'}
              />
              <NavItem 
                icon={<Newspaper size={18} />} 
                label="News" 
                path="/admin/news" 
                isDisabled={userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED'}
              />
              <NavItem 
                icon={<Image size={18} />} 
                label="Gallery" 
                path="/admin/gallery" 
                isDisabled={userRole === 'coordinator' && profileApprovalStatus !== 'APPROVED'}
              />
            </div>

            <div className="mb-6">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Approval & Review</p>
              <NavItem 
                icon={<Users size={18} />} 
                label="Profile Approval" 
                path="/admin/profile-approval"
                subOptions={[
                  { label: 'Pending Profiles', path: '/admin/profile-approval/pending', icon: <Users size={14} /> },
                  { label: 'Approved Profiles', path: '/admin/profile-approval/approved', icon: <UserCheck size={14} /> }
                ]}
              />
              <NavItem 
                icon={<Newspaper size={18} />} 
                label="Post Approval" 
                path="/admin/post-approval"
                subOptions={[
                  { label: 'Pending Posts', path: '/admin/post-approval/pending', icon: <Newspaper size={14} /> },
                  { label: 'Approved Posts', path: '/admin/post-approval/approved', icon: <UserCheck size={14} /> }
                ]}
              />
            </div>

            <div className="mb-6">
              <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Analytics</p>
              <NavItem icon={<BarChart size={18} />} label="Analytics" path="/admin/analytics" />
            </div>
          </div>

          {/* User Status/Logout Section */}
          <div className="p-4 bg-slate-50 border-t border-slate-200">
            <div className="flex items-center space-x-3 px-2 py-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {userAvatar}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {userRole === 'super_admin' ? 'Super Administrator' : 
                   userRole === 'admin' ? 'Administrator' : 
                   userRole === 'coordinator' ? `Coordinator • ${
                     profileApprovalStatus === 'APPROVED' ? 'Approved' :
                     profileApprovalStatus === 'IN_REVIEW' ? 'Pending' :
                     profileApprovalStatus === 'REJECTED' ? 'Rejected' : 'Unknown'
                   }` : 'Administrator'}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-slate-600"
                title="Logout"
              >
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
