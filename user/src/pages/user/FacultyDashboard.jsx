import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import useFacultyDashboard from '../../hooks/useFacultyDashboard'
import InteractiveCalendar from '../../components/shared/InteractiveCalendar'
import useCalendarNotes from '../../hooks/useCalendarNotes'

const FacultyDashboard = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(null)
  const { overviewStats, studentActivities, alumniCoordination, eventsApprovals, engagementMetrics, calendarData, loading, error, refresh } = useFacultyDashboard(user)
  const { notes, addNote, deleteNote, loading: notesLoading } = useCalendarNotes()

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  }

  const statusColorClasses = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    under_review: "bg-amber-100 text-amber-700",
  }

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

  const getEventColor = (type) => {
    switch(type) {
      case 'event': return 'bg-blue-500'
      case 'job': return 'bg-green-500'
      case 'mentorship': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      {/* Header - Full Width */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="w-full px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.name?.split(' ')[0] || 'Faculty'}! 👨‍🏫
              </h1>
              <p className="text-slate-600 mt-1">
                {user?.profile?.role || 'Professor'} • {user?.profile?.department || 'Computer Science'}
              </p>
            </div>
            <div className="w-full lg:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students, alumni, jobs, events..."
                  className="w-full px-4 py-3 pl-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Quick Access Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 4h.01" />
              </svg>
              View Reports
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Manage Events
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Overview Cards - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition-all ${colorClasses.blue}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Students Under Guidance</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.studentsUnderGuidance}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.studentsTrend}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition-all ${colorClasses.green}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Alumni Linked to Department</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.alumniLinkedToDepartment}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.alumniTrend}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition-all ${colorClasses.purple}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Department Events</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.activeDepartmentEvents}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.eventsTrend}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md transition-all ${colorClasses.orange}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pending Requests / Approvals</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{overviewStats.pendingRequests}</p>
                <p className="text-sm text-slate-500 mt-1">{overviewStats.requestsTrend}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/50">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9 4h.01" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Student Activities and Alumni Coordination */}
          <div className="xl:col-span-2 space-y-8">
            {/* Student Activity & Monitoring Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Student Activity & Monitoring</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Activity Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {studentActivities.map((student, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{student.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{student.activity}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColorClasses[student.status]}`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{student.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Alumni Coordination Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Alumni Coordination</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Alumni Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Industry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mentorship</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Events</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {alumniCoordination.map((alumni, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{alumni.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{alumni.industry}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              alumni.mentorship === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {alumni.mentorship}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{alumni.events}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Events & Approvals Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Events & Approvals</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Event Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Organizer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {eventsApprovals.map((event, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{event.name}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{event.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{event.organizer}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColorClasses[event.status]}`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {event.status === 'pending' && (
                                <>
                                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                                    Approve
                                  </button>
                                  <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                                    Review
                                  </button>
                                </>
                              )}
                              <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                                View Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Calendar and Analytics */}
          <div className="space-y-6">
            {/* Interactive Calendar Section */}
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

            {/* Calendar Legend */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Calendar Legend</h3>
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Events</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Job-Related Activities</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Mentorship Sessions</span>
                </div>
              </div>
            </div>

            {/* Reports & Insights Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Reports & Insights</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Engagement Metrics</h3>
                
                {/* Student Engagement */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Student Engagement</span>
                    <span className="text-sm font-bold text-slate-900">{engagementMetrics.studentEngagement}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: `${engagementMetrics.studentEngagement}%`}}></div>
                  </div>
                </div>

                {/* Alumni Participation */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Alumni Participation</span>
                    <span className="text-sm font-bold text-slate-900">{engagementMetrics.alumniParticipation}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: `${engagementMetrics.alumniParticipation}%`}}></div>
                  </div>
                </div>

                {/* Event Success */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Event Success Rate</span>
                    <span className="text-sm font-bold text-slate-900">{engagementMetrics.eventSuccess}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{width: `${engagementMetrics.eventSuccess}%`}}></div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors">
                    View Full Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FacultyDashboard
