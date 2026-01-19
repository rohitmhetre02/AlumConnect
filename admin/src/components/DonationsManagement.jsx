import { useMemo, useState } from 'react'
import useApiList from '../hooks/useApiList'
import getStatusBadgeClass from '../utils/status'

const formatCurrency = (amount) => {
  if (!Number.isFinite(amount)) return '$0'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

const formatDate = (date) => {
  if (!date) return '—'
  const parsed = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatRole = (role) => {
  if (!role) return ''
  const str = role.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const DonationsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCampaign, setFilterCampaign] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const { data: campaigns, isLoading, error } = useApiList('/donations')

  const flattenedDonations = useMemo(() => {
    return campaigns.flatMap((campaign) => {
      const contributions = Array.isArray(campaign.contributions) ? campaign.contributions : []
      return contributions.map((contribution) => ({
        id: contribution.id || `${campaign.id}-${contribution.contributedAt}`,
        donorName: contribution.contributorName || 'Anonymous Donor',
        email: '',
        amount: Number(contribution.amount ?? 0),
        campaign: campaign.title || 'Untitled Campaign',
        department: campaign.department || '—',
        role: formatRole(contribution.contributorRole) || 'Donor',
        status: 'Completed',
        date: contribution.contributedAt || campaign.updatedAt || campaign.createdAt || null,
      }))
    })
  }, [campaigns])

  const filteredDonations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return flattenedDonations.filter((donation) => {
      const matchesSearch =
        !query ||
        donation.donorName.toLowerCase().includes(query) ||
        donation.campaign.toLowerCase().includes(query) ||
        donation.department.toLowerCase().includes(query) ||
        donation.role.toLowerCase().includes(query)

      const matchesCampaign = filterCampaign === 'all' || donation.campaign === filterCampaign
      const matchesStatus = filterStatus === 'all' || donation.status === filterStatus

      return matchesSearch && matchesCampaign && matchesStatus
    })
  }, [flattenedDonations, searchTerm, filterCampaign, filterStatus])

  const campaignOptions = useMemo(() => {
    const values = new Set()
    flattenedDonations.forEach((donation) => {
      if (donation.campaign) values.add(donation.campaign)
    })
    return Array.from(values).sort()
  }, [flattenedDonations])

  const totalAmount = useMemo(() => {
    return filteredDonations.reduce((sum, donation) => sum + donation.amount, 0)
  }, [filteredDonations])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Donations Management</h1>
        <p className="text-slate-600">Manage donations and track campaign contributions.</p>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Campaigns</option>
              {campaignOptions.map((campaign) => (
                <option key={campaign} value={campaign}>
                  {campaign}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <button className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50">
            Create Campaign
          </button>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-inner mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Total Donations</h3>
              <p className="text-sm text-slate-500">All campaigns combined</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalAmount)}</div>
              <p className="text-sm text-slate-500">from {filteredDonations.length} donations</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Donor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Campaign</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading donations…
                  </td>
                </tr>
              ) : filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    No donations match the current filters.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{donation.donorName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-slate-100 text-slate-700">
                        {donation.campaign}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{donation.department}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass('active')}`}>
                        {donation.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-900">{formatCurrency(donation.amount)}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{formatDate(donation.date)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(donation.status)}`}>
                        {donation.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-primary hover:text-primary">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:text-red-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}
      </section>
    </div>
  )
}

export default DonationsManagement
