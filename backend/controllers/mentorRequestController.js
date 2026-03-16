const mongoose = require('mongoose')

const MentorRequest = require('../models/MentorRequest')
const MentorSession = require('../models/MentorSession')
const MentorApplication = require('../models/MentorApplication')
const MentorService = require('../models/MentorService')
const Student = require('../models/Student')
const Alumni = require('../models/Alumni')

// Helper function to parse service duration string and convert to minutes
const parseServiceDuration = (duration) => {
  if (!duration) return 30; // Default 30 minutes
  
  // Extract numbers from duration string
  const match = duration.match(/(\d+)/);
  if (!match) return 30; // Default 30 minutes if no number found
  
  const minutes = parseInt(match[1]);
  
  // Check if duration is in hours
  if (duration.toLowerCase().includes('hour') || duration.toLowerCase().includes('hr')) {
    return minutes * 60; // Convert hours to minutes
  }
  
  return minutes; // Return minutes
}

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

    // Populate user information for proper display
    const requests = await MentorRequest.find(query)
      .populate({
        path: 'mentee',
        select: 'firstName lastName email avatar department role currentYear admissionYear passoutYear expectedPassoutYear skills',
        model: 'Student'
      })
      .populate({
        path: 'mentor',
        select: 'firstName lastName email avatar',
        model: 'Alumni'
      })
      .sort({ createdAt: -1 })

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
      requestMessage = '',
    } = req.body ?? {}

    const mentorApplication = await MentorApplication.findOne({ _id: mentorId, status: 'approved' }).populate('user', 'firstName lastName email avatar')
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

    // Fetch user data from User collection for comprehensive information
    let userData = null
    console.log('User Role:', role)
    console.log('Requester ID:', requesterId)
    
    if (role === 'student') {
      userData = await Student.findById(requesterId)
      console.log('Fetched Student Data:', userData)
    } else if (role === 'alumni' || role === 'alumni-student') {
      userData = await Alumni.findById(requesterId)
      console.log('Fetched Alumni Data:', userData)
    }

    console.log('User Data Department:', userData?.department)
    console.log('User Data Role:', userData?.role)
    console.log('Mentee Profile Department:', menteeProfile?.department)

    const menteeFullName = userData?.firstName + ' ' + userData?.lastName || userData?.name || menteeProfile.firstName + ' ' + menteeProfile.lastName

    const normalizedMode = normalizeMode(preferredMode, serviceDoc?.mode || mentorApplication.modes?.[0] || 'online')
    const normalizedDate = preferredDateTime ? new Date(preferredDateTime) : null

    if (normalizedDate && Number.isNaN(normalizedDate.getTime())) {
      return res.status(400).json({ message: 'Preferred date/time is invalid.' })
    }

    const requestPayload = {
      mentee: requesterId,
      mentor: mentorOwnerId,
      service: serviceDoc?._id ?? undefined,
      serviceName: serviceDoc?.title || undefined,
      serviceDuration: serviceDoc?.duration || '',
      serviceMode: serviceDoc?.mode || '',
      servicePrice: serviceDoc?.price ?? 0,
      menteeName: menteeFullName,
      menteeEmail: userData?.email || menteeProfile.email || '',
      menteeAvatar: userData?.avatar || menteeProfile.avatar || '',
      menteeDepartment: userData?.department || menteeProfile?.department || 'Not specified',
      menteeRole: userData?.role || role || 'Not specified',
      currentYear: userData?.currentYear || userData?.admissionYear || '',
      passoutYear: userData?.passoutYear || userData?.expectedPassoutYear || '',
      menteeSkills: Array.isArray(userData?.skills) ? userData.skills.filter(Boolean) : Array.isArray(menteeProfile.skills) ? menteeProfile.skills.filter(Boolean) : [],
      preferredDateTime: normalizedDate,
      preferredMode: normalizedMode,
      requestMessage: requestMessage?.toString()?.trim() || '',
      status: 'pending',
    }

    console.log('Final menteeDepartment:', requestPayload.menteeDepartment)
    console.log('Final menteeRole:', requestPayload.menteeRole)

    console.log('Request Payload:', requestPayload)
    console.log('User Data:', userData)
    console.log('Mentee Profile:', menteeProfile)

    // Only require serviceName if a service was selected
    if (serviceId && !requestPayload.serviceName) {
      return res.status(400).json({ message: 'Selected service is not available.' })
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

    // Convert to ObjectId for proper querying
    const { ObjectId } = require('mongoose').Types
    let objectId
    try {
      objectId = new ObjectId(requestId)
    } catch (error) {
      return res.status(400).json({ message: 'Invalid request identifier format.' })
    }

    const role = (req.user?.role || '').toLowerCase()

    // Get request with populated mentee and mentor info
    const request = await MentorRequest.findById(objectId)
      .populate({
        path: 'mentee',
        select: 'firstName lastName email avatar',
        model: role === 'alumni' || role === 'alumni-student' ? 'Alumni' : 'Student'
      })
      .populate({
        path: 'mentor',
        select: 'firstName lastName email avatar',
        model: 'Alumni'
      })
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    let session = null
    if (request.session) {
      session = await MentorSession.findById(request.session).select('-mentor')
    }

    console.log('Request found:', request)
    console.log('Request sessionDetails:', request.sessionDetails)
    console.log('Request scheduledDateTime:', request.scheduledDateTime)
    console.log('Request meetingLink:', request.meetingLink)
    console.log('Request notes:', request.notes)

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

const acceptMentorshipRequest = async (req, res) => {
  try {
    console.log('acceptMentorshipRequest called')
    console.log('req.user:', req.user)
    console.log('req.params:', req.params)
    console.log('req.body:', req.body)
    console.log('req.params.requestId:', req.params.requestId)
    
    const { sessionDate, sessionTime, meetingLink, mentorMessage } = req.body

    // First try to find without mentor filter to see if request exists
    const anyRequest = await MentorRequest.findById(req.params.requestId)
    console.log('Found any request:', anyRequest)
    
    if (!anyRequest) {
      console.log('Request not found for ID:', req.params.requestId)
      return res.status(404).json({ message: 'Request not found' })
    }

    // Now try with mentor filter
    const { error, userId } = ensureMentor(req)
    console.log('Auth check:', { error, userId })
    
    if (error) {
      console.log('Authentication error:', error)
      return res.status(error.status).json({ message: error.message })
    }

    const request = await MentorRequest.findOne({ _id: req.params.requestId, mentor: userId })
    console.log('Found request for mentor:', request)
    
    if (!request) {
      console.log('Request not found for mentor:', userId)
      return res.status(404).json({ message: 'Request not found or you do not have permission to accept this request.' })
    }

    // Calculate session start and end times
    let sessionStartTime = null;
    let sessionEndTime = null;
    
    if (sessionDate && sessionTime) {
      // Parse the session date and time
      const sessionDateObj = new Date(sessionDate);
      const [hours, minutes] = sessionTime.split(':').map(Number);
      
      // Create session start time
      sessionStartTime = new Date(sessionDateObj);
      sessionStartTime.setHours(hours, minutes, 0, 0);
      
      // Calculate session end time based on service duration
      const durationInMinutes = parseServiceDuration(request.serviceDuration);
      sessionEndTime = new Date(sessionStartTime.getTime() + durationInMinutes * 60000);
      
      console.log('Session times calculated:', {
        sessionStartTime,
        sessionEndTime,
        duration: durationInMinutes,
        serviceDuration: request.serviceDuration
      });
    }

    // Update request status and session details
    request.status = 'accepted'
    request.sessionDetails = {
      sessionDate: sessionDate ? new Date(sessionDate) : null,
      sessionStartTime: sessionStartTime,
      sessionEndTime: sessionEndTime,
      sessionTime: sessionTime || '',
      meetingLink: meetingLink || '',
      mentorMessage: mentorMessage || ''
    }

    await request.save()

    res.json({
      success: true,
      message: 'Mentorship session scheduled successfully',
      data: request
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
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

const completeSession = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const { outcome, remark } = req.body
    const requestId = req.params.requestId

    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    if (!outcome || !['completed', 'missed'].includes(outcome)) {
      return res.status(400).json({ message: 'Valid outcome (completed or missed) is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentor: userId })
    if (!request) {
      return res.status(404).json({ message: 'Request not found.' })
    }

    // Update request with session outcome
    if (outcome === 'completed') {
      // Set status to completed, sessionOutcome to completed, and reviewSubmitted to false
      request.status = 'completed'
      request.sessionOutcome = outcome
      request.reviewSubmitted = false
    } else if (outcome === 'missed') {
      // For missed sessions, move to completed directly
      request.status = 'completed'
      request.sessionOutcome = outcome
    }
    
    if (remark) {
      request.remark = remark
    }

    await request.save()

    console.log('Session completed:', {
      requestId,
      outcome,
      remark,
      mentor: userId
    })

    res.json({
      success: true,
      message: `Session marked as ${outcome}`,
      data: request
    })

  } catch (error) {
    console.error('Error completing session:', error)
    res.status(500).json({ message: error.message })
  }
}

const submitReview = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit reviews.' })
    }

    const { rating, feedback } = req.body
    const requestId = req.params.requestId

    console.log('Review submission attempt:', {
      requestId,
      userId,
      rating,
      feedback: feedback?.substring(0, 50) + '...'
    })

    if (!requestId) {
      return res.status(400).json({ message: 'Request identifier is required.' })
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating (1-5) is required.' })
    }

    const request = await MentorRequest.findOne({ _id: requestId, mentee: userId })
    if (!request) {
      console.log('Request not found for:', { requestId, userId })
      return res.status(404).json({ message: 'Request not found.' })
    }

    console.log('Found request:', {
      requestId: request._id,
      status: request.status,
      sessionOutcome: request.sessionOutcome,
      reviewSubmitted: request.reviewSubmitted
    })

    // Check if session is completed and review is not yet submitted
    if (request.reviewSubmitted) {
      return res.status(400).json({ message: 'Review has already been submitted.' })
    }
    
    if (request.status !== 'completed') {
      return res.status(400).json({ message: 'Session must be marked as completed before submitting review.' })
    }
    
    if (request.sessionOutcome !== 'completed') {
      return res.status(400).json({ message: 'Review can only be submitted for completed sessions, not missed sessions.' })
    }

    // Update request with review and move to completed
    request.status = 'completed'
    request.reviewSubmitted = true
    request.rating = rating
    request.feedback = feedback

    await request.save()

    console.log('Review submitted successfully:', {
      requestId,
      rating,
      mentee: userId
    })

    res.json({
      success: true,
      message: 'Review submitted successfully',
      data: request
    })

  } catch (error) {
    console.error('Error submitting review:', error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  listMyRequests,
  getRequestDetails,
  acceptRequest: acceptMentorshipRequest,
  rejectRequest,
  reviewRequest,
  confirmRequest,
  createMentorRequest,
  updateMeetingLink,
  getPendingRequests,
  completeSession,
  submitReview,
}
