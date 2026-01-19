import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import useInsightsDetail from '../../hooks/useInsightsDetail'
import Pagination from '../../components/ui/Pagination'
import { SkeletonCard } from '../../components/ui/Skeleton'

const formatDateTime = (value, options = {}) => {
  if (!value) return '—'
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
      ...options,
    })
  } catch (_error) {
    return '—'
  }
}

const formatDate = (value) => formatDateTime(value, { timeStyle: undefined })

const formatCount = (value) => {
  const number = Number(value ?? 0)
  if (Number.isNaN(number)) return '0'
  return number.toLocaleString()
}

const formatCurrency = (value) => {
  const number = Number(value ?? 0)
  if (Number.isNaN(number) || number === 0) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(number)
}

const badgeClasses = (tone = 'slate') => {
  const mapping = {
    slate: 'bg-slate-100 text-slate-600',
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    sky: 'bg-sky-100 text-sky-600',
    rose: 'bg-rose-100 text-rose-600',
    violet: 'bg-violet-100 text-violet-600',
  }
  return mapping[tone] ?? mapping.slate
}

const SessionCard = ({ item }) => {
  const statusTone = item.status === 'completed' ? 'emerald' : item.status === 'cancelled' ? 'rose' : 'sky'
  const counterpartLabel = item.counterpart?.name || item.counterpart?.email || 'Mentor'
  const counterpartEmail = item.counterpart?.email && item.counterpart?.email !== counterpartLabel ? item.counterpart.email : ''
  const feedback = item.feedback || null

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{item.serviceName ?? 'Session'}</h3>
          <p className="text-sm text-slate-500">{formatDateTime(item.sessionDate)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(statusTone)}`}>
            {item.status ? item.status.replace(/_/g, ' ') : 'Scheduled'}
          </span>
          {item.mode ? (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses('primary')}`}>
              {item.mode}
            </span>
          ) : null}
        </div>
      </header>

      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Counterpart</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {counterpartLabel}
            {counterpartEmail ? <span className="ml-2 text-xs font-medium text-slate-500">{counterpartEmail}</span> : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Duration</dt>
          <dd className="mt-1 font-semibold text-slate-900">{item.durationMinutes ? `${item.durationMinutes} minutes` : 'Not recorded'}</dd>
        </div>
      </dl>

      {feedback ? (
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span>Feedback</span>
            {feedback.rating ? (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClasses('amber')}`}>
                Rating {feedback.rating}
              </span>
            ) : null}
          </div>
          {feedback.comment ? <p className="mt-2 text-sm text-slate-600">“{feedback.comment}”</p> : null}
          <p className="mt-2 text-xs text-slate-400">Received {formatDateTime(feedback.submittedAt)}</p>
        </div>
      ) : null}
    </article>
  )
}

const RequestCard = ({ item }) => {
  const statusTone = item.status === 'accepted' ? 'emerald' : item.status === 'rejected' ? 'rose' : 'sky'
  const counterpartName = item.menteeName || item.mentor?.name || item.mentor?.id || 'Request'
  const counterpartEmail = item.menteeEmail || item.mentor?.email || ''

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{item.serviceName ?? 'Mentorship request'}</h3>
          <p className="text-sm text-slate-500">Submitted {formatDateTime(item.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(statusTone)}`}>
          {item.status ? item.status.replace(/_/g, ' ') : 'Pending'}
        </span>
      </header>

      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Counterpart</dt>
          <dd className="mt-1 font-semibold text-slate-900">
            {counterpartName}
            {counterpartEmail ? <span className="ml-2 text-xs font-medium text-slate-500">{counterpartEmail}</span> : null}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Preferred session</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatDateTime(item.preferredDateTime)}</dd>
          <p className="text-xs text-slate-500">Mode: {item.preferredMode ?? 'Not specified'}</p>
        </div>
      </dl>

      {item.notes ? (
        <p className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-sm text-slate-600">{item.notes}</p>
      ) : null}
    </article>
  )
}

const EventCard = ({ item }) => {
  const statusTone = item.status === 'completed' ? 'slate' : item.status === 'upcoming' ? 'primary' : 'sky'

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{item.title ?? 'Event'}</h3>
          <p className="text-sm text-slate-500">{item.location ?? 'Location to be announced'}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(statusTone)}`}>
          {item.status ? item.status.replace(/_/g, ' ') : 'Registered'}
        </span>
      </header>

      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Starts</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatDateTime(item.startAt)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Registered</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatDateTime(item.registeredAt)}</dd>
        </div>
      </dl>

      {item.organization ? (
        <p className="text-sm text-slate-500">Organised by {item.organization}</p>
      ) : null}
      {typeof item.registrations === 'number' ? (
        <p className="text-sm text-slate-500">Registrations captured: {formatCount(item.registrations)}</p>
      ) : null}
    </article>
  )
}

const FeedbackCard = ({ item }) => {
  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{item.serviceName ?? 'Mentorship feedback'}</h3>
          <p className="text-sm text-slate-500">From {item.menteeName ?? 'Mentee'}</p>
        </div>
        {item.rating ? (
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses('amber')}`}>
            Rating {item.rating}
          </span>
        ) : null}
      </header>

      {item.comment ? <p className="text-sm text-slate-600">“{item.comment}”</p> : null}
      <p className="text-xs text-slate-400">Submitted {formatDateTime(item.submittedAt)}</p>
    </article>
  )
}

const ServiceCard = ({ item }) => {
  const statusTone = item.status === 'active' ? 'emerald' : item.status === 'archived' ? 'slate' : 'sky'

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{item.title ?? 'Mentor service'}</h3>
          <p className="text-sm text-slate-500">Created {formatDateTime(item.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(statusTone)}`}>
          {item.status ? item.status.replace(/_/g, ' ') : 'Draft'}
        </span>
      </header>

      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Mode</dt>
          <dd className="mt-1 font-semibold text-slate-900">{item.mode ?? 'Flexible'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Bookings</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatCount(item.bookings)}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Price</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatCurrency(item.price)}</dd>
        </div>
      </dl>
    </article>
  )
}

const OpportunityCard = ({ item }) => {
  const statusTone = item.status === 'active' ? 'emerald' : item.status === 'closed' ? 'rose' : 'slate'

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{item.title ?? 'Opportunity'}</h3>
          <p className="text-sm text-slate-500">{item.company ?? 'Organization'}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses(statusTone)}`}>
          {item.status ? item.status.replace(/_/g, ' ') : 'Active'}
        </span>
      </header>

      <dl className="grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Type</dt>
          <dd className="mt-1 font-semibold text-slate-900">{item.type ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Location</dt>
          <dd className="mt-1 font-semibold text-slate-900">{item.location ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-widest text-slate-400">Deadline</dt>
          <dd className="mt-1 font-semibold text-slate-900">{formatDate(item.deadline)}</dd>
        </div>
      </dl>
    </article>
  )
}

const DETAIL_CONFIG = {
  sessions: {
    title: 'Session history',
    subtitle: 'Review every mentorship session, status, and feedback in one place.',
    empty: 'No sessions recorded yet. Once you start scheduling mentorship sessions, they will appear here.',
    render: SessionCard,
  },
  requests: {
    title: 'Mentorship requests',
    subtitle: 'Track mentorship requests, their outcomes, and upcoming schedule preferences.',
    empty: 'No mentorship requests yet. Requests you send or receive will be listed here.',
    render: RequestCard,
  },
  events: {
    title: 'Event participation',
    subtitle: 'Keep tabs on events you have created, registered for, or managed.',
    empty: 'No event activity yet. When you register for events or host them, they will show up here.',
    render: EventCard,
  },
  feedback: {
    title: 'Session feedback',
    subtitle: 'Read through mentee reflections and ratings for your mentorship sessions.',
    empty: 'No feedback captured yet. Once sessions receive feedback, it will surface here.',
    render: FeedbackCard,
  },
  services: {
    title: 'Mentor services',
    subtitle: 'Manage every mentorship service you offer and monitor bookings at a glance.',
    empty: 'No services listed yet. Create a mentorship service to see it here.',
    render: ServiceCard,
  },
  opportunities: {
    title: 'Opportunities shared',
    subtitle: 'Track internships and job opportunities you have published for the community.',
    empty: 'No opportunities posted yet. When you publish a new listing, it will appear here.',
    render: OpportunityCard,
  },
}

const InsightsDetail = () => {
  const { type: typeParam } = useParams()
  const navigate = useNavigate()

  const normalizedType = useMemo(() => (typeParam ? String(typeParam).toLowerCase() : ''), [typeParam])
  const config = DETAIL_CONFIG[normalizedType]

  const { items, total, loading, error, page, pageSize, totalPages, setPage, refresh } = useInsightsDetail(
    config ? normalizedType : null,
    { page: 1, pageSize: 10 },
  )

  const RenderCard = config?.render ?? null

  const handleBack = () => navigate('/dashboard/insights')

  const showingRangeStart = (page - 1) * pageSize + (items.length ? 1 : 0)
  const showingRangeEnd = (page - 1) * pageSize + items.length

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
          >
            ← Back to insights
          </button>
          <div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">Insights detail</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{config?.title ?? 'Insights'}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{config?.subtitle ?? 'Explore detailed insight records.'}</p>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 text-right shadow-sm">
          <p className="text-xs uppercase tracking-widest text-slate-400">Total records</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{formatCount(total)}</p>
        </div>
      </header>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonCard key={`detail-skeleton-${index}`} className="h-40" />
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="space-y-4 rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-rose-600">
          <div>
            <h2 className="text-lg font-semibold">We couldn’t load this insight</h2>
            <p className="text-sm">{error.message ?? 'Please try again later.'}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700"
          >
            Retry loading
          </button>
        </div>
      ) : null}

      {!loading && !error && config && items.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-8 text-center text-slate-500">
          <h2 className="text-xl font-semibold text-slate-700">{config.empty}</h2>
        </div>
      ) : null}

      {!loading && !error && RenderCard ? (
        <section className="grid gap-4">
          {items.map((item) => (
            <RenderCard key={item.id || item._id} item={item} />
          ))}
        </section>
      ) : null}

      {!loading && !error && totalPages > 1 ? (
        <footer className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">
            Showing {formatCount(showingRangeStart)}-{formatCount(showingRangeEnd)} of {formatCount(total)}
          </p>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </footer>
      ) : null}
    </div>
  )
}

export default InsightsDetail
