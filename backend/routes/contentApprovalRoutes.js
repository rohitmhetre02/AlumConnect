const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const requireRoles = require('../middleware/requireRoles')
const {
  getPendingPosts,
  getApprovedPosts,
  decideOnPost,
  debugCampaigns,
} = require('../controllers/contentApprovalController')

const router = express.Router()

router.use(authMiddleware, requireRoles('admin', 'coordinator'))

router.get('/pending', getPendingPosts)
router.get('/approved', getApprovedPosts)
router.post('/decision', decideOnPost)
router.get('/debug-campaigns', debugCampaigns)

module.exports = router
