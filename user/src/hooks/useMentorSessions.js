import { useCallback, useEffect, useMemo, useState } from 'react'
import { get, put } from '../utils/api'
import useToast from './useToast'

const SESSIONS_ENDPOINT = '/api/mentors/me/sessions'

const normalizeSession = (session = {}) => {
  if (!session) return null

  return {
    id: session.id || session._id || '',
    menteeName: session.menteeName || '',
    menteeEmail: session.menteeEmail || '',
    menteeAvatar: session.menteeAvatar || '',
    serviceName: session.serviceName || '',
    sessionDate: session.sessionDate ? new Date(session.sessionDate) : null,
    durationMinutes: typeof session.durationMinutes === 'number' ? session.durationMinutes : Number(session.durationMinutes ?? 0),
    status: session.status || 'completed',
    mode: session.mode || 'online',
    notes: session.notes || '',
    feedback: session.feedback
      ? {
          rating: typeof session.feedback.rating === 'number' ? session.feedback.rating : null,
          comment: session.feedback.comment || '',
          submittedAt: session.feedback.submittedAt ? new Date(session.feedback.submittedAt) : null,
        }
      : null,
    createdAt: session.createdAt ? new Date(session.createdAt) : null,
    updatedAt: session.updatedAt ? new Date(session.updatedAt) : null,
  }
}

const sortSessions = (list = []) => {
  return [...list].sort((a, b) => {
    if (a.sessionDate && b.sessionDate) {
      return b.sessionDate - a.sessionDate
    }
    return b.createdAt - a.createdAt
  })
}

export const useMentorSessions = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get(SESSIONS_ENDPOINT)
      const data = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      setItems(sortSessions(data.map(normalizeSession).filter(Boolean)))
    } catch (err) {
      setError(err)
      toast?.({
        title: 'Unable to load session history',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const getSessionDetails = useCallback(
    async (sessionId) => {
      try {
        const response = await get(`${SESSIONS_ENDPOINT}/${sessionId}`)
        return normalizeSession(response?.data ?? response)
      } catch (err) {
        toast?.({
          title: 'Unable to load session details',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  const updateSession = useCallback(
    async (sessionId, payload) => {
      try {
        const response = await put(`${SESSIONS_ENDPOINT}/${sessionId}`, payload)
        const session = normalizeSession(response?.data ?? response)
        if (session) {
          setItems((prev) => sortSessions(prev.map((item) => (item.id === session.id ? session : item))))
        }
        toast?.({
          title: 'Session updated',
          description: 'Session details have been saved.',
          tone: 'success',
        })
        return session
      } catch (err) {
        toast?.({
          title: 'Unable to update session',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  return useMemo(
    () => ({
      sessions: items,
      loading,
      error,
      refresh: fetchSessions,
      getSessionDetails,
      updateSession,
    }),
    [items, loading, error, fetchSessions, getSessionDetails, updateSession],
  )
}

export default useMentorSessions
