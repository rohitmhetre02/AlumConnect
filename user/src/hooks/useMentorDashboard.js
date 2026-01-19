import { useCallback, useEffect, useMemo, useState } from 'react'
import { get } from '../utils/api'
import useToast from './useToast'

const DASHBOARD_ENDPOINT = '/api/mentors/dashboard/overview'

const normalizeMetricNumber = (value) => {
  const number = Number(value ?? 0)
  if (Number.isNaN(number) || number < 0) return 0
  return number
}

const normalizeSessionSummary = (session = {}) => {
  if (!session) return null
  return {
    id: session.id || session._id || '',
    menteeName: session.menteeName || '',
    serviceName: session.serviceName || '',
    sessionDate: session.sessionDate ? new Date(session.sessionDate) : null,
    mode: session.mode || 'online',
    status: session.status || 'scheduled',
  }
}

const normalizeRequestSummary = (request = {}) => {
  if (!request) return null
  return {
    id: request.id || request._id || '',
    menteeName: request.menteeName || '',
    serviceName: request.serviceName || '',
    status: request.status || 'pending',
    createdAt: request.createdAt ? new Date(request.createdAt) : null,
  }
}

const normalizeFeedbackSummary = (feedback = {}) => {
  if (!feedback) return null
  return {
    id: feedback.id || feedback._id || '',
    menteeName: feedback.menteeName || '',
    serviceName: feedback.serviceName || '',
    rating: typeof feedback.rating === 'number' ? feedback.rating : null,
    comment: feedback.comment || '',
    submittedAt: feedback.submittedAt ? new Date(feedback.submittedAt) : null,
  }
}

export const useMentorDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    totalMentees: 0,
    activeServices: 0,
    pendingRequests: 0,
  })
  const [upcomingSessions, setUpcomingSessions] = useState([])
  const [recentRequests, setRecentRequests] = useState([])
  const [recentFeedback, setRecentFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get(DASHBOARD_ENDPOINT)
      const data = response?.data ?? response

      const normalizedMetrics = {
        totalSessions: normalizeMetricNumber(data?.metrics?.totalSessions),
        upcomingSessions: normalizeMetricNumber(data?.metrics?.upcomingSessions),
        completedSessions: normalizeMetricNumber(data?.metrics?.completedSessions),
        totalMentees: normalizeMetricNumber(data?.metrics?.totalMentees),
        activeServices: normalizeMetricNumber(data?.metrics?.activeServices),
        pendingRequests: normalizeMetricNumber(data?.metrics?.pendingRequests),
      }

      const normalizedSessions = Array.isArray(data?.upcomingSessions)
        ? data.upcomingSessions.map(normalizeSessionSummary).filter(Boolean)
        : []

      const normalizedRequests = Array.isArray(data?.recentRequests)
        ? data.recentRequests.map(normalizeRequestSummary).filter(Boolean)
        : []

      const normalizedFeedback = Array.isArray(data?.recentFeedback)
        ? data.recentFeedback.map(normalizeFeedbackSummary).filter(Boolean)
        : []

      setMetrics(normalizedMetrics)
      setUpcomingSessions(normalizedSessions)
      setRecentRequests(normalizedRequests)
      setRecentFeedback(normalizedFeedback)
    } catch (err) {
      setError(err)
      toast?.({
        title: 'Unable to load mentor dashboard',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return useMemo(
    () => ({
      metrics,
      upcomingSessions,
      recentRequests,
      recentFeedback,
      loading,
      error,
      refresh: fetchDashboard,
    }),
    [metrics, upcomingSessions, recentRequests, recentFeedback, loading, error, fetchDashboard],
  )
}

export default useMentorDashboard
