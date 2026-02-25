const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Event = require('../models/Event')
const EventRegistration = require('../models/EventRegistration')
const authMiddleware = require('../middleware/authMiddleware')

// Get all event registrations for the logged-in user
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ userId: req.user.id })
      .populate('eventId', 'title description startAt endAt location mode organization')
      .sort({ registeredAt: -1 })
    
    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    })
  } catch (error) {
    console.error('Error fetching user event registrations:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event registrations',
      error: error.message
    })
  }
})

// Register for an event
router.post('/:eventId/register', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params
    const { name, email, role, department, passoutYear, currentYear, registrationType } = req.body

    // Check if event exists and is upcoming
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    if (new Date(event.endAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      })
    }

    // Create registration
    const registration = new EventRegistration({
      eventId: eventId,
      userId: req.user.id,
      name: name || req.user.name,
      email: email || req.user.email,
      role: role || 'student',
      department: department || req.user.profile?.department,
      passoutYear: passoutYear || req.user.profile?.graduationYear,
      currentYear: currentYear,
      registrationType: registrationType || 'popup'
    })

    await registration.save()

    // Populate event details for response
    await registration.populate('eventId', 'title description startAt endAt location mode organization')

    res.status(201).json({
      success: true,
      message: 'Successfully registered for event',
      data: registration
    })
  } catch (error) {
    console.error('Error registering for event:', error)
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to register for event',
      error: error.message
    })
  }
})

// Cancel event registration
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const registration = await EventRegistration.findById(id)
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      })
    }

    // Check if user owns this registration
    if (registration.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this registration'
      })
    }

    // Check if event has already started
    const event = await Event.findById(registration.eventId)
    if (event && new Date(event.startAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel registration for events that have already started'
      })
    }

    // Delete the registration (since the existing model doesn't have a status field)
    await EventRegistration.findByIdAndDelete(id)

    res.json({
      success: true,
      message: 'Registration cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling registration:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cancel registration',
      error: error.message
    })
  }
})

// Get registrations for a specific event (for event creators)
router.get('/event/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params

    // Check if user is the creator of the event or admin/faculty
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      })
    }

    if (event.createdBy.toString() !== req.user.id && 
        !['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view registrations for this event'
      })
    }

    const registrations = await EventRegistration.find({ eventId: eventId })
      .sort({ registeredAt: -1 })

    res.json({
      success: true,
      data: registrations,
      count: registrations.length
    })
  } catch (error) {
    console.error('Error fetching event registrations:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registrations',
      error: error.message
    })
  }
})

// Get event registration statistics for dashboard
router.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const totalRegistrations = await EventRegistration.countDocuments({ userId: userId })
    const upcomingEvents = await EventRegistration.find({ 
      userId: userId
    })
    .populate('eventId', 'title startAt endAt')
    .sort({ 'eventId.startAt': 1 })
    .limit(5)

    res.json({
      success: true,
      data: {
        totalRegistrations,
        upcomingEvents
      }
    })
  } catch (error) {
    console.error('Error fetching registration stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch registration statistics',
      error: error.message
    })
  }
})

module.exports = router
