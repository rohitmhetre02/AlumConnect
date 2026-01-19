import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

const deriveStatus = (campaign) => {
  if (!campaign) return 'Active'
  const { goalAmount, raisedAmount, deadline } = campaign
  if (goalAmount && raisedAmount >= goalAmount) return 'Completed'
  if (deadline) {
    const due = new Date(deadline)
    if (!Number.isNaN(due.getTime()) && due < new Date()) {
      return raisedAmount >= goalAmount * 0.5 ? 'Completed' : 'Closed'
    }
  }
  return 'Active'
}

const formatRole = (role) => {
  if (!role) return ''
  const str = role.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const CampaignsManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const { data: campaigns, isLoading, error } = useApiList('/campaigns')

  const normalizedCampaigns = useMemo(() => {
    return campaigns.map((campaign) => {
      const goal = Number(campaign.goalAmount ?? 0)
      const raised = Number(campaign.raisedAmount ?? 0)
      const status = deriveStatus({ goalAmount: goal, raisedAmount: raised, deadline: campaign.deadline })
      const contributions = Array.isArray(campaign.contributions) ? campaign.contributions : []

      return {
        id: campaign.id || campaign._id,
        title: campaign.title || 'Untitled Campaign',
        description: campaign.description || '',
        goal,
        raised,
        deadline: campaign.deadline || null,
        status,
        donors: campaign.contributionCount ?? contributions.length ?? 0,
        postedBy: {
          name: campaign.createdByName || '—',
          role: campaign.createdByRole ? campaign.createdByRole.toString() : '',
        }
      }
    })
  }, [campaigns])

  const filteredCampaigns = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return normalizedCampaigns.filter((campaign) => {
      const matchesSearch =
        !query ||
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.postedBy.name.toLowerCase().includes(query)
      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [normalizedCampaigns, searchTerm, filterStatus])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Campaigns Management</h1>
        <p className="text-slate-600">Manage fundraising campaigns and donation drives.</p>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Planning">Planning</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button 
            onClick={() => navigate('/admin/campaigns/create')}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50"
          >
            Create Campaign
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-sm text-slate-500">Loading campaigns…</div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sm text-slate-500">
              No campaigns match the current filters.
            </div>
          ) : (
            filteredCampaigns.map((campaign) => {
              const progress = campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0
              const progressColor = progress >= 75 ? 'bg-emerald-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'

              return (
                <div key={campaign.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-red-600/20 hover:shadow-lg cursor-pointer"
                     onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">{campaign.title}</h3>
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-3">{campaign.description}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Goal:</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(campaign.goal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Raised:</span>
                        <span className="font-semibold text-emerald-600">{formatCurrency(campaign.raised)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Progress:</span>
                        <span className="font-semibold text-slate-900">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progressColor} transition-all duration-300`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="text-sm text-slate-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v5a5 5 0 005 5h4a5 5 0 005-5v-5a2 2 0 00-2-2z" />
                          </svg>
                          <span>{campaign.donors} donors</span>
                        </div>
                        <div>Deadline: {formatDate(campaign.deadline)}</div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-slate-400 hover:text-slate-600 transition">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="text-slate-400 hover:text-red-600 transition">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2">
                      <span className="text-xs uppercase tracking-wide text-slate-500">Posted By</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">{campaign.postedBy.name}</span>
                        {campaign.postedBy.role && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass('active')}`}>
                            {campaign.postedBy.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}
      </section>
    </div>
  )
}

export default CampaignsManagement
