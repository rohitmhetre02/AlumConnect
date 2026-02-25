const requireRoles = (...roles) => {
  const normalizedAllowed = roles
    .filter(Boolean)
    .map((role) => String(role).trim().toLowerCase())

  return (req, res, next) => {
    const user = req.user

    if (!user || !user.role) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const userRole = String(user.role).trim().toLowerCase()

    if (normalizedAllowed.length && !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action.' })
    }

    return next()
  }
}

module.exports = requireRoles
