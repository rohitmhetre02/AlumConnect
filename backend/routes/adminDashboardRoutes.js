const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

// Import dashboard controller functions
const {
  getDashboardStats,
  getPendingItems,
  getRecentActivity,
  getAnalytics,
  approveItem,
  rejectItem
} = require('../controllers/adminDashboardController')

// Apply auth middleware to all routes
router.use(authMiddleware)

// Dashboard statistics
router.get('/stats', getDashboardStats)

// Pending items for approval
router.get('/pending', getPendingItems)

// Recent activity feed
router.get('/activity', getRecentActivity)

// Analytics data
router.get('/analytics', getAnalytics)

// Approve pending item
router.post('/approve/:type/:id', approveItem)

// Reject pending item
router.post('/reject/:type/:id', rejectItem)

module.exports = router
