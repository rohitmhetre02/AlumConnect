import React, { useState, useEffect } from "react"
import { useAuth } from "../../context/AuthContext"
import { get } from "../../utils/api"

const FacultyDashboard = () => {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [counts, setCounts] = useState({
    students: 0,
    alumni: 0,
    events: 0,
    campaigns: 0
  })

  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const [
        studentsRes,
        alumniRes,
        eventsRes,
        activitiesRes
      ] = await Promise.all([
        get("/api/faculty/students"),
        get("/api/faculty/alumni"),
        get("/api/faculty/events/pending"),
        get("/api/faculty/student-activities")
      ])

      setCounts({
        students: studentsRes.count || 0,
        alumni: alumniRes.count || 0,
        events: eventsRes.count || 0,
        campaigns: 0
      })

      setUpcomingEvents(eventsRes.data || [])
      setRecentActivities(activitiesRes.data || [])

    } catch (err) {
      setError("Failed to load dashboard")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Welcome Section */}

      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {user?.name}
        </h1>

        <p className="text-slate-600 mt-1">
          Faculty Dashboard
        </p>

        <div className="mt-3 flex gap-4 text-sm text-slate-500">
          <span>Department: {user?.profile?.department || "N/A"}</span>
          <span>Role: {user?.role}</span>
        </div>
      </div>


      {/* Department Statistics */}

      <div className="grid md:grid-cols-4 gap-6">

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Students</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.students}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Alumni</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.alumni}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Upcoming Events</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.events}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <p className="text-sm text-slate-500">Active Campaigns</p>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {counts.campaigns}
          </h2>
        </div>

      </div>


      {/* Upcoming Events */}

      <div className="bg-white border rounded-2xl p-6 shadow-sm">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Upcoming Events
          </h2>
        </div>

        <div className="space-y-4">

          {upcomingEvents.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No upcoming events
            </p>
          ) : (
            upcomingEvents.map(event => (

              <div
                key={event._id}
                className="border rounded-xl p-4 flex justify-between items-center hover:bg-slate-50"
              >

                <div>
                  <p className="font-medium text-slate-900">
                    {event.title}
                  </p>

                  <p className="text-sm text-slate-500">
                    {formatDate(event.date)}
                  </p>
                </div>

                <span className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                  {event.attendees || 0} attending
                </span>

              </div>

            ))
          )}

        </div>

      </div>


      {/* Recent Activities */}

      <div className="bg-white border rounded-2xl p-6 shadow-sm">

        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          Recent Department Activities
        </h2>

        <div className="space-y-4">

          {recentActivities.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No activities found
            </p>
          ) : (
            recentActivities.map(activity => (

              <div
                key={activity._id}
                className="flex items-center gap-3 border rounded-xl p-4 hover:bg-slate-50"
              >

                <div className="text-xl">
                  {activity.type === "student" && "👨‍🎓"}
                  {activity.type === "alumni" && "🎓"}
                  {activity.type === "event" && "📅"}
                  {activity.type === "campaign" && "🎯"}
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {activity.title}
                  </p>

                  <p className="text-xs text-slate-500">
                    {formatDate(activity.date)}
                  </p>
                </div>

              </div>

            ))
          )}

        </div>

      </div>

    </div>
  )
}

export default FacultyDashboard