const express = require('express')
const { signup, login } = require('../controllers/authController')
const {
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
} = require('../controllers/passwordResetController')
const {
  startOAuth,
  handleOAuthCallback,
  getOAuthProviders,
} = require('../controllers/oauthController')
const { getMyProfile } = require('../controllers/profileController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/password/reset/request', requestPasswordReset)
router.post('/password/reset/verify', verifyPasswordResetCode)
router.post('/password/reset/complete', resetPassword)
router.get('/oauth/providers', getOAuthProviders)
router.get('/oauth/google', startOAuth('google'))
router.get('/oauth/google/callback', handleOAuthCallback('google'))
router.get('/oauth/linkedin', startOAuth('linkedin'))
router.get('/oauth/linkedin/callback', handleOAuthCallback('linkedin'))
router.get('/profile/me', authMiddleware, getMyProfile)

module.exports = router
