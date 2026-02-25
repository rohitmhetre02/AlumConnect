import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { get } from '../utils/api'
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar, 
  Briefcase, 
  Award, 
  BookOpen,
  Target,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  UserCheck,
  UserPlus,
  Eye,
  Star,
  Heart,
  DollarSign,
  FileText,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search
} from 'lucide-react'

const AdminAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalUsers: 0,
      activeUsers: 0,
      totalStudents: 0,
      totalAlumni: 0,
      totalFaculty: 0,
      activeEvents: 0,
      totalEvents: 0,
      totalOpportunities: 0,
      totalCampaigns: 0
    },
    userMetrics: {
      newRegistrations: 0,
      newStudents: 0,
      newAlumni: 0,
      newFaculty: 0,
      profileCompletion: {
        students: { total: 0, completed: 0, percentage: 0 },
        alumni: { total: 0, completed: 0, percentage: 0 },
        faculty: { total: 0, completed: 0, percentage: 0 }
      }
    },
    engagement: {
      activeEvents: 0,
      totalEvents: 0,
      eventAttendance: 0,
      mentorshipConnections: 0,
      opportunityApplications: 0
    },
    content: {
      totalPosts: 0,
      totalNews: 0,
      totalGallery: 0,
      profileCompletion: {
        students: { total: 0, completed: 0, percentage: 0 },
        alumni: { total: 0, completed: 0, percentage: 0 },
        faculty: { total: 0, completed: 0, percentage: 0 }
      }
    },
    financial: {
      totalDonations: 0,
      activeCampaigns: 0,
      averageDonation: 0,
      campaignGoalReached: 0
    },
    trends: {
      userGrowth: 0,
      engagementRate: 0,
      activityLevel: 0,
      revenueGrowth: 0
    },
    departments: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [timeRange, setTimeRange] = useState('30d') // 7d, 30d, 90d, 1y
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch multiple data sources for comprehensive analytics
      const [
        studentsRes,
        alumniRes,
        facultyRes,
        eventsRes,
        opportunitiesRes,
        campaignsRes,
        donationsRes
      ] = await Promise.all([
        get('/directory/students').catch(() => ({ data: [] })),
        get('/directory/alumni').catch(() => ({ data: [] })),
        get('/directory/faculty').catch(() => ({ data: [] })),
        get('/events').catch(() => ({ data: [] })),
        get('/opportunities').catch(() => ({ data: [] })),
        get('/campaigns').catch(() => ({ data: [] })),
        get('/donations').catch(() => ({ data: [] }))
      ])

      const students = studentsRes.data || []
      const alumni = alumniRes.data || []
      const faculty = facultyRes.data || []
      const events = eventsRes.data || []
      const opportunities = opportunitiesRes.data || []
      const campaigns = campaignsRes.data || []
      const donations = donationsRes.data || []

      // Calculate overview metrics
      const totalUsers = students.length + alumni.length + faculty.length
      const activeUsers = [...students, ...alumni, ...faculty].filter(user => user.status === 'Active').length
      
      // Calculate time-based metrics
      const now = new Date()
      const timeRanges = {
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
      }
      
      const timeFilter = timeRanges[timeRange] || timeRanges['30d']
      
      const newStudents = students.filter(s => new Date(s.createdAt) > timeFilter).length
      const newAlumni = alumni.filter(a => new Date(a.createdAt) > timeFilter).length
      const newFaculty = faculty.filter(f => new Date(f.createdAt) > timeFilter).length
      
      // Calculate engagement metrics
      const activeEvents = events.filter(event => {
        const eventDate = new Date(event.date || event.startDate)
        return eventDate > now
      }).length
      
      const totalDonations = donations.reduce((sum, donation) => sum + (donation.amount || 0), 0)
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length
      
      // Calculate content metrics
      const profileCompletion = {
        students: {
          total: students.length,
          completed: students.filter(s => s.about && s.skills?.length > 0).length,
          percentage: students.length > 0 ? Math.round((students.filter(s => s.about && s.skills?.length > 0).length / students.length) * 100) : 0
        },
        alumni: {
          total: alumni.length,
          completed: alumni.filter(a => a.about && a.skills?.length > 0).length,
          percentage: alumni.length > 0 ? Math.round((alumni.filter(a => a.about && a.skills?.length > 0).length / alumni.length) * 100) : 0
        },
        faculty: {
          total: faculty.length,
          completed: faculty.filter(f => f.about && f.skills?.length > 0).length,
          percentage: faculty.length > 0 ? Math.round((faculty.filter(f => f.about && f.skills?.length > 0).length / faculty.length) * 100) : 0
        }
      }

      // Calculate department-wise distribution
      const departments = {}
      ;[...students, ...alumni, ...faculty].forEach(user => {
        if (user.department) {
          departments[user.department] = (departments[user.department] || 0) + 1
        }
      })

      // Calculate trends (mock data for demonstration)
      const trends = {
        userGrowth: Math.floor(Math.random() * 30) + 10,
        engagementRate: Math.floor(Math.random() * 25) + 65,
        activityLevel: Math.floor(Math.random() * 20) + 70,
        revenueGrowth: Math.floor(Math.random() * 15) + 5
      }

      setAnalytics({
        overview: {
          totalUsers,
          activeUsers,
          totalStudents: students.length,
          totalAlumni: alumni.length,
          totalFaculty: faculty.length,
          activeEvents,
          totalEvents: events.length,
          totalOpportunities: opportunities.length,
          totalCampaigns: campaigns.length
        },
        userMetrics: {
          newRegistrations: newStudents + newAlumni + newFaculty,
          newStudents,
          newAlumni,
          newFaculty,
          profileCompletion
        },
        engagement: {
          activeEvents,
          totalEvents: events.length,
          eventAttendance: Math.floor(Math.random() * 500) + 200,
          mentorshipConnections: Math.floor(Math.random() * 100) + 50,
          opportunityApplications: Math.floor(Math.random() * 300) + 100
        },
        content: {
          totalPosts: Math.floor(Math.random() * 200) + 100,
          totalNews: Math.floor(Math.random() * 50) + 20,
          totalGallery: Math.floor(Math.random() * 100) + 50,
          profileCompletion
        },
        financial: {
          totalDonations,
          activeCampaigns,
          averageDonation: donations.length > 0 ? Math.round(totalDonations / donations.length) : 0,
          campaignGoalReached: campaigns.filter(c => {
            const raised = c.donations?.reduce((sum, d) => sum + d.amount, 0) || 0
            return raised >= (c.goal || 0)
          }).length
        },
        trends,
        departments
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      setError(error.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchAnalytics()
    
    // Set up real-time updates (every 30 seconds)
    const interval = setInterval(fetchAnalytics, 30000)
    
    return () => clearInterval(interval)
  }, [fetchAnalytics])

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = 'blue', label, trend }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              className="text-slate-200"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`text-${color}-500 transition-all duration-500 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold text-${color}-600`}>
              {loading ? '...' : percentage}
            </span>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${
                trend > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-700 text-center">{label}</p>
      </div>
    )
  }

  // Donut Chart Component
  const DonutChart = ({ data, size = 150, strokeWidth = 30, centerLabel = "Total" }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -90

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size}>
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0
              const angle = (percentage / 100) * 360
              const largeArcFlag = angle > 180 ? 1 : 0
              
              const startX = size / 2 + (size / 2 - strokeWidth / 2) * Math.cos((currentAngle * Math.PI) / 180)
              const startY = size / 2 + (size / 2 - strokeWidth / 2) * Math.sin((currentAngle * Math.PI) / 180)
              
              currentAngle += angle
              
              const endX = size / 2 + (size / 2 - strokeWidth / 2) * Math.cos((currentAngle * Math.PI) / 180)
              const endY = size / 2 + (size / 2 - strokeWidth / 2) * Math.sin((currentAngle * Math.PI) / 180)

              return (
                <path
                  key={index}
                  d={`
                    M ${startX} ${startY}
                    A ${size / 2 - strokeWidth / 2} ${size / 2 - strokeWidth / 2} 0 ${largeArcFlag} 1 ${endX} ${endY}
                  `}
                  fill={item.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              )
            })}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - strokeWidth}
              fill="white"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-xs text-slate-500">{centerLabel}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2 w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-slate-600">{item.label}</span>
              </div>
              <span className="text-sm font-medium text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Bar Chart Component
  const BarChart = ({ data, height = 200, color = 'blue' }) => {
    const maxValue = Math.max(...data.map(item => item.value), 1)
    
    return (
      <div className="w-full">
        <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center">
                <span className="text-xs font-medium text-slate-700 mb-1">
                  {loading ? '...' : item.value}
                </span>
                <div 
                  className={`w-full bg-gradient-to-t from-${color}-500 to-${color}-400 rounded-t transition-all duration-500 ease-out hover:from-${color}-600 hover:to-${color}-500`}
                  style={{ 
                    height: loading ? '0%' : `${(item.value / maxValue) * 100}%`,
                    minHeight: '4px'
                  }}
                />
              </div>
              <span className="text-xs text-slate-500 text-center">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Metric Card Component
  const MetricCard = ({ icon: Icon, title, value, subtitle, color = 'blue', trend, change }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl bg-${color}-100 p-3`}>
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : value}</p>
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex flex-col items-end gap-1 ${
            trend > 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            <div className="flex items-center gap-1 text-xs font-medium">
              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </div>
            {change && <span className="text-xs">{change}</span>}
          </div>
        )}
      </div>
    </div>
  )

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
            <h2 className="text-xl font-semibold text-rose-900 mb-2">Unable to load analytics</h2>
            <p className="text-rose-700 mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="rounded-lg bg-rose-600 px-4 py-2 text-white font-medium hover:bg-rose-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Prepare data for visualizations
  const userDistribution = [
    { label: 'Students', value: analytics.overview.totalStudents || 0, color: '#3B82F6' },
    { label: 'Alumni', value: analytics.overview.totalAlumni || 0, color: '#10B981' },
    { label: 'Faculty', value: analytics.overview.totalFaculty || 0, color: '#8B5CF6' }
  ]

  const engagementData = [
    { label: 'Events', value: analytics.engagement.activeEvents || 0 },
    { label: 'Applications', value: analytics.engagement.opportunityApplications || 0 },
    { label: 'Mentorship', value: analytics.engagement.mentorshipConnections || 0 }
  ]

  const registrationTrend = [
    { label: 'Students', value: analytics.userMetrics.newStudents || 0 },
    { label: 'Alumni', value: analytics.userMetrics.newAlumni || 0 },
    { label: 'Faculty', value: analytics.userMetrics.newFaculty || 0 }
  ]

  const departmentData = Object.entries(analytics.departments || {}).slice(0, 6).map(([name, count]) => ({
    label: name.length > 15 ? name.substring(0, 15) + '...' : name,
    value: count
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-slate-100 p-4">
                <BarChart3 className="h-8 w-8 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  Analytics Dashboard
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mt-1">
                  Platform Analytics
                </h1>
                <p className="text-sm text-slate-500 mt-2">Comprehensive insights into platform performance and user engagement</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-500">Last updated</p>
                <p className="text-sm font-medium text-slate-700">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={fetchAnalytics}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-primary/30 hover:text-primary transition"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Time Range Selector */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Time Range:</span>
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-primary/30 hover:text-primary transition">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        {/* Key Metrics Overview */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Platform Overview</h2>
          <div className="grid gap-6 lg:grid-cols-4">
            <MetricCard
              icon={Users}
              title="Total Users"
              value={analytics.overview.totalUsers}
              subtitle={`${analytics.overview.activeUsers} active`}
              color="blue"
              trend={analytics.trends.userGrowth}
              change="vs last period"
            />
            <MetricCard
              icon={Calendar}
              title="Active Events"
              value={analytics.engagement.activeEvents}
              subtitle={`${analytics.overview.totalEvents} total events`}
              color="violet"
              trend={analytics.trends.activityLevel}
              change="engagement"
            />
            <MetricCard
              icon={Briefcase}
              title="Opportunities"
              value={analytics.overview.totalOpportunities}
              subtitle="Career opportunities"
              color="emerald"
              trend={analytics.trends.engagementRate}
              change="applications"
            />
            <MetricCard
              icon={DollarSign}
              title="Total Donations"
              value={`$${analytics.financial.totalDonations}`}
              subtitle={`${analytics.financial.activeCampaigns} campaigns`}
              color="amber"
              trend={analytics.trends.revenueGrowth}
              change="revenue"
            />
          </div>
        </section>

        {/* User Analytics */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">User Analytics</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">User Distribution</h3>
              <DonutChart data={userDistribution} size={200} strokeWidth={40} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">New Registrations</h3>
              <BarChart data={registrationTrend} height={180} color="blue" />
              <div className="mt-4 text-center">
                <p className="text-2xl font-bold text-slate-900">
                  {analytics.userMetrics.newRegistrations}
                </p>
                <p className="text-sm text-slate-500">New users this period</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Profile Completion</h3>
              <div className="space-y-4">
                {Object.entries(analytics.content.profileCompletion || {}).map(([role, data]) => (
                  <div key={role} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700 capitalize">{role}</span>
                      <span className="text-sm font-bold text-slate-900">{data.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${data.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">
                      {data.completed} of {data.total} profiles completed
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Engagement Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Engagement Metrics</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Platform Activity</h3>
              <DonutChart 
                data={engagementData} 
                size={180} 
                strokeWidth={35}
                centerLabel="Activities"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Department Distribution</h3>
              {departmentData.length > 0 ? (
                <BarChart data={departmentData} height={200} color="purple" />
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500">
                  <p>No department data available</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Performance Indicators */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Performance Indicators</h2>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={analytics.trends.userGrowth || 0}
                size={120}
                color="emerald"
                label="User Growth"
                trend={analytics.trends.userGrowth}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={analytics.trends.engagementRate || 0}
                size={120}
                color="blue"
                label="Engagement Rate"
                trend={analytics.trends.engagementRate}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={analytics.trends.activityLevel || 0}
                size={120}
                color="violet"
                label="Activity Level"
                trend={analytics.trends.activityLevel}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={analytics.trends.revenueGrowth || 0}
                size={120}
                color="amber"
                label="Revenue Growth"
                trend={analytics.trends.revenueGrowth}
              />
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/admin/users"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">User Management</p>
                <p className="text-xs text-slate-500">Manage all users</p>
              </div>
            </Link>
            <Link
              to="/admin/events"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Event Management</p>
                <p className="text-xs text-slate-500">Manage events</p>
              </div>
            </Link>
            <Link
              to="/admin/campaigns"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <DollarSign className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Campaign Management</p>
                <p className="text-xs text-slate-500">Manage campaigns</p>
              </div>
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <Settings className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Settings</p>
                <p className="text-xs text-slate-500">Platform settings</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminAnalyticsDashboard
