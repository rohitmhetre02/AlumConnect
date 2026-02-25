import { useCallback, useEffect, useState, useRef } from 'react'

import { get } from '../utils/api'

const INITIAL_STATE = {
  metrics: [],
  charts: {},
  spotlight: [],
  recentActivity: [],
  detailLinks: {},
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000

const useInsightsOverview = () => {
  const [data, setData] = useState(INITIAL_STATE)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Refs for caching and preventing duplicate requests
  const cacheRef = useRef(null)
  const requestRef = useRef(null)
  const lastFetchRef = useRef(0)

  const fetchOverview = useCallback(async (forceRefresh = false) => {
    const now = Date.now()
    
    // Return cached data if still valid and not forcing refresh
    if (!forceRefresh && cacheRef.current && (now - lastFetchRef.current) < CACHE_DURATION) {
      setData(cacheRef.current.data)
      setRole(cacheRef.current.role)
      setLoading(false)
      setError(null)
      return
    }

    // Prevent multiple simultaneous requests
    if (requestRef.current) {
      return
    }

    setLoading(true)
    setError(null)
    requestRef.current = true

    try {
      const response = await get('/api/insights/overview')
      const payload = response?.data ?? response

      if (!payload) {
        throw new Error('No data returned from insights overview API.')
      }

      const newData = {
        metrics: payload.metrics ?? [],
        charts: payload.charts ?? {},
        spotlight: payload.spotlight ?? [],
        recentActivity: payload.recentActivity ?? [],
        detailLinks: payload.detailLinks ?? {},
      }

      // Update cache
      cacheRef.current = {
        data: newData,
        role: payload.role ?? null,
      }
      lastFetchRef.current = now

      setRole(payload.role ?? null)
      setData(newData)
    } catch (err) {
      console.error('useInsightsOverview error:', err)
      setError(err)
      setData(INITIAL_STATE)
      setRole(null)
    } finally {
      setLoading(false)
      requestRef.current = null
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
    refresh: () => fetchOverview(true), // Force refresh when explicitly called
  }
}

export default useInsightsOverview
