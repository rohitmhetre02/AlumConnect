import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import useMyOpportunityReferrals from '../../hooks/useMyOpportunityReferrals'

const normalizeOpportunity = (rawSource, fallback = {}) => {
  if (!rawSource && !fallback) return null

  const source = rawSource && typeof rawSource === 'object' ? rawSource : {}
  const derivedId = typeof rawSource === 'string' ? rawSource : undefined

  const id = source.id ?? source._id ?? fallback.opportunityId ?? fallback.opportunity_id ?? derivedId ?? ''
  const title = source.title ?? fallback.opportunityTitle ?? fallback.title ?? 'Applied Opportunity'
  const company = source.company ?? fallback.opportunityCompany ?? fallback.company ?? 'Unknown Company'
  const typeSource = source.type ?? fallback.opportunityType ?? fallback.type
  const type = typeof typeSource === 'string' ? typeSource.toLowerCase() : 'opportunity'
  const locationSource = source.location ?? fallback.opportunityLocation ?? fallback.location
  const rawLocation = typeof locationSource === 'string' ? locationSource.trim() : ''
  const location = rawLocation || (source.isRemote || fallback.isRemote ? 'Remote' : '')

  if (!id) return null

  return {
    id,
    title,
    company,
    type,
    location,
    description: source.description ?? fallback.description ?? '',
    deadline: source.deadline ?? fallback.deadline ?? null,
    postedAt: source.postedAt ?? source.createdAt ?? fallback.submittedAt ?? fallback.createdAt ?? null,
  }
}

const statusToneClasses = {
  submitted: 'bg-sky-100 text-sky-700',
  reviewed: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  declined: 'bg-rose-100 text-rose-700',
}

const statusIcons = {
  submitted: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  reviewed: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  accepted: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  declined: (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

const statusMessages = {
  submitted: 'Application submitted - Waiting for review',
  reviewed: 'Under review - Your application is being considered',
  accepted: 'Application accepted - Congratulations! Check your email for next steps',
  declined: 'Application declined - Thank you for your interest',
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString(undefined, { dateStyle: 'medium' })
  } catch (error) {
    return '—'
  }
}

const MyApplications = () => {
  const {
    referrals,
    loading,
    error,
    refresh,
  } = useMyOpportunityReferrals()

  const applications = useMemo(() => {
    if (!Array.isArray(referrals)) return []

    return referrals
      .map((entry) => {
        const rawOpportunity =
          entry?.opportunity ??
          entry?.opportunityDetails ??
          entry?.opportunityData ??
          entry?.opportunityInfo ??
          entry?.applicationOpportunity ??
          entry?.opportunityId ??
          entry?.opportunity_id

        const opportunity = normalizeOpportunity(rawOpportunity, entry)
        if (!opportunity?.id) return null

        return {
          id: entry.id ?? `${opportunity.id}-${entry.status}`,
          status: (entry.status ?? 'pending').toLowerCase(),
          submittedAt: entry.submittedAt ?? entry.createdAt ?? null,
          updatedAt: entry.updatedAt ?? null,
          resumeUrl: entry.resumeUrl ?? null,
          proposal: entry.proposal ?? null,
          opportunity,
        }
      })
      .filter(Boolean)
  }, [referrals])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">My Activity</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Submitted Applications</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Track every role you have applied for through AlumConnect. Review statuses, revisit opportunity
                details, and jump back to the listing with a single click.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-500">Total Applied</p>
              <p className="text-2xl font-bold text-slate-900">{applications.length}</p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            Loading your applications...
          </div>
        )}

        {error && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600 shadow-sm">
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error.message ?? 'Unable to load your applications right now.'}</span>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="rounded-full border border-rose-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:bg-rose-100"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white/80 px-10 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-9 4h8" />
              </svg>
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-800">No applications yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Start exploring open opportunities and send in your profile. Your submitted applications will appear here.
            </p>
            <Link
              to="/dashboard/opportunities"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
            >
              Browse Opportunities
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="mt-8 space-y-4">
            {applications.map(({ id, opportunity, status, submittedAt, updatedAt }) => {
              const tone = statusToneClasses[status] ?? 'bg-slate-100 text-slate-600'

              return (
                <article
                  key={id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{opportunity.company}</p>
                      <h2 className="text-xl font-semibold text-slate-900">{opportunity.title}</h2>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                        <span>{opportunity.location || 'Location Flexible'}</span>
                        <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                        <span>{opportunity.type}</span>
                        {opportunity.deadline ? (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                            <span>Deadline {formatDate(opportunity.deadline)}</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>
                        {statusIcons[status] || statusIcons.submitted}
                        {status.replace(/_/g, ' ')}
                      </span>
                      <p className="text-xs text-slate-500 max-w-48 text-right">
                        {statusMessages[status] || statusMessages.submitted}
                      </p>
                      <div className="text-right text-[11px] text-slate-400">
                        <p>Applied {formatDate(submittedAt)}</p>
                        {updatedAt ? <p>Updated {formatDate(updatedAt)}</p> : null}
                      </div>
                      <Link
                        to={`/dashboard/opportunities/${opportunity.id}`}
                        className="inline-flex items-center gap-2 rounded-full border border-sky-200 px-3 py-1 text-xs font-semibold text-sky-600 transition hover:border-sky-300 hover:bg-sky-50"
                      >
                        View Opportunity
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyApplications
