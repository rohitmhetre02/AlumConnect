const adminOnly = (req, res, next) => {
  const role = req.user?.role
  if (!req.user || !role) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  if (String(role).toLowerCase() !== 'admin') {
    return res.status(403).json({ message: 'Administrator access required.' })
  }

  return next()
}

module.exports = adminOnly
