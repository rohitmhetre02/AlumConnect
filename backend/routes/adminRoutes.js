const express = require('express')
const router = express.Router()
const {
  getAllMentors,
  getMentorRequests,
  getMentorReviews,
  suspendMentor,
  reactivateMentor,
  approveMentor,
  deleteMentor
} = require('../controllers/adminController')

// Get all mentors for admin
router.get('/mentors', getAllMentors)

// Get mentorship requests for a specific mentor
router.get('/mentors/:mentorId/requests', getMentorRequests)

// Get reviews for a specific mentor
router.get('/mentors/:mentorId/reviews', getMentorReviews)

// Approve a mentor
router.patch('/mentors/:mentorId/approve', approveMentor)

// Suspend a mentor
router.patch('/mentors/:mentorId/suspend', suspendMentor)

// Reactivate a mentor
router.patch('/mentors/:mentorId/reactivate', reactivateMentor)

// Delete a mentor
router.delete('/mentors/:mentorId', deleteMentor)

module.exports = router
