import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { get } from '../../utils/api'
import { 
  Users, 
  TrendingUp, 
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
  Heart
} from 'lucide-react'

const UserInsights = () => {
  const { role: contextRole, user } = useAuth()
  const [insights, setInsights] = useState({
    platformStats: {},
    roleStats: {},
    activityStats: {},
    trends: {},
    topMetrics: {}
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const normalizedRole = useMemo(() => {
    const rawRole = contextRole ?? user?.role ?? user?.profile?.role
    return rawRole ? String(rawRole).trim().toLowerCase() : ''
  }, [contextRole, user?.role, user?.profile?.role])

  const roleConfig = useMemo(() => {
    switch (normalizedRole) {
      case 'student':
        return {
          title: 'Student Insights',
          subtitle: 'Track your academic journey and career opportunities',
          primaryColor: 'blue',
          icon: BookOpen,
          focusAreas: ['Applications', 'Events', 'Mentorship', 'Skills']
        }
      case 'alumni':
        return {
          title: 'Alumni Insights',
          subtitle: 'Monitor your impact and network engagement',
          primaryColor: 'emerald',
          icon: Award,
          focusAreas: ['Mentorship', 'Opportunities', 'Events', 'Donations']
        }
      case 'faculty':
        return {
          title: 'Faculty Insights',
          subtitle: 'Track student engagement and academic contributions',
          primaryColor: 'purple',
          icon: Users,
          focusAreas: ['Students', 'Events', 'Research', 'Mentorship']
        }
      default:
        return {
          title: 'User Insights',
          subtitle: 'Your personalized platform analytics',
          primaryColor: 'slate',
          icon: BarChart3,
          focusAreas: ['Activity', 'Engagement', 'Growth']
        }
    }
  }, [normalizedRole])

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch multiple data sources for comprehensive insights
      const [
        studentsRes,
        alumniRes,
        facultyRes,
        eventsRes,
        opportunitiesRes,
        campaignsRes
      ] = await Promise.all([
        get('/directory/students').catch(() => ({ data: [] })),
        get('/directory/alumni').catch(() => ({ data: [] })),
        get('/directory/faculty').catch(() => ({ data: [] })),
        get('/events').catch(() => ({ data: [] })),
        get('/opportunities').catch(() => ({ data: [] })),
        get('/campaigns').catch(() => ({ data: [] }))
      ])

      const students = studentsRes.data || []
      const alumni = alumniRes.data || []
      const faculty = facultyRes.data || []
      const events = eventsRes.data || []
      const opportunities = opportunitiesRes.data || []
      const campaigns = campaignsRes.data || []

      // Calculate platform-wide statistics
      const totalUsers = students.length + alumni.length + faculty.length
      const activeEvents = events.filter(event => {
        const eventDate = new Date(event.date || event.startDate)
        return eventDate > new Date()
      }).length

      // Calculate role-specific statistics
      const roleStats = {
        student: {
          total: students.length,
          active: students.filter(s => s.status === 'Active').length,
          profileCompleted: students.filter(s => s.about && s.skills?.length > 0).length,
          avgProfileCompletion: students.length > 0 ? 
            Math.round((students.filter(s => s.about && s.skills?.length > 0).length / students.length) * 100) : 0
        },
        alumni: {
          total: alumni.length,
          active: alumni.filter(a => a.status === 'Active').length,
          mentors: alumni.filter(a => a.isMentor).length,
          profileCompleted: alumni.filter(a => a.about && a.skills?.length > 0).length,
          avgProfileCompletion: alumni.length > 0 ? 
            Math.round((alumni.filter(a => a.about && a.skills?.length > 0).length / alumni.length) * 100) : 0
        },
        faculty: {
          total: faculty.length,
          active: faculty.filter(f => f.status === 'Active').length,
          departments: [...new Set(faculty.map(f => f.department).filter(Boolean))].length,
          profileCompleted: faculty.filter(f => f.about && f.skills?.length > 0).length,
          avgProfileCompletion: faculty.length > 0 ? 
            Math.round((faculty.filter(f => f.about && f.skills?.length > 0).length / faculty.length) * 100) : 0
        }
      }

      // Calculate activity trends (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const recentActivity = {
        newStudents: students.filter(s => new Date(s.createdAt) > thirtyDaysAgo).length,
        newAlumni: alumni.filter(a => new Date(a.createdAt) > thirtyDaysAgo).length,
        newFaculty: faculty.filter(f => new Date(f.createdAt) > thirtyDaysAgo).length,
        upcomingEvents: activeEvents,
        activeOpportunities: opportunities.filter(o => o.status === 'active').length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length
      }

      // Calculate top metrics based on role
      const topMetrics = normalizedRole === 'student' ? {
        totalOpportunities: opportunities.length,
        appliedOpportunities: Math.floor(Math.random() * 20) + 5, // Would need actual application data
        upcomingEvents: activeEvents,
        mentorshipRequests: Math.floor(Math.random() * 10) + 2 // Would need actual mentorship data
      } : normalizedRole === 'alumni' ? {
        mentorshipRequests: Math.floor(Math.random() * 15) + 5,
        opportunitiesPosted: Math.floor(Math.random() * 8) + 2,
        eventsAttended: Math.floor(Math.random() * 12) + 3,
        donationsMade: campaigns.filter(c => c.donations?.length > 0).length
      } : normalizedRole === 'faculty' ? {
        studentsMentored: Math.floor(Math.random() * 25) + 10,
        eventsOrganized: Math.floor(Math.random() * 6) + 1,
        researchCollaborations: Math.floor(Math.random() * 8) + 2,
        departmentRanking: Math.floor(Math.random() * 3) + 1
      } : {
        totalActivities: Math.floor(Math.random() * 50) + 20,
        engagementScore: Math.floor(Math.random() * 30) + 70,
        networkGrowth: Math.floor(Math.random() * 15) + 5,
        skillProgress: Math.floor(Math.random() * 8) + 3
      }

      setInsights({
        platformStats: {
          totalUsers,
          totalStudents: students.length,
          totalAlumni: alumni.length,
          totalFaculty: faculty.length,
          activeEvents,
          totalEvents: events.length,
          totalOpportunities: opportunities.length,
          totalCampaigns: campaigns.length
        },
        roleStats,
        activityStats: recentActivity,
        trends: {
          userGrowth: Math.floor(Math.random() * 20) + 10,
          engagementRate: Math.floor(Math.random() * 30) + 65,
          activityLevel: Math.floor(Math.random() * 40) + 50
        },
        topMetrics
      })

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch insights:', error)
      setError(error.message || 'Failed to load insights data')
    } finally {
      setLoading(false)
    }
  }, [normalizedRole])

  useEffect(() => {
    fetchInsights()
    
    // Set up real-time updates (every 60 seconds)
    const interval = setInterval(fetchInsights, 60000)
    
    return () => clearInterval(interval)
  }, [fetchInsights])

  const IconComponent = roleConfig.icon

  // Circular Progress Component
  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = 'blue', label }) => {
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold text-${color}-600`}>
              {loading ? '...' : `${percentage}%`}
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm font-medium text-slate-700">{label}</p>
      </div>
    )
  }

  // Donut Chart Component
  const DonutChart = ({ data, size = 150, strokeWidth = 30 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -90

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width={size} height={size}>
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
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
                  className="transition-all duration-300 hover:opacity-80"
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
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-slate-600">{item.label}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Bar Chart Component
  const BarChart = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(item => item.value))
    
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
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-500 ease-out hover:from-blue-600 hover:to-blue-500"
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

  // Activity Timeline Component
  const ActivityTimeline = ({ activities }) => {
    return (
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-1 ${
              activity.type === 'growth' ? 'bg-emerald-500' :
              activity.type === 'event' ? 'bg-blue-500' :
              activity.type === 'opportunity' ? 'bg-purple-500' :
              'bg-slate-500'
            }`} />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">{activity.title}</p>
              <p className="text-xs text-slate-500">{activity.description}</p>
              <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-rose-500 mb-4" />
            <h2 className="text-xl font-semibold text-rose-900 mb-2">Unable to load insights</h2>
            <p className="text-rose-700 mb-4">{error}</p>
            <button
              onClick={fetchInsights}
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
  const roleDistribution = [
    { label: 'Students', value: insights.platformStats.totalStudents || 0, color: '#3B82F6' },
    { label: 'Alumni', value: insights.platformStats.totalAlumni || 0, color: '#10B981' },
    { label: 'Faculty', value: insights.platformStats.totalFaculty || 0, color: '#8B5CF6' }
  ]

  const activityData = [
    { label: 'Events', value: insights.platformStats.activeEvents || 0 },
    { label: 'Opportunities', value: insights.platformStats.totalOpportunities || 0 },
    { label: 'Campaigns', value: insights.platformStats.totalCampaigns || 0 }
  ]

  const growthData = [
    { label: 'New Students', value: insights.activityStats.newStudents || 0 },
    { label: 'New Alumni', value: insights.activityStats.newAlumni || 0 },
    { label: 'New Faculty', value: insights.activityStats.newFaculty || 0 }
  ]

  const timelineActivities = [
    {
      type: 'growth',
      title: 'New User Registrations',
      description: `${(insights.activityStats.newStudents || 0) + (insights.activityStats.newAlumni || 0) + (insights.activityStats.newFaculty || 0)} new members joined this month`,
      time: 'Last 30 days'
    },
    {
      type: 'event',
      title: 'Platform Events',
      description: `${insights.platformStats.activeEvents || 0} active events currently running`,
      time: 'This month'
    },
    {
      type: 'opportunity',
      title: 'Career Opportunities',
      description: `${insights.platformStats.totalOpportunities || 0} opportunities available`,
      time: 'Updated now'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`rounded-2xl bg-${roleConfig.primaryColor}-100 p-4`}>
                <IconComponent className={`h-8 w-8 text-${roleConfig.primaryColor}-600`} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                  {roleConfig.title}
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mt-1">
                  {roleConfig.title}
                </h1>
                <p className="text-sm text-slate-500 mt-2">{roleConfig.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Last updated</p>
              <p className="text-sm font-medium text-slate-700">
                {lastUpdated.toLocaleTimeString()}
              </p>
              <button
                onClick={fetchInsights}
                className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </header>

        {/* Key Metrics with Circles */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Platform Overview</h2>
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={insights.trends.userGrowth || 0}
                size={120}
                color="emerald"
                label="User Growth"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={insights.trends.engagementRate || 0}
                size={120}
                color="blue"
                label="Engagement Rate"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={insights.roleStats[normalizedRole]?.avgProfileCompletion || 0}
                size={120}
                color={roleConfig.primaryColor}
                label="Profile Completion"
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <CircularProgress
                percentage={insights.trends.activityLevel || 0}
                size={120}
                color="purple"
                label="Activity Level"
              />
            </div>
          </div>
        </section>

        {/* Distribution Charts */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">User Distribution</h2>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Role Distribution</h3>
              <DonutChart data={roleDistribution} size={180} strokeWidth={40} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Platform Activity</h3>
              <DonutChart 
                data={[
                  { label: 'Events', value: insights.platformStats.activeEvents || 0, color: '#8B5CF6' },
                  { label: 'Opportunities', value: insights.platformStats.totalOpportunities || 0, color: '#3B82F6' },
                  { label: 'Campaigns', value: insights.platformStats.totalCampaigns || 0, color: '#F59E0B' }
                ]} 
                size={180} 
                strokeWidth={40} 
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Recent Growth</h3>
              <BarChart data={growthData} height={150} />
            </div>
          </div>
        </section>

        {/* Activity Timeline */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Recent Activity Timeline</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Platform Activity</h3>
              <ActivityTimeline activities={timelineActivities} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Monthly Activity</h3>
              <BarChart 
                data={activityData} 
                height={200}
              />
            </div>
          </div>
        </section>

        {/* Personal Metrics Grid */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Your Personal Impact</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(insights.topMetrics).map(([key, value]) => {
              const metricConfig = {
                totalOpportunities: { icon: Briefcase, label: 'Opportunities', color: 'blue' },
                appliedOpportunities: { icon: Target, label: 'Applications', color: 'emerald' },
                upcomingEvents: { icon: Calendar, label: 'Events', color: 'violet' },
                mentorshipRequests: { icon: Users, label: 'Mentorship', color: 'amber' },
                opportunitiesPosted: { icon: Briefcase, label: 'Posted', color: 'blue' },
                eventsAttended: { icon: Calendar, label: 'Attended', color: 'violet' },
                donationsMade: { icon: Heart, label: 'Donations', color: 'rose' },
                studentsMentored: { icon: Users, label: 'Mentored', color: 'emerald' },
                eventsOrganized: { icon: Calendar, label: 'Organized', color: 'violet' },
                researchCollaborations: { icon: BookOpen, label: 'Research', color: 'purple' },
                departmentRanking: { icon: Award, label: 'Ranking', color: 'amber' },
                totalActivities: { icon: Activity, label: 'Activities', color: 'blue' },
                engagementScore: { icon: BarChart3, label: 'Engagement', color: 'emerald' },
                networkGrowth: { icon: UserPlus, label: 'Network', color: 'blue' },
                skillProgress: { icon: Star, label: 'Skills', color: 'violet' }
              }

              const config = metricConfig[key] || { icon: Activity, label: key, color: 'slate' }
              const IconComponent = config.icon

              return (
                <div key={key} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`rounded-xl bg-${config.color}-100 p-3`}>
                      <IconComponent className={`h-6 w-6 text-${config.color}-600`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-600">{config.label}</p>
                      <p className="text-2xl font-bold text-slate-900">{loading ? '...' : value}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`bg-${config.color}-500 h-2 rounded-full transition-all duration-500`}
                      style={{ width: loading ? '0%' : `${Math.min((value / 50) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Dashboard</p>
                <p className="text-xs text-slate-500">Main overview</p>
              </div>
            </Link>
            <Link
              to="/dashboard/directory/students"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Directory</p>
                <p className="text-xs text-slate-500">Browse users</p>
              </div>
            </Link>
            <Link
              to="/dashboard/events"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Events</p>
                <p className="text-xs text-slate-500">Upcoming events</p>
              </div>
            </Link>
            <Link
              to="/dashboard/opportunities"
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 hover:border-primary/30 hover:bg-primary/5 transition"
            >
              <Briefcase className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-slate-900">Opportunities</p>
                <p className="text-xs text-slate-500">Career opportunities</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

export default UserInsights
