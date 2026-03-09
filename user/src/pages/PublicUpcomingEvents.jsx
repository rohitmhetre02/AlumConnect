import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const PublicUpcomingEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/events/upcoming")
      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (timeString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(undefined, options)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full">

      {/* HERO HEADER */}
      <div
        className="w-full py-20 text-center text-white"
        style={{
          backgroundImage: "url('/images/banner-pattern.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#9C7A2B"
        }}
      >
        <h1 className="text-5xl font-bold">Upcoming Events</h1>
      </div>

      {/* INTRO */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="bg-white rounded-lg shadow-md p-8 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Discover Upcoming Events
          </h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            Stay connected with our alumni community through exciting events,
            networking sessions, reunions, workshops and professional
            development programs.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Join us to reconnect with classmates, expand your professional
            network and participate in meaningful alumni activities.
          </p>
        </div>

        {/* EVENTS GRID */}
        {events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
              >

                {/* IMAGE */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* EVENT INFO */}
                <div className="p-6">

                  <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded mb-2">
                    {event.eventType}
                  </span>

                  <h3 className="text-lg font-semibold mb-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>

                  <div className="text-sm text-gray-700 space-y-1 mb-4">
                    <p>📅 {formatDate(event.date)}</p>
                    <p>⏰ {formatTime(event.time)}</p>
                    <p>📍 {event.location}</p>
                  </div>

                  {/* REGISTER BUTTON */}
                  <Link
                    to="/login"
                    className="block w-full text-center bg-red-700 hover:bg-red-800 text-white py-2 rounded font-medium"
                  >
                    Register Now
                  </Link>

                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center py-20 text-gray-600">
            {error
              ? "Unable to load events."
              : "No upcoming events available."}
          </div>
        )}

        {/* CENTER LOGIN BUTTON */}
        <div className="text-center mt-14">
          <Link
            to="/login"
            className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded font-semibold"
          >
            Login to Register
          </Link>
        </div>

      </div>
    </div>
  )
}

export default PublicUpcomingEvents