const mongoose = require('mongoose')

const { getModelByRole } = require('../utils/roleModels')
const {
  buildProfilePayload,
  validateProfilePayload,
  detectIncompleteProfile,
} = require('../utils/profileValidation')
const getMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user
    const Model = getModelByRole(role)

    if (!Model || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user context' })
    }

    const user = await Model.findById(id).select('-password')

    if (!user) {
      return res.status(404).json({ success: false, message: 'Profile not found' })
    }

    return res.status(200).json({
      success: true,
      incompleteProfile: detectIncompleteProfile(user),
      data: user,
    })
  } catch (error) {
    console.error('getMyProfile error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch profile' })
  }
}

const updateMyProfile = async (req, res) => {
  try {
    const { id, role } = req.user
    const Model = getModelByRole(role)

    if (!Model || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user context' })
    }

    const payload = buildProfilePayload(req.body, role)
    validateProfilePayload(payload, role)

    const updatedUser = await Model.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
      select: '-password',
    })

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Profile not found' })
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    })
  } catch (error) {
    if (error.message?.includes('required') || error.message?.includes('must be a valid year') || error.message?.includes('skills')) {
      return res.status(400).json({ success: false, message: error.message })
    }

    console.error('updateMyProfile error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update profile' })
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
}
