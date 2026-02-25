const express = require('express')
const router = express.Router()
const calendarController = require('../controllers/calendarController')
const authMiddleware = require('../middleware/authMiddleware')

// Get calendar notes for a user
router.get('/notes/:userId', authMiddleware, calendarController.getNotes)

// Add a new calendar note
router.post('/notes', authMiddleware, calendarController.addNote)

// Update a calendar note
router.post('/notes/:noteId', authMiddleware, calendarController.updateNote)

// Delete a calendar note
router.delete('/notes/:noteId', authMiddleware, calendarController.deleteNote)

module.exports = router
