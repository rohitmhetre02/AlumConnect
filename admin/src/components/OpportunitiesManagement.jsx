import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiList from '../hooks/useApiList'
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
  const { data: opportunities, isLoading, error } = useApiList('/opportunities')

  const normalizedOpportunities = useMemo(() => {
    return opportunities.map((opportunity) => {
      const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null
      const type = normalizeType(opportunity.type)
      const status = deriveStatus(opportunity.deadline)

      return {
        id: opportunity.id || opportunity._id,
        title: opportunity.title || 'Untitled Opportunity',
        company: opportunity.company || '—',
        location: opportunity.location || (opportunity.isRemote ? 'Remote' : '—'),
        type,
        description: opportunity.description || '',
        skills: Array.isArray(opportunity.skills) ? opportunity.skills : [],
        contactEmail: opportunity.contactEmail || '',
        deadline,
        applicants: opportunity.applicants ?? opportunity.applicationCount ?? 0,
        postedAt: opportunity.postedAt || opportunity.createdAt || null,
        postedBy: opportunity.createdByName || opportunity.postedBy || '—',
        postedByRole: opportunity.createdByRole || '',
        status,
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

  const statusOptions = useMemo(() => ['Active', 'Closed'], [])

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Opportunities Management</h1>
        <p className="text-slate-600">Manage job opportunities and career postings for alumni.</p>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => navigate('/admin/opportunities/create')}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50"
          >
            Post Opportunity
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Opportunity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Posted By</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Applicants</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading opportunities…
                  </td>
                </tr>
              ) : filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-500">
                    No opportunities match the current filters.
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div>
                        <button
                          onClick={() => navigate(`/admin/opportunities/${opportunity.id}`)}
                          className="text-sm font-medium text-slate-900 hover:text-primary transition-colors cursor-pointer text-left"
                        >
                          {opportunity.title}
                        </button>
                        <div className="text-sm text-slate-500">ID: #{opportunity.id}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-900">{opportunity.company}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{opportunity.location}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
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
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{opportunity.postedBy}</p>
                        {opportunity.postedByRole && (
                          <p className="text-xs text-slate-500">{capitalize(opportunity.postedByRole)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{formatDate(opportunity.deadline)}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{opportunity.applicants}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(opportunity.status)}`}>
                        {opportunity.status}
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

      </section>
    </div>
  )
}

export default OpportunitiesManagement
