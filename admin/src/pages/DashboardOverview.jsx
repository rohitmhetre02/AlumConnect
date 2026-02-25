import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Briefcase, Calendar, Heart, Clock, Bell, Search } from 'lucide-react'

const DashboardOverview = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAlumni: 15420,
    totalStudents: 8930,
    activeJobs: 127,
    upcomingEvents: 8,
    activeCampaigns: 5,
    pendingApprovals: 23
  })

  useEffect(() => {
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening in your alumni network.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Alumni</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAlumni.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStudents.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeJobs}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingEvents}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeCampaigns}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingApprovals}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/alumni')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <h3 className="font-medium">Alumni Management</h3>
            <p className="text-sm text-gray-600">Manage alumni profiles</p>
          </button>

          <button
            onClick={() => navigate('/admin/jobs')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Briefcase className="w-6 h-6 text-purple-600 mb-2" />
            <h3 className="font-medium">Job Management</h3>
            <p className="text-sm text-gray-600">Manage job postings</p>
          </button>

          <button
            onClick={() => navigate('/admin/events')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Calendar className="w-6 h-6 text-orange-600 mb-2" />
            <h3 className="font-medium">Event Management</h3>
            <p className="text-sm text-gray-600">Manage events</p>
          </button>

          <button
            onClick={() => navigate('/admin/donations')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Heart className="w-6 h-6 text-red-600 mb-2" />
            <h3 className="font-medium">Donation Management</h3>
            <p className="text-sm text-gray-600">Manage campaigns</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
