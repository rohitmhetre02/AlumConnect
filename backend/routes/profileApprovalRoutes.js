const express = require('express')
const router = express.Router()
const { authenticateAdmin } = require('../middleware/auth')
const {
  getPendingProfiles,
  approveProfile,
  rejectProfile,
  getProfileApprovalStats
} = require('../controllers/profileApprovalController')

// Get all pending profiles for admin review
router.get('/pending', authenticateAdmin, getPendingProfiles)

// Approve a profile
router.post('/approve', authenticateAdmin, approveProfile)

// Reject a profile
router.post('/reject', authenticateAdmin, rejectProfile)

// Get approval statistics
router.get('/stats', authenticateAdmin, getProfileApprovalStats)

module.exports = router
