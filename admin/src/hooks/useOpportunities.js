import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'

export const useOpportunity = (id) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    if (!id) {
      setLoading(false)
      setData(null)
      return () => {}
    }

    const fetchItem = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await get(`/opportunities/${id}`, { includeAuth: true })
        if (!isMounted) return
        setData(response?.data ?? null)
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        console.error('Unable to load opportunity:', fetchError)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchItem()

    return () => {
      isMounted = false
    }
  }, [id])

  return { data, loading, error }
}

export default useOpportunity
