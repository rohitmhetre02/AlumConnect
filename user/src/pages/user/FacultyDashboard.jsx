import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { get } from '../../utils/api'

const FacultyDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  
  // Real data states
  const [counts, setCounts] = useState({
    students: 0,
    alumni: 0,
    opportunities: 0,
    events: 0,
    campaigns: 0
  })
  
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  // Fetch real data from backend
  const fetchDashboardData = async () => {
    try {
      if (refreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      // Fetch all data in parallel using existing backend routes
      const [
        studentsRes,
        alumniRes,
        eventsRes,
        activitiesRes,
        opportunitiesRes,
        campaignsRes
      ] = await Promise.all([
        get('/api/faculty/students'),
        get('/api/faculty/alumni'),
        get('/api/faculty/events/upcoming'),
        get('/api/faculty/student-activities'),
        get('/api/faculty/opportunities'),
        get('/api/faculty/campaigns')
      ])

      // Set counts with proper error handling
      setCounts({
        students: studentsRes?.count || studentsRes?.data?.length || 0,
        alumni: alumniRes?.count || alumniRes?.data?.length || 0,
        opportunities: opportunitiesRes?.count || opportunitiesRes?.data?.length || 0,
        events: eventsRes?.count || eventsRes?.data?.length || 0,
        campaigns: campaignsRes?.count || campaignsRes?.data?.length || 0
      })

      // Set events with fallback to empty array
      const eventsData = Array.isArray(eventsRes?.data) ? eventsRes.data : []
      setUpcomingEvents(eventsData.slice(0, 5)) // Show only 5 recent events
      
      // Set activities with fallback to empty array
      const activitiesData = Array.isArray(activitiesRes?.data) ? activitiesRes.data : []
      setRecentActivities(activitiesData.slice(0, 5)) // Show only 5 recent activities

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Failed to load dashboard data. Please try again.')
      
      // Set fallback data
      setCounts({
        students: 0,
        alumni: 0,
        opportunities: 0,
        events: 0,
        campaigns: 0
      })
      setUpcomingEvents([])
      setRecentActivities([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch (error) {
      return 'Invalid Date'
    }
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
      case 'student': return '👨‍🎓'
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Faculty Dashboard</h1>
              <p className="text-slate-600 mt-1">Manage your department and track student activities.</p>
            </div>
           
          </div>
        </header>
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className=" rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Students</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.students}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Alumni</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.alumni}</p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Opportunities</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.opportunities}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Upcoming Events</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.events}</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-50">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{counts.campaigns}</p>
              </div>
              <div className="p-3 rounded-xl bg-pink-50">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Events */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Upcoming Events</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event._id || event.id}
                    className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        <div className="mt-2 space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(event.date)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {event.attendees || 0} attending
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-500">No upcoming events found</p>
                </div>
              )}
            </div>
          </section>          {/* Recent Department Activities */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent Department Activities</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div
                    key={activity._id || activity.id}
                    className="flex items-start gap-3 border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getActivityColor(activity.type)}`}>
                          {activity.type}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(activity.date)}</span>
                      </div>
                      {activity.description && (
                        <p className="mt-2 text-xs text-slate-600 line-clamp-2">{activity.description}</p>
                      )}
                    </div>
                  </div>
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
    </div>
  )
}

export default FacultyDashboard