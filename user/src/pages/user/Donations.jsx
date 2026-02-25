import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import useDonations from '../../hooks/useDonations'

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

const formatDate = (value) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

const Donations = () => {
  const { role } = useAuth()
  const addToast = useToast()
  const navigate = useNavigate()
  const normalizedRole = role?.toLowerCase() ?? null
  const canCreateCampaign = normalizedRole === 'alumni' || normalizedRole === 'faculty'

  const { items, loading, error, refresh } = useDonations()

  const { activeCampaigns, completedCampaigns, supportedCampaigns } = useMemo(() => {
    const sorted = [...items].sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
    const now = Date.now()
    const active = []
    const completed = []
    const supported = []

    sorted.forEach((campaign) => {
      const deadline = campaign.deadline ? new Date(campaign.deadline).getTime() : null
      if (deadline === null || Number.isNaN(deadline) || deadline >= now) {
        active.push(campaign)
      } else {
        completed.push(campaign)
      }
    })

    sorted.forEach((campaign) => {
      if (Array.isArray(campaign.contributions) && campaign.contributions.length > 0) {
        supported.push(campaign)
      }
    })

    completed.sort((a, b) => new Date(b.deadline || 0) - new Date(a.deadline || 0))

    return {
      activeCampaigns: active,
      completedCampaigns: completed,
      supportedCampaigns: supported,
    }
  }, [items])

  const highlightCampaign = activeCampaigns[0] ?? completedCampaigns[0]

  const handleCreateCampaign = () => {
    navigate('/dashboard/donations/create')
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-soft">
        <h1 className="text-3xl font-semibold">Support Our Community</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/80">
          Your contributions help us provide scholarships, improve facilities, and foster innovation for future generations.
        </p>
        {highlightCampaign && (
          <Link
            to={`/dashboard/donations/${highlightCampaign.id}`}
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
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <DonationSkeleton key={index} />)
          ) : activeCampaigns.length > 0 ? (
            activeCampaigns.map((campaign) => <DonationCard key={campaign.id} campaign={campaign} variant="active" />)
          ) : (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <h3 className="text-lg font-semibold text-slate-900">No active campaigns</h3>
              <p className="mt-2 text-sm text-slate-500">
                When fundraising efforts launch, they will appear here. {canCreateCampaign ? 'Start the first campaign!' : ''}
              </p>
            </div>
          )}
        </div>
      </section>

      {supportedCampaigns.length > 0 && (
        <section className="pt-4">
          <h2 className="text-lg font-semibold text-slate-900">Campaigns You’ve Supported</h2>
          <p className="mt-2 text-sm text-slate-500">Revisit the causes you contributed to and track their progress.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {supportedCampaigns.map((campaign) => (
              <DonationCard key={`supported-${campaign.id}`} campaign={campaign} variant="supported" />
            ))}
          </div>
        </section>
      )}

      {completedCampaigns.length > 0 && (
        <section className="pt-4">
          <h2 className="text-lg font-semibold text-slate-900">Recently Concluded</h2>
          <p className="mt-2 text-sm text-slate-500">Take a look at the impact previous campaigns have made.</p>
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {completedCampaigns.map((campaign) => (
              <DonationCard key={`completed-${campaign.id}`} campaign={campaign} variant="completed" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

const DonationCard = ({ campaign, variant }) => {
  const image = campaign.coverImage || DEFAULT_IMAGE
  const progress = calculateProgress(campaign.raisedAmount, campaign.goalAmount)
  const remaining = daysRemaining(campaign.deadline)
  const endedOn = formatDate(campaign.deadline)
  const fullyFunded = Number(campaign.raisedAmount ?? 0) >= Number(campaign.goalAmount ?? Infinity)
  const showCompletedBadge = variant === 'completed' || (variant === 'active' && fullyFunded)
  const supportedLabel = variant === 'supported'

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
      <Link to={`/dashboard/donations/${campaign.id}`} className="relative block h-48 w-full overflow-hidden">
        <img src={image} alt={campaign.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" />
        {showCompletedBadge ? (
          <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            {variant === 'completed' ? `Ended ${endedOn ?? ''}`.trim() || 'Completed' : 'Fully funded'}
          </span>
        ) : supportedLabel ? (
          <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            You contributed
          </span>
        ) : typeof remaining === 'number' ? (
          <span className="absolute left-4 top-4 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            {remaining === 0 ? 'Ends today' : `${remaining} days left`}
          </span>
        ) : endedOn ? (
          <span className="absolute left-4 top-4 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
            {`Ends ${endedOn}`}
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{campaign.title}</h3>
          <p className="text-sm text-slate-500">
            {formatCurrency(campaign.raisedAmount)} raised of {formatCurrency(campaign.goalAmount)}
          </p>
        </div>
        <div className="h-2 rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progress}%` }}></div>
        </div>
        <Link
          to={`/dashboard/donations/${campaign.id}`}
          className="mt-auto inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
        >
          {variant === 'completed' ? 'View impact' : supportedLabel ? 'See updates' : 'Support'}
        </Link>
      </div>
    </article>
  )
}

const DonationSkeleton = () => (
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

export default Donations
