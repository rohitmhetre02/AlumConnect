import { useCallback, useEffect, useRef, useState } from 'react'
import { get } from '../utils/api'

const useDirectoryMembers = (role) => {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchMembers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await get(`/directory/${role}`)
      const list = Array.isArray(response?.data) ? response.data : []
      if (isMountedRef.current) {
        setData(list)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const fallback = `Unable to load ${role} data.`
        setError(err?.message || fallback)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [role])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return {
    data,
    isLoading,
    error,
    refetch: fetchMembers,
  }
}

export default useDirectoryMembers
