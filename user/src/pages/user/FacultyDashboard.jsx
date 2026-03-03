import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { get } from '../../utils/api'

const FacultyDashboard = () => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Real data states
  const [counts, setCounts] = useState({
    students: 0,
    alumni: 0,
    opportunities: 0,
    events: 0
  })
  
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  // Fetch real data from backend
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all data in parallel
      const [
        studentsRes,
        alumniRes,
        opportunitiesRes,
        eventsRes,
        eventsResponse,
        activitiesResponse
      ] = await Promise.all([
        get('/api/faculty/students/count'),
        get('/api/faculty/alumni/count'),
        get('/api/faculty/opportunities/count'),
        get('/api/faculty/events/count'),
        get('/api/faculty/events/upcoming'),
        get('/api/faculty/activities/department')
      ])

      setCounts({
        students: studentsRes.count || 0,
        alumni: alumniRes.count || 0,
        opportunities: opportunitiesRes.count || 0,
        events: eventsRes.count || 0
      })

      setUpcomingEvents(eventsResponse || [])
      setRecentActivities(activitiesResponse || [])

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getActivityColor = (type) => {
    switch(type) {
      case 'student': return 'bg-blue-100 text-blue-700'
      case 'alumni': return 'bg-purple-100 text-purple-700'
      case 'opportunity': return 'bg-green-100 text-green-700'
      case 'event': return 'bg-orange-100 text-orange-700'
      case 'news': return 'bg-red-100 text-red-700'
      case 'campaign': return 'bg-pink-100 text-pink-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getActivityIcon = (type) => {
    switch(type) {
      case 'student': return '📝'
      case 'alumni': return '🎓'
      case 'opportunity': return '💼'
      case 'event': return '📅'
      case 'news': return '📰'
      case 'campaign': return '🎯'
      default: return '📋'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-slate-600">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
            <p className="text-slate-600">Manage your department and track student activities.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      {/* Counts Section */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Students</p>
              <p className="text-2xl font-bold text-slate-900">{counts.students}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
              👥
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Alumni</p>
              <p className="text-2xl font-bold text-slate-900">{counts.alumni}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-purple-100 text-lg font-semibold text-purple-600">
              🎓
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Opportunities</p>
              <p className="text-2xl font-bold text-slate-900">{counts.opportunities}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-green-100 text-lg font-semibold text-green-600">
              💼
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Events</p>
              <p className="text-2xl font-bold text-slate-900">{counts.events}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-orange-100 text-lg font-semibold text-orange-600">
              📅
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Events</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <article
                  key={event._id || event.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft transition hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{event.title}</h3>
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {event.attendees || 0} attending
                      </span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No upcoming events found</p>
              </div>
            )}
          </div>
        </section>

        {/* Recent Department Activities */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Department Activities</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity) => (
                <article
                  key={activity._id || activity.id}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft transition hover:shadow-lg"
                >
                  <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getActivityColor(activity.type)}`}>
                        {activity.type}
                      </span>
                      <span className="text-xs text-slate-500">{activity.time}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No recent activities found</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default FacultyDashboard
