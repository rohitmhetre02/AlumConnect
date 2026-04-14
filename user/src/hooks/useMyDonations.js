import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { get } from '../utils/api'

const formatDonation = (donation) => {
  if (!donation) return null
  return {
    ...donation,
    donatedAt: donation.donatedAt ? new Date(donation.donatedAt) : null,
    amount: Number(donation.amount) || 0,
  }
}

export const useMyDonations = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMyDonations = useCallback(async () => {
    if (!user?.id) {
      setItems([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await get('/campaigns', { includeAuth: true })
      const campaigns = Array.isArray(response?.data) ? response.data : []
      
      // Extract only user's donations from all campaigns
      const myDonations = []
      campaigns.forEach(campaign => {
        if (campaign.donations && Array.isArray(campaign.donations)) {
          campaign.donations.forEach(donation => {
            // Check if this donation belongs to the current user
            if (donation.donorId === user.id || 
                (donation.donorEmail && user.email && donation.donorEmail.toLowerCase() === user.email.toLowerCase())) {
              myDonations.push({
                ...formatDonation(donation),
                campaign: {
                  _id: campaign._id || campaign.id,
                  id: (campaign._id || campaign.id)?.toString() || 'unknown',
                  title: campaign.title || 'Unknown Campaign',
                  coverImage: campaign.coverImage,
                  approvalStatus: campaign.approvalStatus
                }
              })
            }
          })
        }
      })

      // Sort by donation date (newest first)
      myDonations.sort((a, b) => new Date(b.donatedAt) - new Date(a.donatedAt))
      
      setItems(myDonations)
    } catch (fetchError) {
      setError(fetchError)
      console.error('Unable to load my donations:', fetchError)
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.email])

  useEffect(() => {
    fetchMyDonations()
  }, [fetchMyDonations])

  const refresh = useCallback(() => {
    fetchMyDonations()
  }, [fetchMyDonations])

  return useMemo(
    () => ({ items, loading, error, refresh }),
    [items, loading, error, refresh]
  )
}
