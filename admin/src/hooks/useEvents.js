import { useCallback, useEffect, useMemo, useState } from 'react'

import { get } from '../utils/api'

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

  return { data, loading, error }
}

export default useEvent
