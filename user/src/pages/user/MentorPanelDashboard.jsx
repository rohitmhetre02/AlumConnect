import { useMemo } from 'react'
import { useMentorDashboard } from '../../hooks/useMentorDashboard'

const KPI_CARDS = [
  { key: 'totalSessions', label: 'Total Sessions', accent: 'bg-primary/10 text-primary' },
  { key: 'upcomingSessions', label: 'Upcoming Sessions', accent: 'bg-sky-100 text-sky-600' },
  { key: 'completedSessions', label: 'Completed Sessions', accent: 'bg-emerald-100 text-emerald-600' },
  { key: 'totalMentees', label: 'Total Mentees', accent: 'bg-amber-100 text-amber-600' },
  { key: 'activeServices', label: 'Active Services', accent: 'bg-violet-100 text-violet-600' },
  { key: 'pendingRequests', label: 'Pending Requests', accent: 'bg-rose-100 text-rose-600' },
]

const capitalize = (value) => {
  if (!value) return '—'
  const normalized = value.toString().trim()
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '—'
}

const formatDateTime = (date) => {
  if (!date) return '—'
  try {
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch (_error) {
    return '—'
  }
}

const MentorPanelDashboard = () => {
  const { metrics, upcomingSessions, recentRequests, recentFeedback, loading, error, refresh } = useMentorDashboard()

  const metricCards = useMemo(() => {
    return KPI_CARDS.map((card) => ({
      ...card,
      value: metrics?.[card.key] ?? 0,
    }))
  }, [metrics])

  const renderSectionState = (isLoading, stateError, hasItems, emptyLabel) => {
    if (isLoading) {
      return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading…</div>
    }

    if (stateError) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">
          {stateError.message ?? 'Unable to load data.'}
        </div>
      )
    }

    if (!hasItems) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          {emptyLabel}
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Mentor Dashboard</h2>
          <p className="text-sm text-slate-500">Track the health of your mentorship activity and recent engagement.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
        >
          Refresh
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => (
          <article key={card.key} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{card.label}</p>
            <p className="text-3xl font-semibold text-slate-900">{card.value}</p>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${card.accent}`}>
              {card.label}
            </span>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upcoming Sessions</h3>
              <p className="text-xs text-slate-500">Stay prepared for your next mentorship touchpoints.</p>
            </div>
          </header>

          {renderSectionState(loading, error, upcomingSessions.length, 'No upcoming sessions scheduled.') || (
            <ul className="space-y-3">
              {upcomingSessions.map((session) => (
                <li key={session.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{session.menteeName}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {capitalize(session.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{session.serviceName || '—'}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span>{formatDateTime(session.sessionDate)}</span>
                    <span>Mode: {capitalize(session.mode)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Requests</h3>
              <p className="text-xs text-slate-500">Latest mentee requests awaiting your response.</p>
            </div>
          </header>

          {renderSectionState(loading, error, recentRequests.length, 'No recent requests to show.') || (
            <ul className="space-y-3">
              {recentRequests.map((request) => (
                <li key={request.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">{request.menteeName}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {capitalize(request.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{request.serviceName || '—'}</p>
                  <p className="mt-2 text-xs text-slate-500">Requested {formatDateTime(request.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Recent Feedback</h3>
            <p className="text-xs text-slate-500">Insights from mentees on your sessions.</p>
          </div>
        </header>

        {renderSectionState(loading, error, recentFeedback.length, 'No feedback received yet.') || (
          <ul className="space-y-3">
            {recentFeedback.map((feedback) => (
              <li key={feedback.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{feedback.menteeName || 'Mentee'}</span>
                  {feedback.rating ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-600">
                      {feedback.rating.toFixed(1)} ★
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">No rating</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{feedback.serviceName || '—'}</p>
                <p className="mt-2 text-sm text-slate-600">{feedback.comment ? `“${feedback.comment}”` : 'No written feedback.'}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {feedback.submittedAt ? `Submitted ${formatDateTime(feedback.submittedAt)}` : 'Submission date unknown'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default MentorPanelDashboard
