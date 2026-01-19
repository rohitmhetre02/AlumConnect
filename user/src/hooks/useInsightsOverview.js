import { useCallback, useEffect, useState } from 'react'

import { get } from '../utils/api'

const INITIAL_STATE = {
  metrics: [],
  charts: {},
  spotlight: [],
  recentActivity: [],
  detailLinks: {},
}

const useInsightsOverview = () => {
  const [data, setData] = useState(INITIAL_STATE)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOverview = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await get('/api/insights/overview')
      const payload = response?.data ?? response

      if (!payload) {
        throw new Error('No data returned from insights overview API.')
      }

      setRole(payload.role ?? null)
      setData({
        metrics: payload.metrics ?? [],
        charts: payload.charts ?? {},
        spotlight: payload.spotlight ?? [],
        recentActivity: payload.recentActivity ?? [],
        detailLinks: payload.detailLinks ?? {},
      })
    } catch (err) {
      console.error('useInsightsOverview error:', err)
      setError(err)
      setData(INITIAL_STATE)
      setRole(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview()
  }, [fetchOverview])

  return {
    role,
    ...data,
    loading,
    error,
    refresh: fetchOverview,
  }
}

export default useInsightsOverview
