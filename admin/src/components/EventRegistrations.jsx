import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'

const formatDate = (date) => {
  if (!date) return '—'
  const instance = new Date(date)
  if (Number.isNaN(instance.getTime())) return '—'
  return instance.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatTime = (date) => {
  if (!date) return ''
  const instance = new Date(date)
  if (Number.isNaN(instance.getTime())) return ''
  return instance.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const EventRegistrations = () => {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true)
        
        // Fetch event details
        const eventResponse = await api.get(`/events/${eventId}`)
        setEvent(eventResponse.data)
        
        // Fetch registrations
        const registrationsResponse = await api.get(`/events/${eventId}/registrations`)
        setRegistrations(registrationsResponse.data || [])
        
      } catch (err) {
        console.error('Failed to fetch event data:', err)
        setError('Failed to load event data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEventData()
    }
  }, [eventId])

  const handleBack = () => {
    navigate('/admin/events')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Loading Event Registrations...</h1>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Event Registrations</h1>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="text-red-600 mb-4">{error || 'Event not found'}</div>
            <button
              onClick={handleBack}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Event Registrations</h1>
                <p className="text-slate-600 mt-1">{event.title}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Total Registrations</div>
              <div className="text-2xl font-bold text-slate-900">{registrations.length}</div>
            </div>
          </div>
          
          {/* Event Details */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Date & Time
              </div>
              <div className="text-sm font-medium text-slate-900">
                {formatDate(event.startAt)} at {formatTime(event.startAt)}
                {event.endAt && ` - ${formatTime(event.endAt)}`}
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </div>
              <div className="text-sm font-medium text-slate-900">{event.location || '—'}</div>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Type
              </div>
              <div className="text-sm font-medium text-slate-900 capitalize">{event.organization || 'Event'}</div>
            </div>
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Registered Participants</h2>
          </div>
          
          {registrations.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="h-12 w-12 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No registrations yet</h3>
              <p className="text-slate-500">No one has registered for this event yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Department</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Registered At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((registration, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {registration.firstName && registration.lastName
                            ? `${registration.firstName} ${registration.lastName}`
                            : registration.name || '—'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{registration.email || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{registration.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{registration.role || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">{registration.department || '—'}</td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {registration.registeredAt
                          ? new Date(registration.registeredAt).toLocaleString()
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {registrations.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>Showing {registrations.length} registrations</div>
                <div>Last updated: {new Date().toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EventRegistrations
