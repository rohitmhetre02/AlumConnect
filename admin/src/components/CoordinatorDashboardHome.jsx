import React, { useState, useMemo } from 'react'

const reviewRequests = [
  {
    id: 1,
    type: 'Student',
    name: 'Rohit Sharma',
    email: 'rohit.sharma@university.edu',
    requestTitle: 'Mentorship Request for AI/ML Guidance',
    department: 'Computer Science',
    cohort: 'CSE 2025',
    submittedAt: '2024-01-28T09:15:00Z',
    status: 'Pending',
    details: 'Seeking guidance on applied AI career path and project ideation for final year.',
  },
  {
    id: 2,
    type: 'Alumni',
    name: 'Priya Nair',
    email: 'priya.nair@alumni.edu',
    requestTitle: 'Event Speaker Proposal',
    department: 'Business Analytics',
    cohort: 'MBA 2022',
    submittedAt: '2024-01-27T14:30:00Z',
    status: 'Pending',
    details: 'Proposed to conduct a workshop on data storytelling for current students.',
  },
  {
    id: 3,
    type: 'Student',
    name: 'Anjali Verma',
    email: 'anjali.verma@university.edu',
    requestTitle: 'Research Collaboration Request',
    department: 'Electronics & Communication',
    cohort: 'ECE 2024',
    submittedAt: '2024-01-26T11:45:00Z',
    status: 'Approved',
    details: 'Request to collaborate on IoT-based health monitoring research project.',
  },
  {
    id: 4,
    type: 'Alumni',
    name: 'Karan Mehta',
    email: 'karan.mehta@alumni.edu',
    requestTitle: 'Alumni Mentorship Onboarding',
    department: 'Mechanical Engineering',
    cohort: 'ME 2021',
    submittedAt: '2024-01-25T16:20:00Z',
    status: 'Rejected',
    details: 'Applied to become a mentor for mechanical engineering students.',
  },
  {
    id: 5,
    type: 'Student',
    name: 'Sneha Iyer',
    email: 'sneha.iyer@university.edu',
    requestTitle: 'Placement Preparation Guidance',
    department: 'Information Technology',
    cohort: 'IT 2024',
    submittedAt: '2024-01-24T10:00:00Z',
    status: 'Pending',
    details: 'Seeking mock interview preparation and resume review for upcoming placements.',
  },
]

const statusBadge = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
}

const typeBadge = {
  Student: 'bg-blue-100 text-blue-700',
  Alumni: 'bg-purple-100 text-purple-700',
}

const CoordinatorDashboardHome = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredRequests = useMemo(() => {
    const query = searchTerm.toLowerCase()
    return reviewRequests.filter((req) => {
      const matchesSearch =
        req.name.toLowerCase().includes(query) ||
        req.email.toLowerCase().includes(query) ||
        req.requestTitle.toLowerCase().includes(query) ||
        req.department.toLowerCase().includes(query)

      const matchesStatus = filterStatus === 'all' || req.status === filterStatus
      const matchesType = filterType === 'all' || req.type === filterType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchTerm, filterStatus, filterType])

  const stats = useMemo(() => {
    const total = reviewRequests.length
    const pending = reviewRequests.filter((r) => r.status === 'Pending').length
    const approved = reviewRequests.filter((r) => r.status === 'Approved').length
    const rejected = reviewRequests.filter((r) => r.status === 'Rejected').length
    return { total, pending, approved, rejected }
  }, [])

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Coordinator Dashboard</h1>
        <p className="text-slate-600">Review and manage student and alumni requests.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Requests</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-lg font-semibold text-slate-600">
              📋
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-lg font-semibold text-amber-600">
              ⏳
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Approved</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-600">
              ✅
            </span>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-red-100 text-lg font-semibold text-red-600">
              ❌
            </span>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search by name, email, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-11 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Types</option>
              <option value="Student">Student</option>
              <option value="Alumni">Alumni</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <article
              key={request.id}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        typeBadge[request.type] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {request.type}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        statusBadge[request.status] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{request.requestTitle}</h3>
                    <p className="mt-1 text-sm text-slate-600">{request.details}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m8-8H8m12-2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h10l4 4z" />
                      </svg>
                      <span>{request.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>{request.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s10 2 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>{request.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{request.cohort}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatDate(request.submittedAt)}</span>
                    </div>
                  </div>
                </div>

                {request.status === 'Pending' && (
                  <div className="flex gap-2">
                    <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-600">
                      Approve
                    </button>
                    <button className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600">
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4L8 11m0 0l8-4m0 4L8 15m0 0l8-4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No requests match the filters</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default CoordinatorDashboardHome
