const CONTENT_APPROVAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

const LEGACY_MAP = {
  pending: CONTENT_APPROVAL_STATUS.PENDING,
  in_review: CONTENT_APPROVAL_STATUS.PENDING,
  approved: CONTENT_APPROVAL_STATUS.APPROVED,
  rejected: CONTENT_APPROVAL_STATUS.REJECTED,
}

const normalizeContentApprovalStatus = (value) => {
  if (!value) return CONTENT_APPROVAL_STATUS.PENDING
  const normalized = String(value).trim().toUpperCase()
  if (CONTENT_APPROVAL_STATUS[normalized]) {
    return CONTENT_APPROVAL_STATUS[normalized]
  }

  const legacy = LEGACY_MAP[String(value).trim().toLowerCase()]
  if (legacy) {
    return legacy
  }

  return CONTENT_APPROVAL_STATUS.PENDING
}

module.exports = {
  CONTENT_APPROVAL_STATUS,
  normalizeContentApprovalStatus,
}
