import { useNavigate, useParams } from 'react-router-dom'
import { useOpportunity } from '../../hooks/useOpportunities'
import { useState } from 'react'

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

const OpportunityDetailImproved = () => {
  const { opportunityId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useOpportunity(opportunityId)
  const [isExpanded, setIsExpanded] = useState(false)
  
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
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-primary animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="space-y-3">
            <div className="w-64 h-3 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="w-48 h-3 bg-slate-200 rounded-full animate-pulse"></div>
            <div className="w-56 h-3 bg-slate-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Opportunity Not Found</h3>
            <p className="text-sm text-slate-600 mb-4">{error?.message ?? 'This opportunity may have been removed or is no longer available.'}</p>
            <button
              onClick={() => navigate('/dashboard/opportunities')}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-dark hover:shadow-lg hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Opportunities
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Back Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard/opportunities')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-all duration-200 group"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="group-hover:text-primary">Back to Opportunities</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
            <button className="p-2 rounded-full hover:bg-white/50 transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m0 0A9.001 9.001 0 0012 21c4.474 0 8.268-3.12 9.032-7.326" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Layout with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-8 space-y-6">
              {/* Apply Card with Enhanced Design */}
              <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Apply Now</h3>
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                </div>
                
                {data.deadline && (
                  <div className={`p-4 rounded-2xl mb-6 ${
                    getDaysLeft(data.deadline) <= 3 
                      ? 'bg-rose-50 border border-rose-200' 
                      : getDaysLeft(data.deadline) <= 7 
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-emerald-50 border border-emerald-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        getDaysLeft(data.deadline) <= 3 
                          ? 'bg-rose-100' 
                          : getDaysLeft(data.deadline) <= 7 
                          ? 'bg-amber-100'
                          : 'bg-emerald-100'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          getDaysLeft(data.deadline) <= 3 
                            ? 'text-rose-600' 
                            : getDaysLeft(data.deadline) <= 7 
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getDaysLeft(data.deadline)} days left
                        </p>
                        <p className="text-xs text-slate-600">to apply</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {data.contactEmail && (
                    <a
                      href={`mailto:${data.contactEmail}`}
                      className="w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-4 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-105 hover:from-primary-dark hover:to-primary"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Email Contact
                    </a>
                  )}
                  <button className="w-full inline-flex items-center justify-center rounded-2xl border-2 border-primary px-6 py-4 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-lg hover:scale-105">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Request Referral
                  </button>
                </div>
              </div>

              {/* Enhanced Timeline */}
              <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Timeline</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4 group">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="absolute top-10 left-5 w-0.5 h-6 bg-slate-200"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm mb-1">Application Deadline</p>
                      <p className="text-xs text-slate-600">
                        {data.deadline ? new Date(data.deadline).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-110">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-sm mb-1">Posted Date</p>
                      <p className="text-xs text-slate-600">
                        {data.postedAt ? getPostedTime(data.postedAt) : 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Posted By */}
              {data.postedBy && (
                <div className="rounded-3xl bg-white p-6 shadow-xl border border-slate-200/50 backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-6">Posted By</h3>
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{data.postedBy}</p>
                      <p className="text-xs text-slate-600">{data.createdByRole || 'Community Member'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Enhanced Job Header Card */}
            <section className="rounded-3xl bg-white shadow-2xl border border-slate-200/50 overflow-hidden backdrop-blur-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-dark to-primary/90"></div>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 p-8 text-white">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="max-w-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-lg ${
                          data.type === 'internship' ? 'bg-amber-400 text-amber-900' : 'bg-white/20 text-white backdrop-blur-sm'
                        }`}>
                          {normalizedType}
                        </span>
                        {data.deadline && (
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold shadow-lg ${
                            getDaysLeft(data.deadline) <= 3 
                              ? 'bg-rose-400 text-rose-900' 
                              : getDaysLeft(data.deadline) <= 7 
                              ? 'bg-amber-400 text-amber-900'
                              : 'bg-emerald-400 text-emerald-900'
                          }`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {getDaysLeft(data.deadline)} days left
                          </span>
                        )}
                      </div>
                      <h1 className="text-4xl font-bold mb-4 leading-tight">{data.title}</h1>
                      <div className="flex flex-wrap items-center gap-6 text-white/90">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium">{data.company}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium">{data.location}</span>
                        </div>
                      </div>
                      {data.postedAt && (
                        <p className="text-sm text-white/70 mt-3">Posted {getPostedTime(data.postedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Enhanced Job Details Grid */}
            <section className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/50 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Job Details
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="group">
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 transition-all duration-200 hover:shadow-lg hover:scale-105">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Company</p>
                      <p className="text-lg font-bold text-slate-900">{data.company}</p>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 transition-all duration-200 hover:shadow-lg hover:scale-105">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Location</p>
                      <p className="text-lg font-bold text-slate-900">{data.location}</p>
                    </div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 transition-all duration-200 hover:shadow-lg hover:scale-105">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012 3a9.001 9.001 0 00-9 9.255V15H3v6h6v-6h4.5V21h6v-6h3v-1.745z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Employment Type</p>
                      <p className="text-lg font-bold text-slate-900">{normalizedType}</p>
                    </div>
                  </div>
                </div>

                {data.contactEmail && (
                  <div className="group">
                    <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 transition-all duration-200 hover:shadow-lg hover:scale-105">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Contact Email</p>
                        <p className="text-lg font-bold text-slate-900">{data.contactEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Enhanced Description Section */}
            <section className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/50 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  Job Description
                </h2>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                >
                  {isExpanded ? 'Show Less' : 'Read More'}
                </button>
              </div>
              
              {descriptionParagraphs.length > 0 ? (
                <div className={`prose prose-slate max-w-none ${!isExpanded ? 'max-h-64 overflow-hidden' : ''}`}>
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-base leading-relaxed text-slate-600 mb-4">
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-base text-slate-500">No job description provided.</p>
                </div>
              )}
            </section>

            {/* Enhanced Skills Section */}
            {(data.skills ?? []).length > 0 && (
              <section className="rounded-3xl bg-white p-8 shadow-xl border border-slate-200/50 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {data.skills.map((skill, index) => (
                    <span
                      key={skill}
                      className="group relative inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 px-5 py-3 text-sm font-bold text-primary transition-all duration-200 hover:scale-105 hover:shadow-lg hover:border-primary/40"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span className="relative z-10">{skill}</span>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
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

export default OpportunityDetailImproved
