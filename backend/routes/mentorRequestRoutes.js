const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  listMyRequests,
  getRequestDetails,
  acceptRequest,
  rejectRequest,
  confirmRequest,
  createMentorRequest,
  updateMeetingLink,
} = require('../controllers/mentorRequestController')

const router = express.Router()

router.get('/me/requests', authMiddleware, listMyRequests)
router.get('/my-requests', authMiddleware, listMyRequests)
router.post('/:mentorId/requests', authMiddleware, createMentorRequest)
router.get('/me/requests/:requestId', authMiddleware, getRequestDetails)
router.post('/me/requests/:requestId/accept', authMiddleware, acceptRequest)
router.post('/me/requests/:requestId/reject', authMiddleware, rejectRequest)
router.post('/me/requests/:requestId/confirm', authMiddleware, confirmRequest)
router.post('/me/requests/:requestId/meeting-link', authMiddleware, updateMeetingLink)
router.post('/me/requests/:requestId/meetingLink', authMiddleware, updateMeetingLink)
router.post('/my-requests/:requestId/confirm', authMiddleware, confirmRequest)

module.exports = router
