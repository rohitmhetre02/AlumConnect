import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, UserCheck, Briefcase, Calendar, Heart, Clock,
  TrendingUp, TrendingDown, CheckCircle, XCircle, Eye,
  Bell, Search, LogOut, Settings, Building2, FileText,
  Activity, BarChart3, PieChart, Filter,
  Download, UserPlus, AlertCircle, ArrowRight
} from 'lucide-react'

const DashboardOverviewEnhanced = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [dateFilter, setDateFilter] = useState('30days')
  const [notifications, setNotifications] = useState([])
  const [error, setError] = useState(null)
  
  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalStudents: 0,
    activeJobs: 0,
    upcomingEvents: 0,
    activeCampaigns: 0,
    pendingApprovals: 0,
    alumniGrowth: 0,
    studentGrowth: 0,
    jobGrowth: 0,
    eventGrowth: 0,
    campaignGrowth: 0,
    approvalGrowth: 0
  })

  const [pendingItems, setPendingItems] = useState([])
  const [recentActivity, setRecentActivity] = useState([])

  const [adminUser, setAdminUser] = useState({
    name: 'Admin User',
    role: 'Super Admin',
    email: 'admin@alumconnect.com',
    avatar: 'A'
  })

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get admin user from localStorage
      const storedUser = localStorage.getItem('adminUser')
      if (storedUser) {
        setAdminUser(JSON.parse(storedUser))
      }

      const token = localStorage.getItem('adminToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Get user role to determine what data to fetch
      const user = storedUser ? JSON.parse(storedUser) : {}
      const userRole = user.role || 'admin'
      const userDepartment = user.department || ''
      
      console.log('Fetching data for role:', userRole, 'department:', userDepartment)

      // Fetch stats from backend with date filter and role info
      const statsUrl = `http://localhost:5000/api/admin/dashboard/stats?period=${dateFilter}&role=${userRole}&department=${encodeURIComponent(userDepartment)}`
      console.log('Fetching stats from:', statsUrl)
      
      const statsResponse = await fetch(statsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Stats response status:', statsResponse.status)
      console.log('Stats response headers:', statsResponse.headers)
      
      if (!statsResponse.ok) {
        const errorText = await statsResponse.text()
        console.error('Stats error response:', errorText)
        throw new Error(`Failed to fetch dashboard stats: ${statsResponse.status}`)
      }
      
      const statsData = await statsResponse.json()
      console.log('Stats data received:', statsData)
      
      if (statsData.success) {
        setStats(statsData.data)
        console.log('Stats updated successfully')
      } else {
        throw new Error(statsData.message || 'Failed to fetch stats')
      }

      // Fetch pending items with role context
      const pendingUrl = `http://localhost:5000/api/admin/dashboard/pending?role=${userRole}&department=${encodeURIComponent(userDepartment)}`
      const pendingResponse = await fetch(pendingUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        
        if (pendingData.success) {
          setPendingItems(pendingData.data)
        }
      } else {
        setPendingItems([]) // Set empty array on error
      }

      // Fetch recent activity with role context
      const activityUrl = `http://localhost:5000/api/admin/dashboard/activity?role=${userRole}&department=${encodeURIComponent(userDepartment)}`
      const activityResponse = await fetch(activityUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json()
        
        if (activityData.success && activityData.data) {
          setRecentActivity(activityData.data)
        } else {
          setRecentActivity([]) // Set empty array if no data
        }
      } else {
        setRecentActivity([])
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('Date filter changed to:', dateFilter)
    fetchDashboardData()
  }, [dateFilter])

  const handleApprove = async (id, type) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:5000/api/admin/dashboard/approve/${type}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setPendingItems(prev => prev.filter(item => item.id !== id))
        // Refresh stats after approval
        fetchDashboardData()
      } else {
        const errorText = await response.text()
        console.error('Approve error:', errorText)
        alert('Failed to approve item')
      }
    } catch (err) {
      console.error('Error approving item:', err)
      alert('Failed to approve item')
    }
  }

  const handleReject = async (id, type) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:5000/api/admin/dashboard/reject/${type}/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setPendingItems(prev => prev.filter(item => item.id !== id))
        // Refresh stats after rejection
        fetchDashboardData()
      } else {
        const errorText = await response.text()
        console.error('Reject error:', errorText)
        alert('Failed to reject item')
      }
    } catch (err) {
      console.error('Error rejecting item:', err)
      alert('Failed to reject item')
    }
  }

  const handleView = (id, type) => {
    navigate(`/admin/${type}s/${id}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/login')
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  // Enhanced Stat Card Component
  const StatCard = ({ icon: Icon, title, value, change, changeType, color = 'blue', isPriority = false }) => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-50',
        hoverBg: 'group-hover:bg-blue-100',
        text: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        hoverBg: 'group-hover:bg-green-100',
        text: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        hoverBg: 'group-hover:bg-purple-100',
        text: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        hoverBg: 'group-hover:bg-orange-100',
        text: 'text-orange-600'
      },
      red: {
        bg: 'bg-red-50',
        hoverBg: 'group-hover:bg-red-100',
        text: 'text-red-600'
      },
      yellow: {
        bg: 'bg-yellow-50',
        hoverBg: 'group-hover:bg-yellow-100',
        text: 'text-yellow-600'
      }
    }

    const classes = colorClasses[color] || colorClasses.blue

    return (
      <div className={`bg-white rounded-xl shadow-sm border ${isPriority ? 'border-red-200 bg-red-50' : 'border-gray-100'} p-6 hover:shadow-md transition-all duration-200 group`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              {change}% from last 30 days
            </div>
          </div>
          <div className={`p-3 rounded-xl ${isPriority ? 'bg-red-100' : classes.bg} ${isPriority ? '' : classes.hoverBg} group-hover:scale-105 transition-transform`}>
            <Icon className={`w-6 h-6 ${isPriority ? 'text-red-600' : classes.text}`} />
          </div>
        </div>
      </div>
    )
  }

  // Enhanced Management Card Component
  const ManagementCard = ({ icon: Icon, title, description, path, color = 'blue', count }) => {
    const colorClasses = {
      blue: {
        bg: 'bg-blue-50',
        hoverBg: 'group-hover:bg-blue-100',
        text: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        hoverBg: 'group-hover:bg-green-100',
        text: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        hoverBg: 'group-hover:bg-purple-100',
        text: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        hoverBg: 'group-hover:bg-orange-100',
        text: 'text-orange-600'
      },
      red: {
        bg: 'bg-red-50',
        hoverBg: 'group-hover:bg-red-100',
        text: 'text-red-600'
      },
      indigo: {
        bg: 'bg-indigo-50',
        hoverBg: 'group-hover:bg-indigo-100',
        text: 'text-indigo-600'
      },
      gray: {
        bg: 'bg-gray-50',
        hoverBg: 'group-hover:bg-gray-100',
        text: 'text-gray-600'
      },
      yellow: {
        bg: 'bg-yellow-50',
        hoverBg: 'group-hover:bg-yellow-100',
        text: 'text-yellow-600'
      }
    }

    const classes = colorClasses[color] || colorClasses.blue

    return (
      <button
        onClick={() => navigate(path)}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 text-left group hover:border-blue-200 hover:scale-[1.02]"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${classes.bg} ${classes.hoverBg} transition-colors`}>
            <Icon className={`w-6 h-6 ${classes.text}`} />
          </div>
          {count && (
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-3">{description}</p>
        <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
          Manage →
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4 mb-4 lg:mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-900">Error Loading Dashboard</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button 
                  onClick={fetchDashboardData}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <div className="w-full px-3 py-4 lg:py-6">
          {/* Page Title */}
          <div className="mb-4 lg:mb-6 px-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">Welcome back, {adminUser.name}! Here's what's happening in your alumni network.</p>
          </div>

          {/* Date Filter */}
          <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Time Period:</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
                <option value="1year">Last year</option>
              </select>
            </div>
          </div>

          {/* Enhanced Stats Cards - Optimized for full width */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4 mb-4 lg:mb-6 px-2">
            <StatCard
              icon={Users}
              title="Total Alumni"
              value={stats.totalAlumni}
              change={stats.alumniGrowth}
              changeType="increase"
              color="blue"
            />
            <StatCard
              icon={UserCheck}
              title="Total Students"
              value={stats.totalStudents}
              change={stats.studentGrowth}
              changeType="increase"
              color="green"
            />
            <StatCard
              icon={Briefcase}
              title="Active Jobs"
              value={stats.activeJobs}
              change={stats.jobGrowth}
              changeType="increase"
              color="purple"
            />
            <StatCard
              icon={Calendar}
              title="Upcoming Events"
              value={stats.upcomingEvents}
              change={stats.eventGrowth}
              changeType="decrease"
              color="orange"
            />
            <StatCard
              icon={Heart}
              title="Active Campaigns"
              value={stats.activeCampaigns}
              change={stats.campaignGrowth}
              changeType="increase"
              color="red"
            />
            <StatCard
              icon={Clock}
              title="Pending Approvals"
              value={stats.pendingApprovals}
              change={stats.approvalGrowth}
              changeType="decrease"
              color="yellow"
              isPriority={true}
            />
          </div>

          {/* NEW: Action Required Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6 mx-2">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Requires Your Attention</h2>
                <p className="text-sm text-gray-600 mt-1">Items pending your review and approval</p>
              </div>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingItems.length} Pending
              </span>
            </div>
            
            <div className="space-y-3">
              {pendingItems.map(item => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          item.type === 'profile' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'job' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Submitted by: {item.submittedBy}</span>
                        <span>•</span>
                        <span>{item.department}</span>
                        <span>•</span>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleView(item.id, item.type)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleApprove(item.id, item.type)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(item.id, item.type)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingItems.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="font-medium">No pending approvals</p>
                  <p className="text-sm mt-1">All items have been reviewed</p>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Quick Management - Optimized for full width */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mb-4 lg:mb-6 mx-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Quick Management</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
              <ManagementCard
                icon={Users}
                title="Alumni Management"
                description="Manage alumni profiles and data"
                path="/admin/alumni"
                color="blue"
                count={stats.totalAlumni}
              />
              <ManagementCard
                icon={UserCheck}
                title="Student Management"
                description="Manage student records"
                path="/admin/students"
                color="green"
                count={stats.totalStudents}
              />
              <ManagementCard
                icon={Briefcase}
                title="Job Management"
                description="Manage job postings and applications"
                path="/admin/jobs"
                color="purple"
                count={stats.activeJobs}
              />
              <ManagementCard
                icon={Calendar}
                title="Event Management"
                description="Manage events and registrations"
                path="/admin/events"
                color="orange"
                count={stats.upcomingEvents}
              />
              <ManagementCard
                icon={Heart}
                title="Donation Management"
                description="Manage donation campaigns"
                path="/admin/donations"
                color="red"
                count={stats.activeCampaigns}
              />
              <ManagementCard
                icon={Building2}
                title="Department Management"
                description="Manage departments and programs"
                path="/admin/departments"
                color="indigo"
              />
              <ManagementCard
                icon={FileText}
                title="Reports & Analytics"
                description="View detailed reports and analytics"
                path="/admin/reports"
                color="gray"
              />
              <ManagementCard
                icon={Settings}
                title="System Settings"
                description="Configure system settings"
                path="/admin/settings"
                color="yellow"
              />
            </div>
          </div>

          {/* NEW: Recent Activity Feed */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:p-6 mx-2">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All →</button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    activity.type === 'job' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'event' ? 'bg-green-100 text-green-600' :
                    activity.type === 'donation' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {activity.userAvatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>{' '}
                      <span className="font-medium">{activity.entity}</span>
                      {activity.amount && <span className="text-green-600 font-medium ml-1">{activity.amount}</span>}
                    </p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        activity.entityTag === 'job' ? 'bg-purple-100 text-purple-700' :
                        activity.entityTag === 'event' ? 'bg-green-100 text-green-700' :
                        activity.entityTag === 'donation' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.entityTag}
                      </span>
                      <span className="text-xs text-gray-400">{activity.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DashboardOverviewEnhanced
