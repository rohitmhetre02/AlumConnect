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

// Helper function to ensure user is a student
const ensureStudent = (req) => {
  if (!req.user) {
    return { error: 'Authentication required' }
  }
  
  if (req.user.role !== 'student') {
    return { error: 'Access denied. Student role required.' }
  }
  
  return { userId: req.user.id }
}

// Export ensureAuthenticated as alias for authMiddleware
const ensureAuthenticated = authMiddleware

module.exports = {
  authenticateAdmin,
  ensureStudent,
  ensureAuthenticated
}
