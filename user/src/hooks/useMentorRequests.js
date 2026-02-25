import { useCallback, useEffect, useMemo, useState } from 'react'
import { get, post } from '../utils/api'
import useToast from './useToast'
import { useAuth } from '../context/AuthContext'

const MENTOR_REQUESTS_ENDPOINT = '/api/mentors/me/requests'
const MENTEE_REQUESTS_ENDPOINT = '/api/mentors/my-requests'

const toId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (value && typeof value.toString === 'function') return value.toString()
  return String(value)
}

const normalizeRequest = (request = {}) => {
  if (!request) return null

  const createdAt = request.createdAt ? new Date(request.createdAt) : null
  const updatedAt = request.updatedAt ? new Date(request.updatedAt) : null
  const preferredDateTime = request.preferredDateTime ? new Date(request.preferredDateTime) : null
  const scheduledDateTime = request.scheduledDateTime ? new Date(request.scheduledDateTime) : null
  const proposedSlots = Array.isArray(request.proposedSlots)
    ? request.proposedSlots
        .map((slot) => {
          if (!slot || !slot.slotDate) return null
          const slotDate = new Date(slot.slotDate)
          if (Number.isNaN(slotDate.getTime())) return null
          return {
            slotDate,
            mode: slot.mode || 'online',
          }
        })
        .filter(Boolean)
    : []

  return {
    id: request.id || request._id || '',
    mentorId: toId(request.mentor),
    menteeId: toId(request.mentee),
    serviceId: toId(request.service),
    serviceName: request.serviceName || '',
    serviceDuration: request.serviceDuration || '',
    serviceMode: request.serviceMode || request.preferredMode || 'online',
    servicePrice: typeof request.servicePrice === 'number' ? request.servicePrice : Number(request.servicePrice ?? 0),
    menteeName: request.menteeName || '',
    menteeEmail: request.menteeEmail || '',
    menteeAvatar: request.menteeAvatar || '',
    menteeSkills: Array.isArray(request.menteeSkills) ? request.menteeSkills.filter(Boolean) : [],
    mentorName: request.mentorName || '',
    mentorEmail: request.mentorEmail || '',
    mentorAvatar: request.mentorAvatar || '',
    preferredDateTime,
    preferredMode: request.preferredMode || request.serviceMode || 'online',
    scheduledDateTime,
    scheduledMode: request.scheduledMode || '',
    proposedSlots,
    meetingLink: request.meetingLink || '',
    notes: request.notes || '',
    status: (request.status || 'pending').toLowerCase(),
    session: request.session || null,
    createdAt,
    updatedAt,
  }
}

const sortRequests = (list = []) => {
  return [...list].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return b.createdAt - a.createdAt
    }
    return a.menteeName.localeCompare(b.menteeName)
  })
}

export const useMentorRequests = () => {
  const { role: contextRole, user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()

  const normalizedRole = (contextRole || user?.role || user?.profile?.role || '').toLowerCase()
  const isMentor = normalizedRole === 'alumni'
  const isStudent = normalizedRole === 'student'
  const isAlumniStudent = normalizedRole === 'alumni-student'
  const listEndpoint = ['student', 'alumni-student'].includes(normalizedRole)
    ? MENTEE_REQUESTS_ENDPOINT
    : MENTOR_REQUESTS_ENDPOINT
  const mentorEndpoint = MENTOR_REQUESTS_ENDPOINT

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await get(listEndpoint)
      const rawData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      const data = rawData.map(normalizeRequest).filter(Boolean)
      setItems(sortRequests(data))
    } catch (err) {
      setError(err)
      toast?.({
        title: 'Unable to load requests',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setLoading(false)
    }
  }, [toast, listEndpoint])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const getRequestDetails = useCallback(
    async (requestId) => {
      const response = await get(`${mentorEndpoint}/${requestId}`)
      const rawRequest = response?.request ?? response?.data ?? response
      const rawSession = response?.session
      return {
        request: normalizeRequest(rawRequest),
        session: rawSession ? normalizeRequest(rawSession) : null,
      }
    },
    [mentorEndpoint],
  )

  const acceptRequest = useCallback(
    async (requestId, payload = {}) => {
      try {
        const response = await post(`${mentorEndpoint}/${requestId}/accept`, payload)
        const request = normalizeRequest(response?.data ?? response)
        if (request) {
          setItems((prev) => sortRequests(prev.map((item) => (item.id === request.id ? request : item))))
        }
        toast?.({
          title: 'Request accepted',
          description: 'The mentee will be notified of your acceptance.',
          tone: 'success',
        })
        return request
      } catch (err) {
        toast?.({
          title: 'Unable to accept request',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast, mentorEndpoint],
  )

  const rejectRequest = useCallback(
    async (requestId) => {
      try {
        const response = await post(`${mentorEndpoint}/${requestId}/reject`)
        const request = normalizeRequest(response?.data ?? response)
        if (request) {
          setItems((prev) => sortRequests(prev.map((item) => (item.id === request.id ? request : item))))
        }
        toast?.({
          title: 'Request rejected',
          description: 'The mentee will be notified of your decision.',
          tone: 'success',
        })
        return request
      } catch (err) {
        toast?.({
          title: 'Unable to reject request',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast],
  )

  const confirmRequest = useCallback(
    async (requestId, payload = {}) => {
      try {
        const response = await post(`${mentorEndpoint}/${requestId}/confirm`, payload)
        const request = normalizeRequest(response?.data ?? response)
        if (request) {
          setItems((prev) => sortRequests(prev.map((item) => (item.id === request.id ? request : item))))
        }
        toast?.({
          title: 'Schedule confirmed',
          description: 'Your mentorship session has been scheduled successfully.',
          tone: 'success',
        })
        return request
      } catch (err) {
        toast?.({
          title: 'Unable to confirm schedule',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast, mentorEndpoint],
  )

  const updateMeetingLink = useCallback(
    async (requestId, meetingLink) => {
      try {
        const response = await post(`${mentorEndpoint}/${requestId}/meeting-link`, { meetingLink })
        const request = normalizeRequest(response?.data ?? response)
        if (request) {
          setItems((prev) => sortRequests(prev.map((item) => (item.id === request.id ? request : item))))
        }
        toast?.({
          title: 'Meeting link updated',
          description: 'The meeting link has been shared with the mentee.',
          tone: 'success',
        })
        return request
      } catch (err) {
        toast?.({
          title: 'Unable to update meeting link',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast, mentorEndpoint],
  )

  const reviewRequest = useCallback(
    async (requestId) => {
      try {
        const response = await post(`${mentorEndpoint}/${requestId}/review`, {})
        const request = normalizeRequest(response?.data ?? response)
        if (request) {
          setItems((prev) => sortRequests(prev.map((item) => (item.id === request.id ? request : item))))
        }
        toast?.({
          title: 'Request marked for review',
          description: 'The mentorship request has been moved to review status.',
          tone: 'success',
        })
        return request
      } catch (err) {
        toast?.({
          title: 'Unable to mark for review',
          description: err?.message ?? 'Please try again later.',
          tone: 'error',
        })
        throw err
      }
    },
    [toast, mentorEndpoint],
  )

  const currentUserId = (user?._id || user?.id || user?.profile?._id || user?.profile?.id || '').toString()

  return useMemo(
    () => ({
      requests: items,
      loading,
      error,
      refresh: fetchRequests,
      getRequestDetails,
      acceptRequest,
      rejectRequest,
      reviewRequest,
      confirmRequest,
      updateMeetingLink,
      selfId: currentUserId,
      role: normalizedRole,
    }),
    [
      items,
      loading,
      error,
      fetchRequests,
      getRequestDetails,
      acceptRequest,
      rejectRequest,
      reviewRequest,
      confirmRequest,
      currentUserId,
      normalizedRole,
    ],
  )
}

export default useMentorRequests
