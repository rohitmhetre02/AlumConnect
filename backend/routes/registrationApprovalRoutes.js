const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const requireRoles = require('../middleware/requireRoles')
const {
  getCoordinatorPendingRegistrations,
  getCoordinatorRegistrationStats,
  coordinatorDecision,
  getAdminPendingRegistrations,
  getAdminRegistrationStats,
  adminDecision,
} = require('../controllers/registrationApprovalController')

const router = express.Router()

// Coordinator endpoints
router.use('/coordinator', authMiddleware, requireRoles('coordinator'))
router.get('/coordinator/pending', getCoordinatorPendingRegistrations)
router.get('/coordinator/stats', getCoordinatorRegistrationStats)
router.post('/coordinator/decision', coordinatorDecision)

// Admin endpoints
router.use('/admin', authMiddleware, requireRoles('admin'))
router.get('/admin/pending', getAdminPendingRegistrations)
router.get('/admin/stats', getAdminRegistrationStats)
router.post('/admin/decision', adminDecision)

module.exports = router
