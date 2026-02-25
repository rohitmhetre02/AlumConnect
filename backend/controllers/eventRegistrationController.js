const mongoose = require('mongoose')
const Event = require('../models/Event')
const EventRegistration = require('../models/EventRegistration')

const formatRegistration = (registrationDoc) => {
  if (!registrationDoc) return null

  return {
    id: registrationDoc._id.toString(),
    eventId: registrationDoc.eventId,
    name: registrationDoc.name,
    email: registrationDoc.email,
    role: registrationDoc.role,
    department: registrationDoc.department,
    passoutYear: registrationDoc.passoutYear,
    currentYear: registrationDoc.currentYear,
    registeredAt: registrationDoc.registeredAt,
    registrationType: registrationDoc.registrationType,
  }
}

const formatEventSummary = (eventDoc) => {
  if (!eventDoc) return null

  return {
    id: eventDoc._id?.toString?.() ?? eventDoc.id,
    title: eventDoc.title,
    description: eventDoc.description,
    location: eventDoc.location,
    coverImage: eventDoc.coverImage,
    startAt: eventDoc.startAt,
    endAt: eventDoc.endAt,
    registrationLink: eventDoc.registrationLink,
    registrationCount: Array.isArray(eventDoc.registrations) ? eventDoc.registrations.length : 0,
    organization: eventDoc.organization,
    createdByName: eventDoc.createdByName,
  }
}

const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const { name, email, role, department, passoutYear, currentYear, registrationType } = req.body

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event id.' })
    }

    // Check if event exists
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' })
    }

    // Validate required fields
    if (!name || !email || !role || !registrationType) {
      return res.status(400).json({ 
        success: false, 
        message: 'name, email, role, and registrationType are required.' 
      })
    }

    // Validate role
    if (!['alumni', 'student'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'role must be either alumni or student.' 
      })
    }

    // Validate registration type
    if (!['link', 'popup'].includes(registrationType)) {
      return res.status(400).json({ 
        success: false, 
        message: 'registrationType must be either link or popup.' 
      })
    }

    // Validate role-specific fields
    if (role === 'alumni' && !passoutYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'passoutYear is required for alumni.' 
      })
    }

    if (role === 'student' && !currentYear) {
      return res.status(400).json({ 
        success: false, 
        message: 'currentYear is required for students.' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format.' 
      })
    }

    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({ eventId, email })
    if (existingRegistration) {
      return res.status(409).json({ 
        success: false, 
        message: 'You have already registered for this event.' 
      })
    }

    // Create registration
    const registrationData = {
      eventId,
      userId: req.user?.id || req.user?._id || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department: department?.trim() || '',
      passoutYear: role === 'alumni' ? passoutYear : undefined,
      currentYear: role === 'student' ? currentYear : undefined,
      registrationType,
    }

    const registration = await EventRegistration.create(registrationData)

    // Add registration to event
    await Event.findByIdAndUpdate(eventId, {
      $push: { registrations: registration._id }
    })

    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful!', 
      data: formatRegistration(registration) 
    })
  } catch (error) {
    console.error('registerForEvent error:', error)
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'You have already registered for this event.' 
      })
    }
    
    return res.status(500).json({ success: false, message: 'Unable to complete registration.' })
  }
}

const getEventRegistrations = async (req, res) => {
  try {
    const { eventId } = req.params

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event id.' })
    }

    // Check if event exists
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' })
    }

    // Get all registrations for this event
    const registrations = await EventRegistration.find({ eventId })
      .sort({ registeredAt: -1 })
      .lean()

    return res.status(200).json({ 
      success: true, 
      data: registrations.map(formatRegistration) 
    })
  } catch (error) {
    console.error('getEventRegistrations error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch registrations.' })
  }
}

const getRegistrationStats = async (req, res) => {
  try {
    const { eventId } = req.params

    // Validate eventId
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event id.' })
    }

    // Get registration stats
    const stats = await EventRegistration.aggregate([
      { $match: { eventId: mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          alumniRegistrations: {
            $sum: { $cond: [{ $eq: ['$role', 'alumni'] }, 1, 0] }
          },
          studentRegistrations: {
            $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] }
          },
          linkRegistrations: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'link'] }, 1, 0] }
          },
          popupRegistrations: {
            $sum: { $cond: [{ $eq: ['$registrationType', 'popup'] }, 1, 0] }
          }
        }
      }
    ])

    const result = stats[0] || {
      totalRegistrations: 0,
      alumniRegistrations: 0,
      studentRegistrations: 0,
      linkRegistrations: 0,
      popupRegistrations: 0
    }

    return res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('getRegistrationStats error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch registration stats.' })
  }
}

const getMyRegistrations = async (req, res) => {
  try {
    const user = req.user

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    const userId = user.id ? String(user.id) : null
    const userEmail = user.email ? user.email.toLowerCase() : null

    if (!userId && !userEmail) {
      return res.status(400).json({ success: false, message: 'Unable to determine user identity for registrations.' })
    }

    const filters = []
    if (userId) filters.push({ userId })
    if (userEmail) filters.push({ email: userEmail })
    const query = filters.length === 1 ? filters[0] : { $or: filters }

    const [standaloneRegistrations, embeddedEvents] = await Promise.all([
      filters.length
        ? EventRegistration.find(query)
            .sort({ registeredAt: -1 })
            .populate('eventId')
            .lean()
        : [],
      userId
        ? Event.find({ 'registrations.userId': userId })
            .sort({ startAt: -1 })
            .lean()
        : [],
    ])

    const entriesByEventId = new Map()
    const upsertEntry = (eventSummary, { registrationId, registeredAt, registrationType }) => {
      if (!eventSummary?.id) return

      const current = entriesByEventId.get(eventSummary.id)
      const currentTime = current?.registeredAt ? new Date(current.registeredAt).getTime() : -Infinity
      const nextTime = registeredAt ? new Date(registeredAt).getTime() : -Infinity

      if (!current || nextTime > currentTime) {
        entriesByEventId.set(eventSummary.id, {
          registrationId,
          registeredAt,
          registrationType: registrationType ?? '',
          event: {
            ...eventSummary,
            isRegistered: true,
          },
        })
      }
    }

    standaloneRegistrations.forEach((registrationDoc) => {
      const eventSummary = formatEventSummary(registrationDoc.eventId)
      if (!eventSummary) return

      upsertEntry(eventSummary, {
        registrationId: registrationDoc._id.toString(),
        registeredAt: registrationDoc.registeredAt,
        registrationType: registrationDoc.registrationType,
      })
    })

    embeddedEvents.forEach((eventDoc) => {
      const eventSummary = formatEventSummary(eventDoc)
      if (!eventSummary) return

      const matches = Array.isArray(eventDoc.registrations)
        ? eventDoc.registrations.filter((registration) => String(registration.userId) === userId)
        : []

      matches.forEach((registration, index) => {
        upsertEntry(eventSummary, {
          registrationId: `${eventDoc._id?.toString?.() ?? eventSummary.id}::${registration.userId ?? index}`,
          registeredAt: registration.registeredAt,
          registrationType: registration.registrationType || 'internal',
        })
      })
    })

    const payload = Array.from(entriesByEventId.values()).sort((a, b) => {
      const aTime = a.registeredAt ? new Date(a.registeredAt).getTime() : 0
      const bTime = b.registeredAt ? new Date(b.registeredAt).getTime() : 0
      return bTime - aTime
    })

    return res.status(200).json({ success: true, data: payload })
  } catch (error) {
    console.error('getMyRegistrations error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load your registrations.' })
  }
}

module.exports = {
  registerForEvent,
  getEventRegistrations,
  getRegistrationStats,
  getMyRegistrations,
}
