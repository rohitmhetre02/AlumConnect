const REGISTRATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

const LEGACY_REGISTRATION_STATUS_MAP = {
  pending: REGISTRATION_STATUS.PENDING,
  approved: REGISTRATION_STATUS.APPROVED,
  rejected: REGISTRATION_STATUS.REJECTED,
  in_review: REGISTRATION_STATUS.PENDING,
}

const normalizeRegistrationStatus = (value) => {
  if (!value) return REGISTRATION_STATUS.APPROVED
  const normalized = String(value).trim().toUpperCase()
  if (REGISTRATION_STATUS[normalized]) {
    return REGISTRATION_STATUS[normalized]
  }

  const lower = normalized.toLowerCase()
  if (Object.prototype.hasOwnProperty.call(LEGACY_REGISTRATION_STATUS_MAP, lower)) {
    return LEGACY_REGISTRATION_STATUS_MAP[lower]
  }
  return REGISTRATION_STATUS.APPROVED
}

module.exports = {
  REGISTRATION_STATUS,
  normalizeRegistrationStatus,
}
