import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useOpportunities from '../../hooks/useOpportunities'
import useMyOpportunityReferrals from '../../hooks/useMyOpportunityReferrals'
import { useAuth } from '../../context/AuthContext'
import OpportunityReferralModal from '../../components/user/opportunities/OpportunityReferralModal'
import OpportunityReferralBadge from '../../components/user/opportunities/OpportunityReferralBadge'

const TABS = [
  { label: 'Jobs', value: 'jobs' },
  { label: 'Internships', value: 'internships' },
]

const getDeadlineStatus = (deadline) => {
  if (!deadline) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const deadlineDate = new Date(deadline)
  if (Number.isNaN(deadlineDate.getTime())) return null
  deadlineDate.setHours(0, 0, 0, 0)

  const diffDays = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return {
      label: `Expired${deadlineDate ? ` • ${deadlineDate.toLocaleDateString()}` : ''}`,
      tone: 'expired',
    }
  }

  if (diffDays === 0) {
    return {
      label: 'Ends today',
      tone: 'today',
    }
  }

  const label = diffDays === 1 ? '1 day left' : `${diffDays} days left`
  const tone = diffDays <= 7 ? 'soon' : diffDays <= 30 ? 'upcoming' : 'default'

  return { label, tone }
}

const isJobType = (type) => ['full-time', 'part-time', 'contract'].includes(type)

const isInternshipType = (type) => ['internship', 'intern'].includes(type)

const getOpportunityFromItem = (entry) => {
  if (!entry) return null
  return entry.opportunity ?? entry
}

const getOpportunityId = (entry) => {
  const opportunity = getOpportunityFromItem(entry)
  if (!opportunity) return ''
  return opportunity.id ?? opportunity._id ?? ''
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

const truncateText = (value, maxLength = 160) => {
  if (!value) return ''
  const trimmed = value.trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength).trim()}...`
}

const renderDeadlineBadge = (deadline, postedAt) => {
  const info = getDeadlineStatus(deadline)
  if (!info) return null

  const toneClassMap = {
    expired: 'bg-rose-100 text-rose-700',
    today: 'bg-amber-100 text-amber-700',
    soon: 'bg-amber-100 text-amber-700',
    upcoming: 'bg-emerald-100 text-emerald-700',
    default: 'bg-emerald-100 text-emerald-700',
  }

  const badgeClass = toneClassMap[info.tone] ?? toneClassMap.default

  return (
    <div className="flex flex-col items-end">
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badgeClass}`}>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {info.label}
      </span>
      {postedAt ? <span className="text-xs text-slate-400 mt-1">{getPostedTime(postedAt)}</span> : null}
    </div>
  )
}

const formatDateTime = (value) => {
  if (!value) return null
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch (error) {
    return null
  }
}

const normalizeOpportunity = (source = {}) => {
  if (!source) return {
    id: '',
    title: '',
    company: '',
    type: 'opportunity',
    location: '',
    description: '',
    skills: [],
    contactEmail: '',
    deadline: null,
    isRemote: false,
    postedAt: null,
    postedBy: '',
  }

  const id = source.id ?? source._id ?? ''
  const type = typeof source.type === 'string' ? source.type.toLowerCase() : 'opportunity'
  const rawLocation = typeof source.location === 'string' ? source.location.trim() : ''
  const location = rawLocation || (source.isRemote ? 'Remote' : '')

  return {
    id,
    title: source.title ?? '',
    company: source.company ?? '',
    type,
    location,
    description: source.description ?? '',
    skills: Array.isArray(source.skills) ? source.skills : [],
    contactEmail: source.contactEmail ?? '',
    deadline: source.deadline ?? null,
    isRemote: Boolean(source.isRemote),
    postedAt: source.postedAt ?? source.createdAt ?? null,
    postedBy: source.postedBy ?? source.createdByName ?? '',
  }
}

const Opportunities = ({ filter }) => {
  const { role } = useAuth()
  const navigate = useNavigate()
  const normalizedRole = role?.toLowerCase() ?? null
  const canPostOpportunity = normalizedRole === 'alumni' || normalizedRole === 'faculty'
  const { items, loading, error, refresh } = useOpportunities()
  const {
    referrals,
    loading: referralsLoading,
    error: referralsError,
    refresh: refreshReferrals,
    referralMap,
  } = useMyOpportunityReferrals()
  const [activeTab, setActiveTab] = useState('jobs')
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [referralModal, setReferralModal] = useState({ isOpen: false, opportunity: null, referral: null })
  const [localReferrals, setLocalReferrals] = useState({})
  const combinedReferrals = useMemo(
    () => ({
      ...referralMap,
      ...localReferrals,
    }),
    [referralMap, localReferrals],
  )
  const normalizedOpportunities = useMemo(() => items.map((item) => normalizeOpportunity(item)), [items])

  useEffect(() => {
    if (!referralMap || Object.keys(referralMap).length === 0) return

    setLocalReferrals((prev) => {
      if (!prev || Object.keys(prev).length === 0) {
        return prev
      }

      let changed = false
      const next = { ...prev }

      Object.keys(referralMap).forEach((key) => {
        if (next[key]) {
          delete next[key]
          changed = true
        }
      })

      return changed ? next : prev
    })
  }, [referralMap])

  const jobs = useMemo(
    () => normalizedOpportunities.filter((item) => item.type === 'full-time' || item.type === 'part-time' || item.type === 'contract'),
    [normalizedOpportunities],
  )

  const internships = useMemo(
    () => normalizedOpportunities.filter((item) => item.type === 'internship' || item.type === 'intern' || item.type === 'internship'),
    [normalizedOpportunities],
  )

  const applications = useMemo(() => {
    if (!Array.isArray(referrals)) return []

    return referrals
      .map((entry) => {
        const normalizedOpportunity = normalizeOpportunity(entry.opportunity)
        return {
          id: entry.id,
          opportunity: normalizedOpportunity,
          status: entry.status,
          submittedAt: entry.submittedAt,
          updatedAt: entry.updatedAt,
          resumeUrl: entry.resumeUrl,
          proposal: entry.proposal,
        }
      })
      .filter((entry) => Boolean(entry.opportunity?.id))
  }, [referrals])

  useEffect(() => {
    if (filter === 'internship') {
      setActiveTab('internships')
    } else if (filter === 'full-time' || filter === 'part-time') {
      setActiveTab('jobs')
    }
  }, [filter])

  const availableLocations = useMemo(() => {
    const set = new Set()

    normalizedOpportunities.forEach((item) => {
      if (item.location) {
        set.add(item.location)
      }
    })

    applications.forEach((entry) => {
      const location = entry.opportunity?.location
      if (location) {
        set.add(location)
      }
    })

    return ['all', ...Array.from(set)]
  }, [normalizedOpportunities, applications])

  const stats = useMemo(() => {
    return {
      jobs: normalizedOpportunities.filter((item) => isJobType(item.type)).length,
      internships: normalizedOpportunities.filter((item) => isInternshipType(item.type)).length,
      applications: applications.length,
    }
  }, [normalizedOpportunities, applications])

  const activeCollection = useMemo(() => {
    switch (activeTab) {
      case 'internships':
        return internships
      case 'jobs':
      default:
        return jobs
    }
  }, [activeTab, jobs, internships])

  const filtered = useMemo(() => {
    return activeCollection.filter((item) => {
      const opportunity = item.opportunity ?? item
      const normalizedSearch = searchTerm.trim().toLowerCase()
      const matchesSearch = normalizedSearch
        ? [opportunity.title, opportunity.company, opportunity.location, ...(opportunity.skills ?? [])]
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)
        : true
      const matchesLocation = locationFilter === 'all' ? true : opportunity.location === locationFilter
      return matchesSearch && matchesLocation
    })
  }, [activeCollection, locationFilter, searchTerm])

  const handleOpenReferral = (opportunity) => {
    const referral = referralMap[opportunity.id]
    setReferralModal({ isOpen: true, opportunity, referral: referral ?? null })
  }

  const handleCloseReferral = () => {
    setReferralModal({ isOpen: false, opportunity: null, referral: null })
  }

  const handleReferralSubmitted = (result) => {
    if (result?.opportunity) {
      refreshReferrals()
    }
    refresh?.()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Header Section */}
          <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary-dark to-primary/90 p-8 text-white shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012 3a9.001 9.001 0 00-9 9.255V15H3v6h6v-6h4.5V21h6v-6h3v-1.745z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium uppercase tracking-widest text-white/80">Opportunity Hub</p>
                    <h1 className="text-4xl font-bold text-white">Career Opportunities</h1>
                  </div>
                </div>
                <p className="text-lg text-white/90 leading-relaxed">
                  Discover curated roles shared by our alumni network and faculty members. Find your next career opportunity with trusted connections.
                </p>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <span className="text-sm text-white/80">{stats.jobs} Job Listings</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm text-white/80">{stats.internships} Internships</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className="text-sm text-white/80">{stats.applications} My Applications</span>
                  </div>
                </div>
              </div>
              {canPostOpportunity && (
                <div className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/opportunities/post')}
                    className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-bold text-primary shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Post Opportunity
                    </span>
                  </button>
                  <p className="text-xs text-white/70 text-center">Share opportunities with students</p>
                </div>
              )}
            </div>
          </header>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600 shadow-lg">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{error.message ?? 'Unable to load opportunities right now.'}</p>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      {/* Controls Section */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2 rounded-full bg-slate-100 p-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.value
              const counter = stats[tab.value]
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
                    isActive ? 'bg-white text-primary shadow-md' : 'text-slate-600 hover:text-primary hover:bg-white/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
                    {counter ?? 0}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={activeTab === 'applications' ? 'Search applications...' : 'Search opportunities...'}
                className="w-72 rounded-full border border-slate-200 px-4 py-2.5 pl-10 text-sm text-slate-600 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
            </div>
            <select
              value={locationFilter}
              onChange={(event) => setLocationFilter(event.target.value)}
              className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {availableLocations.map((location) => (
                <option key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading || referralsLoading ? (
          <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center text-sm text-slate-400">
            Loading opportunities...
          </div>
        ) : filtered.length ? (
          filtered.map((item, index) => {
            const opportunity = getOpportunityFromItem(item)
            if (!opportunity) return null

            const opportunityId = getOpportunityId(item)
            const referralRecord = combinedReferrals[opportunityId]

            return (
              <Link
                key={`${opportunityId}-${index}`}
                to={`/dashboard/opportunities/${opportunityId}`}
                className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      opportunity.type === 'internship'
                        ? 'bg-amber-100 text-amber-700'
                        : isJobType(opportunity.type)
                        ? 'bg-primary/10 text-primary'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {activeTab === 'applications'
                      ? opportunity.type === 'internship'
                        ? 'Internship'
                        : isJobType(opportunity.type)
                        ? 'Job'
                        : opportunity.type
                      : opportunity.type === 'internship'
                      ? 'Internship'
                      : opportunity.type === 'full-time'
                      ? 'Full-time'
                      : opportunity.type === 'part-time'
                      ? 'Part-time'
                      : opportunity.type}
                  </span>
                  <div className="flex flex-col items-end gap-2">
                    {renderDeadlineBadge(opportunity.deadline, opportunity.postedAt)}
                    {(normalizedRole === 'student' || normalizedRole) && referralRecord ? <OpportunityReferralBadge referral={referralRecord} /> : null}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{opportunity.title}</h3>
                  <p className="text-sm font-medium text-slate-600 mb-1">{opportunity.company}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-400">{opportunity.location ?? 'Flexible'}</p>
                </div>

                {(opportunity.skills ?? []).length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {opportunity.skills.map((skill, index) => (
                        <span key={`${skill}-${index}`} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-slate-600">{truncateText(opportunity.description)}</p>
                </div>

                {opportunity.postedBy && (
                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 mb-4">
                    <svg className="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-semibold text-slate-700">Posted by:</span>
                    <span className="font-semibold text-primary">{opportunity.postedBy}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {(normalizedRole === 'student' || normalizedRole) && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault()
                        handleOpenReferral(opportunity)
                      }}
                      className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                    >
                      {referralRecord ? 'Update Referral' : 'Request Referral'}
                    </button>
                  )}
                  <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
                    View Details
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </span>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012 3a9.001 9.001 0 00-9 9.255V15H3v6h6v-6h4.5V21h6v-6h3v-1.745z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No opportunities match your filters</h3>
            <p className="text-sm text-slate-500 mb-4">
              Try adjusting your search, selecting a different location, or clearing the filters.
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setLocationFilter('all')
              }}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>
        </div>
      </div>
      <OpportunityReferralModal
        isOpen={referralModal.isOpen}
        opportunity={referralModal.opportunity}
        initialReferral={referralModal.referral}
        onClose={handleCloseReferral}
        onSubmitted={handleReferralSubmitted}
      />
    </div>
  )
}

const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.65" y2="16.65" />
  </svg>
)

export default Opportunities
