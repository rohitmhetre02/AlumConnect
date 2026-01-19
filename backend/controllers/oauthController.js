const passport = require('passport')

const { createToken, sanitizeUser, AUTHENTICATABLE_ROLES } = require('./authController')
const { getModelByRole } = require('../utils/roleModels')
const { googleConfigured, linkedInConfigured } = require('../config/passport')

const FRONTEND_BASE_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')

const PROVIDER_CONFIG = {
  google: {
    enabled: () => googleConfigured,
    scope: ['profile', 'email'],
    options: { prompt: 'select_account' },
  },
  linkedin: {
    enabled: () => linkedInConfigured,
    scope: ['r_emailaddress', 'r_liteprofile'],
    options: {},
  },
}

const buildRedirectUrl = (status, params = {}) => {
  const url = new URL('/login', FRONTEND_BASE_URL)
  url.searchParams.set('oauthStatus', status)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  return url.toString()
}

const findExistingUserByEmail = async (email) => {
  for (const role of AUTHENTICATABLE_ROLES) {
    const Model = getModelByRole(role)
    if (!Model) continue
    const user = await Model.findOne({ email })
    if (user) {
      return { user, role }
    }
  }
  return null
}

const getOAuthProviders = (_req, res) => {
  const payload = Object.entries(PROVIDER_CONFIG).reduce((acc, [provider, config]) => {
    const enabled = Boolean(config?.enabled?.())
    acc[provider] = {
      enabled,
      authPath: enabled ? `/api/auth/oauth/${provider}` : null,
    }
    return acc
  }, {})

  return res.json(payload)
}

const startOAuth = (provider) => {
  const config = PROVIDER_CONFIG[provider]
  if (!config?.enabled?.()) {
    return (_req, res) => {
      res.redirect(buildRedirectUrl('error', { message: `${provider} login is not available.` }))
    }
  }

  return passport.authenticate(provider, {
    scope: config.scope,
    ...config.options,
    session: false,
  })
}

const handleOAuthCallback = (provider) => {
  return (req, res, next) => {
    passport.authenticate(
      provider,
      { session: false },
      async (err, data) => {
        if (err) {
          console.error(`${provider} OAuth error:`, err)
          return res.redirect(buildRedirectUrl('error', { message: 'Authentication failed.' }))
        }

        if (!data?.profile) {
          return res.redirect(buildRedirectUrl('error', { message: 'Unable to retrieve profile information.' }))
        }

        const email = data.profile.emails?.[0]?.value?.toLowerCase() || data.profile._json?.email?.toLowerCase()

        if (!email) {
          return res.redirect(buildRedirectUrl('error', { message: 'No email returned by provider.' }))
        }

        try {
          const existing = await findExistingUserByEmail(email)
          if (!existing) {
            return res.redirect(
              buildRedirectUrl('no_account', {
                email,
                provider,
              }),
            )
          }

          const token = createToken(existing.user._id, existing.role)
          const sanitized = sanitizeUser(existing.user, existing.role)

          return res.redirect(
            buildRedirectUrl('success', {
              token,
              role: sanitized.role,
              email: sanitized.email,
              name: sanitized.name,
            }),
          )
        } catch (error) {
          console.error('OAuth login error:', error)
          return res.redirect(buildRedirectUrl('error', { message: 'Server error during login.' }))
        }
      },
    )(req, res, next)
  }
}

module.exports = {
  startOAuth,
  handleOAuthCallback,
  buildRedirectUrl,
  getOAuthProviders,
}
