const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy

const getBaseUrl = () => {
  const fromEnv =
    process.env.OAUTH_BASE_URL || process.env.BACKEND_BASE_URL || process.env.PUBLIC_BACKEND_URL
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  const port = process.env.PORT || 5000
  return `http://localhost:${port}`
}

const baseUrl = getBaseUrl()

const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
const linkedInConfigured = Boolean(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET)

if (!googleConfigured) {
  console.warn('Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable it.')
}

if (!linkedInConfigured) {
  console.warn('LinkedIn OAuth is not configured. Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET to enable it.')
}

if (googleConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${baseUrl}/api/auth/oauth/google/callback`,
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        done(null, { profile, provider: 'google' })
      },
    ),
  )
}

if (linkedInConfigured) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${baseUrl}/api/auth/oauth/linkedin/callback`,
        scope: ['r_emailaddress', 'r_liteprofile'],
        state: true,
        passReqToCallback: true,
      },
      (req, accessToken, refreshToken, profile, done) => {
        done(null, { profile, provider: 'linkedin' })
      },
    ),
  )
}

module.exports = {
  baseUrl,
  googleConfigured,
  linkedInConfigured,
}
