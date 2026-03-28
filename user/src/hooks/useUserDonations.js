import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'

const formatDonation = (donation) => {
  if (!donation) return null
  return {
    ...donation,
    campaign: donation.campaign || {},
    donatedAt: donation.donatedAt ? new Date(donation.donatedAt) : null,
    amount: Number(donation.amount) || 0,
  }
}

export const useUserDonations = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserDonations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/campaigns/donations/user', { includeAuth: true })
      const data = Array.isArray(response?.data) ? response.data : []
      const formattedData = data.map(formatDonation).filter(Boolean)
      setItems(formattedData)
    } catch (fetchError) {
      setError(fetchError)
      console.error('Unable to load user donations:', fetchError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserDonations()
  }, [fetchUserDonations])

  const refresh = useCallback(() => {
    fetchUserDonations()
  }, [fetchUserDonations])

  return useMemo(
    () => ({ items, loading, error, refresh }),
    [items, loading, error, refresh]
  )
}
