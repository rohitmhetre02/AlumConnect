const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const {
  listCampaigns,
  getCampaignById,
  listMyCampaigns,
  listUserCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  donateToCampaign,
  getCampaignStats,
} = require('../controllers/campaignController')

const router = express.Router()

// Public routes
router.get('/', listCampaigns)
router.get('/user', authMiddleware, listUserCampaigns)
router.get('/stats', getCampaignStats)

// Protected routes
router.get('/mine', authMiddleware, listMyCampaigns)
router.post('/', authMiddleware, createCampaign)
router.put('/:id', authMiddleware, updateCampaign)
router.delete('/:id', authMiddleware, deleteCampaign)

// Public route with parameter (must come after /mine)
router.get('/:id', getCampaignById)

// Donation route (public but validated)
router.post('/:id/donate', donateToCampaign)

module.exports = router
