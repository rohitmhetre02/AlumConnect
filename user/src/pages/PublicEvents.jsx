import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const PublicEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/public/events")
      const data = await response.json()
      
      if (data.success) {
        setEvents(data.events || [])
      } else {
        console.error('API Error:', data.error)
        setEvents([])
      }
    } catch (err) {
      console.error("Error fetching events:", err)
      setError(err.message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  const getDaysLeft = (eventDate) => {
    const today = new Date()
    const event = new Date(eventDate)
    const diffTime = event - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getEventModeColor = (mode) => {
    switch (mode?.toLowerCase()) {
      case 'online':
        return 'bg-blue-100 text-blue-700'
      case 'in-person':
        return 'bg-green-100 text-green-700'
      case 'hybrid':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
          backgroundColor: "#1E40AF"
        }}
      >
        <h1 className="text-5xl font-bold">Events</h1>
      </div>

      {/* INTRO */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="bg-white rounded-lg shadow-md p-8 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Upcoming Events
          </h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            Join us for exciting events including workshops, seminars, networking
            sessions, alumni meetups, and cultural activities.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Connect with fellow alumni, expand your professional network, and
            participate in meaningful community experiences.
          </p>
        </div>

        {/* EVENT CARDS */}
        {events.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {events.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
              >

                {/* IMAGE */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {event.imageUrl ? (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${event._id}/400/300.jpg`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📅</div>
                        <p className="text-blue-600 text-sm font-medium">Event Image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-6">

                  {/* STATUS */}
                  <span
                    className="inline-block text-xs px-2 py-1 rounded-full mb-2 bg-green-100 text-green-700"
                  >
                    Upcoming
                  </span>

                  <h3 className="text-lg font-semibold mb-2">
                    {event.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {event.description}
                  </p>

                  {/* EVENT MODE */}
                  <span className={`inline-block text-xs px-2 py-1 rounded mb-4 ${getEventModeColor(event.mode)}`}>
                    {event.mode || 'In-Person'}
                  </span>

                  {/* EVENT INFO */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.date)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(event.date)}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {Math.floor(Math.random() * 100) + 20} attending
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getDaysLeft(event.date)} days left
                    </span>
                  </div>

                  {event.registrationDeadline && (
                    <p className="text-xs text-gray-500 mb-4">
                      Registration ends: {formatDate(event.registrationDeadline)}
                    </p>
                  )}

                  {/* REGISTER BUTTON */}
                  <Link
                    to={`/events/${event._id}`}
                    className="block w-full text-center bg-blue-700 hover:bg-blue-800 text-white py-2 rounded"
                  >
                    View Details
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
            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded font-semibold"
          >
            Login to Register
          </Link>
        </div>

      </div>
    </div>
  )
}

export default PublicEvents
