import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import getStatusBadgeClass from '../utils/status'
import useApiList from '../hooks/useApiList'

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
  const { data: events, isLoading, error } = useApiList('/events')

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
        event.createdByName.toLowerCase().includes(query)

      const matchesStatus = filterStatus === 'all' || event.status === filterStatus
      const matchesType = filterType === 'all' || event.type === filterType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [normalizedEvents, searchTerm, filterStatus, filterType])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Events Management</h1>
        <p className="text-slate-600">Manage all events, conferences, and activities across the platform.</p>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => navigate('/admin/events/create')}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50"
          >
            Create Event
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Event</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Attendees</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Posted By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading events…
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    No events match the current filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div>
                        <button
                          onClick={() => navigate(`/admin/events/${event.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-primary transition-colors cursor-pointer text-left"
                        >
                          {event.title}
                        </button>
                        <div className="text-sm text-slate-500">ID: #{event.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm text-slate-900">{formatDate(event.startAt)}</div>
                        <div className="text-xs text-slate-500">{formatTime(event.startAt)}{event.endAt ? ` - ${formatTime(event.endAt)}` : ''}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{event.location}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{event.registrationCount}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-800">
                        {event.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{event.createdByName}</p>
                        {event.createdByRole && <p className="text-xs text-slate-500">{capitalize(event.createdByRole)}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-primary hover:text-primary">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:text-red-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>
    </div>
  )
}

export default EventsManagement
