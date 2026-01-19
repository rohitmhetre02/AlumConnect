import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { get, post } from '../utils/api'
import useToast from './useToast'
import { useAuth } from '../context/AuthContext'

const useOpportunityReferral = (opportunityId, { autoFetch = true } = {}) => {
  const addToast = useToast()
  const { role } = useAuth()
  const [referral, setReferral] = useState(null)
  const [loading, setLoading] = useState(Boolean(autoFetch && opportunityId))
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const normalizedId = useMemo(() => (opportunityId ? String(opportunityId) : ''), [opportunityId])

  const isStudent = useMemo(() => String(role ?? '').trim().toLowerCase() === 'student', [role])

  const fetchReferral = useCallback(async () => {
    if (!normalizedId) {
      setReferral(null)
      setLoading(false)
      return null
    }

    // All authenticated users can request referrals
    if (!role) {
      setReferral(null)
      setLoading(false)
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const response = await get(`/api/opportunities/${normalizedId}/referrals/me`)
      const payload = response?.data ?? response
      setReferral(payload)
      return payload
    } catch (err) {
      if (err?.status === 404) {
        setReferral(null)
        return null
      }

      console.error('useOpportunityReferral fetch error:', err)
      setError(err)
      addToast?.({
        title: 'Unable to load referral',
        description: err.message ?? 'Please try again later.',
        tone: 'error',
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [normalizedId])

  useEffect(() => {
    if (!autoFetch || !normalizedId) {
      setReferral(null)
      setLoading(false)
      return
    }

    fetchReferral()
  }, [autoFetch, normalizedId])

  const submitReferral = useCallback(
    async ({ proposal, resumeFile }) => {
      if (!normalizedId) {
        throw new Error('An opportunity must be selected before submitting a referral.')
      }

      const trimmedProposal = String(proposal ?? '').trim()
      if (!trimmedProposal) {
        const validationError = new Error('Please describe why you are requesting the referral.')
        validationError.code = 'VALIDATION_ERROR'
        throw validationError
      }

      setSubmitting(true)
      setError(null)

      try {
        const formData = new FormData()
        formData.append('proposal', trimmedProposal)
        if (resumeFile instanceof File) {
          formData.append('resume', resumeFile)
        }

        const response = await post(`/api/opportunities/${normalizedId}/referrals`, formData)
        const payload = response?.data ?? response
        setReferral(payload)
        addToast?.({
          title: 'Referral submitted',
          description: 'Your referral request has been shared with the poster.',
          tone: 'success',
        })
        return payload
      } catch (err) {
        console.error('useOpportunityReferral submit error:', err)
        setError(err)
        const description = err?.message ?? 'Please try again later.'
        addToast?.({ title: 'Unable to submit referral', description, tone: 'error' })
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    [normalizedId],
  )

  return {
    referral,
    loading,
    error,
    submitting,
    fetchReferral,
    submitReferral,
    setReferral,
  }
}

export default useOpportunityReferral
