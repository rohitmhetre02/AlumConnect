import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'

const normalizeRegistration = (entry) => {
  if (!entry) return null

  const event = entry.event || entry.eventId || {}

  const toIso = (value) => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  const id = event._id || event.id || entry.eventId
  if (!id) return null

  return {
    id: typeof id === 'string' ? id : id.toString(),
    event: {
      id: typeof id === 'string' ? id : id.toString(),
      title: event.title || '',
      description: event.description || '',
      location: event.location || '',
      coverImage: event.coverImage || '',
      startAt: toIso(event.startAt),
      endAt: toIso(event.endAt),
      registrationLink: event.registrationLink || '',
      organization: event.organization || '',
      registrationCount: typeof event.registrationCount === 'number' ? event.registrationCount : 0,
      createdByName: event.createdByName || '',
    },
    registeredAt: toIso(entry.registeredAt) || null,
    registrationType: entry.registrationType || '',
  }
}

const useRegisteredEvents = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRegisteredEvents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get('/events/registrations/me', { includeAuth: true })
      const data = Array.isArray(response?.data) ? response.data : []
      const normalized = data.map(normalizeRegistration).filter(Boolean)
      setItems(normalized)
      return normalized
    } catch (err) {
      setError(err)
      console.error('useRegisteredEvents: unable to load registrations', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRegisteredEvents()
  }, [fetchRegisteredEvents])

  const memoized = useMemo(() => items, [items])

  return {
    items: memoized,
    loading,
    error,
    refresh: fetchRegisteredEvents,
  }
}

export default useRegisteredEvents
