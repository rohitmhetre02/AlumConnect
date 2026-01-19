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

module.exports = {
  registerForEvent,
  getEventRegistrations,
  getRegistrationStats,
}
