const mongoose = require('mongoose')

const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const Faculty = require('../models/Faculty')
const Coordinator = require('../models/Coordinator')
const Admin = require('../models/Admin')
const { normalizeDepartment } = require('../utils/departments')
const { REGISTRATION_STATUS, normalizeRegistrationStatus } = require('../utils/registrationStatus')
const { sanitizeUser } = require('./authController')

const pendingRolesForCoordinator = ['student', 'alumni']
const pendingRolesForAdmin = ['faculty', 'coordinator']

const formatUserForReview = (userDoc, role) => {
  if (!userDoc) return null
  const normalizedRole = role?.toLowerCase?.() ?? role
  const sanitized = sanitizeUser(userDoc, normalizedRole)

  return {
    ...sanitized,
    department: userDoc.department ?? '',
    registrationStatus: normalizeRegistrationStatus(userDoc.registrationStatus),
    registrationReviewedAt: userDoc.registrationReviewedAt ?? null,
    registrationReviewedBy: userDoc.registrationReviewedBy ?? '',
    registrationDecisionByRole: userDoc.registrationDecisionByRole ?? '',
    registrationRejectionReason: userDoc.registrationRejectionReason ?? '',
    departmentCoordinator: userDoc.departmentCoordinator ?? null,
    metadata: {
      prnNumber: userDoc.prnNumber ?? userDoc.prn ?? '',
      admissionYear: userDoc.admissionYear ?? null,
      expectedPassoutYear: userDoc.expectedPassoutYear ?? null,
      passoutYear: userDoc.passoutYear ?? null,
      title: userDoc.title ?? '',
      phone: userDoc.phone ?? '',
    },
    createdAt: userDoc.createdAt ?? null,
    updatedAt: userDoc.updatedAt ?? null,
  }
}

const ensureObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw Object.assign(new Error('Invalid user id provided.'), { status: 400 })
  }
  return new mongoose.Types.ObjectId(String(value))
}

const getCoordinatorContext = async (coordinatorId) => {
  const coordinator = await Coordinator.findById(coordinatorId).lean()
  if (!coordinator) {
    throw Object.assign(new Error('Coordinator profile not found.'), { status: 404 })
  }

  const normalizedDepartment = normalizeDepartment(coordinator.department)

  return {
    coordinator,
    department: normalizedDepartment,
    displayName: [coordinator.firstName, coordinator.lastName].filter(Boolean).join(' ').trim() || coordinator.email || 'Coordinator',
  }
}

const getAdminContext = async (adminId) => {
  const admin = await Admin.findById(adminId).lean()
  if (!admin) {
    throw Object.assign(new Error('Admin profile not found.'), { status: 404 })
  }

  const displayName = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim() || admin.email || 'Admin'
  return { admin, displayName }
}

const getCoordinatorPendingRegistrations = async (req, res) => {
  try {
    const { coordinator, department } = await getCoordinatorContext(req.user.id)
    const { role: roleFilter } = req.query
    const normalizedFilter = roleFilter ? String(roleFilter).toLowerCase().trim() : 'all'

    const shouldIncludeRole = (role) => normalizedFilter === 'all' || normalizedFilter === role

    const queries = []

    if (shouldIncludeRole('student')) {
      queries.push(
        Student.find({
          department,
          registrationStatus: REGISTRATION_STATUS.PENDING,
        })
          .sort({ createdAt: -1 })
          .lean()
          .then((docs) => docs.map((doc) => formatUserForReview(doc, 'student'))),
      )
    } else {
      queries.push(Promise.resolve([]))
    }

    if (shouldIncludeRole('alumni')) {
      queries.push(
        Alumni.find({
          department,
          registrationStatus: REGISTRATION_STATUS.PENDING,
        })
          .sort({ createdAt: -1 })
          .lean()
          .then((docs) => docs.map((doc) => formatUserForReview(doc, 'alumni'))),
      )
    } else {
      queries.push(Promise.resolve([]))
    }

    const [students, alumni] = await Promise.all(queries)

    return res.status(200).json({
      success: true,
      data: {
        coordinator: {
          id: coordinator._id,
          department,
        },
        students,
        alumni,
      },
      totals: {
        students: students.length,
        alumni: alumni.length,
      },
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to fetch pending registrations.'
    console.error('getCoordinatorPendingRegistrations error:', error)
    return res.status(status).json({ success: false, message })
  }
}

const getCoordinatorRegistrationStats = async (req, res) => {
  try {
    const { department } = await getCoordinatorContext(req.user.id)

    const buildStats = async (Model) => {
      const [pending, approved, rejected] = await Promise.all([
        Model.countDocuments({ department, registrationStatus: REGISTRATION_STATUS.PENDING }),
        Model.countDocuments({ department, registrationStatus: REGISTRATION_STATUS.APPROVED }),
        Model.countDocuments({ department, registrationStatus: REGISTRATION_STATUS.REJECTED }),
      ])

      return { pending, approved, rejected }
    }

    const [studentStats, alumniStats] = await Promise.all([
      buildStats(Student),
      buildStats(Alumni),
    ])

    return res.status(200).json({
      success: true,
      data: {
        student: studentStats,
        alumni: alumniStats,
      },
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to fetch coordinator registration stats.'
    console.error('getCoordinatorRegistrationStats error:', error)
    return res.status(status).json({ success: false, message })
  }
}

const coordinatorDecision = async (req, res) => {
  try {
    const { coordinator, department, displayName } = await getCoordinatorContext(req.user.id)
    const { userId, role, action, reason } = req.body ?? {}

    const normalizedRole = String(role || '').toLowerCase().trim()
    if (!pendingRolesForCoordinator.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Unsupported role for coordinator decision.' })
    }

    if (!['approve', 'reject'].includes(String(action).toLowerCase())) {
      return res.status(400).json({ success: false, message: 'action must be either approve or reject.' })
    }

    const objectId = ensureObjectId(userId)
    const Model = normalizedRole === 'student' ? Student : Alumni

    const current = await Model.findOne({ _id: objectId, department }).lean()
    if (!current) {
      return res.status(404).json({ success: false, message: 'User not found for your department.' })
    }

    if (normalizeRegistrationStatus(current.registrationStatus) !== REGISTRATION_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: 'Registration has already been reviewed.' })
    }

    const now = new Date()
    const update = {
      registrationReviewedAt: now,
      registrationReviewedBy: displayName,
      registrationDecisionByRole: 'coordinator',
      departmentCoordinator: coordinator._id,
    }

    if (String(action).toLowerCase() === 'approve') {
      update.registrationStatus = REGISTRATION_STATUS.APPROVED
      update.registrationRejectionReason = ''
    } else {
      update.registrationStatus = REGISTRATION_STATUS.REJECTED
      update.registrationRejectionReason = reason?.trim() || 'Registration rejected.'
      update.departmentCoordinator = null
    }

    const updated = await Model.findByIdAndUpdate(objectId, update, { new: true })
    const formatted = formatUserForReview(updated.toObject(), normalizedRole)

    return res.status(200).json({
      success: true,
      message: `Registration ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      data: formatted,
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to process coordinator decision.'
    console.error('coordinatorDecision error:', error)
    return res.status(status).json({ success: false, message })
  }
}

const getAdminPendingRegistrations = async (req, res) => {
  try {
    await getAdminContext(req.user.id)
    const { role: roleFilter } = req.query
    const normalizedFilter = roleFilter ? String(roleFilter).toLowerCase().trim() : 'all'

    const shouldIncludeRole = (role) => normalizedFilter === 'all' || normalizedFilter === role

    const queries = []

    if (shouldIncludeRole('faculty')) {
      queries.push(
        Faculty.find({ registrationStatus: REGISTRATION_STATUS.PENDING })
          .sort({ createdAt: -1 })
          .lean()
          .then((docs) => docs.map((doc) => formatUserForReview(doc, 'faculty'))),
      )
    } else {
      queries.push(Promise.resolve([]))
    }

    if (shouldIncludeRole('coordinator')) {
      queries.push(
        Coordinator.find({ registrationStatus: REGISTRATION_STATUS.PENDING })
          .sort({ createdAt: -1 })
          .lean()
          .then((docs) => docs.map((doc) => formatUserForReview(doc, 'coordinator'))),
      )
    } else {
      queries.push(Promise.resolve([]))
    }

    const [faculty, coordinators] = await Promise.all(queries)

    return res.status(200).json({
      success: true,
      data: {
        faculty,
        coordinators,
      },
      totals: {
        faculty: faculty.length,
        coordinators: coordinators.length,
      },
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to fetch admin pending registrations.'
    console.error('getAdminPendingRegistrations error:', error)
    return res.status(status).json({ success: false, message })
  }
}

const getAdminRegistrationStats = async (req, res) => {
  try {
    await getAdminContext(req.user.id)

    const buildStats = async (Model) => {
      const [pending, approved, rejected] = await Promise.all([
        Model.countDocuments({ registrationStatus: REGISTRATION_STATUS.PENDING }),
        Model.countDocuments({ registrationStatus: REGISTRATION_STATUS.APPROVED }),
        Model.countDocuments({ registrationStatus: REGISTRATION_STATUS.REJECTED }),
      ])

      return { pending, approved, rejected }
    }

    const [facultyStats, coordinatorStats] = await Promise.all([
      buildStats(Faculty),
      buildStats(Coordinator),
    ])

    return res.status(200).json({
      success: true,
      data: {
        faculty: facultyStats,
        coordinator: coordinatorStats,
      },
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to fetch admin registration stats.'
    console.error('getAdminRegistrationStats error:', error)
    return res.status(status).json({ success: false, message })
  }
}

const adminDecision = async (req, res) => {
  try {
    const { displayName } = await getAdminContext(req.user.id)
    const { userId, role, action, reason } = req.body ?? {}

    const normalizedRole = String(role || '').toLowerCase().trim()
    if (!pendingRolesForAdmin.includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Unsupported role for admin decision.' })
    }

    if (!['approve', 'reject'].includes(String(action).toLowerCase())) {
      return res.status(400).json({ success: false, message: 'action must be either approve or reject.' })
    }

    const objectId = ensureObjectId(userId)
    const Model = normalizedRole === 'faculty' ? Faculty : Coordinator

    const current = await Model.findById(objectId).lean()
    if (!current) {
      return res.status(404).json({ success: false, message: 'User not found.' })
    }

    if (normalizeRegistrationStatus(current.registrationStatus) !== REGISTRATION_STATUS.PENDING) {
      return res.status(400).json({ success: false, message: 'Registration has already been reviewed.' })
    }

    const now = new Date()
    const update = {
      registrationReviewedAt: now,
      registrationReviewedBy: displayName,
      registrationDecisionByRole: 'admin',
    }

    const isApprove = String(action).toLowerCase() === 'approve'
    update.registrationStatus = isApprove ? REGISTRATION_STATUS.APPROVED : REGISTRATION_STATUS.REJECTED
    update.registrationRejectionReason = isApprove ? '' : reason?.trim() || 'Registration rejected.'

    if (normalizedRole === 'coordinator') {
      update.status = isApprove ? 'active' : 'inactive'
    }

    const updated = await Model.findByIdAndUpdate(objectId, update, { new: true })
    const formatted = formatUserForReview(updated.toObject(), normalizedRole)

    return res.status(200).json({
      success: true,
      message: `Registration ${isApprove ? 'approved' : 'rejected'} successfully.`,
      data: formatted,
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to process admin decision.'
    console.error('adminDecision error:', error)
    return res.status(status).json({ success: false, message })
  }
}

module.exports = {
  getCoordinatorPendingRegistrations,
  getCoordinatorRegistrationStats,
  coordinatorDecision,
  getAdminPendingRegistrations,
  getAdminRegistrationStats,
  adminDecision,
}
