import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

const StudentDashboard = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(null)

  const overviewData = [
    { title: "Available Job Opportunities", value: "24", trend: "+5 this week", color: "blue" },
    { title: "Upcoming Events", value: "8", trend: "+2 this month", color: "purple" },
    { title: "Applications Applied", value: "12", trend: "+3 this week", color: "green" },
    { title: "Active Donation Campaigns", value: "3", trend: "1 ending soon", color: "orange" }
  ]

  const events = [
    { title: "Career Fair 2024", date: "March 15, 2024", time: "10:00 AM", type: "Career Fair" },
    { title: "Tech Workshop: React & Node.js", date: "March 20, 2024", time: "2:00 PM", type: "Workshop" },
    { title: "Alumni Networking Meetup", date: "March 25, 2024", time: "6:00 PM", type: "Networking" },
    { title: "Data Science Webinar", date: "March 28, 2024", time: "4:00 PM", type: "Webinar" }
  ]

  const applications = [
    { title: "Frontend Developer", company: "TechCorp", status: "Applied", date: "March 10, 2024" },
    { title: "Data Science Intern", company: "DataLab", status: "Reviewed", date: "March 8, 2024" },
    { title: "Product Manager", company: "StartupHub", status: "Shortlisted", date: "March 5, 2024" },
    { title: "Software Engineer", company: "Google", status: "Applied", date: "March 3, 2024" },
    { title: "UX Designer", company: "Microsoft", status: "Interview", date: "March 1, 2024" }
  ]

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header - Full Width */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="w-full px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-slate-600 mt-1">
                Department: {user?.profile?.department || 'Computer Science'} • Class of {user?.profile?.graduationYear || '2025'}
              </p>
            </div>
            <div className="w-full lg:w-96">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search jobs and events..."
                  className="w-full px-4 py-3 pl-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-8">
        {/* Overview Cards - Full Width */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overviewData.map((item, index) => (
            <div key={index} className={`rounded-2xl border p-6 bg-white shadow-sm hover:shadow-md ${colorClasses[item.color]}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{item.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{item.value}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.trend}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/50">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid - Full Width */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Events and Applications */}
          <div className="xl:col-span-2 space-y-8">
            {/* Events Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Events & Activities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event, index) => (
                  <div key={index} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{event.title}</h3>
                        <p className="text-sm text-slate-600">{event.date} • {event.time}</p>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {event.type}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">
                        View Details
                      </button>
                      <button className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                        Register
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applications Applied Section */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Applications Applied</h2>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Job Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {applications.map((app, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{app.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{app.company}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            app.status === 'Applied' ? 'bg-blue-100 text-blue-700' :
                            app.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-700' :
                            app.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{app.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Calendar */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Calendar</h2>
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">March 2024</h3>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <div key={index} className="text-center text-xs font-medium text-slate-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({length: 35}, (_, i) => {
                    const day = i - 3 + 1
                    const isValidDay = day > 0 && day <= 31
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer ${
                          isValidDay ? 'hover:bg-slate-100' : ''
                        }`}
                        onClick={() => isValidDay && setSelectedDate(day)}
                      >
                        {isValidDay && (
                          <>
                            <span className="text-sm font-medium text-slate-900">{day}</span>
                            {[5, 12, 15, 20, 25].includes(day) && (
                              <div className="flex gap-1 mt-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  [5, 20].includes(day) ? 'bg-blue-500' :
                                  [12, 25].includes(day) ? 'bg-green-500' :
                                  'bg-purple-500'
                                }`} />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
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
                  <span className="text-sm text-slate-600">Jobs</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">Mentorship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
