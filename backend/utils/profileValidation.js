const PHONE_REGEX = /^[0-9]{10,15}$/

const sanitizeString = (value) => (typeof value === 'string' ? value.trim() : '')

const sanitizeOptionalString = (value) => (value === undefined ? undefined : sanitizeString(value))

const sanitizeStringArray = (value) => {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => sanitizeString(item))
    .filter((item) => item.length > 0)
}

const toBoolean = (value) => {
  if (value === undefined || value === null) return false
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return normalized === 'true' || normalized === '1' || normalized === 'yes'
  }
  if (typeof value === 'number') return value === 1
  return false
}

const sanitizeExperiences = (value) => {
  if (!Array.isArray(value)) return []
  return value
    .map((item = {}) => ({
      title: sanitizeString(item.title ?? ''),
      company: sanitizeString(item.company ?? ''),
      type: sanitizeString(item.type ?? ''),
      startDate: sanitizeString(item.startDate ?? ''),
      endDate: sanitizeString(item.endDate ?? ''),
      isCurrent: toBoolean(item.isCurrent),
      description: sanitizeString(item.description ?? ''),
    }))
    .filter((item) => item.title || item.company || item.description)
}

const sanitizeEducation = (value) => {
  if (!Array.isArray(value)) return []
  return value
    .map((item = {}) => ({
      school: sanitizeString(item.school ?? ''),
      degree: sanitizeString(item.degree ?? ''),
      otherDegree: sanitizeString(item.otherDegree ?? ''),
      field: sanitizeString(item.field ?? ''),
      department: sanitizeString(item.department ?? ''),
      admissionYear: toYear(item.admissionYear),
      passoutYear: toYear(item.passoutYear),
      expectedPassoutYear: toYear(item.expectedPassoutYear),
      isCurrent: toBoolean(item.isCurrent),
      cgpa: sanitizeString(item.cgpa ?? ''),
    }))
    .filter((item) => item.school || item.degree || item.field || item.department)
}

const sanitizeCertifications = (value) => {
  if (!Array.isArray(value)) return []
  return value
    .map((item = {}) => ({
      title: sanitizeString(item.title ?? ''),
      organization: sanitizeString(item.organization ?? ''),
      date: sanitizeString(item.date ?? ''),
      fileName: sanitizeString(item.fileName ?? ''),
      fileType: sanitizeString(item.fileType ?? ''),
    }))
    .filter((item) => item.title || item.organization)
}

const sanitizeSocials = (value) => {
  if (!value) return {}
  if (Array.isArray(value)) {
    return value.reduce((acc, item) => {
      const label = sanitizeString(item?.label ?? '')
      const url = sanitizeString(item?.url ?? '')
      if (label && url) {
        acc[label] = url
      }
      return acc
    }, {})
  }

  if (typeof value !== 'object') return {}
  if (value instanceof Map) {
    const entries = []
    value.forEach((url, label) => {
      const key = sanitizeString(label)
      const sanitizedUrl = sanitizeString(url)
      if (key && sanitizedUrl) {
        entries.push([key, sanitizedUrl])
      }
    })
    return Object.fromEntries(entries)
  }

  return Object.entries(value).reduce((acc, [label, url]) => {
    const key = sanitizeString(label)
    const sanitizedUrl = sanitizeString(url)
    if (key && sanitizedUrl) {
      acc[key] = sanitizedUrl
    }
    return acc
  }, {})
}

const toYear = (value) => {
  if (value === undefined || value === null || value === '') return undefined
  const numeric = Number(value)
  return Number.isInteger(numeric) ? numeric : undefined
}

const validateProfilePayload = (body = {}, role) => {
  if (!role) {
    throw new Error('User role is required')
  }

  const ensureNonEmpty = (field, message = `${field} is required`) => {
    if (body[field] === undefined) return
    if (!String(body[field]).trim()) {
      throw new Error(message)
    }
  }

  ensureNonEmpty('firstName')
  ensureNonEmpty('lastName')
  ensureNonEmpty('department')

  if (body.phone && !PHONE_REGEX.test(String(body.phone).trim())) {
    throw new Error('phone must be between 10 and 15 digits')
  }

  if (body.skills !== undefined) {
    if (!Array.isArray(body.skills) || body.skills.some((skill) => !String(skill).trim())) {
      throw new Error('skills must be an array of non-empty strings')
    }
  }

  if (body.interests !== undefined) {
    if (!Array.isArray(body.interests) || body.interests.some((interest) => !String(interest).trim())) {
      throw new Error('interests must be an array of non-empty strings')
    }
  }

  if (body.careerGoals !== undefined && body.careerGoals !== null) {
    if (typeof body.careerGoals !== 'string') {
      throw new Error('careerGoals must be a string')
    }
    if (!body.careerGoals.trim()) {
      throw new Error('careerGoals must not be empty')
    }
  }

  if (body.certifications !== undefined) {
    if (!Array.isArray(body.certifications)) {
      throw new Error('certifications must be an array')
    }
  }

  if (body.experiences !== undefined) {
    if (!Array.isArray(body.experiences)) {
      throw new Error('experiences must be an array')
    }
  }

  if (body.education !== undefined) {
    if (!Array.isArray(body.education)) {
      throw new Error('education must be an array')
    }
  }

  if (role === 'student') {
    if (body.currentYear !== undefined && !Number.isInteger(Number(body.currentYear))) {
      throw new Error('currentYear must be a valid year')
    }
  }

  if (role === 'alumni') {
    if (body.passoutYear !== undefined && !Number.isInteger(Number(body.passoutYear))) {
      throw new Error('passoutYear must be a valid year')
    }
  }
}

const buildProfilePayload = (body = {}, role) => {
  const payload = {}

  if (body.firstName !== undefined) payload.firstName = sanitizeString(body.firstName)
  if (body.lastName !== undefined) payload.lastName = sanitizeString(body.lastName)
  if (body.department !== undefined) payload.department = sanitizeString(body.department)
  if (body.title !== undefined) payload.title = sanitizeString(body.title)
  if (body.location !== undefined) payload.location = sanitizeString(body.location)
  if (body.phone !== undefined) payload.phone = sanitizeString(body.phone)
  if (body.about !== undefined) payload.about = sanitizeString(body.about)
  if (body.avatar !== undefined) payload.avatar = sanitizeString(body.avatar)
  if (body.cover !== undefined) payload.cover = sanitizeString(body.cover)

  if (body.skills !== undefined) {
    payload.skills = sanitizeStringArray(body.skills)
  }

  if (body.interests !== undefined) {
    payload.interests = sanitizeStringArray(body.interests)
  }

  if (body.careerGoals !== undefined) {
    payload.careerGoals = sanitizeString(body.careerGoals)
  }

  if (body.certifications !== undefined) {
    payload.certifications = sanitizeCertifications(body.certifications)
  }

  if (body.socials !== undefined) {
    payload.socials = sanitizeSocials(body.socials)
  }

  if (body.experiences !== undefined) {
    payload.experiences = sanitizeExperiences(body.experiences)
  }

  if (body.education !== undefined) {
    payload.education = sanitizeEducation(body.education)
  }

  if (role === 'student') {
    if (body.currentYear !== undefined) payload.currentYear = toYear(body.currentYear)
    if (body.admissionYear !== undefined) payload.admissionYear = toYear(body.admissionYear)
    if (body.expectedPassoutYear !== undefined) payload.expectedPassoutYear = toYear(body.expectedPassoutYear)
  }

  if (role === 'alumni') {
    if (body.passoutYear !== undefined) payload.passoutYear = toYear(body.passoutYear)
  }

  return payload
}

const detectIncompleteProfile = (userDoc) => {
  if (!userDoc) return true

  const baseFields = ['firstName', 'lastName', 'department']
  const hasBase = baseFields.every((field) => Boolean(userDoc[field]))
  if (!hasBase) return true

  // No longer require specific year fields as they're optional in the new UI
  return false
}

module.exports = {
  PHONE_REGEX,
  sanitizeString,
  sanitizeOptionalString,
  buildProfilePayload,
  validateProfilePayload,
  detectIncompleteProfile,
  sanitizeCertifications,
}
