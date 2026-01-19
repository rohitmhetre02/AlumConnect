const jwt = require('jsonwebtoken')

const optionalAuth = (req, _res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next()
  }

  const token = authHeader.split(' ')[1]

  try {
    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = jwt.verify(token, secret)
    req.user = { id: decoded.id, role: decoded.role }
  } catch (error) {
    console.warn('optionalAuth: unable to verify token', error?.message)
  }

  return next()
}

module.exports = optionalAuth
