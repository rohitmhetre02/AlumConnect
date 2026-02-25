import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import getStatusBadgeClass from '../utils/status'
import useApiList from '../hooks/useApiList'
import { api } from '../utils/api'

const determineEventStatus = (startAt, endAt) => {
  const now = new Date()
  if (!startAt) return 'Scheduled'
  if (startAt > now) return 'Upcoming'
  if (endAt && endAt < now) return 'Completed'
  if (!endAt && startAt <= now) return 'In Progress'
  if (endAt && startAt <= now && endAt >= now) return 'In Progress'
  return 'Scheduled'
}

const formatDate = (date) => {
  if (!date) return '—'
  const instance = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(instance.getTime())) return '—'
  return instance.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatTime = (date) => {
  if (!date) return ''
  const instance = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(instance.getTime())) return ''
  return instance.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

const capitalize = (value) => {
  if (!value) return ''
  const str = value.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const EventsManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  const { data: events, isLoading: dataLoading, error, refetch } = useApiList('/events')

  // Get user role from localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const userRole = adminUser.role ? adminUser.role.toString().toLowerCase() : 'admin'
  const isCoordinator = userRole === 'coordinator'

  const normalizedEvents = useMemo(() => {
    return events.map((event) => {
      const startAt = event.startAt ? new Date(event.startAt) : null
      const endAt = event.endAt ? new Date(event.endAt) : null

      return {
        id: event.id || event._id,
        title: event.title || 'Untitled Event',
        description: event.description || '',
        location: event.location || '—',
        organization: event.organization || '—',
        department: event.department || '',
        startAt,
        endAt,
        registrationCount: Number(event.registrationCount ?? 0),
        createdByName: event.createdByName || '—',
        createdByRole: event.createdByRole || '',
        status: determineEventStatus(startAt, endAt),
        type: event.organization ? capitalize(event.organization) : 'Event',
      }
    })
  }, [events])

  const statusOptions = useMemo(() => {
    const statuses = new Set()
    normalizedEvents.forEach((event) => {
      if (event.status) statuses.add(event.status)
    })
    return Array.from(statuses)
  }, [normalizedEvents])

  const typeOptions = useMemo(() => {
    const types = new Set()
    normalizedEvents.forEach((event) => {
      if (event.type) types.add(event.type)
    })
    return Array.from(types)
  }, [normalizedEvents])

  const filteredEvents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return normalizedEvents.filter((event) => {
      const matchesSearch =
        !query ||
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.createdByName.toLowerCase().includes(query) ||
        event.type.toLowerCase().includes(query)

      const matchesStatus = filterStatus === 'all' || event.status === filterStatus
      const matchesType = filterType === 'all' || event.type === filterType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [normalizedEvents, searchTerm, filterStatus, filterType])

  // Admin action handlers
  const handleEdit = (id) => {
    navigate(`/admin/events/${id}/edit`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        await api.delete(`/events/${id}`)
        await refetch()
        alert('Event deleted successfully')
      } catch (error) {
        console.error('Failed to delete event:', error)
        alert('Failed to delete event. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    setIsLoading(true)
    try {
      await api.put(`/events/${id}`, { status: newStatus })
      await refetch()
      alert(`Event status updated to: ${newStatus}`)
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events Management</h1>
          </div>
          {!isCoordinator && (
            <button 
              onClick={() => navigate('/admin/events/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-600/50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </button>
          )}
        </div>
      </header>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search events by title, location, organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="Upcoming">Upcoming</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Types</option>
                {typeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Event</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Registrations</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Posted By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">View</th>
                {!isCoordinator && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataLoading ? (
                <tr>
                  <td colSpan={isCoordinator ? 8 : 9} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      Loading events...
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={isCoordinator ? 8 : 9} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>No events found matching your criteria.</div>
                      {!isCoordinator && (
                        <button 
                          onClick={() => navigate('/admin/events/create')}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create First Event
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-slate-900 max-w-xs truncate">{event.title}</div>
                        <div className="text-xs text-slate-500">ID: #{event.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-slate-900">{formatDate(event.startAt)}</div>
                        <div className="text-xs text-slate-500">{formatTime(event.startAt)}{event.endAt ? ` - ${formatTime(event.endAt)}` : ''}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{event.location}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}/registrations`)}
                        className="flex items-center gap-1 text-sm text-slate-700 hover:text-red-600 transition-colors group"
                      >
                        <svg className="h-4 w-4 text-slate-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="underline decoration-2 underline-offset-2 group-hover:decoration-red-500">{event.registrationCount}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{event.createdByName}</div>
                        <div className="text-xs text-slate-500">{capitalize(event.createdByRole)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        title="View Event Details"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                    {!isCoordinator && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(event.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                            title="Edit Event"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          
                          <div className="relative group">
                            <button
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              More
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                              <div className="py-1">
                                {event.status === 'Upcoming' && (
                                  <button
                                    onClick={() => handleStatusUpdate(event.id, 'In Progress')}
                                    disabled={isLoading}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-50"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Start Event
                                  </button>
                                )}
                                
                                {event.status === 'In Progress' && (
                                  <button
                                    onClick={() => handleStatusUpdate(event.id, 'Completed')}
                                    disabled={isLoading}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-50"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Complete Event
                                  </button>
                                )}
                                
                                <div className="border-t border-slate-100 my-1"></div>
                                
                                <button
                                  onClick={() => handleDelete(event.id)}
                                  disabled={isLoading}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredEvents.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filteredEvents.length} of {normalizedEvents.length} events</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}
      </section>
    </div>
  )
}

export default EventsManagement
