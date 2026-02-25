import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { get, del } from '../../utils/api'

const formatDate = (date) => {
  if (!date) return '—'
  const instance = new Date(date)
  if (Number.isNaN(instance.getTime())) return '—'
  return instance.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800'
    case 'paused':
      return 'bg-amber-100 text-amber-800'
    case 'closed':
      return 'bg-slate-100 text-slate-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

const getApprovalStatusBadgeClass = (status) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800'
    case 'REJECTED':
      return 'bg-red-100 text-red-800'
    case 'PENDING':
    default:
      return 'bg-amber-100 text-amber-800'
  }
}

const MyPosts = () => {
  const { role, user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [contentType, setContentType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)
  
  const [opportunities, setOpportunities] = useState([])
  const [events, setEvents] = useState([])
  const [donations, setDonations] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const isAlumniOrFaculty = ['alumni', 'faculty'].includes(String(role ?? '').trim().toLowerCase())

  // Fetch user's posted content
  const fetchUserContent = async () => {
    if (!isAlumniOrFaculty) {
      setDataLoading(false)
      return
    }

    try {
      const [opportunitiesRes, eventsRes, donationsRes, campaignsRes] = await Promise.all([
        get('/api/opportunities/mine'),
        get('/api/events/mine'),
        get('/api/donations/mine'),
        get('/api/campaigns/mine')
      ])

      setOpportunities(opportunitiesRes?.data || [])
      setEvents(eventsRes?.data || [])
      setDonations(donationsRes?.data || [])
      setCampaigns(campaignsRes?.data || [])
    } catch (error) {
      console.error('Failed to fetch user content:', error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchUserContent()
  }, [])

  const allContent = useMemo(() => {
    const content = []
    
    opportunities.forEach(item => content.push({
      ...item,
      contentType: 'opportunity',
      title: item.title,
      company: item.company,
      location: item.location,
      type: item.type,
      deadline: item.deadline,
      status: item.status,
      approvalStatus: item.approvalStatus,
      createdAt: item.createdAt,
      applicants: item.applicants || 0
    }))
    
    events.forEach(item => content.push({
      ...item,
      contentType: 'event',
      title: item.title,
      company: item.organizer || '—',
      location: item.location,
      type: item.type,
      deadline: item.date,
      status: item.status,
      approvalStatus: item.approvalStatus,
      createdAt: item.createdAt,
      applicants: item.attendees || 0
    }))
    
    donations.forEach(item => content.push({
      ...item,
      contentType: 'donation',
      title: item.title,
      company: item.organizer || '—',
      location: '—',
      type: 'donation',
      deadline: item.deadline,
      status: item.status,
      approvalStatus: item.approvalStatus,
      createdAt: item.createdAt,
      applicants: item.donors || 0
    }))
    
    campaigns.forEach(item => content.push({
      ...item,
      contentType: 'campaign',
      title: item.title,
      company: item.organizer || '—',
      location: '—',
      type: 'campaign',
      deadline: item.deadline,
      status: item.status,
      approvalStatus: item.approvalStatus,
      createdAt: item.createdAt,
      applicants: item.contributors || 0
    }))

    return content
  }, [opportunities, events, donations, campaigns])

  const filteredContent = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return allContent.filter((content) => {
      const matchesSearch =
        !query ||
        content.title.toLowerCase().includes(query) ||
        (content.company && content.company.toLowerCase().includes(query)) ||
        (content.location && content.location.toLowerCase().includes(query))

      const matchesType = contentType === 'all' || content.contentType === contentType
      const matchesStatus = filterStatus === 'all' || content.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [allContent, searchTerm, contentType, filterStatus])

  const handleEdit = (content) => {
    const editRoutes = {
      opportunity: `/user/opportunities/${content.id}/edit`,
      event: `/user/events/${content.id}/edit`,
      donation: `/user/donations/${content.id}/edit`,
      campaign: `/user/campaigns/${content.id}/edit`
    }
    navigate(editRoutes[content.contentType])
  }

  const handleDelete = async (content) => {
    if (!window.confirm(`Are you sure you want to delete this ${content.contentType}?`)) return

    setIsLoading(true)
    try {
      const endpoints = {
        opportunity: `/api/opportunities/${content.id}`,
        event: `/api/events/${content.id}`,
        donation: `/api/donations/${content.id}`,
        campaign: `/api/campaigns/${content.id}`
      }

      await del(endpoints[content.contentType])
      await fetchUserContent()
      alert(`${content.contentType.charAt(0).toUpperCase() + content.contentType.slice(1)} deleted successfully`)
    } catch (error) {
      console.error('Failed to delete:', error)
      alert('Failed to delete. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'opportunity':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      case 'event':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'donation':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'campaign':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
          </svg>
        )
      default:
        return null
    }
  }

  if (!isAlumniOrFaculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Content Management</h1>
            <p className="mt-2 text-slate-600">This feature is available for alumni and faculty members only.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Content Management</h1>
            <p className="text-slate-600 mt-1">Manage your posted opportunities, events, donations, and campaigns.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => navigate('/user/opportunities/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Opportunity
            </button>
            <button 
              onClick={() => navigate('/user/events/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </button>
          </div>
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
                  placeholder="Search your content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                />
              </div>
              
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Content</option>
                <option value="opportunity">Opportunities</option>
                <option value="event">Events</option>
                <option value="donation">Donations</option>
                <option value="campaign">Campaigns</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Content Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Date/Deadline</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Registrations</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Approval Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      Loading your content...
                    </div>
                  </td>
                </tr>
              ) : filteredContent.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <div>No content found.</div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate('/user/opportunities/create')}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                        >
                          Create Opportunity
                        </button>
                        <button 
                          onClick={() => navigate('/user/events/create')}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                          Create Event
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContent.map((content) => (
                  <tr key={`${content.contentType}-${content.id}`} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900 max-w-xs truncate">{content.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{content.company}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(content.contentType)}
                        <span className="text-sm text-slate-700 capitalize">{content.contentType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{content.location || '—'}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(content.deadline)}</td>
                    <td className="px-6 py-4">
                      {content.contentType === 'event' ? (
                        <button
                          onClick={() => navigate(`/user/events/${content.id}/registrations`)}
                          className="flex items-center gap-1 text-sm text-slate-700 hover:text-blue-600 transition-colors group"
                        >
                          <svg className="h-4 w-4 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span className="underline decoration-2 underline-offset-2 group-hover:decoration-blue-500">{content.applicants}</span>
                        </button>
                      ) : (
                        <span className="text-sm text-slate-700">{content.applicants}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(content.status)}`}>
                        {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getApprovalStatusBadgeClass(content.approvalStatus)}`}>
                        {content.approvalStatus === 'APPROVED' ? '✅ ' : content.approvalStatus === 'REJECTED' ? '❌ ' : '🟡 '}
                        {content.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(content)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                          title="Edit Content"
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
                              <button
                                onClick={() => handleDelete(content)}
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

        {filteredContent.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filteredContent.length} of {allContent.length} items</div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default MyPosts
