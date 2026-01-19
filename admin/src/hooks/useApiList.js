import { useCallback, useEffect, useRef, useState } from 'react'
import { get } from '../utils/api'

const useApiList = (path) => {
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

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await get(path)
      const list = Array.isArray(response?.data) ? response.data : []
      if (isMountedRef.current) {
        setData(list)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const fallback = `Unable to load data from ${path}.`
        setError(err?.message || fallback)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [path])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  }
}

export default useApiList
