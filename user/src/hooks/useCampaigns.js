import { useCallback, useEffect, useMemo, useState } from 'react'

import { get, post, put, del } from '../utils/api'

const formatCampaign = (campaign) => {
  if (!campaign) return null
  return {
    ...campaign,
    deadline: campaign.deadline ? new Date(campaign.deadline) : null,
    createdAt: campaign.createdAt ? new Date(campaign.createdAt) : null,
    updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt) : null,
  }
}

export const useCampaigns = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/campaigns', { includeAuth: false })
      const data = Array.isArray(response?.data) ? response.data : []
      setItems(data.map(formatCampaign).filter(Boolean))
    } catch (fetchError) {
      setError(fetchError)
      console.error('Unable to load campaigns:', fetchError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const createCampaign = useCallback(
    async ({ title, description, goalAmount, coverImage, deadline, category, tags, featured, priority }) => {
      try {
        console.log('Creating campaign with data:', {
          title, description, goalAmount, coverImage, deadline, category, tags, featured, priority
        })
        
        const response = await post('/campaigns', {
          title,
          description,
          goalAmount,
          coverImage,
          deadline,
          category,
          tags,
          featured,
          priority,
        })

        console.log('Campaign creation response:', response)
        const formatted = formatCampaign(response?.data)

        if (formatted) {
          setItems((prev) => [formatted, ...prev])
        }

        return formatted
      } catch (createError) {
        console.error('Unable to publish campaign:', createError)
        throw createError
      }
    },
    []
  )

  const updateCampaign = useCallback(
    async (id, updates) => {
      try {
        const response = await put(`/campaigns/${id}`, updates)
        const formatted = formatCampaign(response?.data)

        if (formatted) {
          setItems((prev) => prev.map((item) => (item.id === id ? formatted : item)))
        }

        return formatted
      } catch (updateError) {
        console.error('Unable to update campaign:', updateError)
        throw updateError
      }
    },
    []
  )

  const deleteCampaign = useCallback(async (id) => {
    try {
      await del(`/campaigns/${id}`)
      setItems((prev) => prev.filter((item) => item.id !== id))
      return true
    } catch (deleteError) {
      console.error('Unable to delete campaign:', deleteError)
      throw deleteError
    }
  }, [])

  return useMemo(
    () => ({ items, loading, error, refresh: fetchCampaigns, createCampaign, updateCampaign, deleteCampaign }),
    [items, loading, error, fetchCampaigns, createCampaign, updateCampaign, deleteCampaign]
  )
}

export const useCampaign = (id) => {
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

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await get(`/campaigns/${id}`, { includeAuth: false })
        if (!isMounted) return
        setData(formatCampaign(response?.data ?? null))
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        console.error('Unable to load campaign:', fetchError)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [id])

  const donateToCampaign = useCallback(
    async (donationData) => {
      try {
        const response = await post(`/campaigns/${id}/donate`, donationData)
        const formatted = formatCampaign(response?.data)
        if (formatted) {
          setData(formatted)
        }
        return formatted
      } catch (donateError) {
        console.error('Unable to donate to campaign:', donateError)
        throw donateError
      }
    },
    [id]
  )

  return { data, loading, error, donateToCampaign }
}

export const useCampaignStats = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await get('/campaigns/stats', { includeAuth: false })
        if (!isMounted) return
        setData(response?.data ?? null)
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        console.error('Unable to load campaign stats:', fetchError)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading, error }
}

export default useCampaigns
