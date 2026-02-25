export const REGISTRATION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

const LEGACY_STATUS_MAP = {
  pending: REGISTRATION_STATUS.PENDING,
  approved: REGISTRATION_STATUS.APPROVED,
  rejected: REGISTRATION_STATUS.REJECTED,
  in_review: REGISTRATION_STATUS.PENDING,
}

export const normalizeRegistrationStatus = (value) => {
  if (!value) return REGISTRATION_STATUS.APPROVED

  const normalized = String(value).trim().toUpperCase()
  if (Object.prototype.hasOwnProperty.call(REGISTRATION_STATUS, normalized)) {
    return REGISTRATION_STATUS[normalized]
  }

  const legacy = LEGACY_STATUS_MAP[String(value).trim().toLowerCase()]
  if (legacy) {
    return legacy
  }

  return REGISTRATION_STATUS.APPROVED
}

export const isRegistrationApproved = (status) =>
  normalizeRegistrationStatus(status) === REGISTRATION_STATUS.APPROVED

export const isRegistrationPending = (status) =>
  normalizeRegistrationStatus(status) === REGISTRATION_STATUS.PENDING

export const isRegistrationRejected = (status) =>
  normalizeRegistrationStatus(status) === REGISTRATION_STATUS.REJECTED
