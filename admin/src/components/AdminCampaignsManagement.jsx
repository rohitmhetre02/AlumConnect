import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiList from '../hooks/useApiList'
import getStatusBadgeClass from '../utils/status'
import { api } from '../utils/api'

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

const AdminCampaignsManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  // Fetch only coordinator-approved campaigns
  const { data: campaigns, isLoading: dataLoading, error, refetch } = useApiList('/campaigns?approvalStatus=APPROVED')

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
        goalAmount: goal,
        raisedAmount: raised,
        progressPercentage: goal > 0 ? Math.round((raised / goal) * 100) : 0,
        donorCount: campaign.donorCount || 0,
        deadline: campaign.deadline || null,
        status: status,
        category: campaign.category || 'other',
        coverImage: campaign.coverImage || '',
        tags: Array.isArray(campaign.tags) ? campaign.tags : [],
        postedAt: campaign.createdAt || null,
        postedBy: campaign.createdByName || '—',
        postedByRole: campaign.createdByRole || 'alumni',
        featured: campaign.featured || false,
        priority: campaign.priority || 0,
        donations: campaign.donations || [],
        recentDonations: campaign.recentDonations || [],
        approvalStatus: campaign.approvalStatus || 'APPROVED',
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
        campaign.postedBy.toLowerCase().includes(query)

      const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus
      const matchesCategory = filterCategory === 'all' || campaign.category === filterCategory

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [normalizedCampaigns, searchTerm, filterStatus, filterCategory])

  // Admin action handlers
  const handlePause = async (id) => {
    setIsLoading(true)
    try {
      await api.put(`/campaigns/${id}`, { status: 'paused' })
      await refetch()
      alert('Campaign has been paused successfully.')
    } catch (error) {
      console.error('Failed to pause campaign:', error)
      alert('Failed to pause campaign. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin/campaigns/${id}/edit`)
  }

  const handleClose = async (id) => {
    setIsLoading(true)
    try {
      await api.put(`/campaigns/${id}`, { status: 'completed' })
      await refetch()
      alert('Campaign has been closed successfully.')
    } catch (error) {
      console.error('Failed to close campaign:', error)
      alert('Failed to close campaign. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        await api.delete(`/campaigns/${id}`)
        await refetch()
        alert('Campaign deleted successfully')
      } catch (error) {
        console.error('Failed to delete campaign:', error)
        alert('Failed to delete campaign. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleDownloadReports = async (id) => {
    setIsLoading(true)
    try {
      // Generate CSV report with donation data
      const response = await api.get(`/campaigns/${id}/report`)
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `campaign-report-${id}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      alert('Campaign report downloaded successfully.')
    } catch (error) {
      console.error('Failed to download report:', error)
      alert('Failed to download report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="space-y-6">
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Campaigns Management</h1>
            <p className="text-slate-600 mt-1">Manage fundraising campaigns for alumni.</p>
          </div>
          <button 
            onClick={() => navigate('/admin/campaigns/create')}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-600/50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Campaign
          </button>
        </div>
      </header>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search campaigns by title, description, posted by..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
                <option value="Paused">Paused</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Categories</option>
                <option value="scholarship">Scholarship</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="equipment">Equipment</option>
                <option value="research">Research</option>
                <option value="community">Community</option>
                <option value="emergency">Emergency</option>
                <option value="other">Other</option>
              </select>
            </div>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Campaign Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Goal Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Amount Raised</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Progress</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Donor Count</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Deadline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">View</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataLoading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      Loading campaigns...
                    </div>
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2zm0 8c1.11 0 2 .89 2 2s-.89 2-2-.89-2-2-2z" />
                      </svg>
                      <div>No coordinator-approved campaigns found.</div>
                      <button 
                        onClick={() => navigate('/admin/campaigns/create')}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create First Campaign
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 max-w-xs truncate">{campaign.title}</div>
                      <div className="text-xs text-slate-500">{campaign.category}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(campaign.goalAmount)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(campaign.raisedAmount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                            <span>{campaign.progressPercentage}%</span>
                            <span>{formatCurrency(campaign.raisedAmount)} / {formatCurrency(campaign.goalAmount)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                campaign.progressPercentage >= 75 ? 'bg-emerald-500' : 
                                campaign.progressPercentage >= 50 ? 'bg-blue-500' : 
                                campaign.progressPercentage >= 25 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${campaign.progressPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {campaign.donorCount > 0 ? (
                        <button
                          onClick={() => navigate(`/admin/campaigns/${campaign.id}/donations`)}
                          className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
                          title="View Donations"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v2m0 0v2m0-2h2a3 3 0 013.857-5.356M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {campaign.donorCount} Donors
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-slate-400">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v2m0 0v2m0-2h2a3 3 0 013.857-5.356M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          0 Donors
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(campaign.deadline)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        title="View Campaign Details"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(campaign.id)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                          title="Edit Campaign"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        
                        <div className="relative group">
                          <button
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                          >
                            More
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          
                          <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                            <div className="py-1">
                              {campaign.status !== 'Paused' && campaign.status !== 'Completed' && (
                                <button
                                  onClick={() => handlePause(campaign.id)}
                                  disabled={isLoading}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-50"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Pause Campaign
                                </button>
                              )}
                              
                              {campaign.status !== 'Completed' && (
                                <button
                                  onClick={() => handleClose(campaign.id)}
                                  disabled={isLoading}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  Close Campaign
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDownloadReports(campaign.id)}
                                disabled={isLoading}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-700 transition-colors disabled:opacity-50"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293H19a2 2 0 012-2z" />
                                </svg>
                                Download Reports
                              </button>
                              
                              <div className="border-t border-slate-100 my-1"></div>
                              
                              <button
                                onClick={() => handleDelete(campaign.id)}
                                disabled={isLoading}
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredCampaigns.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filteredCampaigns.length} of {normalizedCampaigns.length} campaigns</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>
    </div>
  )
}

export default AdminCampaignsManagement
