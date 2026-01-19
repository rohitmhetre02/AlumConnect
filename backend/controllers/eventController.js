const mongoose = require('mongoose')

const Event = require('../models/Event')
const { getModelByRole } = require('../utils/roleModels')

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
  }
}

const findEventByIdentifier = async (identifier) => {
  if (!identifier) return null

  console.log('findEventByIdentifier called with:', identifier)

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    console.log('Identifier is a valid ObjectId, trying findById...')
    try {
      const byObjectId = await Event.findById(identifier)
      if (byObjectId) {
        console.log('Found event by ObjectId')
        return byObjectId
      }
      console.log('No event found by ObjectId')
    } catch (error) {
      console.warn('findById error:', error.message)
    }
  }

  try {
    console.log('Trying native collection lookup...')
    const raw = await Event.collection.findOne({ _id: identifier })
    if (raw) {
      console.log('Found event by native collection lookup')
      return Event.hydrate(raw)
    }
    console.log('No event found by native collection lookup')
  } catch (error) {
    console.warn('Native lookup error:', error.message)
  }

  try {
    console.log('Trying legacy id field lookup...')
    const byLegacyId = await Event.findOne({ id: identifier })
    if (byLegacyId) {
      console.log('Found event by legacy id field')
      return byLegacyId
    }
    console.log('No event found by legacy id field')
  } catch (error) {
    console.warn('Legacy lookup error:', error.message)
  }

  console.log('Event not found by any method')
  return null
}

const listEvents = async (_req, res) => {
  try {
    const events = await Event.find().sort({ startAt: 1, createdAt: -1 }).lean()
    return res.status(200).json({ success: true, data: events.map(formatEvent) })
  } catch (error) {
    console.error('listEvents error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch events.' })
  }
}

const getEventById = async (req, res) => {
  try {
    const { id } = req.params

    const eventDoc = await findEventByIdentifier(id)

    if (!eventDoc) {
      return res.status(404).json({ success: false, message: 'Event not found.' })
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
    if (!CreatorModel) {
      // For admin and coordinator users, create a simple creator object
      if (role === 'admin' || role === 'coordinator') {
        const createdByName = user.email || role.charAt(0).toUpperCase() + role.slice(1)
        const payload = {
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          mode: normalizedMode,
          coverImage: coverImage?.trim() ?? '',
          registrationLink: registrationLink?.trim() ?? '',
          startAt: parsedStart,
          endAt: parsedEnd,
          organization: organization,
          department: department?.trim() || '',
          branch: branch?.trim() || '',
          createdBy: user.id,
          createdByRole: role,
          createdByName,
          registrations: [],
        }

        const event = await Event.create(payload)
        return res.status(201).json({ success: true, message: 'Event created successfully.', data: formatEvent(event) })
      }
      return res.status(403).json({ success: false, message: 'Unsupported creator role.' })
    }

    const creator = await CreatorModel.findById(user.id).select('firstName lastName email').lean()

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator record not found.' })
    }

    const createdByName = `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() || creator.email || ''

    const payload = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      mode: normalizedMode,
      coverImage: coverImage?.trim() ?? '',
      registrationLink: registrationLink?.trim() ?? '',
      startAt: parsedStart,
      endAt: parsedEnd,
      organization: organization,
      department: department?.trim() || '',
      branch: branch?.trim() || '',
      createdBy: user.id,
      createdByRole: role,
      createdByName,
      registrations: [],
    }

    const event = await Event.create(payload)

    // Add event to user's profile events array
    await CreatorModel.findByIdAndUpdate(user.id, {
      $push: { events: event._id }
    })

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

module.exports = {
  listEvents,
  getEventById,
  createEvent,
  registerForEvent,
}
