import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import useCampaigns from '../../hooks/useCampaigns'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric)
}

const calculateProgress = (raised, goal) => {
  if (!goal || goal <= 0) return 0
  return Math.min(100, Math.round((Number(raised ?? 0) / Number(goal)) * 100))
}

const Campaigns = () => {

  const { role } = useAuth()
  const navigate = useNavigate()

  const normalizedRole = role?.toLowerCase() ?? null

  const canCreateCampaign = useMemo(() => {
    return ['alumni', 'admin', 'coordinator'].includes(normalizedRole)
  }, [normalizedRole])

  const { items, loading, error, refresh } = useCampaigns()

  const campaigns = useMemo(() => {

    return [...items].sort((a, b) => {

      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1

      if (a.priority !== b.priority) return b.priority - a.priority

      if (a.deadline && b.deadline)
        return new Date(a.deadline) - new Date(b.deadline)

      return new Date(b.createdAt) - new Date(a.createdAt)

    })

  }, [items])

  const handleCreateCampaign = () => {
    navigate('/dashboard/campaigns/create')
  }

  return (
    <div className="space-y-10">

      {/* Header */}

      <header className="text-center py-6">

        <h1 className="text-3xl font-bold text-slate-900">
          Support Our Community Campaigns
        </h1>

        {canCreateCampaign && (
          <div className="mt-6">
            <button
              onClick={handleCreateCampaign}
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              + Create Campaign
            </button>
          </div>
        )}

      </header>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <p>{error.message ?? 'Unable to load campaigns right now.'}</p>
          <button
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Campaign Grid */}

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <CampaignSkeleton key={i} />
            ))
          : campaigns.length > 0
          ? campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))
          : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900">
                No campaigns yet
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Fundraising campaigns will appear here.
              </p>
            </div>
          )}

      </section>

    </div>
  )
}

const CampaignCard = ({ campaign }) => {

  const image = campaign.coverImage || DEFAULT_IMAGE

  const progress = calculateProgress(
    campaign.raisedAmount,
    campaign.goalAmount
  )

  return (

    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm hover:shadow-lg transition">

      <img
        src={image}
        alt={campaign.title}
        className="h-48 w-full object-cover"
      />

      <div className="flex flex-1 flex-col gap-4 p-6">

        <h3 className="text-lg font-semibold text-slate-900">
          {campaign.title}
        </h3>

        <p className="text-sm text-slate-500">
          {formatCurrency(campaign.raisedAmount)} raised of{' '}
          {formatCurrency(campaign.goalAmount)}
        </p>

        <div className="h-2 rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <Link
          to={`/dashboard/campaigns/${campaign.id}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          Donate Now
        </Link>

      </div>

    </article>

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