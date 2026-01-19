import { useState, useCallback } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const useEventRegistrations = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const registerForEvent = useCallback(async (eventId, registrationData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed')
      }

      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to register for event'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getEventRegistrations = useCallback(async (eventId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/registrations`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch registrations')
      }

      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch registrations'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getRegistrationStats = useCallback(async (eventId) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/registrations/stats`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch registration stats')
      }

      return result
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch registration stats'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    registerForEvent,
    getEventRegistrations,
    getRegistrationStats,
    loading,
    error,
    clearError,
  }
}

export default useEventRegistrations
