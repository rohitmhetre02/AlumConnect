const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { listMySessions, getSessionDetails, updateSession } = require('../controllers/mentorSessionController')

const router = express.Router()

router.use(authMiddleware)

router.get('/me/sessions', listMySessions)
router.get('/me/sessions/:sessionId', getSessionDetails)
router.put('/me/sessions/:sessionId', updateSession)

module.exports = router
