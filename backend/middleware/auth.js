const authMiddleware = require('./authMiddleware')
const adminOnly = require('./adminOnly')

// Combined middleware for admin authentication
const authenticateAdmin = (req, res, next) => {
  // First apply auth middleware to authenticate the user
  authMiddleware(req, res, (err) => {
    if (err) return
    
    // Then apply adminOnly middleware to check admin role
    adminOnly(req, res, next)
  })
}

module.exports = {
  authenticateAdmin
}
