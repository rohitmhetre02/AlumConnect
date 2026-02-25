import { useCallback, useEffect, useMemo, useState } from 'react'

import { get, post, put } from '../utils/api'

const ALLOWED_EVENT_MODES = Object.freeze(['online', 'in-person', 'hybrid'])
export const EVENT_MODES = ALLOWED_EVENT_MODES

const normalizeMode = (mode) => {
  const normalized = String(mode ?? '').toLowerCase().trim()
  return ALLOWED_EVENT_MODES.includes(normalized) ? normalized : 'in-person'
}

const normalizeISO = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const formatEvent = (event) => {
  if (!event) return null
  return {
    ...event,
    mode: normalizeMode(event.mode),
    startAt: normalizeISO(event.startAt),
    endAt: normalizeISO(event.endAt),
    isRegistered: Boolean(event.isRegistered),
    registrationCount: typeof event.registrationCount === 'number' ? event.registrationCount : 0,
  }
}

export const useEvents = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/events', { includeAuth: false })
      const data = Array.isArray(response?.data) ? response.data : []
      setItems(data.map(formatEvent).filter(Boolean))
    } catch (fetchError) {
      setError(fetchError)
      console.error('Unable to load events:', fetchError)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const updateEvent = useCallback(
    async (id, eventData) => {
      try {
        const response = await put(`/events/${id}`, eventData)
        const formatted = formatEvent(response?.data)

        if (formatted) {
          setItems((prev) => {
            const exists = prev.some((event) => event.id === formatted.id)
            if (!exists) return prev
            return prev.map((event) => (event.id === formatted.id ? formatted : event))
          })
        }

        return formatted
      } catch (updateError) {
        console.error('useEvents: Unable to update event:', updateError)
        throw updateError
      }
    },
    []
  )

  const createEvent = useCallback(
    async ({ title, description, location, coverImage, startAt, endAt, mode, registrationLink, organization, department, branch }) => {
      try {
        console.log('useEvents: Creating event with data:', {
          title, description, location, coverImage, startAt, endAt, mode, registrationLink, organization, department, branch
        })
        
        const response = await post('/events', {
          title,
          description,
          location,
          coverImage,
          startAt,
          endAt,
          mode,
          registrationLink,
          organization,
          department,
          branch,
        })

        console.log('useEvents: API response:', response)
        const formatted = formatEvent(response?.data)

        if (formatted) {
          setItems((prev) => [formatted, ...prev])
        }

        return formatted
      } catch (createError) {
        console.error('useEvents: Unable to publish event:', createError)
        throw createError
      }
    },
    []
  )

  const registerForEvent = useCallback(
    async (eventId, payload) => {
      try {
        const response = await post(`/events/${eventId}/register`, payload)
        const formatted = formatEvent(response?.data)

        if (formatted) {
          setItems((prev) => {
            const exists = prev.some((event) => event.id === formatted.id)
            if (!exists) return prev
            return prev.map((event) => (event.id === formatted.id ? formatted : event))
          })
        }

        return formatted
      } catch (registerError) {
        console.error('useEvents: Unable to register for event:', registerError)
        throw registerError
      }
    },
    []
  )

  return useMemo(
    () => ({ 
      items, 
      loading, 
      error, 
      refresh: fetchEvents, 
      createEvent,
      updateEvent,
      registerForEvent,
      getEventById: async (id) => {
        try {
          const response = await get(`/events/${id}`, { includeAuth: false })
          return formatEvent(response?.data)
        } catch (error) {
          console.error('Failed to get event by id:', error)
          throw error
        }
      }
    }),
    [items, loading, error, fetchEvents, createEvent, updateEvent, registerForEvent]
  )
}

export const useMyEvents = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/events/mine')
      const data = Array.isArray(response?.data) ? response.data : []
      const formatted = data.map(formatEvent).filter(Boolean)
      setItems(formatted)
      return formatted
    } catch (fetchError) {
      setError(fetchError)
      console.error('Unable to load your events:', fetchError)
      throw fetchError
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  return useMemo(
    () => ({ items, loading, error, refresh: fetchEvents }),
    [items, loading, error, fetchEvents],
  )
}

export const useEvent = (id) => {
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
        const response = await get(`/events/${id}`, { includeAuth: true })
        if (!isMounted) return
        setData(formatEvent(response?.data ?? null))
      } catch (fetchError) {
        if (!isMounted) return
        setError(fetchError)
        console.error('Unable to load event:', fetchError)
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

  const register = useCallback(
    async (payload) => {
      if (!id) {
        throw new Error('Event id is required to register')
      }

      const response = await post(`/events/${id}/register`, payload)
      const formatted = formatEvent(response?.data)
      setData(formatted)
      return formatted
    },
    [id],
  )

  return { data, loading, error, register }
}

export default useEvents
