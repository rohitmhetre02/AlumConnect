import { useCallback, useEffect, useMemo, useState } from 'react'

import { get, post } from '../utils/api'
import useToast from './useToast'

const normalizeTagsInput = (tags) => {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.filter(Boolean)
  }
  return String(tags)
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

export const useOpportunities = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/opportunities', { includeAuth: false })
      setItems(Array.isArray(response?.data) ? response.data : [])
    } catch (fetchError) {
      setError(fetchError)
      addToast?.({
        title: 'Unable to load opportunities',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createOpportunity = useCallback(
    async ({ title, company, type, location, description, skills, contactEmail, deadline, isRemote, postedBy }) => {
      try {
        const response = await post('/opportunities', {
          title,
          company,
          type,
          location,
          description,
          skills,
          contactEmail,
          deadline,
          isRemote,
          postedBy,
        })

        if (response?.data) {
          setItems((prev) => [response.data, ...prev])
        }

        addToast?.({
          title: 'Opportunity posted',
          description: 'Your opportunity is now live for students to discover.',
          tone: 'success',
        })

        return response?.data ?? null
      } catch (createError) {
        addToast?.({
          title: 'Unable to post opportunity',
          description: createError.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw createError
      }
    },
    [addToast]
  )

  return useMemo(
    () => ({
      items,
      loading,
      error,
      refresh: fetchItems,
      createOpportunity,
    }),
    [items, loading, error, fetchItems, createOpportunity]
  )
}

export const useMyOpportunities = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const addToast = useToast()

  const fetchItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/opportunities/mine')
      const data = Array.isArray(response?.data) ? response.data : []
      setItems(data)
      return data
    } catch (fetchError) {
      setError(fetchError)
      addToast?.({
        title: 'Unable to load your opportunities',
        description: fetchError.message ?? 'Please try again later.',
        tone: 'error',
      })
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return useMemo(
    () => ({ items, loading, error, refresh: fetchItems }),
    [items, loading, error, fetchItems],
  )
}

export const useOpportunity = (id) => {
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

    const fetchItem = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await get(`/opportunities/${id}`, { includeAuth: false })
        if (!isMounted) return
        setData(response?.data ?? null)
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        addToast?.({
          title: 'Unable to load opportunity',
          description: fetchError.message ?? 'Please try again later.',
          tone: 'error',
        })
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchItem()

    return () => {
      isMounted = false
    }
  }, [id, addToast])

  return { data, loading, error }
}

export default useOpportunities
