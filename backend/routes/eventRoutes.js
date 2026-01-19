const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuth')
const { listEvents, getEventById, createEvent, registerForEvent } = require('../controllers/eventController')

const router = express.Router()

router.get('/', listEvents)
router.get('/:id', optionalAuth, getEventById)
router.post('/', authMiddleware, createEvent)
router.post('/:id/register', authMiddleware, registerForEvent)

module.exports = router
