const PROFILE_STATUS = {
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

const LEGACY_STATUS_MAP = {
  pending: PROFILE_STATUS.IN_REVIEW,
  approved: PROFILE_STATUS.APPROVED,
  rejected: PROFILE_STATUS.REJECTED,
  in_review: PROFILE_STATUS.IN_REVIEW,
}

const normalizeProfileStatus = (value) => {
  if (!value) return PROFILE_STATUS.IN_REVIEW
  const normalized = String(value).trim().toUpperCase()
  if (PROFILE_STATUS[normalized]) {
    return PROFILE_STATUS[normalized]
  }

  if (Object.prototype.hasOwnProperty.call(LEGACY_STATUS_MAP, normalized.toLowerCase())) {
    return LEGACY_STATUS_MAP[normalized.toLowerCase()]
  }

  return PROFILE_STATUS.IN_REVIEW
}

module.exports = {
  PROFILE_STATUS,
  normalizeProfileStatus,
}
