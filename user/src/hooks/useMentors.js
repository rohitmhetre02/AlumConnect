import { useCallback, useEffect, useMemo, useState } from 'react'

import { get, post, put } from '../utils/api'
import useToast from './useToast'

const ensureArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const slugify = (value) => {
  if (!value) return ''
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const formatMentor = (mentor = {}) => {
  if (!mentor) return null

  const fullName = mentor.fullName || mentor.name || ''
  const slug = mentor.slug || slugify(fullName || mentor.email || mentor.id || mentor.applicationId)
  const tags = ensureArray(mentor.tags?.length ? mentor.tags : mentor.categories)
  const availability = ensureArray(mentor.availability?.length ? mentor.availability : mentor.modes)
  const expertise = ensureArray(mentor.expertise)
  const services = Array.isArray(mentor.services) ? mentor.services : []
  const resources = Array.isArray(mentor.resources) ? mentor.resources : []

  const fallbackId = slug || mentor.email || mentor.applicationId || mentor.profileId || mentor.id || `mentor-${Math.random().toString(36).slice(2)}`
  const highlightedName = fullName || mentor.name || 'Mentor'

  return {
    ...mentor,
    id: mentor.id || mentor.profileId || mentor.applicationId || fallbackId,
    profileId: mentor.profileId ?? '',
    applicationId: mentor.applicationId ?? '',
    slug,
    status: mentor.status ?? 'approved',
    name: highlightedName,
    fullName: highlightedName,
    position: mentor.position || mentor.jobRole || '',
    tags,
    categories: ensureArray(mentor.categories),
    availability,
    modes: ensureArray(mentor.modes),
    expertise,
    services,
    resources,
    avatar:
      mentor.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(highlightedName.slice(0, 2) || 'MN')}`,
    industry: mentor.industry || '',
    rating: mentor.rating ?? null,
  }
}

const normalizeMentorList = (data) => {
  if (!Array.isArray(data)) return []
  return data.map(formatMentor).filter(Boolean)
}

export const useMentors = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const fetchMentors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/api/mentors', { includeAuth: false })
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      setItems(normalizeMentorList(data))
    } catch (fetchError) {
      setError(fetchError)
      addToast?.({
        title: 'Unable to load mentors',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchMentors()
  }, [fetchMentors])

  const apply = useCallback(
    async (payload) => {
      try {
        const response = await post('/api/mentors/applications', payload)
        const raw = response?.data ?? response
        const mentor = formatMentor(raw)
        if (mentor) {
          setItems((prev) => {
            const withoutExisting = prev.filter((item) => item.profileId !== mentor.profileId && item.applicationId !== mentor.applicationId)
            return [mentor, ...withoutExisting]
          })
        }
        addToast?.({
          title: 'Application submitted',
          description: 'You are now listed as a mentor.',
          tone: 'success',
        })
        return mentor
      } catch (applyError) {
        addToast?.({
          title: 'Unable to submit application',
          description: applyError.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw applyError
      }
    },
    [addToast],
  )

  const getMyProfile = useCallback(async () => {
    try {
      setError(null)
      const response = await get('/api/mentors/me')
      return response
    } catch (err) {
      const message = err?.message ?? 'Failed to load mentor profile.'
      setError(err)
      addToast?.({
        title: 'Unable to load mentor profile',
        description: message,
        tone: 'error',
      })
      throw err
    }
  }, [addToast])

  const updateMyProfile = useCallback(
    async (payload) => {
      try {
        setError(null)
        const response = await put('/api/mentors/me', payload)
        const mentor = response?.data
        if (mentor) {
          setItems((prev) => prev.map((m) => (m.id === mentor.id ? mentor : m)))
        }
        addToast?.({
          title: 'Profile updated',
          description: 'Your mentor profile has been updated.',
          tone: 'success',
        })
        return response
      } catch (err) {
        const message = err?.message ?? 'Failed to update profile.'
        setError(err)
        addToast?.({
          title: 'Unable to update mentor profile',
          description: message,
          tone: 'error',
        })
        throw err
      }
    },
    [addToast],
  )

  return useMemo(
    () => ({
      items,
      loading,
      error,
      refresh: fetchMentors,
      apply,
      getMyProfile,
      updateMyProfile,
    }),
    [items, loading, error, fetchMentors, apply, getMyProfile, updateMyProfile],
  )
}

export default useMentors
