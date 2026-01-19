const bcrypt = require('bcryptjs')

const { getModelByRole } = require('../utils/roleModels')
const { sanitizeUser } = require('./authController')

const normalizeEmail = (value = '') => String(value).trim().toLowerCase()

const updateAccountEmail = async (req, res) => {
  try {
    const { id, role } = req.user ?? {}
    const { newEmail, currentPassword } = req.body ?? {}

    if (!id || !role) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ success: false, message: 'New email is required.' })
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Current password is required to change email.' })
    }

    const normalizedEmail = normalizeEmail(newEmail)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' })
    }

    const Model = getModelByRole(role)
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Unsupported user role.' })
    }

    const user = await Model.findById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' })
    }

    if (user.email === normalizedEmail) {
      return res.status(200).json({
        success: true,
        message: 'Email remains unchanged.',
        data: sanitizeUser(user, role),
      })
    }

    const existingUser = await Model.findOne({ email: normalizedEmail })
    if (existingUser && existingUser._id.toString() !== id) {
      return res.status(409).json({ success: false, message: 'This email is already registered.' })
    }

    user.email = normalizedEmail
    await user.save()

    const sanitized = sanitizeUser(user, role)
    return res.status(200).json({
      success: true,
      message: 'Email updated successfully.',
      data: sanitized,
    })
  } catch (error) {
    console.error('updateAccountEmail error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update email.' })
  }
}

const changeAccountPassword = async (req, res) => {
  try {
    const { id, role } = req.user ?? {}
    const { currentPassword, newPassword } = req.body ?? {}

    if (!id || !role) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'Current password is required.' })
    }

    if (!newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ success: false, message: 'New password is required.' })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters long.' })
    }

    const Model = getModelByRole(role)
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Unsupported user role.' })
    }

    const user = await Model.findById(id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'Account not found.' })
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' })
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return res.status(400).json({ success: false, message: 'New password must be different from the current password.' })
    }

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()

    return res.status(200).json({ success: true, message: 'Password updated successfully.' })
  } catch (error) {
    console.error('changeAccountPassword error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update password.' })
  }
}

module.exports = {
  updateAccountEmail,
  changeAccountPassword,
}
