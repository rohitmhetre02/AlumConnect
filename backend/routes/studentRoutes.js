const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const { savePreferences, getRecommendedMentors, getPreferences } = require('../controllers/studentController')

// Apply auth middleware to all routes
router.use(authMiddleware)

// POST /api/students/preferences - Save student preferences
router.post('/preferences', savePreferences)

// GET /api/students/preferences - Get student preferences
router.get('/preferences', getPreferences)

// GET /api/students/recommendations - Get recommended mentors for student
router.get('/recommendations', getRecommendedMentors)

module.exports = router
