const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

// Get alumni activity
router.get('/activity', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id
    const role = (req.user?.role || '').toLowerCase()

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can view their activity.' })
    }

    // TODO: Implement real activity tracking
    // For now, return empty activity array
    const activity = []

    res.status(200).json({
      success: true,
      data: activity,
      count: activity.length
    })
  } catch (error) {
    console.error('Error fetching alumni activity:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    })
  }
})

module.exports = router
