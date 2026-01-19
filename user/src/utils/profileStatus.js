export const PROFILE_STATUS = {
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

export const normalizeProfileStatus = (value) => {
  if (!value) return PROFILE_STATUS.IN_REVIEW

  const normalized = String(value).trim().toUpperCase()

  if (Object.values(PROFILE_STATUS).includes(normalized)) {
    return normalized
  }

  const legacy = LEGACY_STATUS_MAP[String(value).trim().toLowerCase()]
  if (legacy) {
    return legacy
  }

  return PROFILE_STATUS.IN_REVIEW
}

export const isProfileApproved = (status) => normalizeProfileStatus(status) === PROFILE_STATUS.APPROVED

export const isProfileInReview = (status) => normalizeProfileStatus(status) === PROFILE_STATUS.IN_REVIEW

export const isProfileRejected = (status) => normalizeProfileStatus(status) === PROFILE_STATUS.REJECTED
