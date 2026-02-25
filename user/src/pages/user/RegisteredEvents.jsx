import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import useRegisteredEvents from '../../hooks/useRegisteredEvents'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80'

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

  return `${startDate} • ${startTime}`
}

const RegisteredEvents = () => {
  const {
    items: registrations,
    loading,
    error,
    refresh,
  } = useRegisteredEvents()

  const registeredEvents = useMemo(() => {
    return [...registrations].sort((a, b) => {
      const aTime = new Date(a.event?.startAt || 0).getTime()
      const bTime = new Date(b.event?.startAt || 0).getTime()
      return aTime - bTime
    })
  }, [registrations])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Registered Events</h1>
          <p className="text-sm text-slate-500">
            These are the events you’ve signed up for. Stay prepared and join on time.
          </p>
        </div>
        <Link
          to="/dashboard/events"
          className="rounded-full border border-primary/20 bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
        >
          Browse all events
        </Link>
      </div>

      {error ? (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <p>{error.message ?? 'Unable to load your registered events right now.'}</p>
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:text-rose-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => <EventSkeleton key={index} />)
        ) : registeredEvents.length > 0 ? (
          registeredEvents.map((registration) => (
            <RegisteredEventCard key={registration.id} registration={registration} />
          ))
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <h3 className="text-lg font-semibold text-slate-900">No registered events yet</h3>
            <p className="mt-2 text-sm text-slate-500">
              When you register for an event it will appear here. Explore upcoming opportunities to stay involved.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

const RegisteredEventCard = ({ registration }) => {
  const event = registration.event || {}
  const coverImage = event.coverImage && !event.coverImage.startsWith('blob:') ? event.coverImage : DEFAULT_IMAGE
  const schedule = formatSchedule(event.startAt, event.endAt)

  return (
    <Link
      to={`/dashboard/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <img src={coverImage} alt={`${event.title} banner`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute right-4 top-4 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white">
          {formatDateBadge(event.startAt)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
          <p className="text-sm text-slate-500">{event.location || 'Location to be announced'}</p>
        </div>
        <p className="text-sm text-slate-600">{event.description}</p>
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
          {registration.registeredAt ? (
            <div className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
              Registered {formatDateBadge(registration.registeredAt)}
            </div>
          ) : null}
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition group-hover:translate-x-1 group-hover:text-primary/80">
            View details
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

export default RegisteredEvents
