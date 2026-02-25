const jwt = require('jsonwebtoken')

const normalizeId = (value) => {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value.toHexString === 'function') return value.toHexString()
  if (typeof value.toString === 'function') return value.toString()
  if (typeof value === 'object' && value.$oid) return value.$oid
  return String(value)
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, secret)
    req.user = { id: normalizeId(decoded.id), role: decoded.role }
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
}

module.exports = authMiddleware
