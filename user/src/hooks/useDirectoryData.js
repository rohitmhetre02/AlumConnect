import { useEffect, useState } from 'react'

import { get } from '../utils/api'
import useToast from './useToast'

const ROLE_ENDPOINT_MAP = {
  students: '/directory/students',
  alumni: '/directory/alumni',
  faculty: '/directory/faculty',
  coordinators: '/directory/coordinators',
}

export const useDirectoryData = (role) => {
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState([])
  const [error, setError] = useState(null)
  const addToast = useToast()

  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      const endpoint = ROLE_ENDPOINT_MAP[role]
      if (!endpoint) {
        setMembers([])
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)
      try {
        console.log(`Fetching members for role: ${role}, endpoint: ${endpoint}`)
        const response = await get(endpoint)
        console.log(`Directory response for ${role}:`, response)
        const members = Array.isArray(response?.data) ? response.data : []
        console.log(`Parsed ${members.length} members for ${role}:`, members)
        if (!isMounted) return
        setMembers(members)
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        addToast?.({
          title: 'Unable to load directory',
          description: fetchError.message ?? 'Please try again later.',
          tone: 'error',
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [role, addToast])

  return { loading, members, error }
}

export const useDirectoryProfile = (id) => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)
  const addToast = useToast()

  useEffect(() => {
    let isMounted = true
    if (!id) {
      setProfile(null)
      setLoading(false)
      return () => {}
    }

    const fetchProfile = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await get(`/directory/profile/${id}`)
        if (!isMounted) return
        setProfile(response?.data ?? null)
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        addToast?.({
          title: 'Unable to load profile',
          description: fetchError.message ?? 'Please try again later.',
          tone: 'error',
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [id, addToast])

  return { loading, profile, error }
}
