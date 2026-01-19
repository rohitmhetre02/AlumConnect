const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const PasswordResetToken = require('../models/PasswordResetToken')
const { getModelByRole } = require('../utils/roleModels')
const { generateNumericCode } = require('../utils/password')
const { sendPasswordResetCodeEmail, isEmailConfigured } = require('../utils/email')

const RESETTABLE_ROLES = ['admin', 'coordinator', 'student', 'alumni', 'faculty']
const CODE_EXPIRY_MINUTES = 10
const RESET_TOKEN_EXPIRY_MINUTES = 30
const MAX_FAILED_ATTEMPTS = 5

const normalizeEmail = (value = '') => String(value).trim().toLowerCase()

const findUserByEmail = async (email) => {
  for (const role of RESETTABLE_ROLES) {
    const Model = getModelByRole(role)
    if (!Model) continue

    const user = await Model.findOne({ email })
    if (user) {
      return { user, role }
    }
  }
  return null
}

const requestPasswordReset = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' })
    }

    const userResult = await findUserByEmail(email)
    if (!userResult) {
      return res.status(404).json({ message: 'No account found with this email.' })
    }

    const code = generateNumericCode(6)
    const codeHash = await bcrypt.hash(code, 10)
    const codeExpiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000)

    await PasswordResetToken.findOneAndUpdate(
      { email },
      {
        email,
        role: userResult.role,
        codeHash,
        codeExpiresAt,
        attempts: 0,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
        verifiedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    const emailOutcome = await sendPasswordResetCodeEmail({
      to: email,
      code,
      expiresInMinutes: CODE_EXPIRY_MINUTES,
    })

    return res.status(200).json({
      message: 'Verification code sent successfully.',
      emailSent: Boolean(emailOutcome?.sent),
      emailSkipped: Boolean(emailOutcome?.skipped),
      emailConfigured: isEmailConfigured(),
      expiresInMinutes: CODE_EXPIRY_MINUTES,
    })
  } catch (error) {
    console.error('requestPasswordReset error:', error)
    return res.status(500).json({ message: 'Unable to start password reset.' })
  }
}

const verifyPasswordResetCode = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const code = String(req.body.code ?? '').trim()

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required.' })
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ message: 'Invalid code format.' })
    }

    const record = await PasswordResetToken.findOne({ email })
    if (!record) {
      return res.status(404).json({ message: 'Verification code not found or expired.' })
    }

    if (record.attempts >= MAX_FAILED_ATTEMPTS) {
      return res.status(429).json({ message: 'Too many failed attempts. Please request a new code.' })
    }

    if (!record.codeExpiresAt || record.codeExpiresAt.getTime() < Date.now()) {
      return res.status(410).json({ message: 'Verification code has expired.' })
    }

    const isMatch = await bcrypt.compare(code, record.codeHash)
    if (!isMatch) {
      record.attempts += 1
      await record.save()
      return res.status(400).json({ message: 'Invalid verification code.' })
    }

    const resetTokenPlain = crypto.randomBytes(32).toString('hex')
    const resetTokenHash = await bcrypt.hash(resetTokenPlain, 10)
    const resetTokenExpiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000)

    record.resetTokenHash = resetTokenHash
    record.resetTokenExpiresAt = resetTokenExpiresAt
    record.attempts = 0
    record.verifiedAt = new Date()
    await record.save()

    return res.status(200).json({
      message: 'Verification successful.',
      resetToken: resetTokenPlain,
      expiresInMinutes: RESET_TOKEN_EXPIRY_MINUTES,
    })
  } catch (error) {
    console.error('verifyPasswordResetCode error:', error)
    return res.status(500).json({ message: 'Unable to verify code.' })
  }
}

const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email)
    const resetToken = String(req.body.resetToken ?? '').trim()
    const newPassword = String(req.body.newPassword ?? '').trim()

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Email, reset token, and new password are required.' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' })
    }

    const record = await PasswordResetToken.findOne({ email })
    if (!record || !record.resetTokenHash) {
      return res.status(404).json({ message: 'Reset session not found. Please restart password reset.' })
    }

    if (!record.resetTokenExpiresAt || record.resetTokenExpiresAt.getTime() < Date.now()) {
      await PasswordResetToken.deleteOne({ email })
      return res.status(410).json({ message: 'Reset token has expired. Please request a new code.' })
    }

    const isTokenValid = await bcrypt.compare(resetToken, record.resetTokenHash)
    if (!isTokenValid) {
      return res.status(400).json({ message: 'Invalid reset token.' })
    }

    const Model = getModelByRole(record.role)
    if (!Model) {
      console.error(`resetPassword missing model for role ${record.role}`)
      return res.status(500).json({ message: 'Unable to reset password.' })
    }

    const user = await Model.findOne({ email })
    if (!user) {
      await PasswordResetToken.deleteOne({ email })
      return res.status(404).json({ message: 'User account not found.' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    await PasswordResetToken.deleteOne({ email })

    return res.status(200).json({ message: 'Password updated successfully.' })
  } catch (error) {
    console.error('resetPassword error:', error)
    return res.status(500).json({ message: 'Unable to reset password.' })
  }
}

module.exports = {
  requestPasswordReset,
  verifyPasswordResetCode,
  resetPassword,
}
