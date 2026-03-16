const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuth')
const { listEvents, listAllEvents, listMyEvents, getEventById, createEvent, updateEvent, registerForEvent, getEventRegistrations } = require('../controllers/eventController')
const { getMyRegistrations } = require('../controllers/eventRegistrationController')

const router = express.Router()

// Admin routes
router.get('/admin/all', authMiddleware, listAllEvents)

// Public routes
router.get('/', listEvents)
router.get('/all', authMiddleware, listMyEvents)
router.get('/registrations/me', authMiddleware, getMyRegistrations)
router.get('/:id', authMiddleware, getEventById)
router.get('/:id/registrations', authMiddleware, getEventRegistrations)
router.post('/', authMiddleware, createEvent)
router.put('/:id', authMiddleware, updateEvent)
router.post('/:id/register', authMiddleware, registerForEvent)

module.exports = router
