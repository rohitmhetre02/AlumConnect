const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  donateToCampaign,
  getCampaignStats,
} = require('../controllers/campaignController')

const router = express.Router()

// Public routes
router.get('/', listCampaigns)
router.get('/stats', getCampaignStats)
router.get('/:id', getCampaignById)

// Protected routes
router.post('/', authMiddleware, createCampaign)
router.put('/:id', authMiddleware, updateCampaign)
router.delete('/:id', authMiddleware, deleteCampaign)

// Donation route (public but validated)
router.post('/:id/donate', donateToCampaign)

module.exports = router
