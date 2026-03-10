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
    postedById: '',
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
    postedById: source.postedById ?? source.createdBy ?? source.userId ?? '',
  }
}

const Opportunities = ({ filter }) => {

  const { user, role } = useAuth()
  const navigate = useNavigate()

  const normalizedRole = role?.toLowerCase() ?? null
  const canPostOpportunity = normalizedRole === "alumni"

  const { items, loading, error, refresh } = useOpportunities()

  const {
    referrals,
    loading: referralsLoading,
    refresh: refreshReferrals,
    referralMap,
  } = useMyOpportunityReferrals()


  /* ---------- UI STATES ---------- */

  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const [typeFilter, setTypeFilter] = useState("all")
  const [modeFilter, setModeFilter] = useState("all")
  const [workTypeFilter, setWorkTypeFilter] = useState("all")

  const [referralModal, setReferralModal] = useState({
    isOpen: false,
    opportunity: null,
    referral: null
  })


  /* ---------- NORMALIZE DATA ---------- */

  const normalizedOpportunities = useMemo(() => {
    return items.map((item) => normalizeOpportunity(item))
  }, [items])


  /* ---------- FILTER LOGIC ---------- */

  const filtered = useMemo(() => {

    // Filter out opportunities that don't have required data or that might cause API errors
    const validOpportunities = normalizedOpportunities.filter(opportunity => 
      opportunity && 
      opportunity.id && 
      opportunity.title && 
      opportunity.company
    )

    return validOpportunities.filter((opportunity) => {

      const searchMatch =
        searchTerm === "" ||
        `${opportunity.title} ${opportunity.company} ${opportunity.location}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())


      const typeMatch =
        typeFilter === "all" ||
        (typeFilter === "job" &&
          ["full-time", "part-time", "contract"].includes(opportunity.type)) ||
        (typeFilter === "internship" &&
          ["internship", "intern"].includes(opportunity.type))


      const workTypeMatch =
        workTypeFilter === "all" ||
        opportunity.type === workTypeFilter


      const modeMatch =
        modeFilter === "all" ||
        opportunity.location?.toLowerCase().includes(modeFilter)


      return searchMatch && typeMatch && workTypeMatch && modeMatch

    })

  }, [
    normalizedOpportunities,
    searchTerm,
    typeFilter,
    modeFilter,
    workTypeFilter
  ])


  /* ---------- REFERRAL HANDLERS ---------- */

  const handleOpenReferral = (opportunity) => {
    // Only open referral modal if user is authenticated and opportunity is valid
    if (!user || !opportunity?.id) {
      console.error('Cannot open referral: User not authenticated or invalid opportunity')
      return
    }
    
    const referral = referralMap[opportunity.id]
    setReferralModal({
      isOpen: true,
      opportunity,
      referral: referral ?? null
    })
  }

  const handleCloseReferral = () => {
    setReferralModal({
      isOpen: false,
      opportunity: null,
      referral: null
    })
  }

  const handleReferralSubmitted = () => {
    // Only refresh if user is authenticated
    if (user) {
      refreshReferrals()
      refresh()
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 ">
      <div className="container mx-auto px-1 py-1 max-w-7xl">
        <div className="space-y-2">
          {/* Header Section */}
          <header className="max-w-5xl mx-auto text-center py-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
              Opportunity Hub
            </p>

            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
              Career Opportunities
            </h1>

           

            {normalizedRole === "alumni" && (
              <div className="mt-5">
                <button
                  onClick={() => navigate("/dashboard/opportunities/post")}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      d="M12 4v16m8-8H4" />
                  </svg>

                  Post Opportunity
                </button>
              </div>
            )}

          </header>

          {/* Error State */}
          {error && (
            <div className="border border-red-300 text-red-600 px-4 py-3 rounded mb-6 flex justify-between items-center">
              <span>{error.message ?? "Unable to load opportunities."}</span>
              <button
                onClick={refresh}
                className="text-sm border px-3 py-1 rounded hover:bg-red-50"
              >
                Retry
              </button>
            </div>
          )}

          {/* Search + Filter */}
          <section className="max-w-5xl mx-auto mb-10">

            <div className="flex gap-3 items-center">

              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search opportunities..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:outline-none"
                />

                <svg
                  className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="border border-gray-300 px-5 py-3 rounded-lg font-medium"
              >
                Filter
              </button>

            </div>


            {/* Filters Panel */}
            {showFilters && (

              <div className="mt-6 grid md:grid-cols-3 gap-4 border border-gray-200 p-6 rounded-lg">

                {/* Opportunity Type */}
                <div>
                  <label className="text-sm font-semibold">
                    Opportunity Type
                  </label>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full mt-2 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="job">Job</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>


                {/* Work Mode */}
                <div>
                  <label className="text-sm font-semibold">
                    Work Mode
                  </label>

                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="w-full mt-2 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>


                {/* Work Type */}
                <div>
                  <label className="text-sm font-semibold">
                    Work Type
                  </label>

                  <select
                    value={workTypeFilter}
                    onChange={(e) => setWorkTypeFilter(e.target.value)}
                    className="w-full mt-2 border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="all">All</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>

              </div>

            )}

          </section>


          {/* Opportunity Cards */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {loading ? (
              <div className="text-center py-10 text-gray-400">
                Loading opportunities...
              </div>
            ) : filtered.length ? (

              filtered.map((opportunity, index) => {

                const opportunityId = opportunity.id || opportunity._id
                const referralRecord = referralMap?.[opportunityId]

                return (

                  <Link
                    key={`${opportunityId}-${index}`}
                    to={`/dashboard/opportunities/${opportunityId}`}
                    className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >

                    {/* Type + Deadline */}
                    <div className="flex items-center justify-between mb-4">

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${opportunity.type === "internship"
                          ? "bg-amber-100 text-amber-700"
                          : isJobType(opportunity.type)
                            ? "bg-primary/10 text-primary"
                            : "bg-slate-100 text-slate-700"
                          }`}
                      >
                        {opportunity.type === "internship"
                          ? "Internship"
                          : opportunity.type === "full-time"
                            ? "Full-time"
                            : opportunity.type === "part-time"
                              ? "Part-time"
                              : opportunity.type}
                      </span>

                      <div className="flex flex-col items-end gap-2">
                        {renderDeadlineBadge(opportunity.deadline, opportunity.postedAt)}

                        {normalizedRole === "student" && referralRecord && (
                          <OpportunityReferralBadge referral={referralRecord} />
                        )}

                      </div>

                    </div>


                    {/* Title + Company */}
                    <div className="mb-4">

                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {opportunity.title}
                      </h3>

                      <p className="text-sm font-medium text-slate-600 mb-1">
                        {opportunity.company}
                      </p>

                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        {opportunity.location || "Flexible"}
                      </p>

                    </div>


                    {/* Skills */}
                    {opportunity.skills?.length > 0 && (

                      <div className="mb-4">

                        <div className="flex flex-wrap gap-2">

                          {opportunity.skills.map((skill, index) => (
                            <span
                              key={`${skill}-${index}`}
                              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}

                        </div>

                      </div>

                    )}


                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-sm text-slate-600">
                        {truncateText(opportunity.description)}
                      </p>
                    </div>


                    {/* Posted By */}
                    {opportunity.postedBy && (

                      <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 mb-4">

                        <svg
                          className="h-3.5 w-3.5 text-primary"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>

                        <span className="font-semibold text-slate-700">
                          Posted by:
                        </span>

                        <span className="font-semibold text-primary">
                          {opportunity.postedBy}
                        </span>

                      </div>

                    )}


                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">

                      {normalizedRole === "student" && (

                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault()
                            handleOpenReferral(opportunity)
                          }}
                          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                        >
                          {referralRecord ? "Update Referral" : "Request Referral"}
                        </button>

                      )}

                      <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">

                        View Details

                        <svg
                          className="h-3.5 w-3.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M9 18l6-6-6-6" />
                        </svg>

                      </span>

                    </div>

                  </Link>

                )

              })

            ) : (

              <div className="text-center py-10 col-span-full">

                <p className="text-gray-500 mb-4">
                  No opportunities found
                </p>

                <button
                  onClick={() => {
                    setSearchTerm("")
                    setTypeFilter("all")
                    setModeFilter("all")
                    setWorkTypeFilter("all")
                  }}
                  className="border px-4 py-2 rounded"
                >
                  Clear Filters
                </button>

              </div>

            )}

          </section>
        </div>
      </div>
      <OpportunityReferralModal
        isOpen={referralModal.isOpen && user}
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
