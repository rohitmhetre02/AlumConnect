import { useCallback, useMemo, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import MentorFilterBar from '../../components/user/mentorship/MentorFilterBar'
import MentorCard from '../../components/user/mentorship/MentorCard'
import { useAuth } from '../../context/AuthContext'
import { useMentors } from '../../hooks/useMentors'
import { useMentorServices } from '../../hooks/useMentorServices'
import { useMentorResources } from '../../hooks/useMentorResources'
import { useMentorSessions } from '../../hooks/useMentorSessions'
import { useMentorRequests } from '../../hooks/useMentorRequests'
import MentorPanelDashboard from './MentorPanelDashboard'
          
const FILTER_DEFAULTS = {
  experience: [],
  rating: [],
  availability: [],
  tags: [],
}

const FILTER_SECTIONS = [
  {
    key: 'experience',
    label: 'Experience Level',
    options: ['0-3 years', '4-7 years', '8-12 years', '12+ years'],
    description: 'Match mentors by professional tenure.',
  },
  {
    key: 'rating',
    label: 'Mentor Rating',
    options: ['4.0 and above', '4.5 and above', 'Top rated'],
    description: 'Filter based on community feedback averages.',
  },
  {
    key: 'availability',
    label: 'Preferred Mode',
    options: ['Video Call', 'Chat / Email', 'In person'],
    description: 'Find mentors offering your ideal session type.',
  },
]

const toList = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const applicationSteps = [
  { label: 'Basic Info', caption: 'Step 1: Basic Information' },
  { label: 'Professional', caption: 'Step 2: Professional Details' },
  { label: 'Preferences', caption: 'Step 3: Mentorship Preferences' },
]

const industryOptions = ['IT', 'Finance', 'Core', 'Startup', 'Government', 'Other']

const skillOptions = ['React', 'Java', 'Data Science', 'DevOps', 'MBA', 'UI/UX']

const mentorshipAreaOptions = [
  'Career Guidance',
  'Placements',
  'Higher Studies',
  'Startup Guidance',
  'Resume Review',
  'Interview Preparation',
]

const degreeOptions = [
  'B.E. Computer Engineering',
  'B.E. Information Technology',
  'B.E. Electronics & Telecommunication',
  'B.E. Mechanical Engineering',
  'B.E. Civil Engineering',
  'B.Tech Computer Engineering',
  'B.Tech Information Technology',
  'M.E. Computer Engineering',
  'M.E. Information Technology',
  'M.Tech Computer Engineering',
  'MCA',
  'Other',
]

const departmentOptions = [
  'Computer Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Telecommunication Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electronics Engineering (VLSI Design And Technology)',
  'Electronics & Communication (Advanced Communication Technology)',
  'School of Architecture',
  'Other',
]

const preferredStudentOptions = ['UG', 'PG', 'Any']

const weeklyHoursOptions = ['1–2 hours', '2–5 hours', '5+ hours']

const mentorshipModeOptions = ['Chat', 'Call', 'Video']

const panelNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'profile', label: 'Manage Profile', icon: 'user' },
  { key: 'mentees', label: 'Mentees & Requests', icon: 'users' },
  { key: 'services', label: 'Services Management', icon: 'settings' },
  { key: 'sessions', label: 'Sessions', icon: 'video' },
  { key: 'resources', label: 'Resources', icon: 'library' },
  { key: 'history', label: 'History', icon: 'history' },
]

const Mentorship = () => {
  const navigate = useNavigate()
  const { panelSection: panelSectionParam } = useParams()
  const { role: userRole, user, updateUser } = useAuth()
  const [search, setSearch] = useState('')
  const [industry, setIndustry] = useState('all industries')
  const [showApplication, setShowApplication] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState(FILTER_DEFAULTS)
  const {
    items: mentors,
    loading: mentorsLoading,
    error: mentorsError,
    apply: submitMentorApplication,
  } = useMentors()

  const normalizedRole = [userRole, user?.role, user?.profile?.role]
    .find((role) => typeof role === 'string' && role.trim())
    ?.toLowerCase()

  const isAlumni = normalizedRole === 'alumni'
  const userProfileId = user?.profile?._id || user?.profile?.id || user?.id || null

  const currentMentorProfile = useMemo(() => {
    if (!userProfileId) return null
    const list = Array.isArray(mentors) ? mentors : []
    return list.find((mentor) => mentor.profileId === userProfileId || mentor.applicationId === userProfileId) ?? null
  }, [mentors, userProfileId])

  const isMentor = Boolean(currentMentorProfile)

  useEffect(() => {
    if (currentMentorProfile && !user?.isMentor) {
      updateUser({
        isMentor: true,
        profile: {
          ...(user?.profile ?? {}),
          isMentor: true,
        },
      })
    }
  }, [currentMentorProfile, updateUser, user?.isMentor, user?.profile])

  const industries = useMemo(() => {
    const set = new Set()
    ;(Array.isArray(mentors) ? mentors : []).forEach((mentor) => {
      // Exclude current user's own mentor profile from industries
      const isOwnProfile = mentor.profileId === userProfileId || 
                          mentor.applicationId === userProfileId || 
                          mentor.id === userProfileId
      if (!isOwnProfile) {
        const value = (mentor.industry ?? '').toLowerCase()
        if (value) set.add(value)
      }
    })
    return Array.from(set).sort()
  }, [mentors, userProfileId])

  const filteredMentors = useMemo(() => {
    const normalized = Array.isArray(mentors) ? mentors : []
    const searchValue = search.trim().toLowerCase()

    return normalized.filter((mentor) => {
      // Exclude current user's own mentor profile
      const isOwnProfile = mentor.profileId === userProfileId || 
                          mentor.applicationId === userProfileId || 
                          mentor.id === userProfileId
      if (isOwnProfile) return false

      const industryValue = (mentor.industry ?? '').toLowerCase()
      const tags = toList(mentor.tags)
      const availabilityOptions = toList(mentor.availability)
      const matchesIndustry = industry === 'all industries' || industryValue === industry
      const matchesSearch =
        !searchValue ||
        tags.some((tag) => tag.toLowerCase().includes(searchValue)) ||
        (mentor.fullName ?? '').toLowerCase().includes(searchValue) ||
        (mentor.position ?? '').toLowerCase().includes(searchValue)

      if (!matchesIndustry || !matchesSearch) return false

      if (filters.experience.length) {
        const experienceLabel = mentor.experience ?? ''
        if (!filters.experience.includes(experienceLabel)) return false
      }

      if (filters.rating.length) {
        const score = Number(mentor.rating ?? 0)
        const passes = filters.rating.some((rule) => {
          if (rule === '4.0 and above') return score >= 4
          if (rule === '4.5 and above') return score >= 4.5
          if (rule === 'Top rated') return score >= 4.8
          return false
        })
        if (!passes) return false
      }

      if (filters.availability.length) {
        if (!filters.availability.some((mode) => availabilityOptions.includes(mode))) return false
      }

      if (filters.tags.length) {
        if (!filters.tags.some((tag) => tags.includes(tag))) return false
      }

      return true
    })
  }, [mentors, industry, search, filters, userProfileId])

  const uniqueTags = useMemo(() => {
    const tagSet = new Set()
    ;(Array.isArray(mentors) ? mentors : []).forEach((mentor) => {
      // Exclude current user's own mentor profile from tags
      const isOwnProfile = mentor.profileId === userProfileId || 
                          mentor.applicationId === userProfileId || 
                          mentor.id === userProfileId
      if (!isOwnProfile) {
        toList(mentor.tags).forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
  }, [mentors, userProfileId])

  const panelComponents = useMemo(
    () => ({
      dashboard: PanelDashboard,
      profile: PanelProfile,
      mentees: PanelMentees,
      services: PanelServices,
      sessions: PanelSessions,
      resources: PanelResources,
      history: PanelHistory,
    }),
    [],
  )

  const panelConfig = useMemo(() => {
    if (!panelSectionParam || !panelComponents[panelSectionParam]) return null
    return panelNavItems.find((item) => item.key === panelSectionParam) ?? null
  }, [panelSectionParam, panelComponents])

  const ActivePanelComponent = panelConfig ? panelComponents[panelConfig.key] : null
  const activePanelLabel = panelConfig?.label ?? ''
  const isBecomeRoute = panelSectionParam === 'become'

  const handleSubmitApplication = useCallback(
    async (payload) => {
      const result = await submitMentorApplication(payload)
      if (result) {
        updateUser({
          isMentor: true,
          profile: {
            ...(user?.profile ?? {}),
            isMentor: true,
          },
        })
      }
      return result
    },
    [submitMentorApplication, updateUser, user?.profile]
  )

  const handleOpenPanel = useCallback(() => {
    setShowApplication(false)
    navigate('/dashboard/mentorship/dashboard')
  }, [navigate])

  useEffect(() => {
    // If user is already a mentor and trying to access become page, redirect to dashboard
    if (isBecomeRoute && isMentor) {
      navigate('/dashboard/mentorship/dashboard', { replace: true })
      return
    }
    setShowApplication(Boolean(isBecomeRoute))
  }, [isBecomeRoute, isMentor, navigate])

  const handleOpenApplication = useCallback(() => {
    if (isBecomeRoute) {
      setShowApplication(true)
    } else {
      navigate('/dashboard/mentorship/become')
    }
  }, [isBecomeRoute, navigate])

  const handleCloseApplication = useCallback(() => {
    setShowApplication(false)
    if (isBecomeRoute) {
      navigate('/dashboard/mentorship', { replace: true })
    }
  }, [isBecomeRoute, navigate])

  return (
    <div className="space-y-8">
      {ActivePanelComponent ? (
        <section className="space-y-6">
          <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Mentor Panel</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{activePanelLabel}</h1>
            <p className="mt-2 text-sm text-slate-500">Manage your mentorship presence.</p>
          </header>
          <ActivePanelComponent />
        </section>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Mentorship Program</h1>
              <p className="text-sm text-slate-500">Connect with mentors from across industries.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  filters.availability.length || filters.experience.length || filters.rating.length || filters.tags.length
                    ? 'border-primary/60 text-primary hover:border-primary hover:text-primary'
                    : 'border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'
                }`}
              >
                Filters
                <svg
                  className={`ml-2 inline h-3 w-3 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 8l5 5 5-5" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/mentorship/ai-match')}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4285f4] via-[#9c47ff] to-[#34a853] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9c47ff]"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                  AI
                </span>
                AI Match Mentor
              </button>
              {isAlumni && !isMentor && (
                <button
                  type="button"
                  onClick={handleOpenApplication}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Apply to be a Mentor
                </button>
              )}
            </div>
          </div>

          <MentorFilterBar
            search={search}
            onSearchChange={setSearch}
            industry={industry}
            onIndustryChange={(value) => setIndustry(value || 'all industries')}
            industries={industries}
            loading={mentorsLoading}
          />

          {showFilters && (
            <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Refine mentors</h2>
                  <p className="text-xs text-slate-500">Combine filters to find the perfect mentor match.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFilters(FILTER_DEFAULTS)
                      setShowFilters(false)
                    }}
                    className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                  >
                    Apply
                  </button>
                </div>
              </header>

              <div className="grid gap-5 lg:grid-cols-3">
                {FILTER_SECTIONS.map((section) => (
                  <article key={section.key} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">{section.label}</h3>
                    <p className="text-xs text-slate-500">{section.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {section.options.map((option) => {
                        const isActive = filters[section.key].includes(option)
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setFilters((prev) => {
                                const next = prev[section.key].includes(option)
                                  ? prev[section.key].filter((item) => item !== option)
                                  : [...prev[section.key], option]
                                return { ...prev, [section.key]: next }
                              })
                            }}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              isActive ? 'bg-primary/10 text-primary' : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {option}
                          </button>
                        )
                      })}
                    </div>
                  </article>
                ))}

                <article className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <h3 className="text-sm font-semibold text-slate-900">Mentor Tags</h3>
                  <p className="text-xs text-slate-500">Focus on mentors with specific expertise labels.</p>
                  <div className="flex flex-wrap gap-2">
                    {uniqueTags.map((tag) => {
                      const isActive = filters.tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() =>
                            setFilters((prev) => {
                              const next = prev.tags.includes(tag)
                                ? prev.tags.filter((item) => item !== tag)
                                : [...prev.tags, tag]
                              return { ...prev, tags: next }
                            })
                          }
                          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                            isActive ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </article>
              </div>
            </section>
          )}

          {mentorsError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-600">
              {mentorsError.message ?? 'Unable to load mentors at this time.'}
            </div>
          )}

          {mentorsLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse space-y-4 rounded-2xl bg-white p-6 text-center shadow-sm"
                >
                  <div className="mx-auto h-20 w-20 rounded-full bg-slate-200" />
                  <div className="mx-auto h-4 w-2/3 rounded bg-slate-200" />
                  <div className="mx-auto h-3 w-1/2 rounded bg-slate-100" />
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: 3 }).map((__, chipIndex) => (
                      <span key={chipIndex} className="h-6 w-16 rounded-full bg-slate-100" />
                    ))}
                  </div>
                  <div className="mx-auto h-9 w-full rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredMentors.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filteredMentors.map((mentor) => {
                const profileKey = mentor.profileId || mentor.id
                const targetId = mentor.applicationId || mentor.id || mentor.profileId
                return (
                  <MentorCard
                    key={profileKey}
                    mentor={mentor}
                    onViewProfile={() => navigate(`/dashboard/mentors/${targetId}`)}
                  />
                )
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <h2 className="text-lg font-semibold text-slate-900">No mentors match your filters yet</h2>
              <p className="mt-2 text-sm text-slate-500">
                Try adjusting your filters or check back later as new mentors join the program.
              </p>
            </div>
          )}
        </>
      )}

      {showApplication && (
        <MentorApplicationModal
          onClose={handleCloseApplication}
          onSubmit={handleSubmitApplication}
          onSuccess={handleOpenPanel}
        />
      )}
    </div>
  )
}

const PanelDashboard = () => <MentorPanelDashboard />

export const PanelProfile = () => {
  const { getMyProfile, updateMyProfile } = useMentors()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  // Section-wise editing states
  const [editingSections, setEditingSections] = useState({
    basic: false,
    professional: false,
    mentorship: false,
    workExperience: false,
    education: false,
    socialMedia: false
  })

  // Social media links state
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    twitter: '',
    github: '',
    portfolio: '',
    facebook: '',
    instagram: ''
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getMyProfile()
        setProfile(data)
        
        // Initialize social links from profile data
        setSocialLinks({
          linkedin: data?.linkedin || '',
          twitter: data?.twitter || '',
          github: data?.github || '',
          portfolio: data?.portfolio || '',
          facebook: data?.facebook || '',
          instagram: data?.instagram || ''
        })
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getMyProfile])

  const toggleSectionEdit = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const saveSection = async (section) => {
    try {
      setSaving(true)
      setError(null)
      
      let updateData = {}
      
      switch(section) {
        case 'basic':
          updateData = {
            fullName: profile.fullName,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            graduationYear: profile.graduationYear,
            degree: profile.degree,
            department: profile.department,
            currentLocation: profile.currentLocation
          }
          break
        case 'professional':
          updateData = {
            currentJobTitle: profile.currentJobTitle,
            company: profile.company,
            industry: profile.industry,
            expertise: profile.expertise
          }
          break
        case 'mentorship':
          updateData = {
            mentorshipMode: profile.mentorshipMode,
            availableDays: profile.availableDays,
            timeCommitment: profile.timeCommitment,
            mentorshipPreference: profile.mentorshipPreference,
            maxMentees: profile.maxMentees
          }
          break
        case 'socialMedia':
          updateData = {
            linkedin: socialLinks.linkedin,
            twitter: socialLinks.twitter,
            github: socialLinks.github,
            portfolio: socialLinks.portfolio,
            facebook: socialLinks.facebook,
            instagram: socialLinks.instagram
          }
          break
        case 'workExperience':
          updateData = { workExperience: profile.workExperience }
          break
        case 'education':
          updateData = { education: profile.education }
          break
      }
      
      const response = await updateMyProfile(updateData)
      const updatedProfile = response.data || response
      setProfile(updatedProfile)
      
      // Update social links state if social media section was saved
      if (section === 'socialMedia') {
        setSocialLinks({
          linkedin: updatedProfile.linkedin || '',
          twitter: updatedProfile.twitter || '',
          github: updatedProfile.github || '',
          portfolio: updatedProfile.portfolio || '',
          facebook: updatedProfile.facebook || '',
          instagram: updatedProfile.instagram || ''
        })
      }
      
      toggleSectionEdit(section)
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} section updated successfully!`)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field) => (value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (platform) => (e) => {
    const value = e.target.value
    setSocialLinks(prev => ({
      ...prev,
      [platform]: value
    }))
  }

  const handleAddExperience = () => {
    setProfile((prev) => ({
      ...prev,
      workExperience: [...(prev.workExperience || []), { company: '', role: '', startDate: '', endDate: '', isCurrentJob: false, description: '' }],
    }))
  }

  const handleUpdateExperience = (index, field, value) => {
    setProfile((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp)),
    }))
  }

  const handleRemoveExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index),
    }))
  }

  const handleAddEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [...(prev.education || []), { 
        institution: '', 
        degree: '', 
        field: '', 
        admissionYear: '', 
        passoutYear: '', 
        cgpa: '', 
        isCurrentlyPursuing: false 
      }],
    }))
  }

  const handleUpdateEducation = (index, field, value) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu)),
    }))
  }

  const handleRemoveEducation = (index) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }))
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-sm text-rose-600">
        {error}
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-500">
        No mentor profile found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-gradient-to-r from-primary/5 to-blue-500/5 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your mentorship presence and connect with mentees</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-500">Status</p>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              {profile.status || 'Active'}
            </span>
          </div>
          {profile.profilePhoto && (
            <img 
              src={profile.profilePhoto} 
              alt="Profile" 
              className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
            />
          )}
        </div>
      </div>

      {/* Basic Information */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              1
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Basic Information</h2>
          </div>
          {editingSections.basic ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleSectionEdit('basic')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveSection('basic')}
                disabled={saving}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => toggleSectionEdit('basic')}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            {editingSections.basic ? (
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={handleChange('fullName')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Your full name"
              />
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.fullName || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
              {profile.email || 'Not provided'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
            {editingSections.basic ? (
              <input
                type="tel"
                value={profile.phoneNumber || ''}
                onChange={handleChange('phoneNumber')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+1 (555) 000-0000"
              />
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.phoneNumber || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Graduation Year</label>
            {editingSections.basic ? (
              <input
                type="text"
                value={profile.graduationYear || ''}
                onChange={handleChange('graduationYear')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="2020"
              />
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.graduationYear || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Degree</label>
            {editingSections.basic ? (
              <select
                value={profile.degree || ''}
                onChange={handleChange('degree')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Degree</option>
                <option value="B.E. Computer Engineering">B.E. Computer Engineering</option>
                <option value="B.E. Information Technology">B.E. Information Technology</option>
                <option value="B.E. Electronics & Telecommunication">B.E. Electronics & Telecommunication</option>
                <option value="B.E. Mechanical Engineering">B.E. Mechanical Engineering</option>
                <option value="B.E. Civil Engineering">B.E. Civil Engineering</option>
                <option value="B.Tech Computer Engineering">B.Tech Computer Engineering</option>
                <option value="B.Tech Information Technology">B.Tech Information Technology</option>
                <option value="M.E. Computer Engineering">M.E. Computer Engineering</option>
                <option value="M.E. Information Technology">M.E. Information Technology</option>
                <option value="M.Tech Computer Engineering">M.Tech Computer Engineering</option>
                <option value="MCA">MCA</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.degree || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
            {editingSections.basic ? (
              <select
                value={profile.department || ''}
                onChange={handleChange('department')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Department</option>
                <option value="Computer Engineering">Computer Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science</option>
                <option value="Electronics & Telecommunication Engineering">Electronics & Telecommunication Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.department || 'Not provided'}
              </div>
            )}
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Location</label>
            {editingSections.basic ? (
              <input
                type="text"
                value={profile.currentLocation || ''}
                onChange={handleChange('currentLocation')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="City, Country"
              />
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.currentLocation || 'Not provided'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              2
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Professional Information</h2>
          </div>
          {editingSections.professional ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => toggleSectionEdit('professional')}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveSection('professional')}
                disabled={saving}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => toggleSectionEdit('professional')}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Current Job Title</label>
            {editingSections.professional ? (
              <input
                type="text"
                value={profile.currentJobTitle || ''}
                onChange={handleChange('currentJobTitle')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Senior Software Engineer"
              />
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.currentJobTitle || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
            {editingSections.professional ? (
              <input
                type="text"
                value={profile.company || ''}
                onChange={handleChange('company')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Tech Corp"
              />
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.company || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Industry</label>
            {editingSections.professional ? (
              <select
                value={profile.industry || ''}
                onChange={handleChange('industry')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Industry</option>
                <option value="IT / Software">IT / Software</option>
                <option value="Core Engineering">Core Engineering</option>
                <option value="Management">Management</option>
                <option value="Government">Government</option>
                <option value="Startup">Startup</option>
                <option value="Research / Academia">Research / Academia</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.industry || 'Not provided'}
              </div>
            )}
          </div>
        </div>

        {/* Skills & Expertise */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Skills & Expertise <span className="text-slate-400 font-normal">({profile.expertise?.length || 0} skills)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {(profile.expertise || []).map((skill, index) => (
              <span
                key={index}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                  isEditing ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {skill}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const updatedSkills = profile.expertise.filter((s) => s !== skill)
                      handleArrayChange('expertise')(updatedSkills)
                    }}
                    className="ml-1 hover:text-primary-dark"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            {isEditing && (
              <input
                type="text"
                placeholder="Add skill and press Enter"
                className="rounded-full border border-slate-200 px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const skill = e.target.value.trim()
                    if (skill && !profile.expertise.includes(skill)) {
                      handleArrayChange('expertise')([...profile.expertise, skill])
                      e.target.value = ''
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mentorship Preferences */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
            3
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Mentorship Preferences</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mentorship Mode</label>
            {editingSections.basic ? (
              <select
                value={profile.mentorshipMode || ''}
                onChange={handleChange('mentorshipMode')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Mode</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="both">Both</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700 capitalize">
                {profile.mentorshipMode || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Available Days</label>
            {editingSections.basic ? (
              <select
                value={profile.availableDays || ''}
                onChange={handleChange('availableDays')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Availability</option>
                <option value="weekdays">Weekdays</option>
                <option value="weekends">Weekends</option>
                <option value="flexible">Flexible</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700 capitalize">
                {profile.availableDays || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Time Commitment</label>
            {editingSections.basic ? (
              <select
                value={profile.timeCommitment || ''}
                onChange={handleChange('timeCommitment')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Commitment</option>
                <option value="1-2">1-2 hours per week</option>
                <option value="3-5">3-5 hours per week</option>
                <option value="on-demand">On demand</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.timeCommitment === '1-2' ? '1-2 hours per week' :
                 profile.timeCommitment === '3-5' ? '3-5 hours per week' :
                 profile.timeCommitment === 'on-demand' ? 'On demand' :
                 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Mentorship Preference</label>
            {editingSections.basic ? (
              <select
                value={profile.mentorshipPreference || ''}
                onChange={handleChange('mentorshipPreference')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Preference</option>
                <option value="students">Students</option>
                <option value="alumni">Alumni</option>
                <option value="both">Both</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700 capitalize">
                {profile.mentorshipPreference || 'Not provided'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Maximum Mentees</label>
            {editingSections.basic ? (
              <select
                value={profile.maxMentees || ''}
                onChange={handleChange('maxMentees')}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select Max Mentees</option>
                <option value="1">1</option>
                <option value="3">3</option>
                <option value="5">5</option>
                <option value="10">10</option>
              </select>
            ) : (
              <div className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-700">
                {profile.maxMentees || 'Not provided'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work Experience Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              4
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Work Experience</h2>
          </div>
          <button
            type="button"
            onClick={handleAddExperience}
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            + Add Experience
          </button>
        </div>
        
        <div className="space-y-4">
          {(profile.workExperience || []).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No work experience added yet</p>
              <p className="text-sm mt-1">Click "Add Experience" to get started</p>
            </div>
          ) : (
            (profile.workExperience || []).map((exp, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Company</label>
                    {editingSections.basic ? (
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => handleUpdateExperience(index, 'company', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Company name"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {exp.company || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                    {editingSections.basic ? (
                      <input
                        type="text"
                        value={exp.role || ''}
                        onChange={(e) => handleUpdateExperience(index, 'role', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Job title"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {exp.role || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                    {editingSections.basic ? (
                      <input
                        type="month"
                        value={exp.startDate || ''}
                        onChange={(e) => handleUpdateExperience(index, 'startDate', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {exp.startDate || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                    {editingSections.basic ? (
                      <div className="space-y-2">
                        <input
                          type="month"
                          value={exp.endDate || ''}
                          onChange={(e) => handleUpdateExperience(index, 'endDate', e.target.value)}
                          disabled={exp.isCurrentJob}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={exp.isCurrentJob || false}
                            onChange={(e) => handleUpdateExperience(index, 'isCurrentJob', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          Currently working here
                        </label>
                      </div>
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {exp.isCurrentJob ? 'Present' : (exp.endDate || 'Not provided')}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    {editingSections.basic ? (
                      <textarea
                        value={exp.description || ''}
                        onChange={(e) => handleUpdateExperience(index, 'description', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        rows={3}
                        placeholder="Brief description of responsibilities and achievements"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {exp.description || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(index)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:text-rose-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Education Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              5
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Education</h2>
          </div>
          <button
            type="button"
            onClick={handleAddEducation}
            className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            + Add Education
          </button>
        </div>
        
        <div className="space-y-4">
          {(profile.education || []).length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No education details added yet</p>
              <p className="text-sm mt-1">Click "Add Education" to get started</p>
            </div>
          ) : (
            (profile.education || []).map((edu, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Institution</label>
                    {editingSections.basic ? (
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => handleUpdateEducation(index, 'institution', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="University name"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {edu.institution || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Degree</label>
                    {editingSections.basic ? (
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => handleUpdateEducation(index, 'degree', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., B.Tech Computer Science"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {edu.degree || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Field/Department</label>
                    {editingSections.basic ? (
                      <input
                        type="text"
                        value={edu.field || ''}
                        onChange={(e) => handleUpdateEducation(index, 'field', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., Computer Science"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {edu.field || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Admission Year</label>
                    {editingSections.basic ? (
                      <input
                        type="number"
                        value={edu.admissionYear || ''}
                        onChange={(e) => handleUpdateEducation(index, 'admissionYear', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., 2020"
                        min="1950"
                        max="2030"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {edu.admissionYear || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Passout Year</label>
                    {editingSections.basic ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          value={edu.passoutYear || ''}
                          onChange={(e) => handleUpdateEducation(index, 'passoutYear', e.target.value)}
                          disabled={edu.isCurrentlyPursuing}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                          placeholder="e.g., 2024"
                          min="1950"
                          max="2030"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={edu.isCurrentlyPursuing || false}
                            onChange={(e) => handleUpdateEducation(index, 'isCurrentlyPursuing', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          />
                          Currently pursuing
                        </label>
                      </div>
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {edu.isCurrentlyPursuing ? 'Currently pursuing' : (edu.passoutYear || 'Not provided')}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">CGPA / Percentage</label>
                    {editingSections.basic ? (
                      <input
                        type="text"
                        value={edu.cgpa || ''}
                        onChange={(e) => handleUpdateEducation(index, 'cgpa', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="e.g., 8.7 CGPA or 85%"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {edu.cgpa || 'Not provided'}
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                    {editingSections.basic ? (
                      <textarea
                        value={edu.description || ''}
                        onChange={(e) => handleUpdateEducation(index, 'description', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        rows={3}
                        placeholder="Achievements, activities, or relevant coursework"
                      />
                    ) : (
                      <div className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-slate-700">
                        {edu.description || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(index)}
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:border-rose-400 hover:text-rose-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      )}
    </div>
  )
}

const PanelMentees = () => {
  const {
    requests,
    loading,
    error,
    refresh,
    getRequestDetails,
    acceptRequest,
    rejectRequest,
    reviewRequest,
    updateMeetingLink,
  } = useMentorRequests()

  const [selectedId, setSelectedId] = useState('')
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [actionState, setActionState] = useState({ id: '', type: '' })
  const [selectedAction, setSelectedAction] = useState(null)
  const [slotOptions, setSlotOptions] = useState(() =>
    Array.from({ length: 3 }, () => ({ slotDate: '', mode: 'online' })),
  )
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0)
  const [scheduleError, setScheduleError] = useState('')
  const [meetingLink, setMeetingLink] = useState('')
  const [meetingLinkError, setMeetingLinkError] = useState('')

  const slotModeOptions = useMemo(
    () => [
      { value: 'online', label: 'Online' },
      { value: 'offline', label: 'Offline' },
      { value: 'hybrid', label: 'Hybrid' },
    ],
    [],
  )

  const formatInputValue = useCallback((value) => {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const tzOffset = date.getTimezoneOffset()
    const local = new Date(date.getTime() - tzOffset * 60 * 1000)
    return local.toISOString().slice(0, 16)
  }, [])

  const resetSlotOptions = useCallback(() => {
    setSlotOptions(Array.from({ length: 3 }, () => ({ slotDate: '', mode: 'online' })))
    setSelectedSlotIndex(0)
  }, [])

  const closeModal = () => {
    if (modalLoading) return
    setSelectedId('')
    setSelectedDetails(null)
    setModalError('')
    setSelectedAction(null)
    setScheduleError('')
    setMeetingLink('')
    setMeetingLinkError('')
    resetSlotOptions()
  }   

  const openDetails = async (requestId, action = null) => {
    setSelectedId(requestId)
    setSelectedAction(action)
    setModalLoading(true)
    setModalError('')
    
    // Reset meeting link state when opening for add-meeting-link action
    if (action === 'add-meeting-link') {
      setMeetingLink('')
      setMeetingLinkError('')
    }
    
    try {
      const details = await getRequestDetails(requestId)
      setSelectedDetails(details)
    } catch (err) {
      setModalError(err?.message ?? 'Unable to load request details.')
    } finally {
      setModalLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedDetails?.request) return

    const { request } = selectedDetails
    
    // Set meeting link if exists
    if (request.meetingLink) {
      setMeetingLink(request.meetingLink)
    }
    
    const initialized = Array.from({ length: 3 }, () => ({ slotDate: '', mode: 'online' }))

    if (request.status === 'accepted' && request.proposedSlots?.length) {
      request.proposedSlots.slice(0, 3).forEach((slot, index) => {
        const slotDate = formatInputValue(slot.slotDate)
        if (slotDate) {
          initialized[index] = {
            slotDate,
            mode: slot.mode || 'online',
          }
        }
      })
    } else {
      const primaryDate = request.preferredDateTime
      const primaryMode = request.preferredMode || 'online'

      if (primaryDate) {
        initialized[0] = {
          slotDate: formatInputValue(primaryDate),
          mode: primaryMode,
        }
      }
    }

    const firstFilledIndex = initialized.findIndex((slot) => slot.slotDate)
    setSlotOptions(initialized)
    setSelectedSlotIndex(firstFilledIndex >= 0 ? firstFilledIndex : 0)
    setScheduleError('')
  }, [selectedDetails, formatInputValue])

  const handleSlotChange = (index, field, value) => {
    setSlotOptions((prev) =>
      prev.map((slot, slotIndex) =>
        slotIndex === index
          ? {
              ...slot,
              [field]: value,
            }
          : slot,
      ),
    )
  }

  const handleAccept = async () => {
    if (!selectedId) return

    // Instead of quick accept, open scheduling modal
    setSelectedAction('accept-schedule')
  }

  const handleAcceptWithSchedule = async () => {
    if (!selectedId) return

    const preparedSlots = slotOptions
      .map((slot) => {
        if (!slot.slotDate) return null
        const candidate = new Date(slot.slotDate)
        if (Number.isNaN(candidate.getTime())) return null
        return {
          slotDate: candidate.toISOString(),
          mode: slot.mode || 'online',
        }
      })
      .filter(Boolean)

    if (!preparedSlots.length) {
      setScheduleError('Provide at least one valid schedule option before accepting.')
      return
    }

    setScheduleError('')
    setActionState({ id: selectedId, type: 'accept' })
    try {
      await acceptRequest(selectedId, {
        proposedSlots: preparedSlots,
      })
      closeModal()
    } catch (err) {
      setScheduleError(err?.message ?? 'Unable to share proposed schedule. Please review options and try again.')
    } finally {
      setActionState({ id: '', type: '' })
    }
  }

  const handleAction = async (requestId, type) => {
    try {
      setActionState({ id: requestId, type })
      
      if (type === 'review') {
        await reviewRequest(requestId)
        closeModal()
      } else if (type === 'reject') {
        await rejectRequest(requestId)
        closeModal()
      }
    } finally {
      setActionState({ id: '', type: '' })
    }
  }

  const handleQuickAccept = async (requestId) => {
    try {
      setActionState({ id: requestId, type: 'accept' })
      
      // Accept with a simple confirmation - mentor will add details later
      await acceptRequest(requestId, {
        proposedSlots: [{
          slotDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          mode: 'online'
        }]
      })
      
      closeModal()
    } catch (err) {
      setModalError(err?.message ?? 'Unable to accept request. Please try again.')
    } finally {
      setActionState({ id: '', type: '' })
    }
  }

  const handleUpdateMeetingLink = async () => {
    if (!selectedId || !meetingLink.trim()) {
      setMeetingLinkError('Meeting link is required.')
      return
    }

    try {
      setActionState({ id: selectedId, type: 'meeting-link' })
      await updateMeetingLink(selectedId, meetingLink.trim())
      setMeetingLinkError('')
    } catch (err) {
      setMeetingLinkError(err?.message ?? 'Unable to update meeting link.')
    } finally {
      setActionState({ id: '', type: '' })
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading requests…</div>
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">
          {error.message ?? 'Unable to load mentee requests.'}
        </div>
      )
    }

    if (!requests.length) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No mentee requests yet</h3>
          <p className="mt-2 text-sm text-slate-500">New mentorship requests will appear here for your review.</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {requests.map((request) => {
          const requestStatus = request.status?.toLowerCase()
          const statusClasses =
            requestStatus === 'confirmed'
              ? 'bg-blue-100 text-blue-600'
              : requestStatus === 'accepted'
              ? 'bg-emerald-100 text-emerald-600'
              : requestStatus === 'rejected'
              ? 'bg-rose-100 text-rose-600'
              : requestStatus === 'review'
              ? 'bg-purple-100 text-purple-600'
              : 'bg-amber-100 text-amber-600'

          const actionDisabled = ['accepted', 'rejected', 'confirmed'].includes(requestStatus)
                const isPending = requestStatus === 'pending'
                const isReview = requestStatus === 'review'

          return (
            <article key={request.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {request.menteeAvatar ? (
                        <img src={request.menteeAvatar} alt={request.menteeName} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        request.menteeName
                          .split(' ')
                          .map((part) => part.charAt(0))
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'M'
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{request.menteeName}</p>
                      <p className="text-xs text-slate-500">{request.menteeEmail || 'Email not shared'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                    {capitalize(request.status)}
                  </span>
                </div>

                <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-700">Requested Service</p>
                    <p className="mt-1 text-sm text-slate-600">{request.serviceName || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Requested At</p>
                    <p className="mt-1 text-sm text-slate-600">{request.createdAt ? request.createdAt.toLocaleString() : '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Preferred Schedule</p>
                    <p className="mt-1 text-sm text-slate-600">{formatDateTime(request.preferredDateTime)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Preferred Mode</p>
                    <p className="mt-1 text-sm text-slate-600">{capitalize(request.preferredMode)}</p>
                  </div>
                </div>

                {request.menteeSkills.length ? (
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {request.menteeSkills.map((skill) => (
                      <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : null}

                {request.notes && <p className="text-sm text-slate-600">“{request.notes}”</p>}

                {request.scheduledDateTime && (
                  <div className="mt-3 rounded-2xl border border-blue-200 bg-blue-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-500">Confirmed Schedule</p>
                    <p className="mt-1 text-sm text-blue-700">
                      {formatDateTime(request.scheduledDateTime)} • {capitalize(request.scheduledMode || request.preferredMode)}
                    </p>
                  </div>
                )}

                {request.meetingLink && (
                  <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-green-500">Meeting Link Shared</p>
                    <p className="mt-1 text-xs text-green-700 break-all">{request.meetingLink}</p>
                  </div>
                )}

                {requestStatus === 'accepted' && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-600">
                    Awaiting mentee confirmation
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 md:flex-col">
                <button
                  type="button"
                  onClick={() => openDetails(request.id)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  View Details
                </button>
                <div className="flex gap-2">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickAccept(request.id)}
                        disabled={actionState.id === request.id && actionState.type === 'accept'}
                        className="rounded-full border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500 hover:text-white disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(request.id, 'review')}
                        disabled={actionState.id === request.id && actionState.type === 'review'}
                        className="rounded-full border border-amber-500 px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-500 hover:text-white disabled:opacity-60"
                      >
                        Review
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(request.id, 'reject')}
                        disabled={actionState.id === request.id && actionState.type === 'reject'}
                        className="rounded-full border border-rose-500 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {isReview && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickAccept(request.id)}
                        disabled={actionState.id === request.id && actionState.type === 'accept'}
                        className="rounded-full border border-emerald-500 px-3 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-500 hover:text-white disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(request.id, 'reject')}
                        disabled={actionState.id === request.id && actionState.type === 'reject'}
                        className="rounded-full border border-rose-500 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:opacity-60"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {requestStatus === 'accepted' && (
                    <button
                      type="button"
                      onClick={() => openDetails(request.id, 'add-meeting-link')}
                      disabled={actionState.id === request.id && actionState.type === 'meeting-link'}
                      className="rounded-full border border-blue-500 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-500 hover:text-white disabled:opacity-60"
                    >
                      Add Meeting Link
                    </button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Mentees & Requests</h2>
          <p className="text-sm text-slate-500">Review new mentorship requests and manage accepted mentees.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
        >
          Refresh
        </button>
      </header>

      {renderContent()}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Request Details</h3>
                <p className="text-xs text-slate-500">Review mentee information before responding.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </div>

            {modalLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading request details…</div>
            ) : modalError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">{modalError}</div>
            ) : selectedDetails ? (
              <div className="space-y-6">
                <section className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/60 p-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mentee</p>
                    <p className="text-base font-semibold text-slate-900">{selectedDetails.request?.menteeName}</p>
                    <p className="text-sm text-slate-500">{selectedDetails.request?.menteeEmail || 'Email not shared'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Requested Service</p>
                    <p className="text-base font-semibold text-slate-900">{selectedDetails.request?.serviceName}</p>
                    <p className="text-sm text-slate-500">Preferred {formatDateTime(selectedDetails.request?.preferredDateTime)} • {capitalize(selectedDetails.request?.preferredMode)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Status</p>
                    <p className="text-sm text-slate-600">{capitalize(selectedDetails.request?.status)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Requested On</p>
                    <p className="text-sm text-slate-600">{selectedDetails.request?.createdAt ? selectedDetails.request.createdAt.toLocaleString() : '—'}</p>
                  </div>
                </section>

                {selectedDetails.request?.menteeSkills?.length ? (
                  <section className="space-y-2 rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mentee Skills & Interests</p>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      {selectedDetails.request.menteeSkills.map((skill) => (
                        <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                ) : null}

                {selectedDetails.request?.notes && (
                  <section className="space-y-2 rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Additional Notes</p>
                    <p className="text-sm text-slate-600">“{selectedDetails.request.notes}”</p>
                  </section>
                )}

                {selectedAction === 'accept-schedule' && selectedDetails?.request && (
                  <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                    <header className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Schedule Mentorship Session</p>
                      <p className="text-xs text-slate-500">Set date, time, and meeting link for this mentorship session.</p>
                    </header>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1 text-sm font-semibold text-slate-700">
                          Session Date & Time
                          <input
                            type="datetime-local"
                            value={formatInputValue(selectedDetails.request.preferredDateTime)}
                            onChange={(e) => {
                              const updatedRequest = {
                                ...selectedDetails.request,
                                preferredDateTime: new Date(e.target.value).toISOString()
                              }
                              setSelectedDetails({ ...selectedDetails, request: updatedRequest })
                            }}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </label>
                        <label className="space-y-1 text-sm font-semibold text-slate-700">
                          Meeting Mode
                          <select
                            value={selectedDetails.request.preferredMode || 'online'}
                            onChange={(e) => {
                              const updatedRequest = {
                                ...selectedDetails.request,
                                preferredMode: e.target.value
                              }
                              setSelectedDetails({ ...selectedDetails, request: updatedRequest })
                            }}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </label>
                      </div>
                      <label className="space-y-1 text-sm font-semibold text-slate-700">
                        Meeting Link
                        <input
                          type="url"
                          value={meetingLink}
                          onChange={(e) => {
                            setMeetingLink(e.target.value)
                            setMeetingLinkError('')
                          }}
                          placeholder="https://zoom.us/j/123456789"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            meetingLinkError ? 'border-rose-300' : 'border-slate-200'
                          }`}
                        />
                        {meetingLinkError && (
                          <p className="text-xs text-rose-500">{meetingLinkError}</p>
                        )}
                      </label>
                      {scheduleError && (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
                          <p className="text-xs text-rose-500">{scheduleError}</p>
                        </div>
                      )}
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={actionState.id === selectedId && actionState.type === 'accept'}
                          className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAcceptWithSchedule}
                          disabled={actionState.id === selectedId && actionState.type === 'accept'}
                          className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                        >
                          {actionState.id === selectedId && actionState.type === 'accept' ? 'Accepting…' : 'Accept & Schedule'}
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {selectedAction === 'add-meeting-link' && selectedDetails?.request && (
                  <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                    <header className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Add Meeting Details</p>
                      <p className="text-xs text-slate-500">Set the final date, time, and meeting link for this mentorship session.</p>
                    </header>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-1 text-sm font-semibold text-slate-700">
                          Final Date & Time
                          <input
                            type="datetime-local"
                            value={formatInputValue(selectedDetails.request.preferredDateTime)}
                            onChange={(e) => {
                              const updatedRequest = {
                                ...selectedDetails.request,
                                preferredDateTime: new Date(e.target.value).toISOString()
                              }
                              setSelectedDetails({ ...selectedDetails, request: updatedRequest })
                            }}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </label>
                        <label className="space-y-1 text-sm font-semibold text-slate-700">
                          Meeting Mode
                          <select
                            value={selectedDetails.request.preferredMode || 'online'}
                            onChange={(e) => {
                              const updatedRequest = {
                                ...selectedDetails.request,
                                preferredMode: e.target.value
                              }
                              setSelectedDetails({ ...selectedDetails, request: updatedRequest })
                            }}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        </label>
                      </div>
                      <label className="space-y-1 text-sm font-semibold text-slate-700">
                        Meeting Link
                        <input
                          type="url"
                          value={meetingLink}
                          onChange={(e) => {
                            setMeetingLink(e.target.value)
                            setMeetingLinkError('')
                          }}
                          placeholder="https://zoom.us/j/123456789"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            meetingLinkError ? 'border-rose-300' : 'border-slate-200'
                          }`}
                        />
                        {meetingLinkError && (
                          <p className="text-xs text-rose-500">{meetingLinkError}</p>
                        )}
                      </label>
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          type="button"
                          onClick={closeModal}
                          disabled={actionState.id === selectedId && actionState.type === 'meeting-link'}
                          className="rounded-full border border-slate-200 px-5 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateMeetingLink}
                          disabled={actionState.id === selectedId && actionState.type === 'meeting-link'}
                          className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                        >
                          {actionState.id === selectedId && actionState.type === 'meeting-link' ? 'Saving…' : 'Save Meeting Details'}
                        </button>
                      </div>
                    </div>
                  </section>
                )}

                {selectedDetails.request?.status === 'pending' && (
                  <div className="flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => handleAction(selectedId, 'reject')}
                      disabled={actionState.id === selectedId && actionState.type === 'reject'}
                      className="rounded-full border border-rose-500 px-5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white disabled:opacity-60"
                    >
                      {actionState.id === selectedId && actionState.type === 'reject' ? 'Rejecting…' : 'Reject'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAccept(selectedId)}
                      disabled={actionState.id === selectedId && actionState.type === 'accept'}
                      className="rounded-full bg-emerald-500 px-5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                    >
                      {actionState.id === selectedId && actionState.type === 'accept' ? 'Accepting…' : 'Accept'}
                    </button>
                  </div>
                )}

                {selectedDetails.session ? (
                  <section className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50/60 p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Session</p>
                    <p className="text-sm text-slate-600">Scheduled {formatDateTime(selectedDetails.session?.sessionDate)} • {formatDuration(selectedDetails.session?.durationMinutes)}</p>
                    <p className="text-sm text-slate-600">Mode: {capitalize(selectedDetails.session?.mode)}</p>
                  </section>
                ) : null}

                {selectedDetails.request?.status === 'confirmed' && (
                  <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                    <header className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Meeting Link</p>
                      <p className="text-xs text-slate-500">Share the video meeting link with your mentee.</p>
                    </header>
                    <div className="space-y-3">
                      <label className="space-y-1 text-sm font-semibold text-slate-700">
                        Meeting Link
                        <input
                          type="url"
                          value={meetingLink}
                          onChange={(e) => {
                            setMeetingLink(e.target.value)
                            setMeetingLinkError('')
                          }}
                          placeholder="https://zoom.us/j/123456789"
                          className={`w-full rounded-2xl border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                            meetingLinkError ? 'border-rose-300' : 'border-slate-200'
                          }`}
                        />
                        {meetingLinkError && (
                          <p className="text-xs font-medium text-rose-500">{meetingLinkError}</p>
                        )}
                      </label>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleUpdateMeetingLink}
                        disabled={actionState.id === selectedId && actionState.type === 'meeting-link'}
                        className="rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                      >
                        {actionState.id === selectedId && actionState.type === 'meeting-link' ? 'Sharing…' : 'Share Link'}
                      </button>
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

const modeOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'hybrid', label: 'Hybrid' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

const emptyService = {
  title: '',
  description: '',
  duration: '',
  price: '',
  mode: 'online',
  status: 'active',
}

const capitalize = (value) => {
  if (!value) return '—'
  const normalized = value.toString().trim().toLowerCase()
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : '—'
}

const formatDateTime = (date) => {
  if (!date) return '—'
  try {
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch (_error) {
    return '—'
  }
}

const formatDuration = (minutes) => {
  if (!minutes || Number.isNaN(Number(minutes))) return '—'
  const total = Number(minutes)
  const hours = Math.floor(total / 60)
  const mins = total % 60
  if (hours && mins) return `${hours}h ${mins}m`
  if (hours) return `${hours}h`
  return `${mins}m`
}

const PanelServices = () => {
  const {
    services,
    loading,
    error,
    createService,
    updateService,
    deleteService,
  } = useMentorServices()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeService, setActiveService] = useState(null)
  const [formValues, setFormValues] = useState(emptyService)
  const [formErrors, setFormErrors] = useState({})

  const openCreateForm = () => {
    setActiveService(null)
    setFormValues(emptyService)
    setFormErrors({})
    setIsFormOpen(true)
  }

  const openEditForm = (service) => {
    setActiveService(service)
    setFormValues({
      title: service.title,
      description: service.description,
      duration: service.duration,
      price: service.price.toString(),
      mode: service.mode,
      status: service.status,
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (submitting) return
    setIsFormOpen(false)
    setFormErrors({})
    setActiveService(null)
  }

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validate = () => {
    const errors = {}
    if (!formValues.title.trim()) errors.title = 'Title is required.'
    if (!formValues.description.trim()) errors.description = 'Description is required.'
    if (!formValues.duration.trim()) errors.duration = 'Duration is required.'
    if (formValues.price === '' || Number.isNaN(Number(formValues.price)) || Number(formValues.price) < 0) {
      errors.price = 'Enter a valid price.'
    }
    if (!formValues.mode) errors.mode = 'Select a mode.'
    if (!formValues.status) errors.status = 'Select a status.'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    try {
      setSubmitting(true)
      const payload = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        duration: formValues.duration.trim(),
        price: Number(formValues.price),
        mode: formValues.mode,
        status: formValues.status,
      }
      if (activeService) {
        await updateService(activeService.id, payload)
      } else {
        await createService(payload)
      }
      setIsFormOpen(false)
      setActiveService(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (serviceId) => {
    if (isDeleting) return
    try {
      setIsDeleting(true)
      await deleteService(serviceId)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">My Mentorship Services</h2>
          <p className="text-sm text-slate-500">Create, update, or archive the sessions you offer mentees.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
        >
          + Add New Service
        </button>
      </header>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading services…</div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">
          {error.message ?? 'Unable to load mentorship services.'}
        </div>
      ) : services.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No services published yet</h3>
          <p className="mt-2 text-sm text-slate-500">Use “Add New Service” to list your first mentorship offering.</p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Create a Service
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {services.map((service) => (
            <article key={service.id} className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{service.title}</h3>
                    <p className="text-xs text-slate-500">{service.duration} • {modeOptions.find((option) => option.value === service.mode)?.label ?? service.mode}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${service.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {service.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{service.description}</p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">₹{service.price.toLocaleString()}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditForm(service)}
                    className="inline-flex items-center gap-1 text-primary transition hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(service.id)}
                    disabled={isDeleting}
                    className="text-rose-500 transition hover:underline disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{activeService ? 'Edit Service' : 'Create Service'}</h3>
                <p className="text-xs text-slate-500">Provide clear details so mentees know what to expect.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Service Title
                  <input
                    value={formValues.title}
                    onChange={handleChange('title')}
                    className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.title ? 'border-rose-300' : 'border-slate-200'}`}
                    placeholder="Mock Interview, Career Clarity, …"
                  />
                  {formErrors.title && <span className="text-xs font-medium text-rose-500">{formErrors.title}</span>}
                </label>
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Duration
                  <input
                    value={formValues.duration}
                    onChange={handleChange('duration')}
                    className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.duration ? 'border-rose-300' : 'border-slate-200'}`}
                    placeholder="45 minutes"
                  />
                  {formErrors.duration && <span className="text-xs font-medium text-rose-500">{formErrors.duration}</span>}
                </label>
              </div>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                Description
                <textarea
                  value={formValues.description}
                  onChange={handleChange('description')}
                  rows={4}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.description ? 'border-rose-300' : 'border-slate-200'}`}
                  placeholder="Outline what mentees will gain from this session."
                />
                {formErrors.description && <span className="text-xs font-medium text-rose-500">{formErrors.description}</span>}
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Price (₹)
                  <input
                    type="number"
                    min="0"
                    value={formValues.price}
                    onChange={handleChange('price')}
                    className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.price ? 'border-rose-300' : 'border-slate-200'}`}
                    placeholder="1499"
                  />
                  {formErrors.price && <span className="text-xs font-medium text-rose-500">{formErrors.price}</span>}
                </label>
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Mode
                  <select
                    value={formValues.mode}
                    onChange={handleChange('mode')}
                    className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.mode ? 'border-rose-300' : 'border-slate-200'}`}
                  >
                    {modeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.mode && <span className="text-xs font-medium text-rose-500">{formErrors.mode}</span>}
                </label>
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Status
                  <select
                    value={formValues.status}
                    onChange={handleChange('status')}
                    className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.status ? 'border-rose-300' : 'border-slate-200'}`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.status && <span className="text-xs font-medium text-rose-500">{formErrors.status}</span>}
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : activeService ? 'Save Changes' : 'Publish Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const PanelSessions = () => (
  <MentorSessionsManager />
)

const MentorSessionsManager = () => {
  const {
    sessions,
    loading,
    error,
    refresh,
    getSessionDetails,
    updateSession,
  } = useMentorSessions()

  const [selectedId, setSelectedId] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')
  const [formValues, setFormValues] = useState({
    sessionDate: '',
    status: 'scheduled',
    mode: 'online',
    durationMinutes: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const openDetails = async (sessionId) => {
    setSelectedId(sessionId)
    setModalLoading(true)
    setModalError('')
    setSelectedSession(null)
    try {
      const details = await getSessionDetails(sessionId)
      setSelectedSession(details)
      setFormValues({
        sessionDate: details.sessionDate ? new Date(details.sessionDate).toISOString().slice(0, 16) : '',
        status: details.status || 'scheduled',
        mode: details.mode || 'online',
        durationMinutes: details.durationMinutes ?? '',
        notes: details.notes || '',
      })
    } catch (err) {
      setModalError(err?.message ?? 'Unable to load session details.')
    } finally {
      setModalLoading(false)
    }
  }

  const closeModal = () => {
    if (submitting) return
    setSelectedId('')
    setSelectedSession(null)
    setModalError('')
    setFormErrors({})
  }

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formValues.sessionDate) errors.sessionDate = 'Session date & time is required.'
    if (!formValues.status) errors.status = 'Select a session status.'
    if (!formValues.mode) errors.mode = 'Select a session mode.'
    if (formValues.durationMinutes !== '' && (Number.isNaN(Number(formValues.durationMinutes)) || Number(formValues.durationMinutes) < 0)) {
      errors.durationMinutes = 'Enter a valid duration in minutes.'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!selectedSession) return
    if (!validateForm()) return

    const payload = {
      sessionDate: formValues.sessionDate ? new Date(formValues.sessionDate).toISOString() : undefined,
      status: formValues.status,
      mode: formValues.mode,
      durationMinutes: formValues.durationMinutes === '' ? undefined : Number(formValues.durationMinutes),
      notes: formValues.notes,
    }

    try {
      setSubmitting(true)
      await updateSession(selectedSession.id, payload)
      setSelectedId('')
      setSelectedSession(null)
      setFormErrors({})
    } finally {
      setSubmitting(false)
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading sessions…</div>
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">
          {error.message ?? 'Unable to load sessions.'}
        </div>
      )
    }

    if (!sessions.length) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No sessions scheduled yet</h3>
          <p className="mt-2 text-sm text-slate-500">Accepted requests and completed sessions will appear here.</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {sessions.map((session) => {
          const statusClasses =
            session.status === 'completed'
              ? 'bg-emerald-100 text-emerald-600'
              : session.status === 'cancelled'
              ? 'bg-rose-100 text-rose-600'
              : 'bg-amber-100 text-amber-600'

          return (
            <article key={session.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {session.menteeName
                        .split(' ')
                        .map((part) => part.charAt(0))
                        .join('')
                        .slice(0, 2)
                        .toUpperCase() || 'M'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{session.menteeName}</p>
                      <p className="text-xs text-slate-500">{session.menteeEmail || 'Email not shared'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                    {capitalize(session.status)}
                  </span>
                </div>

                <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-700">Service</p>
                    <p className="mt-1 text-sm text-slate-600">{session.serviceName || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Session Time</p>
                    <p className="mt-1 text-sm text-slate-600">{formatDateTime(session.sessionDate)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Duration</p>
                    <p className="mt-1 text-sm text-slate-600">{formatDuration(session.durationMinutes)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Mode</p>
                    <p className="mt-1 text-sm text-slate-600">{capitalize(session.mode)}</p>
                  </div>
                </div>

                {session.notes && <p className="text-sm text-slate-600">“{session.notes}”</p>}
              </div>

              <div className="flex items-center gap-3 md:flex-col">
                <button
                  type="button"
                  onClick={() => openDetails(session.id)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  Manage Session
                </button>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Session Management</h2>
          <p className="text-sm text-slate-500">Stay on top of upcoming and completed mentorship sessions.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
        >
          Refresh
        </button>
      </header>

      {renderContent()}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Manage Session</h3>
                <p className="text-xs text-slate-500">Update schedule, status, or notes for this session.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </div>

            {modalLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading session details…</div>
            ) : modalError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">{modalError}</div>
            ) : selectedSession ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <section className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/60 p-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mentee</p>
                    <p className="text-base font-semibold text-slate-900">{selectedSession.menteeName}</p>
                    <p className="text-sm text-slate-500">{selectedSession.menteeEmail || 'Email not shared'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Service</p>
                    <p className="text-base font-semibold text-slate-900">{selectedSession.serviceName || '—'}</p>
                  </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold text-slate-700">
                    Session Date & Time
                    <input
                      type="datetime-local"
                      value={formValues.sessionDate}
                      onChange={handleChange('sessionDate')}
                      className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.sessionDate ? 'border-rose-300' : 'border-slate-200'}`}
                    />
                    {formErrors.sessionDate && <span className="text-xs font-medium text-rose-500">{formErrors.sessionDate}</span>}
                  </label>
                  <label className="space-y-1 text-sm font-semibold text-slate-700">
                    Status
                    <select
                      value={formValues.status}
                      onChange={handleChange('status')}
                      className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.status ? 'border-rose-300' : 'border-slate-200'}`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {formErrors.status && <span className="text-xs font-medium text-rose-500">{formErrors.status}</span>}
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1 text-sm font-semibold text-slate-700">
                    Mode
                    <select
                      value={formValues.mode}
                      onChange={handleChange('mode')}
                      className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.mode ? 'border-rose-300' : 'border-slate-200'}`}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                    {formErrors.mode && <span className="text-xs font-medium text-rose-500">{formErrors.mode}</span>}
                  </label>
                  <label className="space-y-1 text-sm font-semibold text-slate-700">
                    Duration (minutes)
                    <input
                      type="number"
                      min="0"
                      value={formValues.durationMinutes}
                      onChange={handleChange('durationMinutes')}
                      className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.durationMinutes ? 'border-rose-300' : 'border-slate-200'}`}
                      placeholder="e.g., 60"
                    />
                    {formErrors.durationMinutes && <span className="text-xs font-medium text-rose-500">{formErrors.durationMinutes}</span>}
                  </label>
                </div>

                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Session Notes
                  <textarea
                    value={formValues.notes}
                    onChange={handleChange('notes')}
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                    placeholder="Add talking points, agenda, or follow-up notes."
                  />
                </label>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={submitting}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    {submitting ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

const resourceTypeOptions = [
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'link', label: 'Link' },
  { value: 'file', label: 'File' },
  { value: 'image', label: 'Image' },
  { value: 'audio', label: 'Audio' },
  { value: 'document', label: 'Document' },
  { value: 'other', label: 'Other' },
]

const resourceStatusOptions = [
  { value: 'active', label: 'Visible to mentees' },
  { value: 'inactive', label: 'Hidden' },
]

const formatFileSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const PanelResources = () => {
  const {
    resources,
    loading,
    error,
    createResource,
    updateResource,
    deleteResource,
  } = useMentorResources()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [activeResource, setActiveResource] = useState(null)
  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    type: 'pdf',
    status: 'active',
    url: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [formErrors, setFormErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState('')

  const openCreateForm = () => {
    setActiveResource(null)
    setFormValues({ title: '', description: '', type: 'pdf', status: 'active', url: '' })
    setSelectedFile(null)
    setFormErrors({})
    setIsFormOpen(true)
  }

  const openEditForm = (resource) => {
    setActiveResource(resource)
    setFormValues({
      title: resource.title,
      description: resource.description,
      type: resource.type,
      status: resource.status,
      url: resource.url,
    })
    setSelectedFile(null)
    setFormErrors({})
    setIsFormOpen(true)
  }

  const closeForm = () => {
    if (submitting) return
    setIsFormOpen(false)
    setActiveResource(null)
    setFormErrors({})
    setSelectedFile(null)
  }

  const handleInputChange = (field) => (event) => {
    const value = event.target.value
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setSelectedFile(file)
    if (formErrors.file) {
      setFormErrors((prev) => {
        const next = { ...prev }
        delete next.file
        return next
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formValues.title.trim()) errors.title = 'Title is required.'
    if (!formValues.description.trim()) errors.description = 'Description is required.'
    if (!formValues.type) errors.type = 'Select a resource type.'
    if (!formValues.status) errors.status = 'Select visibility.'

    const hasUrl = Boolean(formValues.url.trim())
    const hasFile = Boolean(selectedFile)
    const existingHasFile = Boolean(activeResource?.filePublicId)
    const existingHasUrl = Boolean(activeResource?.url)

    if (!hasUrl && !hasFile && !activeResource) {
      errors.file = 'Upload a file or provide a link.'
    }

    if (!hasUrl && !hasFile && activeResource && !existingHasFile && !existingHasUrl) {
      errors.file = 'Upload a file or provide a link.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    try {
      setSubmitting(true)
      const payload = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        type: formValues.type,
        status: formValues.status,
        url: formValues.url.trim() || undefined,
        file: selectedFile ?? undefined,
      }

      if (activeResource) {
        await updateResource(activeResource.id, payload)
      } else {
        await createResource(payload)
      }

      setIsFormOpen(false)
      setActiveResource(null)
      setSelectedFile(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (resourceId) => {
    try {
      setDeletingId(resourceId)
      await deleteResource(resourceId)
    } finally {
      setDeletingId('')
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Resources & Materials</h2>
          <p className="text-sm text-slate-500">Upload decks, handbooks, or helpful links for your mentees.</p>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          + Upload Resource
        </button>
      </header>

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading resources…</div>
      ) : error ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">
          {error.message ?? 'Unable to load resources.'}
        </div>
      ) : resources.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No resources uploaded yet</h3>
          <p className="mt-2 text-sm text-slate-500">Share templates, guides, or recordings to support your mentees.</p>
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            Upload Resource
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {resources.map((resource) => {
            const typeLabel = resourceTypeOptions.find((option) => option.value === resource.type)?.label ?? resource.type
            const statusLabel = resource.status === 'active' ? 'Visible to mentees' : 'Hidden'
            const uploaded = resource.createdAt ? resource.createdAt.toLocaleDateString() : '—'

            return (
              <article key={resource.id} className="flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{resource.title}</h3>
                      <p className="text-xs text-slate-500">{typeLabel} • Uploaded {uploaded}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${resource.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {statusLabel}
                    </span>
                  </div>
                  {resource.description && <p className="text-sm text-slate-600">{resource.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {resource.url && (
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary transition hover:underline"
                      >
                        View resource
                      </a>
                    )}
                    {resource.fileName && <span className="rounded-full bg-slate-100 px-3 py-1">{resource.fileName}</span>}
                    {resource.fileSize ? <span className="rounded-full bg-slate-100 px-3 py-1">{formatFileSize(resource.fileSize)}</span> : null}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                  <span>Updated {resource.updatedAt ? resource.updatedAt.toLocaleDateString() : '—'}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(resource)}
                      className="inline-flex items-center gap-1 text-primary transition hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deletingId === resource.id}
                      className="text-rose-500 transition hover:underline disabled:opacity-60"
                    >
                      {deletingId === resource.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{activeResource ? 'Edit Resource' : 'Upload Resource'}</h3>
                <p className="text-xs text-slate-500">Share decks, PDFs, links, or recordings with your mentees.</p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="space-y-1 text-sm font-semibold text-slate-700">
                Resource Title
                <input
                  value={formValues.title}
                  onChange={handleInputChange('title')}
                  className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.title ? 'border-rose-300' : 'border-slate-200'}`}
                  placeholder="e.g., Product Strategy Playbook"
                />
                {formErrors.title && <span className="text-xs font-medium text-rose-500">{formErrors.title}</span>}
              </label>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                Description
                <textarea
                  value={formValues.description}
                  onChange={handleInputChange('description')}
                  rows={4}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.description ? 'border-rose-300' : 'border-slate-200'}`}
                  placeholder="Give mentees context on what this resource covers."
                />
                {formErrors.description && <span className="text-xs font-medium text-rose-500">{formErrors.description}</span>}
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Resource Type
                  <select
                    value={formValues.type}
                    onChange={handleInputChange('type')}
                    className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.type ? 'border-rose-300' : 'border-slate-200'}`}
                  >
                    {resourceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.type && <span className="text-xs font-medium text-rose-500">{formErrors.type}</span>}
                </label>
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Visibility
                  <select
                    value={formValues.status}
                    onChange={handleInputChange('status')}
                    className={`w-full rounded-2xl border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 ${formErrors.status ? 'border-rose-300' : 'border-slate-200'}`}
                  >
                    {resourceStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.status && <span className="text-xs font-medium text-rose-500">{formErrors.status}</span>}
                </label>
                <label className="space-y-1 text-sm font-semibold text-slate-700">
                  Resource Link
                  <input
                    value={formValues.url}
                    onChange={handleInputChange('url')}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                    placeholder="https://"
                  />
                </label>
              </div>

              <label className="space-y-1 text-sm font-semibold text-slate-700">
                Upload File (optional)
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                />
                {selectedFile && <span className="text-xs text-slate-500">Selected: {selectedFile.name}</span>}
                {formErrors.file && <span className="text-xs font-medium text-rose-500">{formErrors.file}</span>}
              </label>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={submitting}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-primary hover:text-primary disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {submitting ? 'Saving…' : activeResource ? 'Save Changes' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const PanelHistory = () => {
  const { sessions, loading, error, refresh, getSessionDetails } = useMentorSessions()
  const [selectedId, setSelectedId] = useState('')
  const [selectedSession, setSelectedSession] = useState(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  const closeModal = () => {
    if (modalLoading) return
    setSelectedId('')
    setSelectedSession(null)
    setModalError('')
  }

  const openDetails = async (sessionId) => {
    setSelectedId(sessionId)
    setModalLoading(true)
    setModalError('')
    try {
      const details = await getSessionDetails(sessionId)
      setSelectedSession(details)
    } catch (err) {
      setModalError(err?.message ?? 'Unable to load session details.')
    } finally {
      setModalLoading(false)
    }
  }

  const formatStatus = (status) => {
    if (!status) return '—'
    const normalized = status.toString().trim().toLowerCase()
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const formatMode = (mode) => {
    if (!mode) return '—'
    const normalized = mode.toString().trim().toLowerCase()
    return normalized.charAt(0).toUpperCase() + normalized.slice(1)
  }

  const formatDateTime = (date) => {
    if (!date) return '—'
    try {
      return date.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    } catch (_error) {
      return '—'
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading session history…</div>
    }

    if (error) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">
          {error.message ?? 'Unable to load session history.'}
        </div>
      )
    }

    if (!sessions.length) {
      return (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No session history yet</h3>
          <p className="mt-2 text-sm text-slate-500">Completed mentorship sessions will appear here.</p>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {sessions.map((session) => {
          const hasFeedback = Boolean(session.feedback?.comment) || Boolean(session.feedback?.rating)
          return (
            <article key={session.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {session.menteeAvatar ? (
                        <img src={session.menteeAvatar} alt={session.menteeName} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        session.menteeName
                          .split(' ')
                          .map((part) => part.charAt(0))
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'M'
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{session.menteeName}</p>
                      <p className="text-xs text-slate-500">{session.menteeEmail || 'Email not shared'}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${session.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : session.status === 'cancelled' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    {formatStatus(session.status)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {hasFeedback ? 'Feedback available' : 'No feedback'}
                  </span>
                </div>

                <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
                  <div>
                    <p className="font-semibold text-slate-700">Service</p>
                    <p className="mt-1 text-sm text-slate-600">{session.serviceName || '—'}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Session Time</p>
                    <p className="mt-1 text-sm text-slate-600">{formatDateTime(session.sessionDate)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Duration</p>
                    <p className="mt-1 text-sm text-slate-600">{formatDuration(session.durationMinutes)}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700">Mode</p>
                    <p className="mt-1 text-sm text-slate-600">{formatMode(session.mode)}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:flex-col">
                <button
                  type="button"
                  onClick={() => openDetails(session.id)}
                  className="rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                >
                  View Details
                </button>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Mentorship Session History</h2>
          <p className="text-sm text-slate-500">Review past mentorship sessions and feedback from mentees.</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
        >
          Refresh
        </button>
      </header>

      {renderContent()}

      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Session Details</h3>
                <p className="text-xs text-slate-500">View mentee information and feedback.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </div>

            {modalLoading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading session details…</div>
            ) : modalError ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6 text-sm text-rose-600">{modalError}</div>
            ) : selectedSession ? (
              <div className="space-y-6">
                <section className="grid gap-4 rounded-3xl border border-slate-200 bg-slate-50/60 p-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mentee</p>
                    <p className="text-base font-semibold text-slate-900">{selectedSession.menteeName}</p>
                    <p className="text-sm text-slate-500">{selectedSession.menteeEmail || 'Email not shared'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Session</p>
                    <p className="text-base font-semibold text-slate-900">{selectedSession.serviceName}</p>
                    <p className="text-sm text-slate-500">{formatDateTime(selectedSession.sessionDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Duration</p>
                    <p className="text-sm text-slate-600">{formatDuration(selectedSession.durationMinutes)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mode</p>
                    <p className="text-sm text-slate-600">{formatMode(selectedSession.mode)}</p>
                  </div>
                </section>

                {selectedSession.notes && (
                  <section className="space-y-2 rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Session Notes</p>
                    <p className="text-sm text-slate-600">{selectedSession.notes}</p>
                  </section>
                )}

                <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Feedback</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedSession.feedback ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {selectedSession.feedback ? 'Submitted' : 'Not provided'}
                    </span>
                  </div>

                  {selectedSession.feedback ? (
                    <>
                      {selectedSession.feedback.rating ? (
                        <p className="text-sm font-semibold text-amber-500">Rating: {selectedSession.feedback.rating.toFixed(1)} / 5</p>
                      ) : (
                        <p className="text-sm text-slate-500">Rating not provided.</p>
                      )}
                      {selectedSession.feedback.comment ? (
                        <p className="text-sm text-slate-600">“{selectedSession.feedback.comment}”</p>
                      ) : (
                        <p className="text-sm text-slate-500">No written feedback.</p>
                      )}
                      <p className="text-xs text-slate-400">
                        Submitted {selectedSession.feedback.submittedAt ? selectedSession.feedback.submittedAt.toLocaleString() : '—'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">Mentee has not shared feedback for this session.</p>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

const MetricCard = ({ title, value, detail, accent }) => {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600',
    sky: 'bg-sky-50 text-sky-600',
    amber: 'bg-amber-50 text-amber-600',
    primary: 'bg-primary/10 text-primary',
  }
  return (
    <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
      <p className="text-3xl font-semibold text-slate-900">{value}</p>
      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${colors[accent]}`}>
        {detail}
      </span>
    </div>
  )
}

const PanelIcon = ({ name, className }) => {
  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="3" />
        <path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="7" r="4" />
        <path d="M17 11a4 4 0 100-8" />
        <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
        <path d="M17 21v-2a4 4 0 00-3-3.87" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33h-.09a1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51h-.09a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15v-.09a1.65 1.65 0 00-1-1.51H3.5a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 007 9V8.91a1.65 1.65 0 001-1.51V7a2 2 0 014 0v.09a1.65 1.65 0 001 1.51H12.1a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33" />
      </>
    ),
    video: (
      <>
        <rect x="2" y="6" width="15" height="12" rx="2" />
        <path d="M17 10l4-2v8l-4-2" />
      </>
    ),
    library: (
      <>
        <path d="M4 19L12 5l8 14" />
        <path d="M12 5v14" />
      </>
    ),
    history: (
      <>
        <path d="M3 3v5h5" />
        <path d="M3 13a9 9 0 101-4.5" />
        <path d="M12 7v5l3 3" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[name]}
    </svg>
  )
}

const MentorPanel = ({ onExit, section, onSelectSection }) => {
  return (
    <div className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:grid-cols-[16rem_1fr]">
      <nav className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Mentor Panel</p>
          <p className="mt-2 text-sm text-slate-500">Manage your mentorship presence.</p>
        </div>
        <div className="space-y-1">
          {panelNavItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectSection(item.key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                section === item.key ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <PanelIcon name={item.icon} className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onExit}
          className="mt-4 inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
        >
          Exit Panel
        </button>
      </nav>

      <section className="space-y-6">
        {section === 'dashboard' && <PanelDashboard />}
        {section === 'profile' && <PanelProfile />}
        {section === 'mentees' && <PanelMentees />}
        {section === 'services' && <PanelServices />}
        {section === 'sessions' && <PanelSessions />}
        {section === 'resources' && <PanelResources />}
        {section === 'history' && <PanelHistory />}
      </section>
    </div>
  )
}

const MentorApplicationModal = ({ onClose, onSubmit, onSuccess }) => {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    graduationYear: '',
    degree: '', // Add degree field
    location: '',
    linkedin: '',
    jobRole: '',
    companyName: '',
    industry: industryOptions[0],
    totalExperience: '',
    skills: [],
    careerPath: '',
    mentorshipAreas: [],
    preferredStudents: preferredStudentOptions[0],
    maxStudents: '',
    weeklyHours: weeklyHoursOptions[0],
    modes: ['Chat', 'Video'],
    department: departmentOptions[0],
    availableDays: 'flexible', // Add availableDays field
  })
  const [submitting, setSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState(null)

  const handleCompletion = async () => {
    if (typeof onSubmit !== 'function') return
    setSubmitting(true)
    setSubmissionError(null)

    try {
      const payload = {
        // Step 1: Basic Information
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        graduationYear: form.graduationYear,
        degree: form.degree || '', // Add degree field
        department: form.department,
        currentLocation: form.location,
        profilePhoto: '', // Will be handled by file upload
        
        // Step 2: Professional Information
        currentJobTitle: form.jobRole,
        company: form.companyName,
        industry: form.industry,
        mentorshipAreas: Array.isArray(form.mentorshipAreas) ? form.mentorshipAreas : [],
        expertise: Array.isArray(form.skills) ? form.skills : [],
        
        // Step 3: Availability & Preferences
        mentorshipMode: form.modes?.[0] || 'online', // Take first mode
        availableDays: form.availableDays || 'flexible',
        timeCommitment: form.weeklyHours || 'on-demand',
        mentorshipPreference: form.preferredStudents || 'both',
        maxMentees: form.maxStudents || '5',
        
        // Consent checkboxes (required fields)
        consent1: true,
        consent2: true,
        consent3: true,
      }

      await onSubmit(payload)
      setStep(3)
      onSuccess?.()
    } catch (error) {
      setSubmissionError(error?.message ?? 'Unable to submit application. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleSkill = (skill) => {
    setForm((prev) => {
      const exists = prev.skills.includes(skill)
      return {
        ...prev,
        skills: exists ? prev.skills.filter((item) => item !== skill) : [...prev.skills, skill],
      }
    })
  }

  const toggleArea = (area) => {
    setForm((prev) => {
      const exists = prev.mentorshipAreas.includes(area)
      return {
        ...prev,
        mentorshipAreas: exists
          ? prev.mentorshipAreas.filter((item) => item !== area)
          : [...prev.mentorshipAreas, area],
      }
    })
  }

  const toggleMode = (mode) => {
    setForm((prev) => {
      const exists = prev.modes.includes(mode)
      return {
        ...prev,
        modes: exists ? prev.modes.filter((item) => item !== mode) : [...prev.modes, mode],
      }
    })
  }

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleInputChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const goNext = () => {
    if (step === 0) {
      if (!form.fullName || !form.email || !form.graduationYear || !form.degree || !form.department || !form.location) return
      setStep(1)
      return
    }

    if (step === 1) {
      if (!form.jobRole || !form.companyName || !form.industry || form.skills.length === 0) return
      setStep(2)
      return
    }

    if (step === 2) {
      if (!form.preferredStudents || !form.maxStudents || !form.weeklyHours || !form.availableDays || form.mentorshipAreas.length === 0) return
      handleCompletion()
      return
    }
  }

  const goPrevious = () => {
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const closeModal = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-12 backdrop-blur" role="dialog" aria-modal="true">
      <div className="absolute inset-0" onClick={closeModal} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-3xl max-h-[88vh] flex-col overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)]">
        <header className="flex items-center justify-between border-b border-slate-100 px-10 py-7">
          <button
            type="button"
            onClick={closeModal}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
          >
            <span className="text-lg">←</span>
            Back to Mentorship
          </button>
          <span className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/60">BECOME A MENTOR</span>
            <button
              type="button"
              onClick={closeModal}
              className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-primary hover:text-primary"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        </header>

        <div className="flex-1 overflow-y-auto px-10 py-10">
          <div className="flex justify-center gap-12 pb-10">
            {applicationSteps.map((item, index) => {
              const isActive = index === step
              const isCompleted = index < step
              return (
                <div key={item.label} className="flex flex-col items-center text-center">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition ${
                      isActive || isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </span>
                  <p className={`mt-3 text-xs font-semibold uppercase tracking-[0.28em] ${
                    isActive || isCompleted ? 'text-primary' : 'text-slate-400'
                  }`}>
                    {item.label}
                  </p>
                </div>
              )
            })}
          </div>

          {step === 3 ? (
            <div className="flex flex-col items-center space-y-7 py-12 text-center">
              <span className="grid h-24 w-24 place-items-center rounded-full bg-emerald-100 text-emerald-500">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold text-slate-900">Congratulations! You Are Now a Mentor</h2>
                <p className="max-w-xl text-sm text-slate-500">
                  You have successfully completed the mentor application process. Click the button below to access your Mentor Panel and manage all your mentoring activities.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Go to Mentor Panel
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">{applicationSteps[step].caption}</h2>
                <p className="text-sm text-slate-500">Share your knowledge, guide learners, and make an impact.</p>
              </div>

              {step === 0 && (
                <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)]">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField label="Full Name" value={form.fullName} onChange={handleInputChange('fullName')} placeholder="Alex Johnson" />
                    <InputField label="Email Address" value={form.email} onChange={handleInputChange('email')} type="email" placeholder="alex.j@example.com" />
                    <InputField label="Phone Number (optional)" value={form.phoneNumber} onChange={handleInputChange('phoneNumber')} placeholder="+1 (555) 000-0000" />
                    <InputField label="Graduation Year" value={form.graduationYear} onChange={handleInputChange('graduationYear')} type="number" placeholder="2020" />
                    <SelectField label="Degree / Program" value={form.degree} onChange={handleChange('degree')} options={degreeOptions} />
                    <SelectField label="Department" value={form.department} onChange={handleChange('department')} options={departmentOptions} />
                    <InputField label="Current Location" value={form.location} onChange={handleInputChange('location')} placeholder="City, Country" />
                  </div>

                  <InputField
                    label="LinkedIn / Portfolio URL (optional)"
                    value={form.linkedin}
                    onChange={handleInputChange('linkedin')}
                    placeholder="https://linkedin.com/in/..."
                  />

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6">
                    <p className="text-sm font-semibold text-slate-700">📌 Current Job Role</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Share your current designation so students know the perspective you bring as a mentor. You can update this anytime.
                    </p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)]">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <InputField label="Current Job Title" value={form.jobRole} onChange={handleInputChange('jobRole')} placeholder="Product Manager" />
                    <InputField label="Company Name" value={form.companyName} onChange={handleInputChange('companyName')} placeholder="Acme Corp" />
                    <SelectField label="Industry" value={form.industry} onChange={handleChange('industry')} options={industryOptions} />
                    <InputField label="Total Experience (Years)" value={form.totalExperience} onChange={handleInputChange('totalExperience')} type="number" placeholder="6" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700">Skills</p>
                    <p className="mt-1 text-xs text-slate-500">Select all skills you actively mentor in.</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {skillOptions.map((skill) => {
                        const isSelected = form.skills.includes(skill)
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkill(skill)}
                            className={`rounded-full px-4 py-1 text-xs font-semibold transition ${
                              isSelected ? 'bg-primary text-white shadow-sm shadow-primary/50' : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                            }`}
                          >
                            {skill}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <InputField
                    label="Career Path / Domain"
                    value={form.careerPath}
                    onChange={handleInputChange('careerPath')}
                    placeholder="e.g. Product Management, SaaS Growth"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.25)]">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Mentorship Areas</p>
                    <p className="mt-1 text-xs text-slate-500">Choose the themes you’d like to guide students on.</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {mentorshipAreaOptions.map((area) => {
                        const isSelected = form.mentorshipAreas.includes(area)
                        return (
                          <button
                            key={area}
                            type="button"
                            onClick={() => toggleArea(area)}
                            className={`rounded-2xl border px-3 py-2 text-sm font-medium transition ${
                              isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/40' : 'border-slate-200 text-slate-600 hover:border-primary/50'
                            }`}
                          >
                            {area}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <fieldset className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                      <legend className="text-sm font-semibold text-slate-700">Preferred Students</legend>
                      <div className="space-y-2">
                        {preferredStudentOptions.map((option) => (
                          <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="radio"
                              name="preferredStudents"
                              value={option}
                              checked={form.preferredStudents === option}
                              onChange={handleChange('preferredStudents')}
                              className="h-4 w-4 border-slate-300 text-primary focus:ring-primary"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                      <InputField
                        label="Max Students You Can Mentor"
                        value={form.maxStudents}
                        onChange={handleInputChange('maxStudents')}
                        type="number"
                        placeholder="5"
                      />
                      <SelectField label="Weekly Hours" value={form.weeklyHours} onChange={handleChange('weeklyHours')} options={weeklyHoursOptions} />
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <SelectField label="Preferred Mentorship Mode" value={form.modes?.[0] || ''} onChange={(value) => setForm(prev => ({ ...prev, modes: [value] }))} options={mentorshipModeOptions} />
                    <SelectField label="Available Days" value={form.availableDays} onChange={handleChange('availableDays')} options={['weekdays', 'weekends', 'flexible']} />
                  </div>

                  <p className="text-xs text-slate-400">
                    By submitting, you confirm your commitment to support assigned students professionally and responsibly.
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-4">
                {submissionError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-3 text-sm text-rose-600">
                    {submissionError}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={step === 0 ? closeModal : goPrevious}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                  >
                    {step === 0 ? 'Cancel' : 'Previous'}
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={submitting}
                    className={`rounded-full px-5 py-2 text-sm font-semibold text-white transition ${
                      step === 2 ? 'bg-primary hover:bg-primary/90' : 'bg-primary hover:bg-primary/90'
                    } ${submitting ? 'cursor-wait opacity-80' : ''}`}
                  >
                    {step === 2 ? (submitting ? 'Submitting…' : 'Submit Application') : 'Next'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  {step === 0 && 'Please complete the required fields before continuing.'}
                  {step === 1 && 'Select at least one skill to highlight your strengths.'}
                  {step === 2 && 'Choose mentorship areas and availability to finish your application.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const InputField = ({ label, type = 'text', value, onChange, placeholder }) => (
  <label className="block text-sm font-semibold text-slate-700">
    {label}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
    />
  </label>
)

const SelectField = ({ label, value, onChange, options }) => (
  <label className="block text-sm font-semibold text-slate-700">
    {label}
    <select
      value={value}
      onChange={onChange}
      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  </label>
)

const TextareaField = ({ label, value, onChange, placeholder }) => (
  <label className="block text-sm font-semibold text-slate-700">
    {label}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
    />
  </label>
)

export default Mentorship
