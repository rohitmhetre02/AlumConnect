import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiList from '../hooks/useApiList'
import { api } from '../utils/api'
import getStatusBadgeClass from '../utils/status'

const formatDate = (date) => {
  if (!date) return '—'
  const instance = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(instance.getTime())) return '—'
  return instance.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const capitalize = (value) => {
  if (!value) return ''
  const str = value.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const deriveStatus = (deadline) => {
  if (!deadline) return 'Active'
  const due = new Date(deadline)
  if (Number.isNaN(due.getTime())) return 'Active'
  return due < new Date() ? 'Closed' : 'Active'
}

const normalizeType = (type) => {
  if (!type) return 'Full-time'
  const str = type.toString().trim().toLowerCase()
  if (str === 'full-time') return 'Full-time'
  if (str === 'part-time') return 'Part-time'
  if (str === 'internship') return 'Internship'
  if (str === 'contract') return 'Contract'
  return capitalize(type)
}

const OpportunitiesManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  // Fetch all opportunities for admin management
  const { data: opportunities, isLoading: dataLoading, error, refetch } = useApiList('/opportunities/admin/all')

  // Get user role from localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const userRole = adminUser.role ? adminUser.role.toString().toLowerCase() : 'admin'
  const isCoordinator = userRole === 'coordinator'

  const normalizedOpportunities = useMemo(() => {
    return opportunities.map((opportunity) => {
      const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null
      const type = normalizeType(opportunity.type)
      const status = opportunity.status || 'active'
      const applicants = opportunity.applicants || opportunity.applicationCount || 0

      return {
        id: opportunity.id || opportunity._id,
        title: opportunity.title || 'Untitled Opportunity',
        company: opportunity.company || '—',
        location: opportunity.location || (opportunity.isRemote ? 'Remote' : '—'),
        type: type,
        department: opportunity.department || '—',
        description: opportunity.description || '',
        skills: Array.isArray(opportunity.skills) ? opportunity.skills : [],
        contactEmail: opportunity.contactEmail || '—',
        deadline: deadline,
        applicants: applicants,
        postedAt: opportunity.postedAt || opportunity.createdAt || null,
        postedBy: opportunity.createdByName || '—',
        postedByRole: opportunity.createdByRole || 'alumni',
        status: status,
        approvalStatus: opportunity.approvalStatus || 'APPROVED',
        approvalDepartment: opportunity.approvalDepartment || '—',
        isRemote: opportunity.isRemote || false,
        views: opportunity.views || 0,
        isPushed: opportunity.isPushed || false,
        pushedAt: opportunity.pushedAt || null,
      }
    })
  }, [opportunities])

  const typeOptions = useMemo(() => {
    const values = new Set()
    normalizedOpportunities.forEach(({ type }) => {
      if (type) values.add(type)
    })
    return Array.from(values).sort()
  }, [normalizedOpportunities])

  const statusOptions = useMemo(() => ['active', 'paused', 'closed', 'expired'], [])

  const filteredOpportunities = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return normalizedOpportunities.filter((opportunity) => {
      const matchesSearch =
        !query ||
        opportunity.title.toLowerCase().includes(query) ||
        opportunity.company.toLowerCase().includes(query) ||
        opportunity.location.toLowerCase().includes(query) ||
        opportunity.postedBy.toLowerCase().includes(query) ||
        (opportunity.postedByRole && opportunity.postedByRole.toLowerCase().includes(query))

      const matchesType = filterType === 'all' || opportunity.type === filterType
      const matchesStatus = filterStatus === 'all' || opportunity.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [normalizedOpportunities, searchTerm, filterType, filterStatus])

  // Admin action handlers
  const handleApprove = async (id) => {
    setIsLoading(true)
    try {
      await api.put(`/opportunities/${id}`, { status: 'active', approvalStatus: 'APPROVED' })
      await refetch()
      alert('Opportunity has been approved successfully.')
    } catch (error) {
      console.error('Failed to approve opportunity:', error)
      alert('Failed to approve opportunity. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (id) => {
    const reason = prompt('Please provide a reason for rejection (optional):')
    setIsLoading(true)
    try {
      await api.put(`/opportunities/${id}`, { status: 'closed', approvalStatus: 'REJECTED', approvalRejectionReason: reason || '' })
      await refetch()
      alert('Opportunity has been rejected successfully.')
    } catch (error) {
      console.error('Failed to reject opportunity:', error)
      alert('Failed to reject opportunity. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalApprove = async (id) => {
    setIsLoading(true)
    try {
      await api.put(`/opportunities/${id}`, { status: 'active', approvalStatus: 'APPROVED' })
      await refetch()
      alert('Opportunity has been approved and published successfully.')
    } catch (error) {
      console.error('Failed to approve opportunity:', error)
      alert('Failed to approve opportunity. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (id) => {
    navigate(`/admin/opportunities/${id}/edit`)
  }

  const handleClose = async (id) => {
    setIsLoading(true)
    try {
      await api.put(`/opportunities/${id}`, { status: 'closed' })
      await refetch()
      alert('Opportunity has been closed successfully.')
    } catch (error) {
      console.error('Failed to close opportunity:', error)
      alert('Failed to close opportunity. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = async (id) => {
    setIsLoading(true)
    try {
      await api.put(`/opportunities/${id}`, { status: 'paused' })
      await refetch()
      alert('Opportunity has been paused successfully.')
    } catch (error) {
      console.error('Failed to pause opportunity:', error)
      alert('Failed to pause opportunity. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        await api.delete(`/opportunities/${id}`)
        await refetch()
        alert('Opportunity deleted successfully')
      } catch (error) {
        console.error('Failed to delete opportunity:', error)
        alert('Failed to delete opportunity. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Opportunities Management</h1>
            <p className="text-slate-600 mt-1">Manage all job opportunities and career postings including pending, approved, and rejected status.</p>
          </div>
          {!isCoordinator && (
            <button 
              onClick={() => navigate('/admin/opportunities/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-600/50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Opportunity
            </button>
          )}
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
                  placeholder="Search opportunities by title, company, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                />
              </div>
              
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Opportunity Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Posted By</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Deadline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Applicants</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">View</th>
                {!isCoordinator && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataLoading ? (
                <tr>
                  <td colSpan={isCoordinator ? 9 : 10} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      Loading opportunities...
                    </div>
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={isCoordinator ? 9 : 10} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>No opportunities found.</div>
                      {!isCoordinator && (
                        <button 
                          onClick={() => navigate('/admin/opportunities/create')}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create First Opportunity
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 max-w-xs truncate">{opportunity.title}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {opportunity.isRemote && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            🌐 Remote
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{opportunity.company}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{opportunity.location}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        opportunity.type === 'Full-time'
                          ? 'bg-blue-100 text-blue-800'
                          : opportunity.type === 'Part-time'
                            ? 'bg-green-100 text-green-800'
                            : opportunity.type === 'Internship'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-orange-100 text-orange-800'
                      }`}>
                        {opportunity.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{opportunity.postedBy}</div>
                        <div className="text-xs text-slate-500">{capitalize(opportunity.postedByRole)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(opportunity.deadline)}</td>
                    <td className="px-6 py-4">
                      {opportunity.approvalStatus === 'APPROVED' ? (
                        <button
                          onClick={() => navigate(`/admin/opportunities/${opportunity.id}/applicants`)}
                          className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium text-white hover:bg-purple-700 transition-colors"
                          title="View Applicants"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          Applicants ({opportunity.applicants})
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 text-sm text-slate-700">
                          <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {opportunity.applicants}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(opportunity.status)}`}>
                        {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/opportunities/${opportunity.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                        title="View Opportunity Details"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                    {!isCoordinator && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {opportunity.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(opportunity.id)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                title="Approve Opportunity"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Approve
                              </button>
                              
                              <button
                                onClick={() => handleReject(opportunity.id)}
                                disabled={isLoading}
                                className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                                title="Reject Opportunity"
                              >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Reject
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => handleEdit(opportunity.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                            title="Edit Opportunity"
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
                                {opportunity.status === 'active' && (
                                  <button
                                    onClick={() => handlePause(opportunity.id)}
                                    disabled={isLoading}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors disabled:opacity-50"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Pause
                                  </button>
                                )}
                                
                                {opportunity.status === 'paused' && (
                                  <button
                                    onClick={() => handleFinalApprove(opportunity.id)}
                                    disabled={isLoading}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors disabled:opacity-50"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Resume
                                  </button>
                                )}
                                
                                {opportunity.status !== 'closed' && (
                                  <button
                                    onClick={() => handleClose(opportunity.id)}
                                    disabled={isLoading}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                    </svg>
                                    Close
                                  </button>
                                )}
                                
                                <div className="border-t border-slate-100 my-1"></div>
                                
                                <button
                                  onClick={() => handleDelete(opportunity.id)}
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
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredOpportunities.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filteredOpportunities.length} of {normalizedOpportunities.length} opportunities</div>
            </div>
          </div>
        )}

      </section>
    </div>
  )
}

export default OpportunitiesManagement
