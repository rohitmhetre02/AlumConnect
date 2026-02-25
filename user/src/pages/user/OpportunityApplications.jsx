import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get, put } from '../../utils/api'

const formatDate = (date) => {
  if (!date) return '—'
  const instance = new Date(date)
  if (Number.isNaN(instance.getTime())) return '—'
  return instance.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'accepted':
      return 'bg-emerald-100 text-emerald-800'
    case 'declined':
      return 'bg-red-100 text-red-800'
    case 'reviewed':
      return 'bg-blue-100 text-blue-800'
    case 'submitted':
    default:
      return 'bg-amber-100 text-amber-800'
  }
}

const OpportunityApplications = () => {
  const navigate = useNavigate()
  const { opportunityId } = useParams()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedApplicant, setSelectedApplicant] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [applicants, setApplicants] = useState(null)
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchApplicants = async () => {
    setDataLoading(true)
    setError('')
    try {
      const response = await get(`/opportunities/${opportunityId}/applicants`)
      setApplicants(response?.data || null)
    } catch (err) {
      setError(err?.message || 'Unable to load applicants.')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (opportunityId) {
      fetchApplicants()
    }
  }, [opportunityId])

  const filteredApplicants = useMemo(() => {
    if (!applicants) return []
    
    const query = searchTerm.trim().toLowerCase()
    return applicants.filter((applicant) => {
      const matchesSearch =
        !query ||
        applicant.student.name.toLowerCase().includes(query) ||
        applicant.student.email.toLowerCase().includes(query) ||
        applicant.student.department.toLowerCase().includes(query) ||
        applicant.student.role.toLowerCase().includes(query)

      const matchesStatus = filterStatus === 'all' || applicant.status === filterStatus

      return matchesSearch && matchesStatus
    })
  }, [applicants, searchTerm, filterStatus])

  const handleUpdateStatus = async (applicantId, newStatus, note = '') => {
    setIsLoading(true)
    try {
      await put(`/opportunities/referrals/${applicantId}/status`, { 
        status: newStatus, 
        reviewerNote: note 
      })
      await fetchApplicants()
      alert(`Applicant status updated to ${newStatus} successfully.`)
    } catch (error) {
      console.error('Failed to update applicant status:', error)
      alert('Failed to update applicant status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadResume = (resumeUrl, fileName) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank')
    } else {
      alert('No resume available for this applicant.')
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Failed to load applicants. Please try again.</div>
        <button
          onClick={() => fetchApplicants()}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Opportunity Applications</h1>
            <p className="text-slate-600 mt-1">View and manage applications for your opportunity.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/activity/content')}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-700 hover:shadow-md"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Content
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
                  placeholder="Search applicants by name, email, department..."
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
                <option value="submitted">🟡 Submitted</option>
                <option value="reviewed">🔵 Reviewed</option>
                <option value="accepted">✅ Accepted</option>
                <option value="declined">❌ Declined</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Applicant</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Department</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Applied Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Resume</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <div>No applicants found.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                          {applicant.student.profilePicture ? (
                            <img 
                              src={applicant.student.profilePicture} 
                              alt={applicant.student.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-slate-600">
                              {applicant.student.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{applicant.student.name}</div>
                          <div className="text-xs text-slate-500">{applicant.student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{applicant.student.department}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800">
                        {applicant.student.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(applicant.submittedAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(applicant.status)}`}>
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {applicant.resumeUrl ? (
                        <button
                          onClick={() => handleDownloadResume(applicant.resumeUrl, applicant.resumeFileName)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-200 transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Resume
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">No resume</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedApplicant(applicant)}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        
                        {(applicant.status === 'submitted' || applicant.status === 'reviewed') && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(applicant.id, 'reviewed')}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(applicant.id, 'accepted')}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(applicant.id, 'declined')}
                              disabled={isLoading}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredApplicants.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filteredApplicants.length} of {applicants?.length || 0} applicants</div>
            </div>
          </div>
        )}
      </section>

      {/* Applicant Detail Modal */}
      {selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">Applicant Details</h2>
                <button
                  onClick={() => setSelectedApplicant(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                  {selectedApplicant.student.profilePicture ? (
                    <img 
                      src={selectedApplicant.student.profilePicture} 
                      alt={selectedApplicant.student.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-slate-600">
                      {selectedApplicant.student.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedApplicant.student.name}</h3>
                  <p className="text-slate-600">{selectedApplicant.student.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800">
                      {selectedApplicant.student.role}
                    </span>
                    <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedApplicant.student.department}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Proposal</h4>
                <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedApplicant.proposal}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Applied Date</h4>
                  <p className="text-sm text-slate-600">{formatDate(selectedApplicant.submittedAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-1">Status</h4>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(selectedApplicant.status)}`}>
                    {selectedApplicant.status.charAt(0).toUpperCase() + selectedApplicant.status.slice(1)}
                  </span>
                </div>
              </div>

              {selectedApplicant.resumeUrl && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Resume</h4>
                  <button
                    onClick={() => handleDownloadResume(selectedApplicant.resumeUrl, selectedApplicant.resumeFileName)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Resume ({selectedApplicant.resumeFileName})
                  </button>
                </div>
              )}

              {selectedApplicant.reviewerNote && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Reviewer Note</h4>
                  <div className="bg-amber-50 rounded-lg p-4 text-sm text-amber-800">
                    {selectedApplicant.reviewerNote}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              {(selectedApplicant.status === 'submitted' || selectedApplicant.status === 'reviewed') && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApplicant.id, 'reviewed')
                      setSelectedApplicant(null)
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApplicant.id, 'accepted')
                      setSelectedApplicant(null)
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Please provide a reason for decline (optional):')
                      if (note !== null) {
                        handleUpdateStatus(selectedApplicant.id, 'declined', note)
                        setSelectedApplicant(null)
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    Decline
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OpportunityApplications
