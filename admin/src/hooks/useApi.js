import { useEffect, useState } from 'react'
import { get } from '../utils/api'

const useApi = (path) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError('')
      try {
        const response = await get(path)
        setData(response?.data || null)
      } catch (err) {
        setError(err?.message || `Unable to load data from ${path}.`)
      } finally {
        setIsLoading(false)
      }
    }

    if (path) {
      fetchData()
    }
  }, [path])

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      const fetchData = async () => {
        setIsLoading(true)
        setError('')
        try {
          const response = await get(path)
          setData(response?.data || null)
        } catch (err) {
          setError(err?.message || `Unable to load data from ${path}.`)
        } finally {
          setIsLoading(false)
        }
      }
      fetchData()
    }
  }
}

export default useApi
