import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import OpportunityReferralBadge from '../../components/user/opportunities/OpportunityReferralBadge'
import OpportunityReferralModal from '../../components/user/opportunities/OpportunityReferralModal'
import useOpportunityReferral from '../../hooks/useOpportunityReferral'
import { useOpportunity } from '../../hooks/useOpportunities'
import { useAuth } from '../../context/AuthContext'

const getDaysLeft = (deadline) => {
  if (!deadline) return null
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getPostedTime = (postedDate) => {
  if (!postedDate) return null
  const now = new Date()
  const posted = new Date(postedDate)
  const diffTime = now - posted
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const formatDate = (isoString) => {
  if (!isoString) return 'Not specified'
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return 'Not specified'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

const formatDateTime = (isoString) => {
  if (!isoString) return null
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

const OpportunityDetail = () => {
  const { opportunityId } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()
  const { data, loading, error } = useOpportunity(opportunityId)
  const [isReferralModalOpen, setReferralModalOpen] = useState(false)
  const isStudent = String(role ?? '').trim().toLowerCase() === 'student'
  const {
    referral,
    loading: referralLoading,
    setReferral,
  } = useOpportunityReferral(opportunityId, { autoFetch: Boolean(opportunityId) })

  const normalizedType = data?.type
    ? data.type === 'full-time' ? 'Full-time' :
      data.type === 'part-time' ? 'Part-time' : 'Internship'
    : 'Opportunity'
    
  const descriptionParagraphs = (data?.description ?? '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const handleOpenReferralModal = () => setReferralModalOpen(true)
  const handleCloseReferralModal = () => {
    if (!referralLoading) {
      setReferralModalOpen(false)
    }
  }

  const handleReferralSubmitted = (result) => {
    if (result) {
      setReferral(result)
    }
  }

  if (loading) {
    return (
      <article className="rounded-3xl bg-white p-8 text-center text-sm text-slate-400 shadow-soft">
        Loading opportunity...
      </article>
    )
  }

  if (error || !data) {
    return (
      <article className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {error?.message ?? 'Opportunity not found or unavailable.'}
        </div>
      </article>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <button
          onClick={() => navigate('/dashboard/opportunities')}
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary/30 hover:text-primary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Opportunities
        </button>

        <article className="mt-8 space-y-10">
          <section className="rounded-4xl border border-slate-200 bg-white shadow-soft">
            <div className="flex flex-col gap-8 p-8 sm:p-12">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
                  {normalizedType}
                </span>
                {data.isRemote && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-500">Remote Friendly</span>}
                {data.location && <span className="text-slate-500">{data.location}</span>}
              </div>
              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">{data.title}</h1>
                <p className="text-sm text-slate-500">
                  {data.company ? `${data.company}${data.location ? ' • ' : ''}` : ''}
                  {data.location ?? ''}
                  {data.postedAt && (
                    <span className="ml-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                      Posted {getPostedTime(data.postedAt)}
                    </span>
                  )}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <SummaryTile label="Company" value={data.company ?? 'Not specified'} />
                <SummaryTile label="Role type" value={normalizedType} />
                <SummaryTile label="Location" value={data.location ?? 'Flexible'} supporting={data.isRemote ? 'Remote friendly' : undefined} />
                <SummaryTile
                  label="Deadline"
                  value={formatDate(data.deadline)}
                  supporting={data.deadline ? `Submit in ${Math.max(getDaysLeft(data.deadline), 0)} days` : undefined}
                  highlight={data.deadline && getDaysLeft(data.deadline) <= 7}
                />
                <SummaryTile
                  label="Posted"
                  value={formatDate(data.postedAt)}
                  supporting={data.postedAt ? getPostedTime(data.postedAt) : undefined}
                />
              </div>
            </div>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-8">
              <section className="rounded-4xl bg-white p-8 shadow-soft">
                <h2 className="text-lg font-semibold text-slate-900">Role Overview</h2>
                <div className="mt-4 space-y-4 text-base leading-relaxed text-slate-600">
                  {descriptionParagraphs.length ? (
                    descriptionParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))
                  ) : (
                    <p className="text-slate-500">No job description provided for this opportunity.</p>
                  )}
                </div>
              </section>

              {(data.skills ?? []).length > 0 && (
                <section className="rounded-4xl bg-white p-8 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">Key Skills &amp; Tools</h2>
                  <p className="mt-2 text-sm text-slate-500">Highlight these strengths in your application.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {data.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"
                      >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 7a4 4 0 00-8 0v4" />
                          <path d="M4 9v6" />
                          <path d="M4 19h7" />
                          <path d="M13 17h7" />
                        </svg>
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section className="rounded-4xl bg-white p-8 shadow-soft">
                <h2 className="text-lg font-semibold text-slate-900">Application Timeline</h2>
                <div className="mt-6 space-y-5">
                  <TimelineRow
                    iconBg="bg-emerald-100"
                    iconColor="text-emerald-600"
                    title="Application deadline"
                    value={formatDate(data.deadline)}
                    supporting={data.deadline ? `${Math.max(getDaysLeft(data.deadline), 0)} days left` : 'Submit as soon as possible'}
                  />
                  <TimelineRow
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    title="Opportunity posted"
                    value={formatDate(data.postedAt)}
                    supporting={data.postedAt ? `Posted ${getPostedTime(data.postedAt)}` : 'Live now'}
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-4xl bg-white p-8 shadow-soft">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-slate-900">Take action</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Open
                    </span>
                    {(isStudent || role) && referral ? <OpportunityReferralBadge referral={referral} /> : null}
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-500">Reach out directly or request a referral from your network.</p>
                {(isStudent || role) && referral?.submittedAt ? (
                  <p className="text-xs text-slate-500">
                    Submitted {formatDateTime(referral.submittedAt)}
                    {referral.updatedAt && referral.updatedAt !== referral.submittedAt
                      ? ` • Updated ${formatDateTime(referral.updatedAt)}`
                      : ''}
                  </p>
                ) : null}
                <div className="mt-6 space-y-3">
                  {(isStudent || role) && (
                    <button
                      type="button"
                      onClick={handleOpenReferralModal}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        <path d="M10.314 10.314a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1" />
                      </svg>
                      {referral ? 'Update referral request' : 'Request referral'}
                    </button>
                  )}
                </div>
              </section>

              {data.postedBy && (
                <section className="rounded-4xl bg-white p-8 shadow-soft">
                  <h2 className="text-base font-semibold text-slate-900">Shared by</h2>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        <path d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{data.postedBy}</p>
                      <p className="text-xs uppercase tracking-[0.35em] text-slate-400">{data.createdByRole ? data.createdByRole : 'Community Member'}</p>
                    </div>
                  </div>
                  {data.contactEmail && (
                    <p className="mt-4 text-sm text-slate-500">
                      Connect with {data.postedBy.split(' ')[0] ?? 'the poster'} for additional context or referral support.
                    </p>
                  )}
                </section>
              )}
            </aside>
          </section>
        </article>
      </div>
      <OpportunityReferralModal
        isOpen={isReferralModalOpen}
        onClose={handleCloseReferralModal}
        opportunity={data}
        initialReferral={referral}
        onSubmitted={handleReferralSubmitted}
      />
    </div>
  )
}

const SummaryTile = ({ label, value, highlight = false }) => (
  <div
    className={`rounded-3xl border px-5 py-6 text-sm transition ${
      highlight
        ? 'border-rose-200 bg-rose-50 text-rose-600'
        : 'border-slate-100 bg-slate-50 text-slate-700'
    }`}
  >
    <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
      {label}
    </p>
    <p className="mt-3 text-base font-semibold text-slate-900">
      {value || '—'}
    </p>
  </div>
)

const TimelineRow = ({ iconBg, iconColor, title, value, supporting }) => (
  <div className="flex items-start gap-4">
    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
      <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7V3" />
        <path d="M16 7V3" />
        <path d="M3 11h18" />
        <path d="M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
    <div className="space-y-1">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{value}</p>
      {supporting && <p className="text-xs text-slate-400">{supporting}</p>}
    </div>
  </div>
)

export default OpportunityDetail
