import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import useToast from '../hooks/useToast'
import useCampaigns from '../hooks/useCampaigns'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(numeric)
}

const formatDate = (date) => {
  if (!date) return 'Not specified'
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Not specified'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed)
}

const getCategoryColor = (category) => {
  const colors = {
    scholarship: 'bg-blue-100 text-blue-800',
    infrastructure: 'bg-green-100 text-green-800',
    equipment: 'bg-purple-100 text-purple-800',
    research: 'bg-orange-100 text-orange-800',
    community: 'bg-pink-100 text-pink-800',
    emergency: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || colors.other
}

const getCategoryLabel = (category) => {
  const labels = {
    scholarship: 'Scholarship',
    infrastructure: 'Infrastructure',
    equipment: 'Equipment',
    research: 'Research',
    community: 'Community',
    emergency: 'Emergency',
    other: 'Other',
  }
  return labels[category] || 'Other'
}

const AdminCampaignDetail = () => {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()

  const { data, loading, error } = useCampaigns(campaignId)

  const progress = useMemo(() => {
    if (!data || !data.goalAmount) return 0
    return Math.min(100, Math.round((Number(data.raisedAmount ?? 0) / Number(data.goalAmount)) * 100))
  }, [data])

  const heroImage = data?.coverImage || FALLBACK_IMAGE

  if (loading) {
    return (
      <article className="rounded-3xl bg-white p-8 text-center text-sm text-slate-400 shadow-soft">
        Loading campaign...
      </article>
    )
  }

  if (error || !data) {
    return (
      <article className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {error?.message ?? 'Campaign not found or unavailable.'}
        </div>
      </article>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <button
          onClick={() => navigate('/admin/campaigns')}
          className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary/30 hover:text-primary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Campaigns Management
        </button>

        <article className="mt-8 space-y-10">
          <section className="rounded-4xl border border-slate-200 bg-white shadow-soft overflow-hidden">
            {/* Hero Image */}
            <div className="relative h-64 sm:h-80">
              <img
                src={heroImage}
                alt={`${data.title} campaign banner`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em]">
                  <span className={`inline-flex rounded-full px-3 py-1 ${getCategoryColor(data.category)}`}>
                    {getCategoryLabel(data.category)}
                  </span>
                  <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1">
                    {data.status || 'Active'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 p-8 sm:p-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl lg:text-5xl">{data.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span>Created by {data.createdByName || 'Anonymous'}</span>
                  {data.deadline && <span>• Deadline: {formatDate(data.deadline)}</span>}
                  <span>• {data.contributionCount ?? 0} donors</span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="grid gap-6 rounded-2xl border border-slate-100 p-6 sm:grid-cols-3">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Goal</h3>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(data.goalAmount)}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Raised</h3>
                  <p className="mt-1 text-2xl font-bold text-emerald-600">{formatCurrency(data.raisedAmount)}</p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Progress</h3>
                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900">{progress}%</span>
                      <span className="text-sm text-slate-500">complete</span>
                    </div>
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          progress >= 75 ? 'bg-emerald-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900">Campaign Description</h2>
                <div className="prose prose-slate max-w-none text-sm text-slate-600 whitespace-pre-line">
                  {data.description || 'No description provided.'}
                </div>
              </div>

              {/* Additional details for admin view */}
              <div className="grid gap-6 rounded-2xl border border-slate-100 p-6 sm:grid-cols-2">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Campaign Details</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Campaign ID:</dt>
                      <dd className="font-medium text-slate-900">#{data.id || data._id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Category:</dt>
                      <dd className="font-medium text-slate-900">{getCategoryLabel(data.category)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Goal Amount:</dt>
                      <dd className="font-medium text-slate-900">{formatCurrency(data.goalAmount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Raised Amount:</dt>
                      <dd className="font-medium text-slate-900">{formatCurrency(data.raisedAmount)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Deadline:</dt>
                      <dd className="font-medium text-slate-900">{formatDate(data.deadline)}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Created By</h3>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Name:</dt>
                      <dd className="font-medium text-slate-900">{data.createdByName || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Role:</dt>
                      <dd className="font-medium text-slate-900">{data.createdByRole || '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Created At:</dt>
                      <dd className="font-medium text-slate-900">
                        {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Donors:</dt>
                      <dd className="font-medium text-slate-900">{data.contributionCount ?? 0}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Status:</dt>
                      <dd className="font-medium text-slate-900">{data.status || 'Active'}</dd>
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

export default AdminCampaignDetail
