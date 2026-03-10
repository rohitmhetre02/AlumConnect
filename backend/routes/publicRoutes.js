const express = require('express')
const { 
  getPublicStudents, 
  getPublicAlumni, 
  getPublicMemories, 
  getPublicEvents, 
  getPublicCampaigns 
} = require('../controllers/publicController')

const router = express.Router()

// Public APIs - No authentication required
router.get('/students', getPublicStudents)
router.get('/alumni', getPublicAlumni)
router.get('/memories', getPublicMemories)
router.get('/events', getPublicEvents)
router.get('/campaigns', getPublicCampaigns)

module.exports = router
