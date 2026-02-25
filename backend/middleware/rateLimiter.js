const rateLimit = require('express-rate-limit')

// Create a rate limiter for API requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests from logging
  skipSuccessfulRequests: false,
  // Skip failed requests from logging
  skipFailedRequests: false,
})

// Create a stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Create a rate limiter for profile requests
const profileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 profile requests per minute
  message: {
    error: 'Too many profile requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  apiLimiter,
  authLimiter,
  profileLimiter,
}
