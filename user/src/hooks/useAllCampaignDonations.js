import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'

const formatDonation = (donation) => {
  if (!donation) return null
  return {
    ...donation,
    donatedAt: donation.donatedAt ? new Date(donation.donatedAt) : null,
    amount: Number(donation.amount) || 0,
  }
}

export const useAllCampaignDonations = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAllDonations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/campaigns', { includeAuth: false })
      const campaigns = Array.isArray(response?.data) ? response.data : []
      
      // Extract all donations from all campaigns
      const allDonations = []
      campaigns.forEach(campaign => {
        if (campaign.donations && Array.isArray(campaign.donations)) {
          campaign.donations.forEach(donation => {
            allDonations.push({
              ...formatDonation(donation),
              campaign: {
                _id: campaign._id || campaign.id,
                id: (campaign._id || campaign.id)?.toString() || 'unknown',
                title: campaign.title || 'Unknown Campaign',
                coverImage: campaign.coverImage,
                approvalStatus: campaign.approvalStatus
              }
            })
          })
        }
      })

      // Sort by donation date (newest first)
      allDonations.sort((a, b) => new Date(b.donatedAt) - new Date(a.donatedAt))
      
      setItems(allDonations)
    } catch (fetchError) {
      setError(fetchError)
      console.error('Unable to load campaign donations:', fetchError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllDonations()
  }, [fetchAllDonations])

  const refresh = useCallback(() => {
    fetchAllDonations()
  }, [fetchAllDonations])

  return useMemo(
    () => ({ items, loading, error, refresh }),
    [items, loading, error, refresh]
  )
}
