import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { get } from '../utils/api'

const COMPLETION_RULES = [
  {
    key: 'firstName',
    label: 'First name',
    isComplete: (profile) => Boolean(profile?.firstName?.trim()),
  },
  {
    key: 'lastName',
    label: 'Last name',
    isComplete: (profile) => Boolean(profile?.lastName?.trim()),
  },
  {
    key: 'department',
    label: 'Department / Program',
    isComplete: (profile) => Boolean(profile?.department?.trim() || profile?.program?.trim()),
  },
  {
    key: 'location',
    label: 'Location',
    isComplete: (profile) => Boolean(profile?.location?.trim()),
  },
  {
    key: 'about',
    label: 'About summary',
    isComplete: (profile) => Boolean(profile?.about?.trim()),
  },
  {
    key: 'avatar',
    label: 'Profile photo',
    isComplete: (profile) => Boolean(profile?.avatar?.trim()),
  },
  {
    key: 'cover',
    label: 'Cover image',
    isComplete: (profile) => Boolean(profile?.cover?.trim()),
  },
  {
    key: 'skills',
    label: 'Skills',
    isComplete: (profile) => Array.isArray(profile?.skills) && profile.skills.length > 0,
  },
  {
    key: 'experiences',
    label: 'Experience details',
    isComplete: (profile) => Array.isArray(profile?.experiences) && profile.experiences.length > 0,
  },
  {
    key: 'education',
    label: 'Education history',
    isComplete: (profile) => Array.isArray(profile?.education) && profile.education.length > 0,
  },
  {
    key: 'socials',
    label: 'Social links',
    isComplete: (profile) => {
      if (!profile?.socials) return false
      if (Array.isArray(profile.socials)) {
        return profile.socials.some((entry) => Boolean(entry?.url?.trim()))
      }
      return Object.values(profile.socials).some((value) => Boolean(String(value).trim()))
    },
  },
]

const calculateCompletion = (profile) => {
  const checks = COMPLETION_RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    complete: Boolean(rule.isComplete(profile)),
  }))

  const totalChecks = checks.length
  const completedChecks = checks.filter((rule) => rule.complete).length
  const percentage = totalChecks === 0 ? 0 : Math.round((completedChecks / totalChecks) * 100)

  return {
    percentage,
    missingFields: checks.filter((rule) => !rule.complete).map((rule) => rule.label),
  }
}

const useProfileCompletion = () => {
  const [loading, setLoading] = useState(true)
  const [percentage, setPercentage] = useState(0)
  const [missingFields, setMissingFields] = useState([])
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const lastFetchedAtRef = useRef(null)

  const refresh = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true)
        setError(null)
      }
      try {
        const response = await get('/auth/profile/me')
        const profileData = response?.data ?? null
        setProfile(profileData)
        const { percentage: computedPercentage, missingFields: computedMissing } = calculateCompletion(profileData)
        setPercentage(computedPercentage)
        setMissingFields(computedMissing)
        lastFetchedAtRef.current = new Date()
      } catch (fetchError) {
        console.error('useProfileCompletion refresh error:', fetchError)
        setError(fetchError)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        refresh({ silent: true })
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refresh])

  useEffect(() => {
    const handleProfileUpdated = () => refresh({ silent: true })
    window.addEventListener('profile:updated', handleProfileUpdated)
    return () => window.removeEventListener('profile:updated', handleProfileUpdated)
  }, [refresh])

  const lastUpdated = useMemo(() => lastFetchedAtRef.current, [profile])

  return {
    loading,
    error,
    percentage,
    missingFields,
    profile,
    lastUpdated,
    refresh,
  }
}

export default useProfileCompletion
