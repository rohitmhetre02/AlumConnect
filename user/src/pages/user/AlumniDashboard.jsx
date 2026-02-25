import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import useAlumniDashboard from '../../hooks/useAlumniDashboard'
import InteractiveCalendar from '../../components/shared/InteractiveCalendar'
import useCalendarNotes from '../../hooks/useCalendarNotes'

const AlumniDashboard = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(null)
  const { overviewStats, opportunities, events, mentorshipRequests, recentActivity, calendarData, loading, error, refresh } = useAlumniDashboard(user)
  const { notes, addNote, deleteNote, loading: notesLoading } = useCalendarNotes()

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  }

  const statusColorClasses = {
    pending: "bg-yellow-100 text-yellow-700",
    accepted: "bg-green-100 text-green-700",
    declined: "bg-red-100 text-red-700",
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header - Full Width */}
      <div className="border-b border-slate-100">
        <div className="w-full px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.name?.split(' ')[0] || 'Alumni'}! 👋
              </h1>
              <p className="text-slate-600 mt-1">
                Class of {user?.profile?.graduationYear || '2020'} • {user?.profile?.department || 'Computer Science'}
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
                <p className="text-sm font-medium text-slate-600">Opportunities Posted</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.jobsPosted}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.jobsTrend}</p>
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
                <p className="text-sm font-medium text-slate-600">Events Created or Participated</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.eventsParticipated}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.eventsTrend}</p>
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
                <p className="text-sm font-medium text-slate-600">Active Donation Campaigns</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.activeDonations}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.donationsTrend}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md ${colorClasses.orange}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Mentorship Requests Received</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.mentorshipRequests}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.mentorshipTrend}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Contribution Panel and Mentorship */}
          <div className="xl:col-span-2 space-y-8">
            {/* Contribution Panel */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Contributions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900">Post a Job or Referral</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Share opportunities with students and fellow alumni</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard/opportunities/post'}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Post Opportunity
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900">Create Alumni Events</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Organize networking and professional events</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard/events/post'}
                    className="w-full px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                  >
                    Create Event
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900">Support Campaigns</h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">Contribute to institutional development</p>
                  <button 
                    onClick={() => window.location.href = '/dashboard/donations/create'}
                    className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Donate
                  </button>
                </div>
              </div>
            </div>

            {/* Mentorship Requests Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Mentorship Requests</h2>
              {mentorshipRequests.length > 0 ? (
                <div className="space-y-3">
                  {mentorshipRequests.map((request) => (
                    <div key={request.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{request.name}</h3>
                          <p className="text-sm text-slate-600">{request.department}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColorClasses[request.status]}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{request.request}</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                          Accept
                        </button>
                        <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                          Decline
                        </button>
                        <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-600">No mentorship requests at the moment</p>
                </div>
              )}
            </div>

            {/* Events Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Your Events</h2>
              {events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                          {event.isCreator ? 'Manage' : 'View Details'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <p className="text-slate-600">No events created yet</p>
                  <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Interactive Calendar and Activity */}
          <div className="space-y-6">
            {/* Interactive Calendar */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Interactive Calendar</h2>
              <InteractiveCalendar 
                initialNotes={notes}
                onNotesChange={(updatedNotes) => {
                  // Handle notes update if needed
                  console.log('Calendar notes updated:', updatedNotes)
                }}
              />
            </div>

            {/* Recent Activity Feed */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Recent Activity</h3>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3">
                        <span className="text-lg">{activity.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm text-slate-600">{activity.title}</p>
                          <p className="text-xs text-slate-400">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center">No recent activity</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlumniDashboard
