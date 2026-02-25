import { useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import useMyOpportunityReferrals from '../../hooks/useMyOpportunityReferrals'
import useMentorRequests from '../../hooks/useMentorRequests'
import { useEvents } from '../../hooks/useEvents'

const MyActivity = () => {
  const { role: contextRole, user } = useAuth()

  const normalizedRole = useMemo(() => {
    const rawRole = contextRole ?? user?.role ?? user?.profile?.role
    return rawRole ? String(rawRole).trim().toLowerCase() : ''
  }, [contextRole, user?.role, user?.profile?.role])

  const isStudent = normalizedRole === 'student'

  const {
    referrals,
    loading: applicationsLoading,
    error: applicationsError,
    refresh: refreshApplications,
  } = useMyOpportunityReferrals()

  const applicationSummary = useMemo(() => {
    const counts = { total: 0, pending: 0, accepted: 0, rejected: 0 }
    if (!Array.isArray(referrals)) {
      return counts
    }

    referrals.forEach((entry) => {
      counts.total += 1
      const status = String(entry?.status ?? '').toLowerCase()
      if (status === 'accepted' || status === 'approved') {
        counts.accepted += 1
      } else if (status === 'rejected' || status === 'declined') {
        counts.rejected += 1
      } else {
        counts.pending += 1
      }
    })

    return counts
  }, [referrals])

  const {
    requests: mentorshipRequests,
    loading: mentorshipLoading,
    error: mentorshipError,
    refresh: refreshMentorship,
  } = useMentorRequests()

  const mentorshipSummary = useMemo(() => {
    const counts = { total: 0, pending: 0, awaiting: 0, confirmed: 0, rejected: 0 }
    if (!Array.isArray(mentorshipRequests)) {
      return counts
    }

    mentorshipRequests
      .filter((request) => request?.isSent !== false)
      .forEach((request) => {
        counts.total += 1
        const status = String(request?.status ?? '').toLowerCase()
        if (status === 'confirmed') {
          counts.confirmed += 1
        } else if (status === 'accepted') {
          counts.awaiting += 1
        } else if (status === 'rejected') {
          counts.rejected += 1
        } else {
          counts.pending += 1
        }
      })

    return counts
  }, [mentorshipRequests])

  const {
    items: events,
    loading: eventsLoading,
    error: eventsError,
    refresh: refreshEvents,
  } = useEvents()

  const eventsSummary = useMemo(() => {
    if (!Array.isArray(events)) {
      return { total: 0 }
    }

    return {
      total: events.filter((event) => event?.isRegistered).length,
    }
  }, [events])

  const summaryErrors = useMemo(
    () => [applicationsError, mentorshipError, eventsError].filter(Boolean),
    [applicationsError, mentorshipError, eventsError],
  )

  const handleRefreshAll = useCallback(() => {
    refreshApplications?.()
    refreshMentorship?.()
    refreshEvents?.()
  }, [refreshApplications, refreshMentorship, refreshEvents])

  const navItems = useMemo(
    () => [
      {
        key: 'dashboard',
        label: 'Dashboard',
        to: '/dashboard',
        accent: 'bg-slate-900 text-white border-slate-900',
        metric: 'Home',
        metricLabel: 'Start here',
        metricTone: 'text-white',
        helper: 'Glance at overall progress, announcements, and quick actions.',
        helperTone: 'text-slate-200',
        description: 'Return to your personalized dashboard overview to catch up on updates.',
      },
      {
        key: 'applications',
        label: 'Applications',
        to: '/dashboard/applications',
        accent: 'bg-sky-100 text-sky-700 border-sky-200',
        metric: applicationsLoading
          ? 'Loading…'
          : applicationsError
            ? 'Refresh'
            : String(applicationSummary.total),
        metricLabel: 'Applications tracked',
        metricTone: applicationsError ? 'text-rose-500' : 'text-slate-900',
        helper: applicationsError
          ? applicationsError?.message ?? 'Unable to load applications right now.'
          : `${applicationSummary.pending} pending • ${applicationSummary.accepted} accepted`,
        helperTone: applicationsError ? 'text-rose-500' : 'text-slate-500',
        description: 'Review every opportunity you have applied for and follow each status update.',
      },
      {
        key: 'mentorship',
        label: 'Mentorship Requests',
        to: '/dashboard/mentorship-requests',
        accent: 'bg-amber-100 text-amber-700 border-amber-200',
        metric: mentorshipLoading
          ? 'Loading…'
          : mentorshipError
            ? 'Refresh'
            : String(mentorshipSummary.total),
        metricLabel: 'Requests sent',
        metricTone: mentorshipError ? 'text-rose-500' : 'text-slate-900',
        helper: mentorshipError
          ? mentorshipError?.message ?? 'Unable to load mentorship requests right now.'
          : `${mentorshipSummary.awaiting} awaiting • ${mentorshipSummary.confirmed} confirmed`,
        helperTone: mentorshipError ? 'text-rose-500' : 'text-slate-500',
        description: 'Monitor mentorship support you have asked for and respond quickly when mentors reply.',
      },
      {
        key: 'events',
        label: 'Registered Events',
        to: '/dashboard/registered-events',
        accent: 'bg-violet-100 text-violet-700 border-violet-200',
        metric: eventsLoading
          ? 'Loading…'
          : eventsError
            ? 'Refresh'
            : String(eventsSummary.total),
        metricLabel: 'Active registrations',
        metricTone: eventsError ? 'text-rose-500' : 'text-slate-900',
        helper: eventsError
          ? eventsError?.message ?? 'Unable to load events right now.'
          : eventsSummary.total
            ? 'You have upcoming events on your calendar.'
            : 'No events registered yet.',
        helperTone: eventsError ? 'text-rose-500' : 'text-slate-500',
        description: 'See every event you have signed up for and prepare for the next session.',
      },
      {
        key: 'donations',
        label: 'My Donations',
        to: '/dashboard/donations',
        accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        metric: '—',
        metricLabel: 'Contributions tracked',
        metricTone: 'text-slate-900',
        helper: 'Review the campaigns you support and discover new causes.',
        helperTone: 'text-slate-500',
        description: 'Keep a record of the donation campaigns you follow and the contributions you make.',
      },
      {
        key: 'insights',
        label: 'Insights',
        to: '/dashboard/insights',
        accent: 'bg-slate-900 text-white border-slate-900',
        metric: 'Live',
        metricLabel: 'Dynamic reports',
        metricTone: 'text-slate-900',
        helper: 'Visualize trends across requests, sessions, and community activity.',
        helperTone: 'text-slate-500',
        description: 'Open the analytics workspace tailored to your role and recent activity.',
      },
    ],
    [
      applicationSummary,
      applicationsLoading,
      applicationsError,
      mentorshipSummary,
      mentorshipLoading,
      mentorshipError,
      eventsSummary,
      eventsLoading,
      eventsError,
    ],
  )

  const dashboardTreeItems = useMemo(
    () => navItems.filter((item) => ['dashboard', 'applications', 'mentorship', 'events', 'donations'].includes(item.key)),
    [navItems],
  )

  const insightsItem = useMemo(() => navItems.find((item) => item.key === 'insights'), [navItems])

  const heroTitle = isStudent ? 'Stay on top of your campus journey' : 'Manage your community engagement'
  const heroSubtitle = isStudent
    ? 'Track every application, mentorship exchange, event, and contribution from one activity hub.'
    : 'Jump straight to the tools you need to review requests, events, and impact across the community.'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">My Activity</p>
              <h1 className="text-3xl font-bold text-slate-900">{heroTitle}</h1>
              <p className="text-sm text-slate-500">{heroSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshAll}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 10.5a7.5 7.5 0 0112.692-4.123L20.25 3.75m0 0v4.5m0-4.5h-4.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 13.5a7.5 7.5 0 01-12.692 4.123L3.75 20.25m0 0v-4.5m0 4.5h4.5"
                />
              </svg>
              Refresh overview
            </button>
          </div>
        </header>

        {summaryErrors.length ? (
          <div className="mt-6 space-y-2 rounded-3xl border border-rose-200 bg-rose-50/70 px-6 py-4 text-sm text-rose-600 shadow-sm">
            <p className="font-semibold">Some sections could not be refreshed.</p>
            <ul className="list-disc space-y-1 pl-5">
              {summaryErrors.map((error, index) => (
                <li key={error?.message ?? `activity-error-${index}`}>
                  {error?.message ?? 'Unexpected error occurred.'}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {navItems.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className="group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="space-y-4">
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${item.accent}`}
                >
                  {item.label}
                </span>
                <p className="text-sm text-slate-500">{item.description}</p>
              </div>
              <div className="mt-6 space-y-3">
                {item.metric && item.metricLabel ? (
                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">{item.metricLabel}</p>
                    <p className={`mt-1 text-2xl font-semibold ${item.metricTone}`}>{item.metric}</p>
                  </div>
                ) : null}
                {item.helper ? <p className={`text-xs ${item.helperTone}`}>{item.helper}</p> : null}
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition group-hover:translate-x-1 group-hover:text-primary/80">
                  Open {item.label}
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Navigation map</h2>
          <p className="mt-1 text-sm text-slate-500">
            Follow this quick path when you want to jump between the dashboard areas that make up your activity.
          </p>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-6 py-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-500">Dashboard</p>
              <div className="mt-4 space-y-3 font-mono text-sm text-slate-700">
                {dashboardTreeItems.map((item, index) => {
                  const connector = index === dashboardTreeItems.length - 1 ? '└─' : '├─'
                  return (
                    <div key={item.key} className="space-y-1">
                      <div className="flex items-start gap-2">
                        <span>{connector}</span>
                        <Link
                          to={item.to}
                          className="text-slate-700 underline-offset-4 transition hover:text-primary hover:underline"
                        >
                          {item.label}
                        </Link>
                      </div>
                      <p className="pl-6 text-xs text-slate-500">{item.helper}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {insightsItem ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-900 px-6 py-6 text-white shadow-sm">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-300">Insights</p>
                <Link
                  to={insightsItem.to}
                  className="mt-4 block text-sm font-semibold text-white transition hover:text-primary/80"
                >
                  {insightsItem.label}
                </Link>
                <p className="mt-2 text-xs text-white/80">{insightsItem.helper}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary/80">
                  Open insights
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                  </svg>
                </span>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default MyActivity
