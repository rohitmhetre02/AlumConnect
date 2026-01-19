import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'

const formatCampaign = (campaign) => {
  if (!campaign) return null
  return {
    ...campaign,
    deadline: campaign.deadline ? new Date(campaign.deadline) : null,
    createdAt: campaign.createdAt ? new Date(campaign.createdAt) : null,
    updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt) : null,
  }
}

export const useCampaigns = (id) => {
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
        const response = await get(`/campaigns/${id}`, { includeAuth: true })
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

  return { data, loading, error }
}

export default useCampaigns
