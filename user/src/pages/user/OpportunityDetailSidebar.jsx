import { useNavigate, useParams } from 'react-router-dom'
import { useOpportunity } from '../../hooks/useOpportunities'

const getDaysLeft = (deadline) => {
  if (!deadline) return null
  const today = new Date()
  const deadlineDate = new Date(deadline)
  const diffTime = deadlineDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getPostedTime = (postedDate) => {
  if (!postedDate) return null
  const now = new Date()
  const posted = new Date(postedDate)
  const diffTime = now - posted
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const OpportunityDetailSidebar = () => {
  const { opportunityId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useOpportunity(opportunityId)
  
  const normalizedType = data?.type
    ? data.type === 'full-time' ? 'Full-time' :
      data.type === 'part-time' ? 'Part-time' : 'Internship'
    : 'Opportunity'
    
  const descriptionParagraphs = (data?.description ?? '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-sm text-slate-500">Loading opportunity details...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Opportunity Not Found</h3>
          <p className="text-sm text-slate-500">{error?.message ?? 'This opportunity may have been removed or is no longer available.'}</p>
          <button
            onClick={() => navigate('/dashboard/opportunities')}
            className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/dashboard/opportunities')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Opportunities
        </button>

        {/* Main Layout with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Apply & Timeline */}
          <div className="lg:col-span-1 space-y-6">
            {/* Apply Card */}
            <div className="sticky top-8 space-y-4">
              <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Apply Now</h3>
                <div className="space-y-3">
                  {data.deadline && (
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-slate-600">
                        {getDaysLeft(data.deadline)} days left to apply
                      </span>
                    </div>
                  )}
                  {data.contactEmail && (
                    <a
                      href={`mailto:${data.contactEmail}`}
                      className="w-full inline-flex items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Contact
                    </a>
                  )}
                  <button className="w-full inline-flex items-center justify-center rounded-full border border-primary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Request Referral
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Application Deadline</p>
                      <p className="text-xs text-slate-600">
                        {data.deadline ? new Date(data.deadline).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Posted Date</p>
                      <p className="text-xs text-slate-600">
                        {data.postedAt ? getPostedTime(data.postedAt) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posted By */}
              {data.postedBy && (
                <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Posted By</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{data.postedBy}</p>
                      <p className="text-xs text-slate-600">{data.createdByRole || 'Community Member'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Job Header Card */}
            <section className="rounded-3xl bg-white shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary via-primary-dark to-primary/90 p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    data.type === 'internship' ? 'bg-amber-100 text-amber-700' : 'bg-white/20 text-white'
                  }`}>
                    {normalizedType}
                  </span>
                  {data.deadline && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                      getDaysLeft(data.deadline) <= 7 
                        ? 'bg-rose-100 text-rose-700' 
                        : getDaysLeft(data.deadline) <= 30 
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getDaysLeft(data.deadline)} days left
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
                <div className="flex items-center gap-4 text-white/90">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{data.company}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{data.location}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Job Details */}
            <section className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Job Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Company</p>
                    <p className="text-sm font-semibold text-slate-900">{data.company}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
                    <p className="text-sm font-semibold text-slate-900">{data.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012 3a9.001 9.001 0 00-9 9.255V15H3v6h6v-6h4.5V21h6v-6h3v-1.745z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Employment Type</p>
                    <p className="text-sm font-semibold text-slate-900">{normalizedType}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Description Section */}
            <section className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Job Description</h2>
              {descriptionParagraphs.length > 0 ? (
                <div className="prose prose-slate max-w-none">
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-base leading-relaxed text-slate-600 mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-base text-slate-500">No job description provided.</p>
              )}
            </section>

            {/* Skills Section */}
            {(data.skills ?? []).length > 0 && (
              <section className="rounded-3xl bg-white p-6 shadow-lg border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-900 mb-6">Required Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OpportunityDetailSidebar
