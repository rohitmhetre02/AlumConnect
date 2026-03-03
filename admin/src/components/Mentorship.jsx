import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiList from '../hooks/useApiList'
import getStatusBadgeClass from '../utils/status'

const formatRole = (role) => {
  if (!role) return ''
  const str = role.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const Mentorship = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: mentors, isLoading, error } = useApiList('/mentors')

  const normalizedMentors = useMemo(() => {
    return mentors.map((mentor) => ({
      id: mentor.id || mentor._id,
      name: mentor.fullName || mentor.name || '—',
      role: 'Alumni Mentor',
      department: mentor.department || '—',
      email: mentor.email || '—',
      phone: mentor.phoneNumber || mentor.contactNumber || mentor.phone || '—',
      expertise: Array.isArray(mentor.expertise) ? mentor.expertise : (mentor.expertise ? mentor.expertise.split(',').map(e => e.trim()) : []),
      mentees: mentor.mentees || 0,
      status: mentor.status || 'Active',
      avatar: mentor.profilePhoto || mentor.avatar || null,
      headline: mentor.headline || mentor.currentJobTitle || `${mentor.jobRole} at ${mentor.companyName}` || 'Professional Mentor',
      bio: mentor.bio || mentor.description || '',
      cohorts: mentor.cohorts || [],
      rating: mentor.rating ?? 0,
      reviewCount: mentor.reviewCount || 0,
      graduationYear: mentor.graduationYear || '',
      location: mentor.currentLocation || mentor.location || '',
      jobRole: mentor.currentJobTitle || mentor.jobRole || '',
      companyName: mentor.company || '',
      industry: mentor.industry || '',
      availability: mentor.availability || '',
      maxStudents: mentor.maxStudents || '',
      weeklyHours: mentor.weeklyHours || '',
      services: mentor.services || [],
      experience: mentor.experience || '',
    }))
  }, [mentors])



  const handleViewProfile = (mentorId) => {
    navigate(`/admin/mentorship/${mentorId}`)
  }

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

          ) : error ? (

            <div className="col-span-full text-center py-12">

              <p className="text-sm text-red-600 mb-2">Error loading mentors</p>

              <p className="text-xs text-slate-500">{error}</p>

            </div>

          ) : filteredMentors.length === 0 ? (

            <div className="col-span-full text-center py-12 text-sm text-slate-500">

              No mentors match the filters.

            </div>

          ) : (

            filteredMentors.map((mentor) => (
              <article
                key={mentor.id}
                className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg cursor-pointer"
                onClick={() => handleViewProfile(mentor.id)}
              >
                {/* Header with Image and Basic Info */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Mentor Image */}
                    <div className="relative">
                      {mentor.avatar ? (
                        <img
                          src={mentor.avatar}
                          alt={mentor.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-slate-100"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg">
                          {mentor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                        mentor.status === 'Active' ? 'bg-emerald-500' : 
                        mentor.status === 'Onboarding' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                    </div>

                    {/* Name and Headline */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 truncate">{mentor.name}</h3>
                      <p className="text-sm text-slate-600 truncate">{mentor.headline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(mentor.status)}`}>
                          {mentor.status}
                        </span>
                        <span className="text-xs text-slate-500">{mentor.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${i < Math.floor(mentor.rating) ? 'text-amber-400' : 'text-slate-300'}`}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2l2.92 6.26L22 9.27l-5 4.88L18.18 22 12 18.56 5.82 22 7 14.15l-5-4.88 7.08-1.01z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{mentor.rating.toFixed(1)}</span>
                    <span className="text-sm text-slate-500">• {mentor.reviewCount} reviews</span>
                  </div>

                  {/* Contact Info */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m8-8H8m12-2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h10l4 4z" />
                      </svg>
                      <a 
                        href={`mailto:${mentor.email}`} 
                        className="text-primary hover:underline truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {mentor.email}
                      </a>
                    </div>
                    
                    {mentor.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="truncate">{mentor.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Expertise Tags */}
                  {mentor.expertise.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-700 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.slice(0, 3).map((skill, index) => (
                          <span key={index} className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {skill}
                          </span>
                        ))}
                        {mentor.expertise.length > 3 && (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            +{mentor.expertise.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Mentees Count and Actions */}
                <div className="mt-auto border-t border-slate-100 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700">{mentor.mentees} Mentees</span>
                    </div>
                    <button 
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewProfile(mentor.id)
                      }}
                    >
                      View Details
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

