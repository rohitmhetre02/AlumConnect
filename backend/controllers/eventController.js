const mongoose = require('mongoose')

const Event = require('../models/Event')
const { getModelByRole } = require('../utils/roleModels')
const { CONTENT_APPROVAL_STATUS } = require('../utils/contentApprovalStatus')
const { normalizeDepartment } = require('../utils/departments')

const formatEvent = (eventDoc) => {
  if (!eventDoc) return null

  const source = typeof eventDoc.toObject === 'function' ? eventDoc.toObject() : eventDoc
  const registrations = Array.isArray(source.registrations) ? source.registrations : []

  return {
    id: source._id ? source._id.toString() : source.id,
    legacyId: source.id && !source._id ? source.id : undefined,
    title: source.title,
    mode: source.mode,
    description: source.description,
    location: source.location,
    coverImage: source.coverImage,
    startAt: source.startAt,
    endAt: source.endAt,
    registrationLink: source.registrationLink,
    organization: source.organization,
    department: source.department,
    branch: source.branch,
    createdAt: source.createdAt,
    createdBy: source.createdBy,
    createdByRole: source.createdByRole,
    createdByName: source.createdByName,
    registrationCount: registrations.length,
    approvalStatus: source.approvalStatus ?? CONTENT_APPROVAL_STATUS.PENDING,
    approvalDepartment: source.approvalDepartment ?? '',
    approvalDecisions: Array.isArray(source.approvalDecisions) ? source.approvalDecisions : [],
    approvedAt: source.approvedAt ?? null,
    rejectedAt: source.rejectedAt ?? null,
  }
}

const findEventByIdentifier = async (identifier) => {
  if (!identifier) return null

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    try {
      const byObjectId = await Event.findById(identifier)
      if (byObjectId) {
        return byObjectId
      }
    } catch (error) {
      // Continue silently
    }
  }

  try {
    const raw = await Event.collection.findOne({ _id: identifier })
    if (raw) {
      return Event.hydrate(raw)
    }
  } catch (error) {
    // Continue silently
  }

  try {
    const byLegacyId = await Event.findOne({ id: identifier })
    if (byLegacyId) {
      return byLegacyId
    }
  } catch (error) {
    // Continue silently
  }

  return null
}

const listEvents = async (_req, res) => {
  try {
    const events = await Event.find({ approvalStatus: CONTENT_APPROVAL_STATUS.APPROVED })
      .sort({ startAt: 1, createdAt: -1 })
      .lean()
    return res.status(200).json({ success: true, data: events.map(formatEvent) })
  } catch (error) {
    console.error('listEvents error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch events.' })
  }
}

const listMyEvents = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    const filter = mongoose.Types.ObjectId.isValid(userId)
      ? { createdBy: new mongoose.Types.ObjectId(userId) }
      : { createdBy: userId }

    const events = await Event.find(filter).sort({ createdAt: -1 }).lean()

    return res.status(200).json({ success: true, data: events.map(formatEvent).filter(Boolean) })
  } catch (error) {
    console.error('listMyEvents error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch your events.' })
  }
}

const getEventById = async (req, res) => {
  try {
    const { id } = req.params

    const eventDoc = await findEventByIdentifier(id)

    if (!eventDoc) {
      return res.status(404).json({ success: false, message: 'Event not found.' })
    }

    const userRole = req.user?.role?.toLowerCase?.() ?? ''
    const userId = req.user?.id
    const isOwner = userId && eventDoc.createdBy?.toString?.() === userId
    const isAdmin = userRole === 'admin'
    const isCoordinator = userRole === 'coordinator'

    if (
      eventDoc.approvalStatus !== CONTENT_APPROVAL_STATUS.APPROVED &&
      !isAdmin &&
      !isCoordinator &&
      !isOwner
    ) {
      return res.status(403).json({
        success: false,
        message: 'This event is pending review.',
      })
    }

    const formatted = formatEvent(eventDoc)
    const registrations = Array.isArray(eventDoc.registrations) ? eventDoc.registrations : []
    const isRegistered = req.user ? registrations.some((entry) => entry.userId === req.user.id) : false

    return res.status(200).json({ success: true, data: { ...formatted, isRegistered } })
  } catch (error) {
    console.error('getEventById error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch event.' })
  }
}

const createEvent = async (req, res) => {
  try {
    const user = req.user
    const allowedRoles = new Set(['alumni', 'faculty', 'admin', 'coordinator'])
    const role = user?.role?.toLowerCase()

    if (!user || !allowedRoles.has(role)) {
      return res.status(403).json({ success: false, message: 'Only alumni, faculty, admin, and department coordinators can create events.' })
    }

    const { title, description, location, coverImage, startAt, endAt, mode, registrationLink, organization, department, branch } = req.body ?? {}

    if (!title || !description || !location || !startAt || !organization) {
      return res.status(400).json({ success: false, message: 'title, description, location, startAt, and organization are required.' })
    }

    // Validate organization
    const allowedOrganizations = new Set(['alumni', 'college', 'department'])
    if (!allowedOrganizations.has(organization)) {
      return res.status(400).json({ success: false, message: 'organization must be one of alumni, college, or department.' })
    }

    // Validate department and branch for department organization
    if (organization === 'department') {
      if (!department) {
        return res.status(400).json({ success: false, message: 'department is required when organization is department.' })
      }
    }

    const parsedStart = new Date(startAt)
    if (Number.isNaN(parsedStart.getTime())) {
      return res.status(400).json({ success: false, message: 'startAt must be a valid date.' })
    }

    let parsedEnd = null
    if (endAt) {
      parsedEnd = new Date(endAt)
      if (Number.isNaN(parsedEnd.getTime())) {
        return res.status(400).json({ success: false, message: 'endAt must be a valid date when provided.' })
      }
    }

    const normalizedMode = mode ? String(mode).toLowerCase().trim() : 'in-person'
    const allowedModes = new Set(['online', 'in-person', 'hybrid'])
    if (!allowedModes.has(normalizedMode)) {
      return res.status(400).json({ success: false, message: 'mode must be one of online, in-person, or hybrid.' })
    }

    const CreatorModel = getModelByRole(role)
    let creator = null
    if (CreatorModel) {
      creator = await CreatorModel.findById(user.id).select('firstName lastName email department').lean()
    }

    if (!creator && role !== 'admin' && role !== 'coordinator') {
      return res.status(404).json({ success: false, message: 'Creator record not found.' })
    }

    const createdByName =
      `${creator?.firstName ?? ''} ${creator?.lastName ?? ''}`.trim() ||
      creator?.email ||
      user.email ||
      ''

    const derivedDepartment = normalizeDepartment(
      (organization === 'department' && department) ||
      creator?.department ||
      department ||
      ''
    )

    const isReviewer = role === 'admin' || role === 'coordinator'
    const decisionTimestamp = new Date()
    const approvalStatus = isReviewer ? CONTENT_APPROVAL_STATUS.APPROVED : CONTENT_APPROVAL_STATUS.PENDING
    const approvalDecisions = isReviewer
      ? [
          {
            status: approvalStatus,
            decidedByRole: role,
            decidedByName: createdByName,
            decidedById: user.id,
            decidedAt: decisionTimestamp,
            reason: '',
          },
        ]
      : []

    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      mode: normalizedMode,
      coverImage: coverImage?.trim() ?? '',
      registrationLink: registrationLink?.trim() ?? '',
      startAt: parsedStart,
      endAt: parsedEnd,
      organization,
      department: organization === 'department' ? normalizeDepartment(department) : derivedDepartment,
      branch: branch?.trim() || '',
      createdBy: user.id,
      createdByRole: role,
      createdByName,
      registrations: [],
      approvalStatus,
      approvalDepartment: derivedDepartment,
      approvalDecisions,
      approvedAt: isReviewer ? decisionTimestamp : null,
      rejectedAt: null,
      approvalRejectionReason: '',
    }

    const event = await Event.create(payload)

    if (CreatorModel && ['alumni', 'faculty'].includes(role)) {
      await CreatorModel.findByIdAndUpdate(user.id, {
        $push: { events: event._id },
      })
    }

    return res.status(201).json({ success: true, message: 'Event created successfully.', data: formatEvent(event) })
  } catch (error) {
    console.error('createEvent error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create event.' })
  }
}

const registerForEvent = async (req, res) => {
  try {
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!user?.id || !role) {
      return res.status(401).json({ success: false, message: 'Authentication required to register.' })
    }

    const allowedRoles = new Set(['student', 'alumni', 'faculty'])
    if (!allowedRoles.has(role)) {
      return res.status(403).json({ success: false, message: 'Your role is not eligible for event registration.' })
    }

    const { id } = req.params
    const eventDoc = await findEventByIdentifier(id)
    if (!eventDoc) {
      return res.status(404).json({ success: false, message: 'Event not found.' })
    }

    const registrations = Array.isArray(eventDoc.registrations) ? eventDoc.registrations : []
    const alreadyRegistered = registrations.some((entry) => entry.userId === user.id)
    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'You have already registered for this event.' })
    }

    const { name, department, academicYear, graduationYear } = req.body ?? {}

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' })
    }

    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department is required.' })
    }

    if (role === 'student' && (!academicYear || !academicYear.trim())) {
      return res.status(400).json({ success: false, message: 'Academic year is required for students.' })
    }

    if (role === 'alumni' && (!graduationYear || !graduationYear.trim())) {
      return res.status(400).json({ success: false, message: 'Graduation year is required for alumni.' })
    }

    const registrationPayload = {
      userId: user.id,
      role,
      name: name.trim(),
      department: department.trim(),
      academicYear: role === 'student' ? academicYear.trim() : '',
      graduationYear: role === 'alumni' ? graduationYear.trim() : '',
      registeredAt: new Date(),
    }

    eventDoc.registrations = registrations.concat(registrationPayload)
    await eventDoc.save()

    const formatted = formatEvent(eventDoc)
    formatted.isRegistered = true

    return res.status(201).json({ success: true, message: 'Registration completed successfully.', data: formatted })
  } catch (error) {
    console.error('registerForEvent error:', error)
    return res.status(500).json({ success: false, message: 'Unable to register for the event.' })
  }
}

const updateEvent = async (req, res) => {
  try {
    const userId = req.user?.id
    const { id } = req.params

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' })
    }

    const eventDoc = await findEventByIdentifier(id)
    if (!eventDoc) {
      return res.status(404).json({ success: false, message: 'Event not found.' })
    }

    // Check if user owns this event
    if (eventDoc.createdBy?.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'You can only edit your own events.' })
    }

    const { title, description, location, coverImage, startAt, endAt, mode, registrationLink, organization, department, branch } = req.body ?? {}

    // Validate required fields
    if (!title || !description || !location || !startAt || !organization) {
      return res.status(400).json({ success: false, message: 'title, description, location, startAt, and organization are required.' })
    }

    // Validate organization
    const allowedOrganizations = new Set(['alumni', 'college', 'department'])
    if (!allowedOrganizations.has(organization)) {
      return res.status(400).json({ success: false, message: 'organization must be one of alumni, college, or department.' })
    }

    // Validate department and branch for department organization
    if (organization === 'department' && !department) {
      return res.status(400).json({ success: false, message: 'department is required when organization is department.' })
    }

    const parsedStart = new Date(startAt)
    if (Number.isNaN(parsedStart.getTime())) {
      return res.status(400).json({ success: false, message: 'startAt must be a valid date.' })
    }

    let parsedEnd = null
    if (endAt) {
      parsedEnd = new Date(endAt)
      if (Number.isNaN(parsedEnd.getTime())) {
        return res.status(400).json({ success: false, message: 'endAt must be a valid date when provided.' })
      }
    }

    const normalizedMode = mode ? String(mode).toLowerCase().trim() : 'in-person'
    const allowedModes = new Set(['online', 'in-person', 'hybrid'])
    if (!allowedModes.has(normalizedMode)) {
      return res.status(400).json({ success: false, message: 'mode must be one of online, in-person, or hybrid.' })
    }

    const updatePayload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      mode: normalizedMode,
      coverImage: coverImage?.trim() ?? eventDoc.coverImage,
      registrationLink: registrationLink?.trim() ?? eventDoc.registrationLink,
      startAt: parsedStart,
      endAt: parsedEnd,
      organization: organization,
      department: department?.trim() || eventDoc.department,
      branch: branch?.trim() || eventDoc.branch,
    }

    const actorRole = req.user?.role?.toLowerCase()
    if (!['admin', 'coordinator'].includes(actorRole)) {
      updatePayload.approvalStatus = CONTENT_APPROVAL_STATUS.PENDING
      updatePayload.approvedAt = null
      updatePayload.rejectedAt = null
      updatePayload.approvalDepartment =
        eventDoc.approvalDepartment || normalizeDepartment(eventDoc.department || '')
      updatePayload.approvalDecisions = []
      updatePayload.approvalRejectionReason = ''
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventDoc._id, updatePayload, { new: true })
    
    return res.status(200).json({ 
      success: true, 
      message: 'Event updated successfully.', 
      data: formatEvent(updatedEvent) 
    })
  } catch (error) {
    console.error('updateEvent error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update event.' })
  }
}

const listAllEvents = async (_req, res) => {
  try {
    // Admin can see all events regardless of approval status
    const events = await Event.find({})
      .sort({ startAt: 1, createdAt: -1 })
      .lean()
    return res.status(200).json({ success: true, data: events.map(formatEvent) })
  } catch (error) {
    console.error('listAllEvents error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch events.' })
  }
}

const getEventRegistrations = async (req, res) => {
  try {
    console.log('getEventRegistrations called with params:', req.params)
    const { id } = req.params
    
    console.log('Extracted id:', id)
    
    if (!id) {
      console.log('No id found in params')
      return res.status(400).json({ success: false, message: 'Event ID is required.' })
    }
    
    // Find the event
    console.log('Looking for event with id:', id)
    const event = await findEventByIdentifier(id)
    if (!event) {
      console.log('Event not found')
      return res.status(404).json({ success: false, message: 'Event not found.' })
    }
    
    // Get registrations from the event
    const registrations = Array.isArray(event.registrations) ? event.registrations : []
    
    // If there are no registrations, return empty array
    if (registrations.length === 0) {
      return res.status(200).json({ success: true, data: [] })
    }
    
    // Fetch user details for each registration
    const registrationDetails = []
    for (const registration of registrations) {
      try {
        const UserModel = getModelByRole(registration.role)
        if (UserModel) {
          const user = await UserModel.findById(registration.userId).select('firstName lastName email phone role department').lean()
          if (user) {
            registrationDetails.push({
              firstName: user.firstName,
              lastName: user.lastName,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              phone: user.phone,
              role: user.role,
              department: user.department,
              registeredAt: registration.registeredAt || new Date()
            })
          } else {
            // Fallback to registration data if user not found
            registrationDetails.push({
              firstName: registration.name?.split(' ')[0] || '',
              lastName: registration.name?.split(' ').slice(1).join(' ') || '',
              name: registration.name || '—',
              email: '—',
              phone: '—',
              role: registration.role || '—',
              department: registration.department || '—',
              registeredAt: registration.registeredAt || new Date()
            })
          }
        } else {
          // Fallback if model not found
          registrationDetails.push({
            firstName: registration.name?.split(' ')[0] || '',
            lastName: registration.name?.split(' ').slice(1).join(' ') || '',
            name: registration.name || '—',
            email: '—',
            phone: '—',
            role: registration.role || '—',
            department: registration.department || '—',
            registeredAt: registration.registeredAt || new Date()
          })
        }
      } catch (error) {
        console.error('Error fetching user details for registration:', error)
        // Add fallback registration data
        registrationDetails.push({
          firstName: registration.name?.split(' ')[0] || '',
          lastName: registration.name?.split(' ').slice(1).join(' ') || '',
          name: registration.name || '—',
          email: '—',
          phone: '—',
          role: registration.role || '—',
          department: registration.department || '—',
          registeredAt: registration.registeredAt || new Date()
        })
      }
    }
    
    return res.status(200).json({ success: true, data: registrationDetails })
  } catch (error) {
    console.error('getEventRegistrations error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch event registrations.' })
  }
}

module.exports = {
  listEvents,
  listAllEvents,
  listMyEvents,
  getEventById,
  createEvent,
  updateEvent,
  registerForEvent,
  getEventRegistrations,
}
