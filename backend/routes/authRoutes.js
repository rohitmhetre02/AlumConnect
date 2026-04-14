const express = require('express')
const { signup, login, activateAccount } = require('../controllers/authController')
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

// Account Settings Controller
const {
  updateEmail,
  verifyEmailOTP,
  resendEmailOTP,
  updatePassword,
  verifyPassword,
  deleteAccount,
  forgotPassword,
  verifyForgotPasswordOTP,
  resendForgotPasswordOTP,
} = require('../controllers/accountSettingsController')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/activate-account', activateAccount)
router.post('/password/reset/request', requestPasswordReset)
router.post('/password/reset/verify', verifyPasswordResetCode)
router.post('/password/reset/complete', resetPassword)
router.get('/oauth/providers', getOAuthProviders)
router.get('/oauth/google', startOAuth('google'))
router.get('/oauth/google/callback', handleOAuthCallback('google'))
router.get('/oauth/linkedin', startOAuth('linkedin'))
router.get('/oauth/linkedin/callback', handleOAuthCallback('linkedin'))
router.get('/profile', authMiddleware, getMyProfile)

// Account Settings Routes
router.put('/update-email', authMiddleware, updateEmail)
router.put('/verify-email-otp', verifyEmailOTP)
router.put('/resend-email-otp', resendEmailOTP)
router.post('/update-password', authMiddleware, updatePassword) // POST route for password update
router.post('/verify-password', verifyPassword) // POST route for password verification
router.post('/delete-account', authMiddleware, deleteAccount)
router.post('/forgot-password', forgotPassword)
router.post('/verify-forgot-password-otp', verifyForgotPasswordOTP)
router.post('/resend-forgot-password-otp', resendForgotPasswordOTP)

module.exports = router
