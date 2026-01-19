import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import useEvents from '../../hooks/useEvents'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

const formatDateBadge = (isoString) => {
  if (!isoString) return 'TBA'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'TBA'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

const formatSchedule = (startAt, endAt) => {
  if (!startAt) return 'Schedule to be announced'
  const start = new Date(startAt)
  if (Number.isNaN(start.getTime())) return 'Schedule to be announced'

  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

  const startDate = dateFormatter.format(start)
  const startTime = timeFormatter.format(start)

  if (!endAt) {
    return `${startDate} • ${startTime}`
  }

  const end = new Date(endAt)
  if (Number.isNaN(end.getTime())) {
    return `${startDate} • ${startTime}`
  }

  const endDate = dateFormatter.format(end)
  const endTime = timeFormatter.format(end)
  const sameDay = start.toDateString() === end.toDateString()

  // For cards, show only start time - no end time needed
  return `${startDate} • ${startTime}`
}

const truncate = (value, maxLength = 180) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trim()}...`
}

const Events = () => {
  const { role } = useAuth()
  const addToast = useToast()
  const normalizedRole = role?.toLowerCase() ?? null
  const canCreateEvent = normalizedRole === 'alumni' || normalizedRole === 'faculty'

  const { items, loading, error, refresh } = useEvents()

  const events = useMemo(() => {
    return [...items].sort((a, b) => {
      const aDate = new Date(a.startAt || 0).getTime()
      const bDate = new Date(b.startAt || 0).getTime()
      return aDate - bDate
    })
  }, [items])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Events</h1>
          <p className="text-sm text-slate-500">Discover upcoming alumni-led events and gatherings.</p>
        </div>
        {canCreateEvent && (
          <Link
            to="/dashboard/events/post"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            + Create Event
          </Link>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <p>{error.message ?? 'Unable to load events right now.'}</p>
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:text-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => <EventSkeleton key={index} />)
          : events.length > 0
          ? events.map((event) => <EventCard key={event.id} event={event} />)
          : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900">No events yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                Once alumni publish events, they will appear here. {canCreateEvent ? 'Be the first to host one!' : ''}
              </p>
            </div>
            )}
      </section>
    </div>
  )
}

const EventCard = ({ event }) => {
  const coverImage = event.coverImage && !event.coverImage.startsWith('blob:')
    ? event.coverImage
    : DEFAULT_IMAGE
  const schedule = formatSchedule(event.startAt, event.endAt)
  const modeLabel = capitalize(event.mode ?? 'in-person')

  return (
    <Link
      to={`/dashboard/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img src={coverImage} alt={`${event.title} banner`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-800">
          {modeLabel}
        </span>
        <span className="absolute right-4 top-4 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white">
          {formatDateBadge(event.startAt)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{event.location}</p>
        </div>
        <p className="text-sm text-slate-600">{truncate(event.description)}</p>
        <div className="mt-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4" />
              <path d="M8 2v4" />
              <path d="M3 10h18" />
            </svg>
            {schedule}
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
            View Details
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

const EventSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white">
    <div className="h-44 w-full animate-pulse bg-slate-200" />
    <div className="flex flex-1 flex-col gap-3 px-6 py-5">
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
      <div className="mt-auto h-8 w-full animate-pulse rounded-full bg-slate-200" />
    </div>
  </div>
)

export default Events
