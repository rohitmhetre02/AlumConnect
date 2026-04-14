const express = require('express')
const router = express.Router()

const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getConnections
} = require('../controllers/connectionController')

// Import real auth middleware
const authMiddleware = require('../middleware/authMiddleware')

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`=== CONNECTION ROUTE: ${req.method} ${req.originalUrl} ===`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Test endpoint to verify updated code
router.get('/test', (req, res) => {
  console.log('=== TEST ENDPOINT CALLED ===');
  res.json({ 
    message: 'Connection routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Send connection request
router.post('/send-connection-request', authMiddleware, sendConnectionRequest)

// Accept connection request (matches frontend: /api/user/accept-request/:requestId)
router.post('/accept-request/:requestId', authMiddleware, acceptConnectionRequest)

// Reject connection request (matches frontend: /api/user/reject-request/:requestId)
router.post('/reject-request/:requestId', authMiddleware, rejectConnectionRequest)

// Get connection requests for current user (matches frontend: /api/user/requests)
router.get('/requests', authMiddleware, getConnectionRequests)

// Get connections for current user (matches frontend: /api/user/my-connections)
router.get('/my-connections', authMiddleware, getConnections)

// Get connections for current user (matches frontend: /api/user/connections)
router.get('/connections', authMiddleware, getConnections)

module.exports = router
