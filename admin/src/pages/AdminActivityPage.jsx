import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, UserCheck, Briefcase, Calendar, Heart, Clock,
  TrendingUp, TrendingDown, CheckCircle, XCircle, Eye,
  Bell, Search, LogOut, Settings, Building2, FileText,
  Activity, BarChart3, PieChart, Filter, ArrowLeft
} from 'lucide-react'

const AdminActivityPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [adminUser, setAdminUser] = useState({
    name: 'Admin User',
    role: 'Super Admin',
    email: 'admin@alumconnect.com',
    avatar: 'A'
  })

  // Fetch recent activity from backend
  const fetchActivityData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const token = localStorage.getItem('adminToken')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Fetch recent activity with role context
      const activityUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/dashboard/activity?role=admin&department=all`
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
          setRecentActivity([])
        }
      } else {
        setRecentActivity([])
      }

    } catch (err) {
      console.error('Error fetching activity data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivityData()
  }, [])

  // Filter activities based on search query
  const filteredActivities = recentActivity.filter(activity => 
    activity.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.entity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.action?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getActivityIcon = (type) => {
    switch (type) {
      case 'job': return Briefcase
      case 'event': return Calendar
      case 'donation': return Heart
      case 'campaign': return Heart
      default: return FileText
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'job': return 'bg-purple-100 text-purple-600'
      case 'event': return 'bg-green-100 text-green-600'
      case 'donation': return 'bg-red-100 text-red-600'
      case 'campaign': return 'bg-blue-100 text-blue-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getEntityTagColor = (entityTag) => {
    switch (entityTag) {
      case 'job': return 'bg-purple-100 text-purple-700'
      case 'event': return 'bg-green-100 text-green-700'
      case 'donation': return 'bg-red-100 text-red-700'
      case 'campaign': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">Error loading activity data</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchActivityData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
        </div>
        <p className="text-gray-600">View all recent activities across the platform</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities by user, action, or entity..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchActivityData}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              All Activities ({filteredActivities.length})
            </h2>
            <span className="text-sm text-gray-500">
              Showing all recent platform activities
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms' : 'No recent activities available'}
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold ${getActivityColor(activity.type)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-gray-600">{activity.action}</span>{' '}
                        <span className="font-medium">{activity.entity}</span>
                        {activity.amount && (
                          <span className="text-green-600 font-medium ml-1">{activity.amount}</span>
                        )}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getEntityTagColor(activity.entityTag)}`}>
                          {activity.entityTag}
                        </span>
                        <span className="text-sm text-gray-500">{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminActivityPage
