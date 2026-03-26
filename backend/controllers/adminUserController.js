const XLSX = require('xlsx')
const multer = require('multer')

const { createUsers } = require('./authController')
const { sendUserCredentialsEmail, isEmailConfigured } = require('../utils/email')
const { generateTemporaryPassword } = require('../utils/password')
const { getModelByRole } = require('../utils/roleModels')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

const ROLE_MAP = new Map([
  ['students', 'student'],
  ['student', 'student'],
  ['alumni', 'alumni'],
  ['faculty', 'faculty'],
  ['coordinator', 'coordinator'],
])

const normalizeRole = (inputRole) => {
  if (!inputRole) return null
  const role = String(inputRole).toLowerCase().trim()
  return ROLE_MAP.get(role) ?? null
}

const ensureRoleSupported = (roleParam) => {
  const normalizedRole = normalizeRole(roleParam)
  if (!normalizedRole) {
    throw Object.assign(new Error('Unsupported role provided.'), { status: 400 })
  }

  const Model = getModelByRole(normalizedRole)
  if (!Model) {
    throw Object.assign(new Error(`No model configured for role ${normalizedRole}.`), { status: 400 })
  }

  return normalizedRole
}

const splitName = (name = '') => {
  const value = String(name).trim()
  if (!value) return { firstName: '', lastName: '' }

  const parts = value.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  const [firstName, ...rest] = parts
  return { firstName, lastName: rest.join(' ') }
}

const provisionUsers = async ({ payloads, role }) => {
  const users = await createUsers(payloads, role, true) // Pass adminCreated = true

  const emailConfigured = isEmailConfigured()

  await Promise.all(
    users.map(async ({ sanitized, password }) => {
      if (!emailConfigured) return null

      return sendUserCredentialsEmail({
        to: sanitized.email,
        name: sanitized.name,
        email: sanitized.email,
        password,
        role: sanitized.role,
      })
    })
  )

  return {
    emailConfigured,
    results: users.map(({ sanitized, password }) => ({ user: sanitized, password })),
  }
}

const createSingleUser = async (req, res) => {
  try {
    // Handle specific routes for students, alumni, coordinators, and faculty
    let normalizedRole
    if (req.path.includes('/students/add')) {
      normalizedRole = 'student'
    } else if (req.path.includes('/alumni/add')) {
      normalizedRole = 'alumni'
    } else if (req.path.includes('/coordinators/add')) {
      normalizedRole = 'coordinator'
    } else if (req.path.includes('/faculty/add')) {
      normalizedRole = 'faculty'
    } else {
      normalizedRole = ensureRoleSupported(req.params.role)
    }
    
    const { email, name, department, prn, year, passoutYear } = req.body ?? {}
    
    if (!email) {
      return res.status(400).json({ message: 'email is required.' })
    }

    // Role-specific validation
    if (normalizedRole === 'student' && !prn) {
      return res.status(400).json({ message: 'PRN is required for students.' })
    }
    if (normalizedRole === 'student' && !department) {
      return res.status(400).json({ message: 'Department is required for students.' })
    }
    if (normalizedRole === 'student' && !year) {
      return res.status(400).json({ message: 'Year is required for students.' })
    }
    if (normalizedRole === 'alumni' && !department) {
      return res.status(400).json({ message: 'Department is required for alumni.' })
    }
    if (normalizedRole === 'alumni' && !passoutYear) {
      return res.status(400).json({ message: 'Passout year is required for alumni.' })
    }
    if (normalizedRole === 'coordinator' && !department) {
      return res.status(400).json({ message: 'Department is required for coordinators.' })
    }

    const { firstName, lastName } = splitName(name)
    const password = generateTemporaryPassword()

    // Build payload with role-specific fields
    const userPayload = {
      email,
      firstName,
      lastName,
      password,
      department,
    }

    // Add role-specific fields
    if (normalizedRole === 'student') {
      userPayload.prnNumber = prn
      userPayload.currentYear = year  // Fixed: use currentYear to match schema
    } else if (normalizedRole === 'alumni') {
      userPayload.prnNumber = prn || ''
      userPayload.passoutYear = passoutYear
    }

    const { results, emailConfigured } = await provisionUsers({
      role: normalizedRole,
      payloads: [userPayload],
    })

    return res.status(201).json({
      message: 'User created successfully.',
      user: results[0].user,
      temporaryPassword: results[0].password,
      emailSent: emailConfigured,
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to create user.'
    console.error('createSingleUser error:', error)
    return res.status(status).json({ message })
  }
}

const parseRowsFromWorkbook = (buffer) => {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const [firstSheetName] = workbook.SheetNames
  if (!firstSheetName) {
    throw Object.assign(new Error('Uploaded file does not contain any sheets.'), { status: 400 })
  }

  const sheet = workbook.Sheets[firstSheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

  return rows
}

const extractUsersFromRows = (rows = [], normalizedRole = '') => {
  const userPayloads = []
  const errors = []

  rows.forEach((row, index) => {
    const normalized = Object.keys(row).reduce((acc, key) => {
      acc[key.trim().toLowerCase()] = row[key]
      return acc
    }, {})
    
    const email = String(normalized.email || '').trim()
    const name = normalized.name || normalized['full name'] || ''
    
    if (!email) {
      errors.push({ row: index + 2, message: 'Missing email.' })
      return
    }

    // Role-specific validation
    if (normalizedRole === 'student' && !normalized.prn) {
      errors.push({ row: index + 2, message: 'Missing PRN for student.' })
      return
    }
    if (normalizedRole === 'student' && !normalized.department) {
      errors.push({ row: index + 2, message: 'Missing Department for student.' })
      return
    }
    if (normalizedRole === 'student' && !normalized.year) {
      errors.push({ row: index + 2, message: 'Missing Year for student.' })
      return
    }
    if (normalizedRole === 'alumni' && !normalized.department) {
      errors.push({ row: index + 2, message: 'Missing Department for alumni.' })
      return
    }
    if (normalizedRole === 'alumni' && !normalized.passoutyear && !normalized['passout year']) {
      errors.push({ row: index + 2, message: 'Missing Passout Year for alumni.' })
      return
    }
    if (normalizedRole === 'coordinator' && !normalized.department) {
      errors.push({ row: index + 2, message: 'Missing Department for coordinator.' })
      return
    }

    const { firstName, lastName } = splitName(name)
    const password = generateTemporaryPassword()

    const userPayload = {
      email,
      firstName,
      lastName,
      password,
      department: normalized.department || '',
    }

    // Add role-specific fields
    if (normalizedRole === 'student') {
      userPayload.prnNumber = normalized.prn || ''
      userPayload.year = normalized.year || ''
    } else if (normalizedRole === 'alumni') {
      userPayload.prnNumber = normalized.prn || ''
      userPayload.passoutYear = normalized.passoutyear || normalized['passout year'] || ''
    }

    userPayloads.push(userPayload)
  })

  return { userPayloads, errors }
}

const createBulkUsers = async (req, res) => {
  try {
    // Handle specific routes for students, alumni, coordinators, and faculty
    let normalizedRole
    if (req.path.includes('/students/bulk-upload')) {
      normalizedRole = 'student'
    } else if (req.path.includes('/alumni/bulk-upload')) {
      normalizedRole = 'alumni'
    } else if (req.path.includes('/coordinators/bulk-upload')) {
      normalizedRole = 'coordinator'
    } else if (req.path.includes('/faculty/bulk-upload')) {
      normalizedRole = 'faculty'
    } else {
      normalizedRole = ensureRoleSupported(req.params.role)
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file.' })
    }

    const rows = parseRowsFromWorkbook(req.file.buffer)
    if (!rows.length) {
      return res.status(400).json({ message: 'The uploaded file does not contain any data.' })
    }

    const { userPayloads, errors } = extractUsersFromRows(rows, normalizedRole)

    if (!userPayloads.length) {
      return res.status(400).json({ message: 'No valid user rows found in file.', errors })
    }

    const { results, emailConfigured } = await provisionUsers({ role: normalizedRole, payloads: userPayloads })

    return res.status(201).json({
      message: 'Users created successfully.',
      count: results.length,
      created: results.map(({ user }) => user),
      temporaryPasswords: results.map(({ user, password }) => ({ email: user.email, password })),
      errors,
      emailSent: emailConfigured,
    })
  } catch (error) {
    const status = error.status ?? 500
    const message = error.message ?? 'Unable to create users from file.'
    console.error('createBulkUsers error:', error)
    return res.status(status).json({ message })
  }
}

module.exports = {
  upload,
  createSingleUser,
  createBulkUsers,
}
