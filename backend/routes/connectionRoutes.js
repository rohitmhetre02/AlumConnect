const express = require('express')
const router = express.Router()

const {
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnectionRequests,
  getConnections
} = require('../controllers/connectionController')

// Import real auth middleware
const authMiddleware = require('../middleware/authMiddleware')

// Send connection request
router.post('/send-connection-request', authMiddleware, sendConnectionRequest)

// Accept connection request
router.post('/accept-connection', authMiddleware, acceptConnectionRequest)

// Get connection requests for current user
router.get('/requests', authMiddleware, getConnectionRequests)

// Get connections for current user
router.get('/my-connections', authMiddleware, getConnections)

module.exports = router
