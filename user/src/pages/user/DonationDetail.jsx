import { useMemo } from 'react'
import { useParams } from 'react-router-dom'

import ProgressBar from '../../components/user/donations/ProgressBar'
import ContributionModal from '../../components/user/donations/ContributionModal'
import useModal from '../../hooks/useModal'
import useToast from '../../hooks/useToast'
import { useDonation } from '../../hooks/useDonations'
import { useAuth } from '../../context/AuthContext'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric)
}

const DonationDetail = () => {
  const { campaignId } = useParams()
  const addToast = useToast()
  const { user } = useAuth()
  const contributionModal = useModal(false)

  const { data, loading, error, contribute } = useDonation(campaignId)

  const progress = useMemo(() => {
    if (!data || !data.goalAmount) return 0
    return Math.min(100, Math.round((Number(data.raisedAmount ?? 0) / Number(data.goalAmount)) * 100))
  }, [data])

  const heroImage = data?.coverImage || FALLBACK_IMAGE

  const handleDonateClick = () => {
    if (!user) {
      addToast?.({
        title: 'Sign in required',
        description: 'Please log in to contribute to this campaign.',
        tone: 'info',
      })
      return
    }

    contributionModal.openModal()
  }

  const handleContribution = async ({ amount, message }) => {
    try {
      const updated = await contribute({ amount, message })
      addToast?.({
        title: 'Thank you for contributing!',
        description: `Your donation of ₹${amount.toLocaleString('en-IN')} has been recorded.`,
        tone: 'success',
      })
      return updated
    } catch (contributionError) {
      addToast?.({
        title: 'Unable to process contribution',
        description: contributionError?.message ?? 'Please try again later.',
        tone: 'error',
      })
      throw contributionError
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-10 text-center text-sm text-slate-400 shadow-soft">
        Loading campaign…
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {error?.message ?? 'Campaign not found.'}
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[60%_1fr]">
        <img src={heroImage} alt={`${data.title} banner`} className="h-80 w-full rounded-3xl object-cover" />
        <div className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm font-semibold text-slate-500">Raised</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(data.raisedAmount)}</p>
            <p className="text-sm text-slate-500">Goal {formatCurrency(data.goalAmount)}</p>
            <div className="mt-4">
              <ProgressBar value={progress} />
              <p className="mt-2 text-xs text-slate-500">{progress}% funded</p>
            </div>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleDonateClick}
              className="w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Donate Now
            </button>
            <button className="w-full rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300">
              Share Campaign
            </button>
            <p className="text-center text-xs text-slate-500">Hosted by {data.createdByName || 'AlumConnect Alumni'}</p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{data.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 whitespace-pre-line">{data.description}</p>
      </section>

      {data.contributions && data.contributions.length > 0 && (
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent Contributions</h2>
          <ul className="mt-6 space-y-4">
            {data.contributions.slice(-6).reverse().map((entry) => (
              <li key={entry.id ?? `${entry.contributorId}-${entry.contributedAt}`}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {entry.contributorName || 'Generous Supporter'}
                    {entry.contributorRole ? (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {entry.contributorRole}
                      </span>
                    ) : null}
                  </p>
                  {entry.message ? <p className="mt-1 text-sm text-slate-600">“{entry.message}”</p> : null}
                  <p className="mt-1 text-xs text-slate-400">
                    {entry.contributedAt ? new Date(entry.contributedAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{formatCurrency(entry.amount)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContributionModal
        isOpen={contributionModal.isOpen}
        onClose={contributionModal.closeModal}
        onSubmit={handleContribution}
        campaign={data}
      />
    </div>
  )
}

export default DonationDetail
