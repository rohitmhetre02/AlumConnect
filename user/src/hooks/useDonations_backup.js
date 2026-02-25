import { useCallback, useEffect, useMemo, useState } from 'react'



import { get, post, put } from '../utils/api'

import useToast from './useToast'



const normalizeISO = (value) => {

  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString()

}



const formatContribution = (contribution) => {

  if (!contribution) return null

  return {

    ...contribution,

    contributedAt: normalizeISO(contribution.contributedAt),

  }

}



const formatDonation = (donation) => {

  if (!donation) return null

  return {

    ...donation,

    deadline: normalizeISO(donation.deadline),

    createdAt: normalizeISO(donation.createdAt),

    updatedAt: normalizeISO(donation.updatedAt),

    contributions: Array.isArray(donation.contributions)

      ? donation.contributions.map(formatContribution).filter(Boolean)

      : [],

    contributionCount: typeof donation.contributionCount === 'number'

      ? donation.contributionCount

      : Array.isArray(donation.contributions)

      ? donation.contributions.length

      : 0,

  }

}



export const useDonations = () => {

  const [items, setItems] = useState([])

  const [loading, setLoading] = useState(true)

  const [error, setError] = useState(null)

  const addToast = useToast()



  const fetchDonations = useCallback(async () => {

    setLoading(true)

    setError(null)

    try {

      const response = await get('/donations', { includeAuth: false })

      const data = Array.isArray(response?.data) ? response.data : []

      setItems(data.map(formatDonation).filter(Boolean))

    } catch (fetchError) {

      setError(fetchError)

      addToast?.({

        title: 'Unable to load donations',

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

        const response = await post('/donations', {

          title,

          description,

          goalAmount,

          coverImage,

          deadline,

        })



        const formatted = formatDonation(response?.data)

        if (formatted) {

          setItems((prev) => [formatted, ...prev])

        }



        addToast?.({

          title: 'Campaign published',

          description: 'Your donation campaign is now live.',

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

        const response = await put(`/donations/${id}`, donationData)

        const formatted = formatDonation(response?.data)



        if (formatted) {

          setItems((prev) => {

            const exists = prev.some((campaign) => campaign.id === formatted.id)

            if (!exists) return prev

            return prev.map((campaign) => (campaign.id === formatted.id ? formatted : campaign))

          })

        }



        return formatted

      } catch (updateError) {

        console.error('useDonations: Unable to update donation:', updateError)

        throw updateError

      }

    },

    []

  )



  const contribute = useCallback(

    async (id, { amount, message }) => {

      try {

        const response = await post(`/donations/${id}/contribute`, { amount, message })

        const formatted = formatDonation(response?.data)

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

      const response = await get('/donations/mine')

      const data = Array.isArray(response?.data) ? response.data : []

      const formatted = data.map(formatDonation).filter(Boolean)

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

        const response = await get(`/donations/${id}`, { includeAuth: false })

        if (!isMounted) return

        setData(formatDonation(response?.data ?? null))

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



      const response = await post(`/donations/${id}/contribute`, { amount, message })

      const formatted = formatDonation(response?.data)

      setData(formatted)

      return formatted

    },

    [id],

  )



  return { data, loading, error, contribute }

}



export default useDonations

