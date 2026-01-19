import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProfileHeader from '../../components/user/profile/ProfileHeader'
import ProfileOverview from '../../components/user/profile/ProfileOverview'
import ExperienceList from '../../components/user/profile/ExperienceList'
import EducationList from '../../components/user/profile/EducationList'
import BadgesList from '../../components/user/profile/BadgesList'
import EditProfileModal from '../../components/user/profile/EditProfileModal'
import ProfileApprovalPopup from '../../components/user/ProfileApprovalPopup'
import ProfileApprovedPopup from '../../components/user/ProfileApprovedPopup'
import useModal from '../../hooks/useModal'
import useToast from '../../hooks/useToast'
import { get } from '../../utils/api'
import {
  PROFILE_STATUS,
  normalizeProfileStatus,
  isProfileApproved,
} from '../../utils/profileStatus'
import { useAuth } from '../../context/AuthContext'

const REVIEW_POPUP_DISMISS_PREFIX = 'profile_review_popup_dismissed'
const APPROVED_POPUP_DISMISS_PREFIX = 'profile_approved_popup_dismissed'

const emptyProfile = {
  name: '',
  title: '',
  location: '',
  cover: '',
  avatar: '',
  about: '',
  contact: { email: '', phone: '' },
  socials: {},
  skills: [],
  certifications: [],
  experiences: [],
  education: [],
  stats: { connections: 0, mentorships: 0, views: 0 },
}

const normalizeSocials = (socials) => {
  if (!socials) return {}
  if (socials instanceof Map) {
    return Object.fromEntries(socials.entries())
  }
  if (typeof socials === 'object') return { ...socials }
  return {}
}

const ensureArray = (value) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value].filter(Boolean)
}

const formatProfile = (user = {}) => {
  const firstName = user.firstName ?? ''
  const lastName = user.lastName ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const contact = {
    email: user.email ?? '',
    phone: user.phone ?? '',
  }

  return {
    ...emptyProfile,
    name: fullName || user.name || '',
    title:
      (user.title && user.title.trim()) ||
      (user.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : ''),
    location: user.location ?? '',
    avatar: user.avatar ?? '',
    cover: user.cover ?? '',
    about: user.about ?? '',
    skills: ensureArray(user.skills),
    certifications: ensureArray(user.certifications),
    contact,
    socials: normalizeSocials(user.socials),
    experiences: ensureArray(user.experiences),
    education: ensureArray(user.education),
    stats: {
      connections: Number(user?.stats?.connections ?? 0),
      mentorships: Number(user?.stats?.mentorships ?? 0),
      views: Number(user?.stats?.views ?? 0),
    },
    raw: {
      ...user,
      currentYear: user.currentYear,
      passoutYear: user.passoutYear,
      department: user.department,
      role: user.role,
    },
  }
}

const sectionSuccessMessages = {
  summary: 'Profile summary updated.',
  about: 'About section updated.',
  contact: 'Contact details updated.',
  socials: 'Social links updated.',
  skills: 'Skills updated.',
  badges: 'Certifications updated.',
  experience: 'Experience updated.',
  education: 'Education updated.',
  cover: 'Cover image updated.',
}

const Profile = () => {
  const modal = useModal(false)
  const addToast = useToast()
  const { user, updateUser } = useAuth()
  const [showApprovalPopup, setShowApprovalPopup] = useState(false)
  const [showApprovedPopup, setShowApprovedPopup] = useState(false)
  const [previousApprovalStatus, setPreviousApprovalStatus] = useState(user?.profileApprovalStatus ?? null)

  const [activeSection, setActiveSection] = useState('summary')
  const [profile, setProfile] = useState(emptyProfile)
  const [loading, setLoading] = useState(true)
  const [incomplete, setIncomplete] = useState(true)

  const role = useMemo(() => user?.role ?? 'student', [user])
  const userStorageId = useMemo(() => user?.id ?? user?._id ?? user?.email ?? 'anonymous', [user?.email, user?._id, user?.id])

  const buildStorageKey = useCallback((prefix, status) => `${prefix}:${userStorageId}:${status}`, [userStorageId])

  const isPopupDismissed = useCallback(
    (prefix, status) => {
      if (typeof window === 'undefined') return false
      return window.localStorage.getItem(buildStorageKey(prefix, status)) === 'true'
    },
    [buildStorageKey]
  )

  const dismissPopup = useCallback(
    (prefix, status) => {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(buildStorageKey(prefix, status), 'true')
    },
    [buildStorageKey]
  )

  // Function to refresh user data from server
  const refreshUserData = useCallback(async () => {
    try {
      const response = await get('/auth/profile/me')
      const profileData = response?.data
      if (!profileData) return

      updateUser({
        profileApprovalStatus: normalizeProfileStatus(profileData.profileApprovalStatus),
        isProfileApproved: isProfileApproved(profileData.profileApprovalStatus),
        profile: profileData
      })
    } catch (error) {
      console.error('Profile: Failed to refresh user data:', error)
    }
  }, [updateUser])

  useEffect(() => {
    refreshUserData()
  }, [refreshUserData])

  useEffect(() => {
    const currentStatus = user?.profileApprovalStatus
    if (!currentStatus) return

    const normalizedStatus = normalizeProfileStatus(currentStatus)
    const previousStatus = normalizeProfileStatus(previousApprovalStatus ?? PROFILE_STATUS.IN_REVIEW)

    const shouldShowReviewPopup =
      (normalizedStatus === PROFILE_STATUS.IN_REVIEW || normalizedStatus === PROFILE_STATUS.REJECTED) &&
      !isPopupDismissed(REVIEW_POPUP_DISMISS_PREFIX, normalizedStatus)

    const shouldShowApprovedPopup =
      normalizedStatus === PROFILE_STATUS.APPROVED &&
      previousStatus !== PROFILE_STATUS.APPROVED &&
      !isPopupDismissed(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)

    setShowApprovalPopup(shouldShowReviewPopup)
    setShowApprovedPopup(shouldShowApprovedPopup)

    setPreviousApprovalStatus(normalizedStatus)
  }, [isPopupDismissed, previousApprovalStatus, user?.profileApprovalStatus])

  // Polling mechanism to check profile status every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUserData()
    }, 30000) // 30 seconds

    return () => {
      console.log('Profile: Clearing profile status polling interval')
      clearInterval(interval)
    }
  }, [refreshUserData, user?.profileApprovalStatus])

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      const response = await get('/auth/profile/me')
      const formatted = formatProfile(response.data)
      setProfile(formatted)
      updateUser({
        avatar: response.data.avatar ?? '',
        cover: response.data.cover ?? '',
        firstName: response.data.firstName ?? user?.firstName,
        lastName: response.data.lastName ?? user?.lastName,
        profileApprovalStatus: response.data.profileApprovalStatus ?? user?.profileApprovalStatus,
        isProfileApproved: response.data.isProfileApproved ?? user?.isProfileApproved,
        profile: response.data,
      })
      setIncomplete(Boolean(response.incompleteProfile))
    } catch (error) {
      addToast({ type: 'error', message: error?.message ?? 'Unable to load profile.' })
    } finally {
      setLoading(false)
    }
  }, [addToast, updateUser, user?.firstName, user?.lastName])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const openSectionEditor = (section) => {
    setActiveSection(section ?? 'summary')
    modal.openModal()
  }

  const handleSave = useCallback(
    async (updated, section) => {
      try {
        const payload = { ...updated }

        if (updated.skills) {
          payload.skills = updated.skills
        }

        // Handle role-specific fields
        if (role === 'student') {
          if (updated.currentYear !== undefined) {
            payload.currentYear = updated.currentYear
          }
          if (updated.admissionYear !== undefined) {
            payload.admissionYear = updated.admissionYear
          }
          if (updated.expectedPassoutYear !== undefined) {
            payload.expectedPassoutYear = updated.expectedPassoutYear
          }
        }

        if (role === 'alumni') {
          if (updated.passoutYear !== undefined) {
            payload.passoutYear = updated.passoutYear
          }
        }

        const response = await put('/auth/profile/me', payload)
        const formatted = formatProfile(response.data)
        setProfile(formatted)
        updateUser({
          avatar: response.data.avatar ?? '',
          cover: response.data.cover ?? '',
          firstName: response.data.firstName ?? formatted.raw?.firstName,
          lastName: response.data.lastName ?? formatted.raw?.lastName,
          profile: response.data,
        })
        setIncomplete(false)
        const toastMessage =
          sectionSuccessMessages[section] ?? response.message ?? 'Profile updated successfully.'
        addToast({ type: 'success', message: toastMessage })
      } catch (error) {
        addToast({ type: 'error', message: error?.message ?? 'Unable to update profile.' })
      }
    },
    [addToast, updateUser, role, sectionSuccessMessages]
  )

  const handleCloseApprovalPopup = useCallback(() => {
    const normalizedStatus = normalizeProfileStatus(user?.profileApprovalStatus)
    dismissPopup(REVIEW_POPUP_DISMISS_PREFIX, normalizedStatus)
    setShowApprovalPopup(false)
  }, [dismissPopup, user?.profileApprovalStatus])

  const handleCloseApprovedPopup = useCallback(() => {
    dismissPopup(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)
    setShowApprovedPopup(false)
  }, [dismissPopup])

  if (loading) {
    return (
      <div className="grid gap-6">
        <div className="h-56 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid gap-6 lg:grid-cols-[35%_1fr]">
          <div className="h-72 animate-pulse rounded-3xl bg-slate-200" />
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
            <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!profile.raw) {
    return (
      <div className="rounded-3xl bg-white p-10 text-center shadow-soft">
        <h2 className="text-2xl font-semibold text-slate-900">Profile unavailable</h2>
        <p className="mt-3 text-sm text-slate-500">We couldn’t load your profile details. Please try again later.</p>
      </div>
    )
  }
  return (
    <div className="space-y-10 font-profile">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-primary/30 hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-slate-400 sm:inline">Profile</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          AlumniConnect
        </div>
      </header>

      {incomplete && (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-300 bg-amber-50 px-6 py-4 text-sm text-amber-800">
          <div>
            <p className="font-semibold">Complete your profile</p>
            <p className="text-amber-700/80">Add your personal details so mentors and peers can discover you easily.</p>
          </div>
          <button
            type="button"
            onClick={() => openSectionEditor('summary')}
            className="rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-amber-600"
          >
            Update now
          </button>
        </div>
      )}

      <ProfileHeader profile={profile} onEditSection={openSectionEditor} />
      <div className="grid gap-8 lg:grid-cols-[320px_1fr] xl:gap-10">
        {role === 'faculty' ? (
          // Faculty layout: About in main content, Contact/Socials in sidebar
          <>
            <div className="space-y-6">
              {/* Contact and Socials in sidebar for faculty */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <header className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Contact</h2>
                    <button
                      type="button"
                      onClick={() => openSectionEditor('contact')}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
                    >
                      Edit
                    </button>
                  </header>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <span className="text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-slate-600">{profile.contact?.email || 'contact@example.com'}</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                      <span className="text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </span>
                      <span className="text-sm font-medium text-slate-600">{profile.contact?.phone || '+1 (555) 000-0000'}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <header className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Socials</h2>
                    <button
                      type="button"
                      onClick={() => openSectionEditor('socials')}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
                    >
                      Edit
                    </button>
                  </header>
                  <div className="mt-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {profile.socials?.linkedin ? (
                        <a
                          href={profile.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                          aria-label="LinkedIn"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </a>
                      ) : (
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-300">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        </div>
                      )}
                      {profile.socials?.github ? (
                        <a
                          href={profile.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                          aria-label="GitHub"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      ) : (
                        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-300">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    {Object.keys(profile.socials || {}).length === 0 && (
                      <span className="text-xs text-slate-400">Add your social profiles to showcase your presence.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* About section before Experience for faculty */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <header className="flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">About</h2>
                  <button
                    type="button"
                    onClick={() => openSectionEditor('about')}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
                  >
                    Edit
                  </button>
                </header>
                <div className="mt-4">
                  <p className="text-sm leading-6 text-slate-600">{profile.about || 'Passionate professional with a strong background in teaching and research.'}</p>
                </div>
              </div>
              
              <ExperienceList experiences={profile.experiences} onEditSection={openSectionEditor} />
            </div>
          </>
        ) : (
          // Regular layout for alumni and students
          <>
            <ProfileOverview profile={profile} onEditSection={openSectionEditor} role={role} />
            <div className="space-y-8">
              <ExperienceList experiences={profile.experiences} onEditSection={openSectionEditor} />
              <EducationList education={profile.education} onEditSection={openSectionEditor} />
              <BadgesList certifications={profile.certifications} onEditSection={openSectionEditor} />
            </div>
          </>
        )}
      </div>
      <EditProfileModal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        profile={profile}
        onSave={handleSave}
        activeSection={activeSection}
        role={role}
      />
      
      {showApprovalPopup ? (
        <ProfileApprovalPopup
          user={user}
          onClose={handleCloseApprovalPopup}
        />
      ) : null}

      {showApprovedPopup ? (
        <ProfileApprovedPopup
          user={user}
          onClose={handleCloseApprovedPopup}
        />
      ) : null}
    </div>
  )
}

export default Profile
