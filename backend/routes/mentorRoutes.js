const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  submitMentorApplication,
  listMentors,
  listApplications,
  getMyProfile,
  updateMyProfile,
  getMentorProfile,
} = require('../controllers/mentorController')
const { aiMatchMentors } = require('../controllers/mentorMatchController')

const router = express.Router()

router.get('/', listMentors)
router.post('/applications', authMiddleware, submitMentorApplication)
router.get('/applications', authMiddleware, listApplications)
router.get('/me', authMiddleware, getMyProfile)
router.put('/me', authMiddleware, updateMyProfile)
router.post('/ai-match', authMiddleware, aiMatchMentors)
router.get('/:mentorId', getMentorProfile)

module.exports = router
