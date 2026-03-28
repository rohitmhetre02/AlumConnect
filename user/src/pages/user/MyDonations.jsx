import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import { useAllCampaignDonations } from '../../hooks/useAllCampaignDonations.js'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(numeric)
}

const formatDate = (date) => {
  if (!date) return '—'
  try {
    const instance = new Date(date)
    if (Number.isNaN(instance.getTime())) return '—'
    return instance.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return '—'
  }
}

const MyDonations = () => {
  const { items: donations, loading, error, refresh } = useAllCampaignDonations()

  const sortedDonations = useMemo(() => {
    return [...donations].sort((a, b) => {
      return new Date(b.donatedAt) - new Date(a.donatedAt)
    })
  }, [donations])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Campaigns</h1>
          <p className="text-sm text-slate-500">
            View all donation history across all campaigns.
          </p>
        </div>
        <Link
          to="/dashboard/campaigns"
          className="rounded-full border border-primary/20 bg-white px-5 py-2 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
        >
          Browse Campaigns
        </Link>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <p>{error.message ?? 'Unable to load donation history right now.'}</p>
          <button
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:text-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                  </div>
                  <div className="h-8 w-24 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedDonations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Donor Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Donation Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Payment Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDonations.map((donation) => {
                  const campaign = donation.campaign || {}
                  const campaignId = campaign._id || campaign.id
                  
                  return (
                    <tr key={donation.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-10 to-emerald-5 flex items-center justify-center">
                            <svg className="h-6 w-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">{campaign.title || 'Unknown Campaign'}</div>
                            <div className="text-xs text-slate-500">
                              {campaign.approvalStatus === 'APPROVED' ? 'Active' : campaign.approvalStatus || 'Campaign'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {donation.anonymous ? 'Anonymous' : (donation.donorName || 'Unknown')}
                        </div>
                        {!donation.anonymous && donation.donorEmail && (
                          <div className="text-xs text-slate-500">{donation.donorEmail}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-emerald-600">{formatCurrency(donation.amount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{formatDate(donation.donatedAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${
                            donation.status === 'success' || donation.status === 'completed'
                              ? 'bg-emerald-500' 
                              : donation.status === 'failed' || donation.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                          }`} />
                          <span className={`text-xs font-medium ${
                            donation.status === 'success' || donation.status === 'completed'
                              ? 'text-emerald-700' 
                              : donation.status === 'failed' || donation.status === 'error'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}>
                            {donation.status === 'success' || donation.status === 'completed'
                              ? 'Success' 
                              : donation.status === 'failed' || donation.status === 'error'
                              ? 'Failed'
                              : 'Pending'
                            }
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/dashboard/campaigns/${campaignId}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
                        >
                          View More
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No donations found</h3>
            <p className="text-sm text-slate-500 mb-4">
              No donation history available. When donations are made to campaigns, they will appear here.
            </p>
            <Link
              to="/dashboard/campaigns"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Browse Campaigns
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyDonations
