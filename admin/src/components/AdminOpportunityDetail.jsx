import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import useToast from '../hooks/useToast'
import { useOpportunity } from '../hooks/useOpportunities'

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

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

const AdminOpportunityDetail = () => {
  const { opportunityId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()

  const { data, loading, error } = useOpportunity(opportunityId)
  
  const normalizedType = data?.type
    ? data.type === 'full-time' ? 'Full-time' :
      data.type === 'part-time' ? 'Part-time' : 'Internship'
    : 'Opportunity'
    
  const descriptionParagraphs = (data?.description ?? '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

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
          onClick={() => navigate('/admin/opportunities')}
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary/30 hover:text-primary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Opportunities Management
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

              <div className="grid gap-6 rounded-2xl border border-slate-100 p-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Deadline</h3>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {formatDate(data.deadline)}
                  </p>
                  {data.deadline && (
                    <p className="text-xs text-slate-500">
                      {getDaysLeft(data.deadline) !== null && (
                        <>
                          {getDaysLeft(data.deadline) > 0 
                            ? `${getDaysLeft(data.deadline)} days left`
                            : 'Deadline passed'
                          }
                        </>
                      )}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Applicants</h3>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.applicants ?? data.applicationCount ?? 0}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Contact</h3>
                  <p className="mt-1 text-sm font-medium text-slate-900 truncate">
                    {data.contactEmail || 'Not provided'}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Status</h3>
                  <span className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    data.deadline && new Date(data.deadline) < new Date()
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {data.deadline && new Date(data.deadline) < new Date() ? 'Closed' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Description</h2>
                <div className="prose prose-slate max-w-none text-sm text-slate-600">
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </div>

              {data.skills && data.skills.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Skills Required</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional details for admin view */}
              <div className="grid gap-6 rounded-2xl border border-slate-100 p-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Opportunity Details</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Opportunity ID:</dt>
                      <dd className="font-medium text-slate-900">#{data.id || data._id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Company:</dt>
                      <dd className="font-medium text-slate-900">{data.company || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Type:</dt>
                      <dd className="font-medium text-slate-900">{normalizedType}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Location:</dt>
                      <dd className="font-medium text-slate-900">{data.location || (data.isRemote ? 'Remote' : '—')}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Posted By</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Name:</dt>
                      <dd className="font-medium text-slate-900">{data.createdByName || data.postedBy || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Role:</dt>
                      <dd className="font-medium text-slate-900">{capitalize(data.createdByRole) || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Posted At:</dt>
                      <dd className="font-medium text-slate-900">
                        {data.postedAt ? new Date(data.postedAt).toLocaleDateString() : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </section>
        </article>
      </div>
    </div>
  )
}

export default AdminOpportunityDetail
