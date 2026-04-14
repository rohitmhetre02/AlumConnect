const express = require('express')
const { 
  getPublicStudents, 
  getPublicAlumni, 
  getPublicMemories, 
  getPublicEvents, 
  getPublicCampaigns,
  getPublicStats 
} = require('../controllers/publicController')

const router = express.Router()

// Public APIs - No authentication required
router.get('/students', getPublicStudents)
router.get('/alumni', getPublicAlumni)
router.get('/memories', getPublicMemories)
router.get('/events', getPublicEvents)
router.get('/campaigns', getPublicCampaigns)
router.get('/stats', getPublicStats)

module.exports = router
