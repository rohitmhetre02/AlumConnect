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
    mentorId: toId(request.mentor?._id || request.mentor?.id || request.mentorId || request.mentor),
    menteeId: toId(request.mentee),
    serviceId: toId(request.service),
    serviceName: request.serviceName || '',
    serviceDuration: request.serviceDuration || '',
    serviceMode: request.serviceMode || request.preferredMode || 'online',
    servicePrice: typeof request.servicePrice === 'number' ? request.servicePrice : Number(request.servicePrice ?? 0),
    menteeName: request.menteeName || '',
    menteeEmail: request.menteeEmail || '',
    menteeAvatar: request.menteeAvatar || '',
    menteeDepartment: request.menteeDepartment || '',
    menteeRole: request.menteeRole || '',
    currentYear: request.currentYear || '',
    passoutYear: request.passoutYear || '',
    menteeSkills: Array.isArray(request.menteeSkills) ? request.menteeSkills.filter(Boolean) : [],
    requestMessage: request.requestMessage || '',
    mentorName: request.mentorName || request.mentor?.firstName && request.mentor?.lastName ? 
      `${request.mentor.firstName} ${request.mentor.lastName}` : 
      request.mentorName || '',
    mentorEmail: request.mentorEmail || request.mentor?.email || '',
    mentorAvatar: request.mentorAvatar || request.mentor?.avatar || '',
    preferredDateTime,
    preferredMode: request.preferredMode || request.serviceMode || 'online',
    scheduledDateTime,
    scheduledMode: request.scheduledMode || '',
    proposedSlots,
    meetingLink: request.meetingLink || '',
    notes: request.notes || '',
    status: (request.status || 'pending').toLowerCase(),
    session: request.session || null,
    sessionOutcome: request.sessionOutcome || '',
    remark: request.remark || '',
    reviewSubmitted: request.reviewSubmitted || false,
    rating: request.rating || null,
    feedback: request.feedback || '',
    createdAt,
    updatedAt,
    // Include populated mentee data if available
    mentee: request.mentee || null,
    // Include populated mentor data if available
    mentor: request.mentor || null,
    // Include sessionDetails with new fields
    sessionDetails: request.sessionDetails || null,
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
  
  // IMPORTANT: For MentorshipRequestsPage, we always want requests sent BY the user (as mentee)
  // So we always use /api/mentors/my-requests regardless of user role
  const listEndpoint = MENTEE_REQUESTS_ENDPOINT
  const mentorEndpoint = MENTOR_REQUESTS_ENDPOINT

  console.log('useMentorRequests Debug - User Role:', normalizedRole)
  console.log('useMentorRequests Debug - Is Mentor:', isMentor)
  console.log('useMentorRequests Debug - Is Student:', isStudent)
  console.log('useMentorRequests Debug - Is Alumni-Student:', isAlumniStudent)
  console.log('useMentorRequests Debug - Using Endpoint (always mentee requests):', listEndpoint)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    setError(null)
    console.log('useMentorRequests Debug - Fetching from:', listEndpoint)
    try {
      const response = await get(listEndpoint)
      console.log('useMentorRequests Debug - API Response:', response)
      
      const rawData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
      console.log('useMentorRequests Debug - Raw Data:', rawData)
      
      const data = rawData.map(normalizeRequest).filter(Boolean)
      console.log('useMentorRequests Debug - Normalized Data:', data)
      
      setItems(sortRequests(data))
    } catch (err) {
      console.error('useMentorRequests Debug - Error:', err)
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
        console.log('acceptRequest called with:', { requestId, payload })
        const endpoint = `${mentorEndpoint}/${requestId}/accept`
        console.log('Calling endpoint:', endpoint)
        const response = await post(endpoint, payload)
        console.log('Accept response:', response)
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
        console.error('Accept request error:', err)
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

  const completeSession = useCallback(
    async (requestId, outcome, remark = '') => {
      try {
        const response = await post(`${mentorEndpoint}/${requestId}/complete`, {
          outcome,
          remark
        })
        const request = normalizeRequest(response?.data ?? response)
        if (request) {
          setItems((prev) => sortRequests(prev.map((item) => (item.id === request.id ? request : item))))
        }
        toast?.({
          title: `Session ${outcome}`,
          description: outcome === 'completed' ? 'Session marked as completed successfully.' : 'Session marked as missed.',
          tone: 'success',
        })
        return request
      } catch (err) {
        toast?.({
          title: 'Unable to complete session',
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
      completeSession,
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
      completeSession,
      currentUserId,
      normalizedRole,
    ],
  )
}

export default useMentorRequests
