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
  const users = await createUsers(payloads, role)

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
    const normalizedRole = ensureRoleSupported(req.params.role)
    const { email, name } = req.body ?? {}

    if (!email) {
      return res.status(400).json({ message: 'email is required.' })
    }

    const { firstName, lastName } = splitName(name)
    const password = generateTemporaryPassword()

    const { results, emailConfigured } = await provisionUsers({
      role: normalizedRole,
      payloads: [
        {
          email,
          firstName,
          lastName,
          password,
        },
      ],
    })

    const [created] = results

    return res.status(201).json({
      message: 'User created successfully.',
      user: created.user,
      temporaryPassword: created.password,
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

const extractUsersFromRows = (rows = []) => {
  const userPayloads = []
  const errors = []

  rows.forEach((row, index) => {
    const normalized = Object.keys(row).reduce((acc, key) => {
      acc[key.trim().toLowerCase()] = row[key]
      return acc
    }, {})

    const email = String(normalized.email || '').trim()
    const name = normalized.name ?? ''

    if (!email) {
      errors.push({ row: index + 2, message: 'Missing email.' })
      return
    }

    const { firstName, lastName } = splitName(name)
    const password = generateTemporaryPassword()

    userPayloads.push({
      email,
      firstName,
      lastName,
      password,
    })
  })

  return { userPayloads, errors }
}

const createBulkUsers = async (req, res) => {
  try {
    const normalizedRole = ensureRoleSupported(req.params.role)

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an Excel file.' })
    }

    const rows = parseRowsFromWorkbook(req.file.buffer)
    if (!rows.length) {
      return res.status(400).json({ message: 'The uploaded file does not contain any data.' })
    }

    const { userPayloads, errors } = extractUsersFromRows(rows)

    if (!userPayloads.length) {
      return res.status(400).json({ message: 'No valid user rows found in file.', errors })
    }

    const { results, emailConfigured } = await provisionUsers({ role: normalizedRole, payloads: userPayloads })

    return res.status(201).json({
      message: 'Users created successfully.',
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
