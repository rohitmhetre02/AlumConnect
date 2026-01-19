import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'
import useToast from './useToast'
import { useAuth } from '../context/AuthContext'

const useMyOpportunityReferrals = () => {
  const addToast = useToast()
  const { role } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const isStudent = useMemo(() => String(role ?? '').trim().toLowerCase() === 'student', [role])

  const fetchReferrals = useCallback(async () => {
    // All authenticated users can request referrals
    if (!role) {
      setReferrals([])
      setLoading(false)
      setError(null)
      return []
    }

    setLoading(true)
    setError(null)
    try {
      const response = await get('/api/opportunities/referrals/me')
      const data = Array.isArray(response?.data) ? response.data : []
      setReferrals(data)
      return data
    } catch (fetchError) {
      if (fetchError?.status === 403) {
        setReferrals([])
        setError(
          new Error(
            'Applications are available to student and alumni-student accounts. If you should have access, please contact support to enable application tracking.',
          ),
        )
        return []
      }

      setError(fetchError)
      addToast?.({
        title: 'Unable to load applications',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [addToast, role])

  useEffect(() => {
    fetchReferrals()
  }, [fetchReferrals])

  const map = useMemo(() => {
    const next = {}
    referrals.forEach((entry) => {
      const opportunityId = entry?.opportunity?._id ?? entry?.opportunity?.id ?? entry?.opportunity
      if (opportunityId) {
        next[String(opportunityId)] = entry
      }
    })
    return next
  }, [referrals])

  return {
    referrals,
    loading,
    error,
    refresh: fetchReferrals,
    referralMap: map,
    setReferrals,
  }
}

export default useMyOpportunityReferrals
