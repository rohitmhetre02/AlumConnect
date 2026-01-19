import { useCallback, useEffect, useMemo, useState } from 'react'
import { get, put } from '../utils/api'
import useToast from './useToast'
import { useAuth } from '../context/AuthContext'

const normalizeProfile = (data = {}) => {
  if (!data) return null
  return {
    id: data._id || data.id || '',
    email: data.email || '',
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    department: data.department || '',
    title: data.title || '',
    phone: data.phone || '',
    location: data.location || '',
    about: data.about || '',
    skills: Array.isArray(data.skills) ? data.skills : [],
    socials: data.socials || {},
  }
}

export const useUserProfile = () => {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState(() => normalizeProfile(user?.profile))
  const [loading, setLoading] = useState(!profile)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/api/auth/profile/me')
      const raw = response?.data ?? response
      const normalized = normalizeProfile(raw)
      setProfile(normalized)
      updateUser?.({ profile: raw })
    } catch (err) {
      setError(err)
      toast?.({
        title: 'Unable to load profile',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [toast, updateUser])

  useEffect(() => {
    if (!profile) {
      fetchProfile()
    }
  }, [fetchProfile, profile])

  const updateProfile = useCallback(
    async (payload) => {
      setSaving(true)
      setError(null)
      try {
        const response = await put('/api/auth/profile/me', payload)
        const raw = response?.data ?? response
        const normalized = normalizeProfile(raw)
        setProfile(normalized)
        updateUser?.({ profile: raw })
        toast?.({
          title: 'Profile updated',
          description: 'Your account details were saved successfully.',
          tone: 'success',
        })
        return normalized
      } catch (err) {
        setError(err)
        toast?.({
          title: 'Unable to update profile',
          description: err?.message ?? 'Please review the form and try again.',
          tone: 'error',
        })
        throw err
      } finally {
        setSaving(false)
      }
    },
    [toast, updateUser],
  )

  return useMemo(
    () => ({ profile, loading, saving, error, refresh: fetchProfile, updateProfile }),
    [profile, loading, saving, error, fetchProfile, updateProfile],
  )
}

export default useUserProfile
