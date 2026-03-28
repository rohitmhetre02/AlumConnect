import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import useStudentDashboard from '../../hooks/useStudentDashboard'
import InteractiveCalendar from '../../components/shared/InteractiveCalendar'
import useCalendarNotes from '../../hooks/useCalendarNotes'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(null)
  const { overviewStats, events, applications, allActivities, calendarData, loading, error, refresh } = useStudentDashboard()
  const { notes, addNote, deleteNote, loading: notesLoading } = useCalendarNotes()

  // Helper function to get current year from database
  const getCurrentYear = () => {
    // For student dashboard, only use currentYear from database profile
    const currentYear = user?.currentYear || user?.profile?.currentYear
    
    // If no currentYear in database, default to 1st Year
    return currentYear || '1st Year'
  }

  // Helper function to get user display name
  const getUserDisplayName = () => {
    const firstName = user?.firstName
    const name = user?.name
    if (firstName) return firstName
    if (name) return name.split(' ')[0]
    return 'Student'
  }

  // Helper function to get user department
  const getUserDepartment = () => {
    return user?.department || user?.profile?.department || 'Not specified'
  }

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  }

  const statusColorClasses = {
    blue: "bg-blue-100 text-blue-700",
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  }

  const getEventColor = (type) => {
    switch(type) {
      case 'event': return 'bg-blue-500'
      case 'job': return 'bg-green-500'
      case 'mentorship': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getDaysInMonth = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const days = getDaysInMonth()
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

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
          <p className="text-red-600 mb-4">Error loading dashboard data</p>
          <button 
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen ">
      {/* Header - Full Width */}
      <div className="">
        <div className="w-full px-2 py-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {getUserDisplayName()}! 👋
              </h1>
              <p className="text-slate-600 mt-1">
                Department: {getUserDepartment()} • {getCurrentYear()}
              </p>
            </div>
           
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Overview Cards - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md ${colorClasses.blue}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Available Job Opportunities</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.availableJobs || 0}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.availableJobs > 0 ? 'Available now' : 'No opportunities'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md ${colorClasses.purple}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.upcomingEvents || 0}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.upcomingEvents > 0 ? 'Events scheduled' : 'No events'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md ${colorClasses.green}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Applications Applied</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.applicationsApplied || 0}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.applicationsApplied > 0 ? 'Applications sent' : 'No applications'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md ${colorClasses.orange}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Donation Campaigns</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.activeDonations || 0}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.activeDonations > 0 ? 'Campaigns active' : 'No campaigns'}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Events and Applications */}
          <div className="xl:col-span-2 space-y-8">
            {/* Upcoming Events Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Upcoming Events</h2>
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{event.title}</h3>
                          <p className="text-sm text-slate-600">{event.date} • {event.time}</p>
                        </div>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          {event.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">{event.description}</p>
                      <div className="flex gap-2">
                        <Link 
                          to={`/dashboard/events/${event.id}`}
                          className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50"
                        >
                          View Details
                        </Link>
                        <Link 
                          to={`/dashboard/events/${event.id}`}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            event.isRegistered 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : 'bg-purple-600 text-white hover:bg-purple-700'
                          }`}
                        >
                          {event.isRegistered ? 'Registered' : 'Register'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-600">No upcoming events available</p>
                </div>
              )}
            </div>

            {/* Latest Activity Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Latest Activity</h2>
              {allActivities.length > 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {allActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                              <p className="text-xs text-slate-500">{activity.subtitle}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
                              {activity.typeLabel}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColorClasses[activity.statusColor]}`}>
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{activity.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-600">No recent activity</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Browse Opportunities
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Interactive Calendar */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Interactive Calendar</h2>
              <InteractiveCalendar 
                initialNotes={notes}
                onNotesChange={(updatedNotes) => {
                  // Handle notes update if needed
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
