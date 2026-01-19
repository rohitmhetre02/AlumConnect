import { useMemo, useState } from 'react'
import useApiList from '../hooks/useApiList'
import getStatusBadgeClass from '../utils/status'

const formatRole = (role) => {
  if (!role) return ''
  const str = role.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const Mentorship = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: mentors, isLoading, error } = useApiList('/mentors')

  const normalizedMentors = useMemo(() => {
    return mentors.map((mentor) => ({
      id: mentor.id || mentor._id,
      name: mentor.fullName || '—',
      role: 'Alumni Mentor',
      department: mentor.department || '—',
      email: mentor.email || '—',
      phone: mentor.contactNumber || '—',
      expertise: Array.isArray(mentor.expertise) ? mentor.expertise : [],
      mentees: 0,
      status: mentor.status || 'Active',
      avatar: mentor.fullName ? mentor.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'AM',
      cohorts: [],
      rating: mentor.rating ?? 0,
      reviewCount: 0,
      highlight: mentor.bio || '',
    }))
  }, [mentors])

  const filteredMentors = useMemo(() => {
    const query = searchTerm.toLowerCase()

    return normalizedMentors.filter((mentor) => {
      const matchesSearch =
        mentor.name.toLowerCase().includes(query) ||
        mentor.email.toLowerCase().includes(query) ||
        mentor.department.toLowerCase().includes(query) ||
        mentor.expertise.some((tag) => tag.toLowerCase().includes(query))

      const matchesRole = roleFilter === 'all' || mentor.role === roleFilter
      const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [normalizedMentors, searchTerm, roleFilter, statusFilter])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Mentorship Hub</h1>
        <p className="text-slate-600">Track active mentors, their expertise, and student cohort assignments.</p>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search mentors by name, department, or skill..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-11 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Roles</option>
              <option value="Alumni Mentor">Alumni Mentor</option>
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.25)] transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50">
            Add Mentor
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-sm text-slate-500">Loading mentors…</div>
          ) : filteredMentors.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sm text-slate-500">
              No mentors match the filters.
            </div>
          ) : (
            filteredMentors.map((mentor) => (
              <article
                key={mentor.id}
                className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-base font-semibold text-primary">
                      {mentor.avatar}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{mentor.name}</h3>
                    </div>
                  </div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(mentor.status)}`}>
                    {mentor.status}
                  </span>
                </div>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 00-7.89 16.1L12 22l7.89-3.9A10 10 0 0012 2z" />
                    </svg>
                    <span className="font-medium text-slate-700">{mentor.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2H8C6.9 2 6 .9 6 2v20l6-3 6 3V2z" />
                    </svg>
                    <span className="text-slate-600">{mentor.expertise.join(', ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l3 7-1.34 2.68A1 1 0 007.58 16H19" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 18a2 2 0 104 0 2 2 0 00-4 0zM7 18a2 2 0 104 0 2 2 0 00-4 0z" />
                    </svg>
                    <span className="text-slate-600">Mentees: {mentor.mentees}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span className="text-slate-600">{mentor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m8-8H8m12-2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h10l4 4z" />
                    </svg>
                    <a href={`mailto:${mentor.email}`} className="text-primary hover:underline">
                      {mentor.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.92 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 7.08-1.01z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">{mentor.rating.toFixed(1)} • {mentor.reviewCount} reviews</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-wide text-slate-500">Cohorts</span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {mentor.cohorts.map((cohort) => (
                        <span key={cohort} className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          {cohort}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="text-xs uppercase tracking-wide text-slate-500">Latest Review</span>
                    <p className="mt-1 text-sm italic text-slate-600">“{mentor.highlight}”</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary">
                    View Profile
                  </button>
                  <div className="flex gap-2">
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
                </div>
              </article>
            ))
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}
      </section>
    </div>
  )
}

export default Mentorship
