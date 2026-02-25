const mongoose = require('mongoose')
const { PROFILE_STATUS, normalizeProfileStatus } = require('../utils/profileStatus')
const { sendProfileApprovalStatusEmail } = require('../utils/email')
const { normalizeDepartment } = require('../utils/departments')
const { REGISTRATION_STATUS } = require('../utils/registrationStatus')
const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const Faculty = require('../models/Faculty')
const Coordinator = require('../models/Coordinator')
const Admin = require('../models/Admin')

const COORDINATOR_APPROVAL_ROLES = ['student', 'alumni', 'faculty']
const ADMIN_APPROVAL_ROLES = ['faculty', 'coordinator']

const ensureObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw Object.assign(new Error('Invalid profile id provided.'), { status: 400 })
  }
  return new mongoose.Types.ObjectId(String(value))
}

const getAdminContext = async (adminId) => {
  const admin = await Admin.findById(adminId).lean()
  if (!admin) {
    throw Object.assign(new Error('Admin profile not found.'), { status: 404 })
  }

  const displayName = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim() || admin.email || 'Admin'
  return { admin, displayName }
}

const getCoordinatorContext = async (coordinatorId) => {
  const coordinator = await Coordinator.findById(coordinatorId).lean()
  if (!coordinator) {
    throw Object.assign(new Error('Coordinator profile not found.'), { status: 404 })
  }

  const department = normalizeDepartment(coordinator.department)
  const displayName = [coordinator.firstName, coordinator.lastName].filter(Boolean).join(' ').trim() || coordinator.email || 'Coordinator'

  return { coordinator, department, displayName }
}

const mapPendingProfile = (doc, role) => {
  if (!doc) return null
  const snapshot = doc.toObject ? doc.toObject() : doc
  return {
    ...snapshot,
    id: snapshot._id,
    role,
  }
}

const buildStatsTemplate = (roles) => {
  const template = {}
  Object.values(PROFILE_STATUS).forEach((status) => {
    template[status] = roles.reduce(
      (acc, role) => ({
        ...acc,
        [role]: 0,
      }),
      { total: 0 },
    )
  })
  return template
}

const accumulateStats = (aggregate, template, role) => {
  aggregate.forEach(({ _id, count }) => {
    const status = normalizeProfileStatus(_id)
    if (!template[status]) return
    template[status][role] = count
    template[status].total += count
  })
}

const getPendingProfiles = async (req, res) => {
  try {
    const actorRole = String(req.user?.role || '').toLowerCase()

    if (actorRole === 'admin') {
      await getAdminContext(req.user.id)

      const [faculty, coordinators] = await Promise.all([
        Faculty.find({ profileApprovalStatus: PROFILE_STATUS.IN_REVIEW })
          .sort({ createdAt: -1 })
          .lean(),
        Coordinator.find({ profileApprovalStatus: PROFILE_STATUS.IN_REVIEW })
          .sort({ createdAt: -1 })
          .lean(),
      ])

      // Also find coordinators without profileApprovalStatus field and treat them as pending
      const coordinatorsWithoutStatus = await Coordinator.find({ 
        profileApprovalStatus: { $exists: false } 
      })
        .sort({ createdAt: -1 })
        .lean()

      console.log(`Found ${coordinatorsWithoutStatus.length} coordinators without profileApprovalStatus`)

      // Update those coordinators to have IN_REVIEW status
      if (coordinatorsWithoutStatus.length > 0) {
        await Coordinator.updateMany(
          { profileApprovalStatus: { $exists: false } },
          { 
            $set: { 
              profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
              isProfileApproved: false
            } 
          }
        )
        console.log(`Updated ${coordinatorsWithoutStatus.length} coordinators with IN_REVIEW status`)
      }

      const combined = [
        ...faculty.map((doc) => mapPendingProfile(doc, 'faculty')),
        ...coordinators.map((doc) => mapPendingProfile(doc, 'coordinator')),
        ...coordinatorsWithoutStatus.map((doc) => mapPendingProfile(doc, 'coordinator')),
      ]

      return res.json({
        success: true,
        data: combined,
        meta: { reviewerRole: 'admin' },
      })
    }

    if (actorRole === 'coordinator') {
      const { department } = await getCoordinatorContext(req.user.id)

      const [students, alumni, faculty] = await Promise.all([
        Student.find({
          department,
          profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
        })
          .sort({ createdAt: -1 })
          .lean(),
        Alumni.find({
          department,
          profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
        })
          .sort({ createdAt: -1 })
          .lean(),
        Faculty.find({
          department,
          profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
        })
          .sort({ createdAt: -1 })
          .lean(),
      ])

      const combined = [
        ...students.map((doc) => mapPendingProfile(doc, 'student')),
        ...alumni.map((doc) => mapPendingProfile(doc, 'alumni')),
        ...faculty.map((doc) => mapPendingProfile(doc, 'faculty')),
      ]

      return res.json({
        success: true,
        data: combined,
        meta: { reviewerRole: 'coordinator', department },
      })
    }

    return res.status(403).json({ success: false, message: 'You do not have permission to view profile approvals.' })
  } catch (error) {
    console.error('Error fetching pending profiles:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch pending profiles'
    })
  }
}

const getApprovedProfiles = async (req, res) => {
  try {
    const actorRole = String(req.user?.role || '').toLowerCase()

    if (actorRole === 'admin') {
      await getAdminContext(req.user.id)

      const [faculty, coordinators] = await Promise.all([
        Faculty.find({ profileApprovalStatus: PROFILE_STATUS.APPROVED })
          .sort({ createdAt: -1 })
          .lean(),
        Coordinator.find({ profileApprovalStatus: PROFILE_STATUS.APPROVED })
          .sort({ createdAt: -1 })
          .lean(),
      ])

      const combined = [
        ...faculty.map((doc) => mapPendingProfile(doc, 'faculty')),
        ...coordinators.map((doc) => mapPendingProfile(doc, 'coordinator')),
      ]

      return res.json({
        success: true,
        data: combined,
        meta: { reviewerRole: 'admin' },
      })
    }

    if (actorRole === 'coordinator') {
      const { department } = await getCoordinatorContext(req.user.id)

      const [students, alumni, faculty] = await Promise.all([
        Student.find({
          department,
          profileApprovalStatus: PROFILE_STATUS.APPROVED,
        })
          .sort({ createdAt: -1 })
          .lean(),
        Alumni.find({
          department,
          profileApprovalStatus: PROFILE_STATUS.APPROVED,
        })
          .sort({ createdAt: -1 })
          .lean(),
        Faculty.find({
          department,
          profileApprovalStatus: PROFILE_STATUS.APPROVED,
        })
          .sort({ createdAt: -1 })
          .lean(),
      ])

      const combined = [
        ...students.map((doc) => mapPendingProfile(doc, 'student')),
        ...alumni.map((doc) => mapPendingProfile(doc, 'alumni')),
        ...faculty.map((doc) => mapPendingProfile(doc, 'faculty')),
      ]

      return res.json({
        success: true,
        data: combined,
        meta: { reviewerRole: 'coordinator', department },
      })
    }

    return res.status(403).json({ success: false, message: 'You do not have permission to view profile approvals.' })
  } catch (error) {
    console.error('Error fetching approved profiles:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch approved profiles'
    })
  }
}

const approveProfile = async (req, res) => {
  try {
    const { id, role } = req.body
    if (!id || !role) {
      return res.status(400).json({ success: false, message: 'Profile ID and role are required' })
    }

    const actorRole = String(req.user?.role || '').toLowerCase()
    const normalizedRole = String(role).trim().toLowerCase()
    const profileId = ensureObjectId(id)

    let update
    let updatedProfile
    let displayName

    if (actorRole === 'admin') {
      if (!ADMIN_APPROVAL_ROLES.includes(normalizedRole)) {
        return res.status(403).json({ success: false, message: 'Admins may only approve faculty or coordinator profiles.' })
      }

      const Model = normalizedRole === 'faculty' ? Faculty : Coordinator
      ;({ displayName } = await getAdminContext(req.user.id))

      const now = new Date()
      update = {
        isProfileApproved: true,
        profileApprovalStatus: PROFILE_STATUS.APPROVED,
        profileReviewedAt: now,
        profileReviewedBy: displayName,
        profileRejectionReason: undefined,
        registrationStatus: REGISTRATION_STATUS.APPROVED,
        registrationReviewedAt: now,
        registrationReviewedBy: displayName,
        registrationDecisionByRole: 'admin',
        registrationRejectionReason: '',
      }

      updatedProfile = await Model.findOneAndUpdate(
        { _id: profileId, profileApprovalStatus: PROFILE_STATUS.IN_REVIEW },
        update,
        { new: true },
      )
    } else if (actorRole === 'coordinator') {
      if (!COORDINATOR_APPROVAL_ROLES.includes(normalizedRole)) {
        return res.status(403).json({ success: false, message: 'Coordinators may only approve student, alumni, or faculty profiles.' })
      }

      const { coordinator, department, displayName: coordinatorName } = await getCoordinatorContext(req.user.id)
      let Model
      if (normalizedRole === 'student') {
        Model = Student
      } else if (normalizedRole === 'alumni') {
        Model = Alumni
      } else if (normalizedRole === 'faculty') {
        Model = Faculty
      }

      const now = new Date()
      update = {
        isProfileApproved: true,
        profileApprovalStatus: PROFILE_STATUS.APPROVED,
        profileReviewedAt: now,
        profileReviewedBy: coordinatorName,
        profileRejectionReason: undefined,
        registrationStatus: REGISTRATION_STATUS.APPROVED,
        registrationReviewedAt: now,
        registrationReviewedBy: coordinatorName,
        registrationDecisionByRole: 'coordinator',
        registrationRejectionReason: '',
      }

      // Add departmentCoordinator only for student and alumni
      if (normalizedRole === 'student' || normalizedRole === 'alumni') {
        update.departmentCoordinator = coordinator._id
      }

      const updateQuery = {
        _id: profileId,
        profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
      }
      
      // Add department filter for student, alumni, and faculty
      if (normalizedRole === 'student' || normalizedRole === 'alumni' || normalizedRole === 'faculty') {
        updateQuery.department = department
      }

      updatedProfile = await Model.findOneAndUpdate(
        updateQuery,
        update,
        { new: true },
      )
      displayName = coordinatorName
    } else {
      return res.status(403).json({ success: false, message: 'You do not have permission to approve profiles.' })
    }

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found or already reviewed.' })
    }

    if (updatedProfile.email) {
      const recipientName = [updatedProfile.firstName, updatedProfile.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || updatedProfile.name || updatedProfile.email

      try {
        await sendProfileApprovalStatusEmail({
          to: updatedProfile.email,
          name: recipientName,
          status: 'approved',
          role: normalizedRole,
        })
      } catch (emailError) {
        console.warn('Failed to send approval email:', emailError)
      }
    }

    res.json({
      success: true,
      message: 'Profile approved successfully',
      data: mapPendingProfile(updatedProfile, normalizedRole),
      reviewer: displayName,
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
    if (!id || !role) {
      return res.status(400).json({ success: false, message: 'Profile ID and role are required' })
    }

    const actorRole = String(req.user?.role || '').toLowerCase()
    const normalizedRole = String(role).trim().toLowerCase()
    const profileId = ensureObjectId(id)
    const rejectionReason = reason?.trim()

    if (!rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required.' })
    }

    let updatedProfile
    let displayName

    if (actorRole === 'admin') {
      if (!ADMIN_APPROVAL_ROLES.includes(normalizedRole)) {
        return res.status(403).json({ success: false, message: 'Admins may only reject faculty or coordinator profiles.' })
      }

      const Model = normalizedRole === 'faculty' ? Faculty : Coordinator
      ;({ displayName } = await getAdminContext(req.user.id))

      const now = new Date()
      updatedProfile = await Model.findOneAndUpdate(
        { _id: profileId, profileApprovalStatus: PROFILE_STATUS.IN_REVIEW },
        {
          isProfileApproved: false,
          profileApprovalStatus: PROFILE_STATUS.REJECTED,
          profileReviewedAt: now,
          profileReviewedBy: displayName,
          profileRejectionReason: rejectionReason,
          registrationStatus: REGISTRATION_STATUS.REJECTED,
          registrationReviewedAt: now,
          registrationReviewedBy: displayName,
          registrationDecisionByRole: 'admin',
          registrationRejectionReason: rejectionReason,
        },
        { new: true },
      )
    } else if (actorRole === 'coordinator') {
      if (!COORDINATOR_APPROVAL_ROLES.includes(normalizedRole)) {
        return res.status(403).json({ success: false, message: 'Coordinators may only reject student, alumni, or faculty profiles.' })
      }

      const { coordinator, department, displayName: coordinatorName } = await getCoordinatorContext(req.user.id)
      let Model
      if (normalizedRole === 'student') {
        Model = Student
      } else if (normalizedRole === 'alumni') {
        Model = Alumni
      } else if (normalizedRole === 'faculty') {
        Model = Faculty
      }

      const now = new Date()
      const update = {
        isProfileApproved: false,
        profileApprovalStatus: PROFILE_STATUS.REJECTED,
        profileReviewedAt: now,
        profileReviewedBy: coordinatorName,
        profileRejectionReason: rejectionReason,
        registrationStatus: REGISTRATION_STATUS.REJECTED,
        registrationReviewedAt: now,
        registrationReviewedBy: coordinatorName,
        registrationDecisionByRole: 'coordinator',
        registrationRejectionReason: rejectionReason,
      }

      // Add departmentCoordinator only for student and alumni
      if (normalizedRole === 'student' || normalizedRole === 'alumni') {
        update.departmentCoordinator = null
      }

      const updateQuery = {
        _id: profileId,
        profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
      }
      
      // Add department filter for student, alumni, and faculty
      if (normalizedRole === 'student' || normalizedRole === 'alumni' || normalizedRole === 'faculty') {
        updateQuery.department = department
      }

      updatedProfile = await Model.findOneAndUpdate(
        updateQuery,
        update,
        { new: true },
      )
      displayName = coordinatorName
    } else {
      return res.status(403).json({ success: false, message: 'You do not have permission to reject profiles.' })
    }

    if (!updatedProfile) {
      return res.status(404).json({ success: false, message: 'Profile not found or already reviewed.' })
    }

    if (updatedProfile.email) {
      const recipientName = [updatedProfile.firstName, updatedProfile.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || updatedProfile.name || updatedProfile.email

      try {
        await sendProfileApprovalStatusEmail({
          to: updatedProfile.email,
          name: recipientName,
          status: 'rejected',
          role: normalizedRole,
          reason: rejectionReason,
        })
      } catch (emailError) {
        console.warn('Failed to send rejection email:', emailError)
      }
    }

    res.json({
      success: true,
      message: 'Profile rejected successfully',
      data: mapPendingProfile(updatedProfile, normalizedRole),
      reviewer: displayName,
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
    const actorRole = String(req.user?.role || '').toLowerCase()

    if (actorRole === 'admin') {
      await getAdminContext(req.user.id)
      const roles = ADMIN_APPROVAL_ROLES
      const statsTemplate = buildStatsTemplate(roles)

      // First, update coordinators without profileApprovalStatus
      const coordinatorsWithoutStatus = await Coordinator.find({ 
        profileApprovalStatus: { $exists: false } 
      })
      
      if (coordinatorsWithoutStatus.length > 0) {
        await Coordinator.updateMany(
          { profileApprovalStatus: { $exists: false } },
          { 
            $set: { 
              profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
              isProfileApproved: false
            } 
          }
        )
        console.log(`Updated ${coordinatorsWithoutStatus.length} coordinators with IN_REVIEW status in stats endpoint`)
      }

      const [facultyStats, coordinatorStats] = await Promise.all([
        Faculty.aggregate([
          { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } },
        ]),
        Coordinator.aggregate([
          { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } },
        ]),
      ])

      accumulateStats(facultyStats, statsTemplate, 'faculty')
      accumulateStats(coordinatorStats, statsTemplate, 'coordinator')

      return res.json({ success: true, data: statsTemplate })
    }

    if (actorRole === 'coordinator') {
      const { department } = await getCoordinatorContext(req.user.id)
      const roles = COORDINATOR_APPROVAL_ROLES
      const statsTemplate = buildStatsTemplate(roles)

      const [studentStats, alumniStats, facultyStats] = await Promise.all([
        Student.aggregate([
          { $match: { department } },
          { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } },
        ]),
        Alumni.aggregate([
          { $match: { department } },
          { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } },
        ]),
        Faculty.aggregate([
          { $match: { department } },
          { $group: { _id: '$profileApprovalStatus', count: { $sum: 1 } } },
        ]),
      ])

      accumulateStats(studentStats, statsTemplate, 'student')
      accumulateStats(alumniStats, statsTemplate, 'alumni')
      accumulateStats(facultyStats, statsTemplate, 'faculty')

      return res.json({ success: true, data: statsTemplate })
    }

    return res.status(403).json({ success: false, message: 'You do not have permission to view profile approval statistics.' })
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
  getApprovedProfiles,
  approveProfile,
  rejectProfile,
  getProfileApprovalStats
}
