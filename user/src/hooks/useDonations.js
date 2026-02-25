import { useCallback, useEffect, useMemo, useState } from 'react'

import { get, post, put } from '../utils/api'

import useToast from './useToast'

const normalizeISO = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const formatCampaign = (campaign) => {
  if (!campaign) return null
  return {
    ...campaign,
    deadline: normalizeISO(campaign.deadline),
    createdAt: normalizeISO(campaign.createdAt),
    updatedAt: normalizeISO(campaign.updatedAt),
    contributions: Array.isArray(campaign.donations)
      ? campaign.donations.map(donation => ({
          id: donation._id,
          amount: donation.amount,
          message: donation.message,
          contributorId: donation.anonymous ? null : donation.donorEmail,
          contributorRole: 'donor',
          contributorName: donation.anonymous ? 'Anonymous' : donation.donorName,
          contributedAt: donation.donatedAt,
        })).filter(Boolean)
      : [],
    contributionCount: campaign.donorCount || campaign.donations?.length || 0,
  }
}

// Legacy hook for backward compatibility - now uses campaigns
export const useDonations = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/campaigns', { includeAuth: false })
      const data = Array.isArray(response?.data) ? response.data : []
      setItems(data.map(formatCampaign).filter(Boolean))
    } catch (fetchError) {
      setError(fetchError)
      addToast?.({
        title: 'Unable to load campaigns',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const createDonation = useCallback(
    async ({ title, description, goalAmount, coverImage, deadline }) => {
      try {
        const response = await post('/campaigns', {
          title,
          description,
          goalAmount,
          coverImage,
          deadline,
          category: 'community', // Default category for legacy donations
        })

        const formatted = formatCampaign(response?.data)
        if (formatted) {
          setItems((prev) => [formatted, ...prev])
        }

        addToast?.({
          title: 'Campaign published',
          description: 'Your campaign is now live.',
          tone: 'success',
        })

        return formatted
      } catch (createError) {
        addToast?.({
          title: 'Unable to publish campaign',
          description: createError.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw createError
      }
    },
    [addToast]
  )

  const updateDonation = useCallback(
    async (id, donationData) => {
      try {
        const response = await put(`/campaigns/${id}`, donationData)
        const formatted = formatCampaign(response?.data)

        if (formatted) {
          setItems((prev) => {
            const exists = prev.some((campaign) => campaign.id === formatted.id)
            if (!exists) return prev
            return prev.map((campaign) => (campaign.id === formatted.id ? formatted : campaign))
          })
        }

        return formatted
      } catch (updateError) {
        console.error('useDonations: Unable to update campaign:', updateError)
        throw updateError
      }
    },
    []
  )

  const contribute = useCallback(
    async (id, { amount, message }) => {
      try {
        const response = await post(`/campaigns/${id}/donate`, { 
          amount, 
          message,
          donorName: 'Anonymous User', // Default for legacy contributions
          donorEmail: 'user@example.com',
          anonymous: true
        })

        const formatted = formatCampaign(response?.data)
        if (formatted) {
          setItems((prev) => {
            const exists = prev.some((campaign) => campaign.id === formatted.id)
            if (!exists) return prev
            return prev.map((campaign) => (campaign.id === formatted.id ? formatted : campaign))
          })
        }

        return formatted
      } catch (contributeError) {
        addToast?.({
          title: 'Contribution failed',
          description: contributeError.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw contributeError
      }
    },
    [addToast],
  )

  return useMemo(
    () => ({ items, loading, error, refresh: fetchDonations, createDonation, updateDonation, contribute }),
    [items, loading, error, fetchDonations, createDonation, updateDonation, contribute]
  )
}

export const useMyDonations = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/campaigns/mine')
      const data = Array.isArray(response?.data) ? response.data : []
      const formatted = data.map(formatCampaign).filter(Boolean)
      setItems(formatted)
      return formatted
    } catch (fetchError) {
      setError(fetchError)
      addToast?.({
        title: 'Unable to load your campaigns',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  return useMemo(
    () => ({ items, loading, error, refresh: fetchDonations }),
    [items, loading, error, fetchDonations],
  )
}

export const useDonation = (id) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  useEffect(() => {
    let isMounted = true

    if (!id) {
      setLoading(false)
      setData(null)
      return () => {}
    }

    const fetchDonation = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await get(`/campaigns/${id}`, { includeAuth: false })
        if (!isMounted) return
        setData(formatCampaign(response?.data ?? null))
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        addToast?.({
          title: 'Unable to load campaign',
          description: fetchError.message ?? 'Please try again later.',
          tone: 'error',
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDonation()

    return () => {
      isMounted = false
    }
  }, [id, addToast])

  const contribute = useCallback(
    async ({ amount, message }) => {
      if (!id) {
        throw new Error('Campaign id is required to contribute')
      }

      const response = await post(`/campaigns/${id}/donate`, { 
        amount, 
        message,
        donorName: 'Anonymous User',
        donorEmail: 'user@example.com',
        anonymous: true
      })
      const formatted = formatCampaign(response?.data)
      setData(formatted)
      return formatted
    },
    [id],
  )

  return { data, loading, error, contribute }
}

export default useDonations
