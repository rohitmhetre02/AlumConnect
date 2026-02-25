const mongoose = require('mongoose')

const MentorRequest = require('../models/MentorRequest')
const MentorSession = require('../models/MentorSession')
const MentorApplication = require('../models/MentorApplication')
const MentorService = require('../models/MentorService')
const Student = require('../models/Student')
const Alumni = require('../models/Alumni')

const ensureMentor = (req) => {
  const userId = req.user?.id
  const role = req.user?.role?.toLowerCase?.()

  if (!userId) {
    return { error: { status: 401, message: 'Authentication required.' } }
  }

  const allowedRoles = ['alumni', 'alumni-student']
  if (!role || !allowedRoles.includes(role)) {
    return { error: { status: 403, message: 'Only mentors can manage mentee requests.' } }
  }

  return { userId }
}

const listMyRequests = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const isMentor = role === 'alumni' || role === 'alumni-student'
    const isStudent = role === 'student'
    const isAlumniStudent = role === 'alumni-student'

    if (!isMentor && !isStudent && !isAlumniStudent) {
      return res.status(403).json({ message: 'Mentorship requests are only available to student and mentor accounts.' })
    }

    const { status } = req.query ?? {}

    const filters = []
    if (isMentor) {
      filters.push({ mentor: userId })
    }
    if (isStudent || isAlumniStudent || isMentor) {
      filters.push({ mentee: userId })
    }

    const query = filters.length === 1 ? filters[0] : { $or: filters }

    if (status) {
      const statusCondition = Array.isArray(status)
        ? { $in: status.map((item) => String(item).toLowerCase()) }
        : String(status).toLowerCase()

      query.status = statusCondition
    }

    const requests = await MentorRequest.find(query).sort({ createdAt: -1 })
    return res.status(200).json(requests)
  } catch (error) {
    console.error('listMyRequests error:', error)
    return res.status(500).json({ message: 'Unable to load mentee requests.' })
  }
}

const normalizeMode = (value, fallback = 'online') => {
  const normalized = (value || fallback || '').toString().trim().toLowerCase()
  return ['online', 'offline', 'hybrid'].includes(normalized) ? normalized : fallback
}

const sanitizeProposedSlots = (slots = []) => {
  if (!Array.isArray(slots)) return []

  const limit = Math.min(slots.length, 3)
  const seen = new Set()
  const result = []

  for (let index = 0; index < limit; index += 1) {
    const slot = slots[index]
    if (!slot) continue

    const rawDate = slot.slotDate || slot.date || slot.scheduledDateTime || slot.datetime || slot.value
    if (!rawDate) continue

    const parsedDate = new Date(rawDate)
    if (Number.isNaN(parsedDate.getTime())) continue

    const isoKey = parsedDate.toISOString()
    if (seen.has(isoKey)) continue
    seen.add(isoKey)

    result.push({
      slotDate: parsedDate,
      mode: normalizeMode(slot.mode, 'online'),
    })
  }

  return result
}

const getMenteeProfile = async (userId, role) => {
  if (!userId) return null
  if (role === 'student') {
    return Student.findById(userId)
  }
  return Alumni.findById(userId)
}

const createMentorRequest = async (req, res) => {
  try {
    const requesterId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!requesterId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!['student', 'alumni', 'alumni-student'].includes(role)) {
      return res.status(403).json({ message: 'Only students and alumni can request mentorship.' })
    }

    const { mentorId } = req.params ?? {}
    if (!mentorId || !mongoose.isValidObjectId(mentorId)) {
      return res.status(400).json({ message: 'A valid mentor identifier is required.' })
    }

    const {
      serviceId,
      preferredDateTime,
      preferredMode,
      notes = '',
    } = req.body ?? {}

    const mentorApplication = await MentorApplication.findOne({ _id: mentorId, status: 'approved' }).populate('user')
    if (!mentorApplication) {
      return res.status(404).json({ message: 'Mentor profile not found.' })
    }

    const mentorOwnerId = mentorApplication.user?._id?.toString()
    if (!mentorOwnerId) {
      return res.status(400).json({ message: 'Mentor profile is missing owner information.' })
    }

    let serviceDoc = null
    if (serviceId) {
      serviceDoc = await MentorService.findOne({ _id: serviceId, user: mentorOwnerId, status: 'active' })
      if (!serviceDoc) {
        return res.status(404).json({ message: 'Selected service is not available.' })
      }
    }

    const menteeProfile = await getMenteeProfile(requesterId, role)
    if (!menteeProfile) {
      return res.status(404).json({ message: 'Your profile could not be found. Please try again later.' })
    }

    const fullName = (mentorApplication.fullName || mentorApplication.user?.fullName || '').trim()
    const mentorName = fullName || `${mentorApplication.user?.firstName ?? ''} ${mentorApplication.user?.lastName ?? ''}`.trim() || mentorApplication.user?.email || 'Mentor'
    const mentorEmail = mentorApplication.email || mentorApplication.user?.email || ''
    const mentorAvatar = mentorApplication.user?.avatar || ''

    const menteeFullName =
      menteeProfile.fullName || `${menteeProfile.firstName ?? ''} ${menteeProfile.lastName ?? ''}`.trim() || menteeProfile.email

    const normalizedMode = normalizeMode(preferredMode, serviceDoc?.mode || mentorApplication.modes?.[0] || 'online')
    const normalizedDate = preferredDateTime ? new Date(preferredDateTime) : null

    if (normalizedDate && Number.isNaN(normalizedDate.getTime())) {
      return res.status(400).json({ message: 'Preferred date/time is invalid.' })
    }

    const requestPayload = {
      mentee: requesterId,
      mentor: mentorOwnerId,
      service: serviceDoc?._id ?? undefined,
      serviceName: serviceDoc?.title || mentorApplication.services?.[0]?.title || 'Mentorship Session',
      serviceDuration: serviceDoc?.duration || mentorApplication.services?.[0]?.duration || '',
      serviceMode: serviceDoc?.mode || '',
      servicePrice: serviceDoc?.price ?? 0,
      menteeName: menteeFullName,
      menteeEmail: menteeProfile.email || '',
      menteeAvatar: menteeProfile.avatar || '',
      menteeSkills: Array.isArray(menteeProfile.skills) ? menteeProfile.skills.filter(Boolean) : [],
      preferredDateTime: normalizedDate,
      preferredMode: normalizedMode,
      notes: notes?.toString()?.trim() || '',
      proposedSlots: [],
      mentorName,
      mentorEmail,
      mentorAvatar,
      status: 'pending',
    }

    if (!requestPayload.serviceName) {
      return res.status(400).json({ message: 'A mentorship service is required to submit a request.' })
    }

    const createdRequest = await MentorRequest.create(requestPayload)
    return res.status(201).json(createdRequest)
  } catch (error) {
    console.error('createMentorRequest error:', error)
    return res.status(500).json({ message: 'Unable to submit mentorship request.' })
  }
}

const getRequestDetails = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const requestId = req.params?.requestId
    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentor: userId }).select('-mentor')
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    let session = null
    if (request.session) {
      session = await MentorSession.findById(request.session).select('-mentor')
    }

    return res.status(200).json({ request, session })
  } catch (error) {
    console.error('getRequestDetails error:', error)
    return res.status(500).json({ message: 'Unable to load request details.' })
  }
}

const buildSessionPayload = (requestDoc, overrides = {}) => {
  const fallbackDate = requestDoc.scheduledDateTime || requestDoc.preferredDateTime
  const sessionDate = overrides.sessionDate
    ? new Date(overrides.sessionDate)
    : fallbackDate
    ? new Date(fallbackDate)
    : new Date()

  if (Number.isNaN(sessionDate.getTime())) {
    throw new Error('Invalid session date provided.')
  }

  const mode = normalizeMode(overrides.mode, requestDoc.scheduledMode || requestDoc.preferredMode || 'online')

  return {
    mentor: requestDoc.mentor,
    service: requestDoc.service || undefined,
    serviceName: requestDoc.serviceName,
    menteeName: requestDoc.menteeName,
    menteeEmail: requestDoc.menteeEmail,
    menteeAvatar: requestDoc.menteeAvatar,
    sessionDate,
    durationMinutes: 60,
    status: 'scheduled',
    mode,
    notes: requestDoc.notes || '',
  }
}

const acceptRequest = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const requestId = req.params?.requestId
    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentor: userId })
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    if (request.status === 'accepted') {
      return res.status(200).json(request)
    }

    const proposedSlots = sanitizeProposedSlots(req.body?.proposedSlots)

    if (!proposedSlots.length) {
      return res.status(400).json({ message: 'Provide at least one valid schedule option to accept the request.' })
    }

    request.status = 'accepted'
    request.scheduledDateTime = undefined
    request.scheduledMode = ''
    request.proposedSlots = proposedSlots

    if (request.session) {
      await MentorSession.findOneAndUpdate(
        { _id: request.session, mentor: userId },
        { status: 'cancelled' },
      )
      request.session = undefined
    }

    await request.save()

    const result = await MentorRequest.findById(request._id).select('-mentor')
    return res.status(200).json(result)
  } catch (error) {
    console.error('acceptRequest error:', error)
    return res.status(500).json({ message: 'Unable to accept request.' })
  }
}

const rejectRequest = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const requestId = req.params?.requestId
    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentor: userId })
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    if (request.status === 'rejected') {
      return res.status(200).json(request)
    }

    request.status = 'rejected'
    request.scheduledDateTime = undefined
    request.scheduledMode = ''
    request.proposedSlots = []

    if (request.session) {
      await MentorSession.findOneAndUpdate(
        { _id: request.session, mentor: userId },
        { status: 'cancelled' },
      )
      request.session = undefined
    }

    await request.save()

    const result = await MentorRequest.findById(request._id).select('-mentor')
    return res.status(200).json(result)
  } catch (error) {
    console.error('rejectRequest error:', error)
    return res.status(500).json({ message: 'Unable to reject request.' })
  }
}

const confirmRequest = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!['student', 'alumni', 'alumni-student'].includes(role)) {
      return res.status(403).json({ message: 'Only mentees can confirm mentorship schedules.' })
    }

    const requestId = req.params?.requestId
    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentee: userId })
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    if (request.status === 'confirmed') {
      const confirmedResult = await MentorRequest.findById(request._id).select('-mentor')
      return res.status(200).json(confirmedResult)
    }

    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'This request is not awaiting confirmation.' })
    }

    const { slotIndex, scheduledDateTime, scheduledMode } = req.body ?? {}

    const slots = Array.isArray(request.proposedSlots) ? request.proposedSlots : []
    let targetSlot = null
    let parsedDate = null

    if (Number.isInteger(slotIndex) && slots[slotIndex]) {
      targetSlot = slots[slotIndex]
      parsedDate = new Date(targetSlot.slotDate)
    }

    if (!targetSlot && scheduledDateTime) {
      const candidateDate = new Date(scheduledDateTime)
      if (!Number.isNaN(candidateDate.getTime())) {
        parsedDate = candidateDate
        targetSlot = slots.find((slot) => {
          const slotDate = new Date(slot.slotDate)
          return slotDate.getTime() === candidateDate.getTime()
        })
      }
    }

    if (!targetSlot || !parsedDate || Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: 'Select a valid schedule option to confirm.' })
    }

    const normalizedMode = normalizeMode(scheduledMode, targetSlot.mode || request.preferredMode || 'online')

    request.scheduledDateTime = parsedDate
    request.scheduledMode = normalizedMode
    request.status = 'confirmed'
    request.proposedSlots = []

    const sessionPayloadOverrides = {
      sessionDate: parsedDate,
      mode: normalizedMode,
    }

    if (request.session) {
      await MentorSession.findOneAndUpdate(
        { _id: request.session },
        {
          status: 'scheduled',
          sessionDate: parsedDate,
          mode: normalizedMode,
        },
      )
    } else {
      const sessionPayload = buildSessionPayload(request, sessionPayloadOverrides)
      const session = await MentorSession.create(sessionPayload)
      request.session = session._id
    }

    await request.save()

    const result = await MentorRequest.findById(request._id).select('-mentor')
    return res.status(200).json(result)
  } catch (error) {
    console.error('confirmRequest error:', error)
    return res.status(500).json({ message: 'Unable to confirm request.' })
  }
}

const updateMeetingLink = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const requestId = req.params?.requestId
    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    const { meetingLink } = req.body ?? {}
    if (!meetingLink || !meetingLink.trim()) {
      return res.status(400).json({ message: 'Meeting link is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentor: userId })
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    if (request.status !== 'confirmed') {
      return res.status(400).json({ message: 'Meeting link can only be added to confirmed requests.' })
    }

    request.meetingLink = meetingLink.trim()
    await request.save()

    const result = await MentorRequest.findById(request._id).select('-mentor')
    return res.status(200).json(result)
  } catch (error) {
    console.error('updateMeetingLink error:', error)
    return res.status(500).json({ message: 'Unable to update meeting link.' })
  }
}

const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can view pending mentorship requests.' })
    }

    const pendingRequests = await MentorRequest.find({ 
      mentor: userId, 
      status: 'pending' 
    })
    .populate('mentee', 'name email profile')
    .populate('service', 'title duration mode')
    .sort({ createdAt: -1 })

    const formattedRequests = pendingRequests.map(request => ({
      id: request._id,
      student: {
        id: request.mentee?._id,
        name: request.menteeName,
        email: request.menteeEmail,
        avatar: request.menteeAvatar,
        profile: request.mentee?.profile
      },
      service: {
        id: request.service?._id,
        name: request.serviceName,
        duration: request.serviceDuration,
        mode: request.serviceMode,
        price: request.servicePrice
      },
      preferredDateTime: request.preferredDateTime,
      preferredMode: request.preferredMode,
      notes: request.notes,
      status: request.status,
      createdAt: request.createdAt
    }))

    return res.status(200).json({
      success: true,
      data: formattedRequests,
      count: formattedRequests.length
    })
  } catch (error) {
    console.error('getPendingRequests error:', error)
    return res.status(500).json({ message: 'Unable to fetch pending requests.' })
  }
}

const reviewRequest = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const requestId = req.params?.requestId
    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentor: userId })
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending requests can be marked for review.' })
    }

    request.status = 'review'
    request.updatedAt = new Date()
    await request.save()

    const result = await MentorRequest.findById(request._id).select('-mentor')
    return res.status(200).json(result)
  } catch (error) {
    console.error('reviewRequest error:', error)
    return res.status(500).json({ message: 'Unable to mark request for review.' })
  }
}

module.exports = {
  listMyRequests,
  getRequestDetails,
  acceptRequest,
  rejectRequest,
  reviewRequest,
  confirmRequest,
  createMentorRequest,
  updateMeetingLink,
  getPendingRequests,
}
