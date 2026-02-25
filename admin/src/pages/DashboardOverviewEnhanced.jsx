import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, UserCheck, Briefcase, Calendar, Heart, Clock,
  TrendingUp, TrendingDown, CheckCircle, XCircle, Eye,
  Bell, Search, LogOut, Settings, Building2, FileText,
  RefreshCw, Activity, BarChart3, PieChart, Filter,
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
  
  const [stats, setStats] = useState({
    totalAlumni: 15420,
    totalStudents: 8930,
    activeJobs: 127,
    upcomingEvents: 8,
    activeCampaigns: 5,
    pendingApprovals: 23,
    alumniGrowth: 12.5,
    studentGrowth: 8.3,
    jobGrowth: 15.2,
    eventGrowth: -5.1,
    campaignGrowth: 3.0,
    approvalGrowth: -2.0
  })

  const [pendingItems, setPendingItems] = useState([
    {
      id: 1,
      type: 'profile',
      title: 'John Doe - Alumni Profile',
      submittedBy: 'John Doe',
      department: 'Computer Science',
      date: '2024-01-15',
      status: 'pending'
    },
    {
      id: 2,
      type: 'job',
      title: 'Senior Software Engineer',
      submittedBy: 'Jane Smith',
      department: 'Engineering',
      date: '2024-01-14',
      status: 'pending'
    },
    {
      id: 3,
      type: 'event',
      title: 'Annual Alumni Meetup 2024',
      submittedBy: 'Mike Johnson',
      department: 'Alumni Relations',
      date: '2024-01-13',
      status: 'pending'
    }
  ])

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      user: 'John Doe',
      userAvatar: 'JD',
      action: 'posted a new job',
      entity: 'Senior Software Engineer',
      entityTag: 'job',
      timestamp: '2 hours ago',
      type: 'job'
    },
    {
      id: 2,
      user: 'Jane Smith',
      userAvatar: 'JS',
      action: 'approved an event',
      entity: 'Annual Alumni Meetup 2024',
      entityTag: 'event',
      timestamp: '3 hours ago',
      type: 'event'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      userAvatar: 'MJ',
      action: 'donated to',
      entity: 'Scholarship Fund',
      entityTag: 'donation',
      timestamp: '5 hours ago',
      type: 'donation',
      amount: '$500'
    },
    {
      id: 4,
      user: 'Sarah Wilson',
      userAvatar: 'SW',
      action: 'registered as alumni',
      entity: 'Class of 2020',
      entityTag: 'registration',
      timestamp: '1 day ago',
      type: 'registration'
    }
  ])

  const [analytics, setAnalytics] = useState({
    alumniGrowth: [
      { month: 'Jan', count: 12000 },
      { month: 'Feb', count: 12500 },
      { month: 'Mar', count: 13100 },
      { month: 'Apr', count: 13800 },
      { month: 'May', count: 14500 },
      { month: 'Jun', count: 15420 }
    ],
    jobsVsApproved: [
      { month: 'Jan', posted: 45, approved: 42 },
      { month: 'Feb', posted: 52, approved: 48 },
      { month: 'Mar', posted: 38, approved: 35 },
      { month: 'Apr', posted: 61, approved: 58 },
      { month: 'May', posted: 47, approved: 44 },
      { month: 'Jun', posted: 55, approved: 51 }
    ],
    eventsConducted: [
      { month: 'Jan', count: 12 },
      { month: 'Feb', count: 8 },
      { month: 'Mar', count: 15 },
      { month: 'Apr', count: 10 },
      { month: 'May', count: 18 },
      { month: 'Jun', count: 14 }
    ],
    donationsCollected: [
      { name: 'Scholarship Fund', value: 45000, color: '#3b82f6' },
      { name: 'Infrastructure', value: 32000, color: '#10b981' },
      { name: 'Research', value: 28000, color: '#f59e0b' },
      { name: 'Sports', value: 15000, color: '#ef4444' }
    ]
  })

  const [adminUser, setAdminUser] = useState({
    name: 'Admin User',
    role: 'Super Admin',
    email: 'admin@alumconnect.com',
    avatar: 'A'
  })

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleApprove = async (id, type) => {
    setPendingItems(prev => prev.filter(item => item.id !== id))
    // Show success notification
    alert('Item approved successfully')
  }

  const handleReject = async (id, type) => {
    setPendingItems(prev => prev.filter(item => item.id !== id))
    // Show success notification
    alert('Item rejected successfully')
  }

  const handleView = (id, type) => {
    navigate(`/${type}s/${id}`)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    navigate('/login')
  }

  const unreadNotifications = notifications.filter(n => !n.read).length

  // Enhanced Stat Card Component
  const StatCard = ({ icon: Icon, title, value, change, changeType, color = 'blue', isPriority = false }) => (
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
        <div className={`p-3 rounded-xl ${isPriority ? 'bg-red-100' : `bg-${color}-50`} group-hover:scale-105 transition-transform`}>
          <Icon className={`w-6 h-6 ${isPriority ? 'text-red-600' : `text-${color}-600`}`} />
        </div>
      </div>
    </div>
  )

  // Enhanced Management Card Component
  const ManagementCard = ({ icon: Icon, title, description, path, color = 'blue', count }) => (
    <button
      onClick={() => navigate(path)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 text-left group hover:border-blue-200 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-${color}-50 group-hover:bg-${color}-100 transition-colors`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Page Title */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm lg:text-base text-gray-600 mt-1">Welcome back, {adminUser.name}! Here's what's happening in your alumni network.</p>
          </div>

          {/* Date Filter */}
          <div className="mb-6 lg:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
            <button
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
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

        {/* Enhanced Quick Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* NEW: Analytics & Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Alumni Growth Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Alumni Growth</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View Details →</button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization</p>
                <p className="text-sm text-gray-400 mt-1">Monthly growth trend</p>
              </div>
            </div>
          </div>

          {/* Jobs Posted vs Approved */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Jobs Posted vs Approved</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View Details →</button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization</p>
                <p className="text-sm text-gray-400 mt-1">Comparison chart</p>
              </div>
            </div>
          </div>

          {/* Events Conducted */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Events Conducted This Year</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View Details →</button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization</p>
                <p className="text-sm text-gray-400 mt-1">Monthly event count</p>
              </div>
            </div>
          </div>

          {/* Donations Collected */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Donations Collected</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700">View Details →</button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization</p>
                <p className="text-sm text-gray-400 mt-1">Distribution by category</p>
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
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
      </main>
    </div>
  )
}

export default DashboardOverviewEnhanced
