const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { getModelByRole } = require('../utils/roleModels')
const { PROFILE_STATUS, normalizeProfileStatus } = require('../utils/profileStatus')
const { normalizeDepartment } = require('../utils/departments')
const { REGISTRATION_STATUS, normalizeRegistrationStatus } = require('../utils/registrationStatus')

const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60

const AUTHENTICATABLE_ROLES = ['admin', 'coordinator', 'student', 'alumni', 'faculty']

const getJwtSecret = () => {
  const fallback = 'alumconnect-development-secret'
  const secret = process.env.JWT_SECRET || fallback
  if (secret === fallback) {
    console.warn('JWT_SECRET is not configured. Using fallback development secret.')
  }
  return secret
}

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value.toHexString === 'function') return value.toHexString()
  if (typeof value.toString === 'function') return value.toString()
  if (value.$oid) return value.$oid
  return String(value)
}

const createToken = (userId, role) => {
  const secret = getJwtSecret()
  return jwt.sign({ id: normalizeId(userId), role }, secret, { expiresIn: SEVEN_DAYS_IN_SECONDS })
}

const buildUserDisplayName = (user) => {
  const firstName = user.firstName?.trim() ?? ''
  const lastName = user.lastName?.trim() ?? ''
  const combined = `${firstName} ${lastName}`.trim()
  if (combined) return combined
  if (user.fullName?.trim()) return user.fullName.trim()
  if (user.email?.includes('@')) {
    return user.email.split('@')[0]
  }
  return ''
}

const sanitizeUser = (user, role) => {
  const profileApprovalStatus = normalizeProfileStatus(user?.profileApprovalStatus)
  const isProfileApproved = profileApprovalStatus === PROFILE_STATUS.APPROVED
  const registrationStatus = normalizeRegistrationStatus(user?.registrationStatus)

  return {
    id: normalizeId(user._id),
    role,
    email: user.email,
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    name: buildUserDisplayName(user),
    avatar: user.avatar ?? '',
    isProfileApproved,
    profileApprovalStatus,
    registrationStatus,
  }
}

const ensureNumeric = (value, fieldName) => {
  const numeric = Number(value)
  if (!Number.isInteger(numeric)) {
    throw new Error(`${fieldName} must be a valid year.`)
  }
  return numeric
}

const validateSignupPayload = (role, body) => {
  const requiredBaseFields = ['email', 'firstName', 'lastName', 'password']
  requiredBaseFields.forEach((field) => {
    if (!body[field] || String(body[field]).trim() === '') {
      throw new Error(`${field} is required.`)
    }
  })

  if (role === 'student') {
    const studentFields = ['prnNumber', 'admissionYear', 'currentYear', 'phoneNumber', 'department']
    studentFields.forEach((field) => {
      if (!body[field] || String(body[field]).trim() === '') {
        throw new Error(`${field} is required for student role.`)
      }
    })
    ensureNumeric(body.admissionYear, 'admissionYear')
  }

  if (role === 'alumni') {
    const alumniFields = ['prnNumber', 'passoutYear', 'phoneNumber', 'department']
    alumniFields.forEach((field) => {
      if (!body[field] || String(body[field]).trim() === '') {
        throw new Error(`${field} is required for alumni role.`)
      }
    })
    ensureNumeric(body.passoutYear, 'passoutYear')
  }

  if (role === 'coordinator') {
    if (!body.department || String(body.department).trim() === '') {
      throw new Error('department is required for coordinator role.')
    }
  }

  if (role === 'faculty') {
    const facultyFields = ['department', 'phoneNumber']
    facultyFields.forEach((field) => {
      if (!body[field] || String(body[field]).trim() === '') {
        throw new Error(`${field} is required for faculty role.`)
      }
    })
  }
}

const signup = async (req, res) => {
  try {
    const { role } = req.body
    const normalizedRole = role?.toLowerCase()

    const Model = getModelByRole(normalizedRole)

    if (!Model) {
      return res.status(400).json({ message: 'Invalid role provided.' })
    }

    validateSignupPayload(normalizedRole, req.body)

    const email = String(req.body.email).toLowerCase().trim()
    const existingUser = await Model.findOne({ email })

    if (existingUser) {
      // Check if this is an admin-created student completing their registration
      if (existingUser.registrationReviewedBy === 'admin' && existingUser.registrationStatus === 'APPROVED') {
        // Admin-created student found - update their information and allow login
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const updatePayload = {
          firstName: req.body.firstName?.trim() ?? existingUser.firstName,
          lastName: req.body.lastName?.trim() ?? existingUser.lastName,
          password: hashedPassword,
          department: normalizeDepartment(req.body.department),
          phoneNumber: req.body.phoneNumber,
          // Update student-specific fields if provided
          ...(normalizedRole === 'student' && {
            prnNumber: req.body.prnNumber || existingUser.prnNumber,
            admissionYear: req.body.admissionYear || existingUser.admissionYear,
            currentYear: req.body.currentYear || existingUser.currentYear,
          }),
          // Update alumni-specific fields if provided
          ...(normalizedRole === 'alumni' && {
            prnNumber: req.body.prnNumber || existingUser.prnNumber,
            passoutYear: req.body.passoutYear || existingUser.passoutYear,
          }),
        }

        const updatedUser = await Model.findByIdAndUpdate(
          existingUser._id,
          updatePayload,
          { new: true }
        )

        const token = createToken(updatedUser._id, normalizedRole)

        return res.status(200).json({
          message: 'Registration completed successfully. You can now login.',
          token,
          user: sanitizeUser(updatedUser, normalizedRole),
        })
      } else {
        return res.status(409).json({ message: 'Email already registered for this role.' })
      }
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const payload = {
      email,
      firstName: req.body.firstName?.trim() ?? '',
      lastName: req.body.lastName?.trim() ?? '',
      password: hashedPassword,
      department: normalizeDepartment(req.body.department),
      isProfileApproved: false,
      profileApprovalStatus: PROFILE_STATUS.IN_REVIEW,
      registrationStatus:
        normalizedRole === 'student' || normalizedRole === 'alumni' || normalizedRole === 'coordinator' || normalizedRole === 'faculty'
          ? REGISTRATION_STATUS.PENDING
          : REGISTRATION_STATUS.APPROVED,
      registrationDecisionByRole: '',
      registrationReviewedAt: null,
      registrationReviewedBy: '',
      registrationRejectionReason: '',
    }

    // Add role-specific fields
    if (normalizedRole === 'student') {
      payload.prnNumber = req.body.prnNumber
      payload.admissionYear = req.body.admissionYear
      payload.currentYear = req.body.currentYear
      payload.phoneNumber = req.body.phoneNumber
    } else if (normalizedRole === 'alumni') {
      payload.prnNumber = req.body.prnNumber
      payload.passoutYear = req.body.passoutYear
      payload.phoneNumber = req.body.phoneNumber
    } else if (normalizedRole === 'faculty') {
      payload.phoneNumber = req.body.phoneNumber
    } else if (normalizedRole === 'coordinator') {
      payload.phoneNumber = req.body.phoneNumber
    }

    const user = await Model.create(payload)

    const token = createToken(user._id, normalizedRole)

    return res.status(201).json({
      message: 'Signup successful.',
      token,
      user: sanitizeUser(user, normalizedRole),
    })
  } catch (error) {
    console.error('Signup error details:', error)
    console.error('Request body:', req.body)
    if (error.message.includes('required') || error.message.includes('must be a valid year')) {
      return res.status(400).json({ message: error.message })
    }

    console.error('Signup error:', error)
    return res.status(500).json({ message: 'Unable to signup user.' })
  }
}

const createUsers = async (payloads = [], role, adminCreated = false) => {
  const normalizedRole = role?.toLowerCase()
  const Model = getModelByRole(normalizedRole)

  if (!Model) {
    throw new Error('Unsupported role.')
  }

  const createdUsers = []

  for (const payload of payloads) {
    const { email, firstName = '', lastName = '', password } = payload
    if (!email || !password) {
      throw Object.assign(new Error('email and password are required.'), { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const existing = await Model.findOne({ email: normalizedEmail })
    if (existing) {
      throw Object.assign(new Error(`Email already registered for ${normalizedRole}.`), { status: 409 })
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Auto-approve users created by admin
    const isAutoApproved = adminCreated && (
      normalizedRole === 'student' || 
      normalizedRole === 'alumni' || 
      normalizedRole === 'coordinator' || 
      normalizedRole === 'faculty'
    )
    
    const user = await Model.create({
      email: normalizedEmail,
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      password: hashedPassword,
      isProfileApproved: isAutoApproved,
      profileApprovalStatus: isAutoApproved ? PROFILE_STATUS.APPROVED : PROFILE_STATUS.IN_REVIEW,
      registrationStatus: isAutoApproved ? REGISTRATION_STATUS.APPROVED : 
        (normalizedRole === 'student' || normalizedRole === 'alumni' || normalizedRole === 'coordinator' || normalizedRole === 'faculty'
          ? REGISTRATION_STATUS.PENDING
          : REGISTRATION_STATUS.APPROVED),
      registrationDecisionByRole: isAutoApproved ? 'admin' : '',
      registrationReviewedAt: isAutoApproved ? new Date() : null,
      registrationReviewedBy: isAutoApproved ? 'admin' : '',
      // Include all additional fields from payload
      ...payload
    })

    createdUsers.push({
      raw: user,
      sanitized: sanitizeUser(user, normalizedRole),
      password,
    })
  }

  return createdUsers
}

const login = async (req, res) => {
  try {
    const { role, email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()

    const rolesToEvaluate = []

    const normalizedRoleHint = typeof role === 'string' ? role.toLowerCase().trim() : ''

    if (normalizedRoleHint) {
      const hintedModel = getModelByRole(normalizedRoleHint)
      if (hintedModel) {
        rolesToEvaluate.push({ role: normalizedRoleHint, Model: hintedModel })
      } else {
        console.warn(`Login requested with unknown role "${normalizedRoleHint}". Falling back to autodetection.`)
      }
    }

    if (!rolesToEvaluate.length) {
      AUTHENTICATABLE_ROLES.forEach((roleName) => {
        const Model = getModelByRole(roleName)
        if (Model) {
          rolesToEvaluate.push({ role: roleName, Model })
        }
      })
    }

    let matchedUser = null
    let matchedRole = null
    let matchedRegistrationStatus = REGISTRATION_STATUS.APPROVED

    for (const { role: candidateRole, Model } of rolesToEvaluate) {
      const user = await Model.findOne({ email: normalizedEmail })
      if (!user) {
        continue
      }

      let isMatch = false

      try {
        isMatch = await bcrypt.compare(password, user.password)
      } catch (error) {
        console.warn('bcrypt.compare failed, attempting fallback comparison:', error)
      }

      if (!isMatch && password === user.password) {
        console.warn(`Legacy plaintext password detected for ${user.email}. Consider migrating to hashed passwords.`)
        isMatch = true
      }

      if (isMatch) {
        matchedUser = user
        matchedRole = candidateRole
        matchedRegistrationStatus = normalizeRegistrationStatus(user?.registrationStatus)
        break
      }
    }

    if (!matchedUser || !matchedRole) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    // Allow login for all users regardless of registration status
    // Profile approval status will be checked on frontend for popup display
    
    const token = createToken(matchedUser._id, matchedRole)

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: sanitizeUser(matchedUser, matchedRole),
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Unable to login user.' })
  }
}

module.exports = {
  signup,
  login,
  createUsers,
  createToken,
  sanitizeUser,
  AUTHENTICATABLE_ROLES,
}
