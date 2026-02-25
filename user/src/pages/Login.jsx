import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthTemplate from '../components/auth/AuthTemplate'
import { get, post, API_BASE_URL } from '../utils/api'
import useToast from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'

const providers = [
  {
    id: 'google',
    label: 'Continue with Google',
    accent: 'bg-[#fef3c7] text-[#ea4335]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#EA4335"
          d="M12.24 10.285v3.514h4.95c-.197 1.125-1.337 3.297-4.95 3.297-2.978 0-5.403-2.46-5.403-5.503s2.425-5.503 5.403-5.503c1.695 0 2.835.72 3.486 1.339l2.373-2.286C16.735 3.812 14.732 3 12.24 3 7.38 3 3.5 6.938 3.5 11.594S7.38 20.188 12.24 20.188c5.857 0 9.71-4.108 9.71-9.9 0-.662-.072-1.165-.158-1.663H12.24Z"
        />
      </svg>
    ),
  },
  {
    id: 'linkedin',
    label: 'Continue with LinkedIn',
    accent: 'bg-[#e8f1fb] text-[#0A66C2]',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path
          fill="#0A66C2"
          d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5A2.49 2.49 0 0 1 0 3.5C0 2.12 1.11 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 22h4.56V7.5H.22V22Zm7.68 0h4.38v-7.5c0-1.99.81-3.28 2.61-3.28 1.56 0 2.31 1.06 2.31 3.28V22h4.38v-8.63C21.58 8.88 19.42 7 16.47 7c-2.22 0-3.68.97-4.3 2.11h-.06V7.5H7.9c.06 1.04 0 14.5 0 14.5Z"
        />
      </svg>
    ),
  },
]

const ROLE_FALLBACK_CANDIDATES = ['student', 'alumni', 'faculty', 'coordinator', 'admin']
const PROVIDER_LABELS = {
  google: 'Google',
  linkedin: 'LinkedIn',
}

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [oauthProviders, setOauthProviders] = useState(null)
  const [isFetchingProviders, setIsFetchingProviders] = useState(false)
  const [isRedirectingOAuth, setIsRedirectingOAuth] = useState(false)
  const [activeProvider, setActiveProvider] = useState(null)
  const addToast = useToast()
  const { login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const isValid = useMemo(() => form.email.trim() && form.password.trim(), [form])

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setIsFetchingProviders(true)
        const response = await get('/auth/oauth/providers', { includeAuth: false })
        setOauthProviders(response)
      } catch (error) {
        console.error('Failed to load OAuth providers:', error)
        addToast({ type: 'error', message: 'Unable to load social login options right now.' })
      } finally {
        setIsFetchingProviders(false)
      }
    }

    fetchProviders()
  }, [addToast])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const status = params.get('oauthStatus')

    if (!status) {
      setIsRedirectingOAuth(false)
      setActiveProvider(null)
      return
    }

    const providerId = params.get('provider')
    const providerLabel = PROVIDER_LABELS[providerId] || 'the selected provider'
    const messageParam = params.get('message')

    const cleanParams = () => {
      const keysToRemove = ['oauthStatus', 'message', 'token', 'role', 'email', 'name', 'provider']
      keysToRemove.forEach((key) => params.delete(key))
      const query = params.toString()
      navigate({ pathname: location.pathname, search: query ? `?${query}` : '' }, { replace: true })
    }

    const handleStatus = async () => {
      switch (status) {
        case 'success': {
          const token = params.get('token')
          const role = params.get('role')
          const email = params.get('email')
          const name = params.get('name')

          if (!token || !role) {
            addToast({ type: 'error', message: 'Incomplete data returned from provider login.' })
            cleanParams()
            return
          }

          cleanParams()

          try {
            const loginResponse = await login({ token, role, email, name })
            
            // Show success message for all OAuth logins
            addToast({ type: 'success', message: 'Logged in successfully via social account.' })
          } catch (error) {
            console.error('OAuth login completion failed:', error)
            addToast({ type: 'error', message: 'Unable to complete social login. Please try again.' })
          }
          break
        }
        case 'no_account': {
          const email = params.get('email')
          const displayEmail = email || 'this email address'
          addToast({
            type: 'error',
            message: `No account found for ${displayEmail}. Please sign up before using ${providerLabel} login.`,
          })
          cleanParams()
          break
        }
        case 'error':
        default: {
          const message = messageParam || 'Social login failed. Please try again.'
          addToast({ type: 'error', message })
          cleanParams()
          break
        }
      }
    }

    handleStatus()
    setIsRedirectingOAuth(false)
    setActiveProvider(null)
  }, [addToast, location.pathname, location.search, login, navigate])

  const handleSocialLogin = (providerId) => {
    const providerInfo = oauthProviders?.[providerId]

    if (!providerInfo?.enabled || !providerInfo?.authPath) {
      addToast({ type: 'error', message: `${PROVIDER_LABELS[providerId] || 'Social'} login is not available right now.` })
      return
    }

    try {
      setIsRedirectingOAuth(true)
      setActiveProvider(providerId)
      const redirectUrl = new URL(providerInfo.authPath, API_BASE_URL)
      window.location.href = redirectUrl.toString()
    } catch (error) {
      console.error('Failed to initiate social login:', error)
      setIsRedirectingOAuth(false)
      setActiveProvider(null)
      addToast({ type: 'error', message: 'Unable to redirect to social login.' })
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)

    try {
      const basePayload = {
        email: form.email.trim(),
        password: form.password,
      }

      let response
      let primaryError

      try {
        response = await post('/auth/login', basePayload)
      } catch (error) {
        primaryError = error

        const shouldFallback =
          error?.status === 400 && typeof error.message === 'string' && error.message.toLowerCase().includes('role')

        if (shouldFallback) {
          for (const candidateRole of ROLE_FALLBACK_CANDIDATES) {
            try {
              response = await post('/auth/login', { ...basePayload, role: candidateRole })
              if (response) break
            } catch (fallbackError) {
              if (fallbackError?.status && fallbackError.status !== 401) {
                primaryError = fallbackError
              }
            }
          }
        }
      }

      if (!response) {
        throw primaryError
      }

      // Check if user registration is pending approval
      if (response.user?.profileApprovalStatus === 'IN_REVIEW' || 
          response.user?.profileApprovalStatus === 'pending' ||
          response.user?.profileApprovalStatus === 'in_review') {
        addToast({ type: 'success', message: 'Login successful!' })
      } else {
        addToast({ type: 'success', message: 'Welcome back!' })
      }
      
      login({ ...response.user, token: response.token })
    } catch (error) {
      const message = error?.message ?? 'Unable to login. Please try again.'
      addToast({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSocialLoading = isRedirectingOAuth || isFetchingProviders

  return (
    <AuthTemplate
      header={
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 md:text-[34px]">Welcome to AlumConnect</h1>
          <p className="text-sm text-slate-500 md:text-base">Use your email or another service to continue with the network.</p>
        </div>
      }
      footer={
        <p>
          Don’t have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
            Sign Up
          </Link>
        </p>
      }
      align="center"
    >
      <div className="space-y-4" />
      <div className="space-y-3">
        {providers.map((provider) => {
          const providerInfo = oauthProviders?.[provider.id]
          const isConfigured = Boolean(providerInfo?.enabled && providerInfo?.authPath)
          const isActive = activeProvider === provider.id && isRedirectingOAuth
          const isDisabled = isSocialLoading || !isConfigured

          const buttonLabel = isActive
            ? `Continuing with ${PROVIDER_LABELS[provider.id]}`
            : provider.label

          return (
            <button
              key={provider.id}
              type="button"
              onClick={() => handleSocialLogin(provider.id)}
              disabled={isDisabled}
              className={`flex w-full items-center justify-between rounded-2xl border border-slate-200 px-6 py-4 text-base font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                isDisabled
                  ? 'cursor-not-allowed bg-white text-slate-400 opacity-70'
                  : 'bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]'
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-full font-semibold ${
                    isDisabled ? `${provider.accent} opacity-70` : provider.accent
                  }`}
                >
                  {provider.icon}
                </span>
                {buttonLabel}
              </span>
              {isActive ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />
              ) : (
                <svg
                  className="h-5 w-5 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M7.5 4.5 12.5 10 7.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )
        })}
        {oauthProviders && Object.values(oauthProviders).every((entry) => entry?.enabled === false) ? (
          <p className="text-center text-sm text-slate-500">Social login is currently unavailable.</p>
        ) : null}
        {!oauthProviders && isFetchingProviders ? (
          <p className="text-center text-sm text-slate-400">Loading social login options…</p>
        ) : null}
      </div>
      <div className="relative py-6">
        <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" aria-hidden="true" />
        <span className="relative mx-auto block w-max bg-white px-4 text-sm font-medium text-slate-400">or continue with email</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@domain.com"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
            required
          />
          <div className="text-right text-sm">
            <Link to="/forgot-password" className="font-semibold text-[#2563EB] underline underline-offset-4 hover:text-[#1d4ed8]">
              Forgot password?
            </Link>
          </div>
        </div>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD] ${
            isValid && !isSubmitting
              ? 'bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:bg-[#1d4ed8]'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
        >
          {isSubmitting ? 'Signing in…' : 'Login'}
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M7.5 4.5 12.5 10 7.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </AuthTemplate>
  )
}

export default Login
