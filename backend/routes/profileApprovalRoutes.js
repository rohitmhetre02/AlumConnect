const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const requireRoles = require('../middleware/requireRoles')
const {
  getPendingProfiles,
  getApprovedProfiles,
  approveProfile,
  rejectProfile,
  getProfileApprovalStats
} = require('../controllers/profileApprovalController')
const { updateCoordinatorStatus } = require('../scripts/updateCoordinatorStatus')

router.use(authMiddleware, requireRoles('admin', 'coordinator'))

// Get all pending profiles for review based on role
router.get('/pending', getPendingProfiles)

// Get all approved profiles based on role
router.get('/approved', getApprovedProfiles)

// Approve a profile
router.post('/approve', approveProfile)

// Reject a profile
router.post('/reject', rejectProfile)

// Get approval statistics scoped by reviewer role
router.get('/stats', getProfileApprovalStats)

// Temporary route to update coordinator status (admin only)
router.post('/update-coordinator-status', requireRoles('admin'), updateCoordinatorStatus)

module.exports = router
