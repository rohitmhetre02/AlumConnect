import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import useCampaigns from '../../hooks/useCampaigns'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric)
}

const calculateProgress = (raised, goal) => {
  if (!goal || goal <= 0) return 0
  return Math.min(100, Math.round((Number(raised ?? 0) / Number(goal)) * 100))
}

const daysRemaining = (deadline) => {
  if (!deadline) return null
  const end = new Date(deadline)
  if (Number.isNaN(end.getTime())) return null
  const now = new Date()
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
  return diff < 0 ? 0 : diff
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

const Campaigns = () => {
  const { role } = useAuth()
  const addToast = useToast()
  const navigate = useNavigate()
  const normalizedRole = role?.toLowerCase() ?? null
  const canCreateCampaign = normalizedRole === 'alumni' || normalizedRole === 'faculty'

  const { items, loading, error, refresh } = useCampaigns()

  const campaigns = useMemo(() => {
    return [...items].sort((a, b) => {
      // Featured campaigns first
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      // Then by priority
      if (a.priority !== b.priority) return b.priority - a.priority
      // Then by deadline (soonest first)
      if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline)
      // Finally by creation date
      return new Date(b.createdAt) - new Date(a.createdAt)
    })
  }, [items])

  const handleCreateCampaign = () => {
    navigate('/dashboard/campaigns/create')
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-soft">
        <h1 className="text-3xl font-semibold">Support Our Community Campaigns</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Join us in making a difference through various fundraising initiatives for scholarships, infrastructure, equipment, research, and community service.
        </p>
        {campaigns.length > 0 && (
          <Link
            to={`/dashboard/campaigns/${campaigns[0].id}`}
            className="mt-6 inline-flex rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Donate Now
          </Link>
        )}
      </div>

      {canCreateCampaign && (
        <button
          type="button"
          onClick={handleCreateCampaign}
          className="rounded-full border border-primary/20 bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
        >
          + Create Campaign
        </button>
      )}

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <p>{error.message ?? 'Unable to load campaigns right now.'}</p>
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:text-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Active Campaigns</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, index) => <CampaignSkeleton key={index} />)
            : campaigns.length > 0
            ? campaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)
            : (
              <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <h3 className="text-lg font-semibold text-slate-900">No campaigns yet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  When alumni and faculty launch fundraising campaigns, they will appear here. {canCreateCampaign ? 'Start the first campaign!' : ''}
                </p>
              </div>
              )}
        </div>
      </section>
    </div>
  )
}

const CampaignCard = ({ campaign }) => {
  const image = campaign.coverImage || DEFAULT_IMAGE
  const progress = calculateProgress(campaign.raisedAmount, campaign.goalAmount)
  const remaining = daysRemaining(campaign.deadline)

  return (
    <Link to={`/dashboard/campaigns/${campaign.id}`} className="relative block h-full w-full overflow-hidden">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
        <img src={image} alt={campaign.title} className="h-48 w-full object-cover transition duration-500 hover:scale-105" />
        {campaign.featured && (
          <span className="absolute left-4 top-4 rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-yellow-900">
            Featured
          </span>
        )}
        <div className="flex-1 flex flex-col p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{campaign.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{campaign.company}</p>
            </div>
            <p className="text-sm text-slate-600 line-clamp-3">{campaign.description}</p>
            <div className="mt-auto flex items-center justify-between text-sm text-slate-500">
              <span>{formatCurrency(campaign.goalAmount)}</span>
              <span>{campaign.type}</span>
            </div>
            <div className="space-y-2 text-sm text-slate-500">
              <p>{formatCurrency(campaign.raisedAmount)} raised of {formatCurrency(campaign.goalAmount)}</p>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{campaign.donorCount || 0} donors</span>
                <span>{progress}% funded</span>
              </div>
            </div>
          </div>
          <div className="mt-auto">
            <Link
              to={`/dashboard/campaigns/${campaign.id}`}
              className="mt-auto inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Donate Now
            </Link>
          </div>
        </div>
      </article>
    </Link>
  )
}

const CampaignSkeleton = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-white">
    <div className="h-48 w-full animate-pulse bg-slate-200" />
    <div className="flex flex-1 flex-col gap-3 p-6">
      <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-200" />
      <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
      <div className="mt-auto h-9 w-full animate-pulse rounded-full bg-slate-200" />
    </div>
  </div>
)

export default Campaigns
