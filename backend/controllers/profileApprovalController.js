const { getModelByRole } = require('../utils/roleModels')
const { PROFILE_STATUS, normalizeProfileStatus } = require('../utils/profileStatus')
const { sendProfileApprovalStatusEmail } = require('../utils/email')

const getPendingProfiles = async (req, res) => {
  try {
    const { role } = req.query
    const pendingProfiles = []

    if (!role || role === 'student') {
      const Student = require('../models/Student')
      const students = await Student.find({ 
        profileApprovalStatus: PROFILE_STATUS.IN_REVIEW 
      }).select('firstName lastName email department prnNumber admissionYear createdAt')
      pendingProfiles.push(...students.map(s => ({ ...s.toObject(), role: 'student' })))
    }

    if (!role || role === 'alumni') {
      const Alumni = require('../models/Alumni')
      const alumni = await Alumni.find({ 
        profileApprovalStatus: PROFILE_STATUS.IN_REVIEW 
      }).select('firstName lastName email department prnNumber passoutYear createdAt')
      pendingProfiles.push(...alumni.map(a => ({ ...a.toObject(), role: 'alumni' })))
    }

    if (!role || role === 'faculty') {
      const Faculty = require('../models/Faculty')
      const faculty = await Faculty.find({ 
        profileApprovalStatus: PROFILE_STATUS.IN_REVIEW 
      }).select('firstName lastName email department title createdAt')
      pendingProfiles.push(...faculty.map(f => ({ ...f.toObject(), role: 'faculty' })))
    }

    res.json({
      success: true,
      data: pendingProfiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
  } catch (error) {
    console.error('Error fetching pending profiles:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch pending profiles'
    })
  }
}

const approveProfile = async (req, res) => {
  try {
    const { id, role } = req.body
    const { adminName } = req.user

    if (!id || !role) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID and role are required'
      })
    }

    const Model = getModelByRole(role)
    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      })
    }

    const updatedProfile = await Model.findByIdAndUpdate(
      id,
      {
        isProfileApproved: true,
        profileApprovalStatus: PROFILE_STATUS.APPROVED,
        profileReviewedAt: new Date(),
        profileReviewedBy: adminName,
        profileRejectionReason: undefined,
      },
      { new: true }
    )

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      })
    }

    if (updatedProfile.email) {
      const displayName = [updatedProfile.firstName, updatedProfile.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || updatedProfile.name || updatedProfile.email

      try {
        await sendProfileApprovalStatusEmail({
          to: updatedProfile.email,
          name: displayName,
          status: 'approved',
          role,
        })
      } catch (emailError) {
        console.warn('Failed to send approval email:', emailError)
      }
    }

    res.json({
      success: true,
      message: 'Profile approved successfully',
      data: updatedProfile
    })
  } catch (error) {
    console.error('Error approving profile:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to approve profile'
    })
  }
}

const rejectProfile = async (req, res) => {
  try {
    const { id, role, reason } = req.body
    const { adminName } = req.user

    if (!id || !role) {
      return res.status(400).json({
        success: false,
        message: 'Profile ID and role are required'
      })
    }

    const Model = getModelByRole(role)
    if (!Model) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      })
    }

    const updatedProfile = await Model.findByIdAndUpdate(
      id,
      {
        isProfileApproved: false,
        profileApprovalStatus: PROFILE_STATUS.REJECTED,
        profileReviewedAt: new Date(),
        profileReviewedBy: adminName,
        profileRejectionReason: reason || 'Profile does not meet requirements',
      },
      { new: true }
    )

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      })
    }

    if (updatedProfile.email) {
      const displayName = [updatedProfile.firstName, updatedProfile.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || updatedProfile.name || updatedProfile.email

      try {
        await sendProfileApprovalStatusEmail({
          to: updatedProfile.email,
          name: displayName,
          status: 'rejected',
          role,
          reason: updatedProfile.profileRejectionReason,
        })
      } catch (emailError) {
        console.warn('Failed to send rejection email:', emailError)
      }
    }

    res.json({
      success: true,
      message: 'Profile rejected successfully',
      data: updatedProfile
    })
  } catch (error) {
    console.error('Error rejecting profile:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to reject profile'
    })
  }
}

const getProfileApprovalStats = async (req, res) => {
  try {
    const stats = {
      [PROFILE_STATUS.IN_REVIEW]: { student: 0, alumni: 0, faculty: 0, total: 0 },
      [PROFILE_STATUS.APPROVED]: { student: 0, alumni: 0, faculty: 0, total: 0 },
      [PROFILE_STATUS.REJECTED]: { student: 0, alumni: 0, faculty: 0, total: 0 },
    }

    const Student = require('../models/Student')
    const Alumni = require('../models/Alumni')
    const Faculty = require('../models/Faculty')

    const studentStats = await Student.aggregate([
      { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } }
    ])
    const alumniStats = await Alumni.aggregate([
      { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } }
    ])
    const facultyStats = await Faculty.aggregate([
      { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } }
    ])

    const processStats = (roleStats, role) => {
      roleStats.forEach(stat => {
        const status = normalizeProfileStatus(stat._id)
        if (!stats[status]) return
        stats[status][role] = stat.count
        stats[status].total += stat.count
      })
    }

    processStats(studentStats, 'student')
    processStats(alumniStats, 'alumni')
    processStats(facultyStats, 'faculty')

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching approval stats:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch approval statistics'
    })
  }
}

module.exports = {
  getPendingProfiles,
  approveProfile,
  rejectProfile,
  getProfileApprovalStats
}
