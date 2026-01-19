const express = require('express')
const { getMyProfile, updateMyProfile } = require('../controllers/profileController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/me', authMiddleware, getMyProfile)
router.put('/me', authMiddleware, updateMyProfile)
module.exports = router
