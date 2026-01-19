import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthTemplate from '../components/auth/AuthTemplate'
import { post } from '../utils/api'
import useToast from '../hooks/useToast'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OTP_LENGTH = 6
const OTP_RESEND_INTERVAL = 30

const stepMeta = {
  email: {
    title: 'Forgot Password?',
    description:
      'Enter the email address associated with your account. We will send you a verification code to reset your password.',
  },
  otp: {
    title: 'Verify Your Email',
    description: 'We have sent a 6-digit verification code to your email.',
  },
  reset: {
    title: 'Reset Password',
    description: 'Create your new password below.',
  },
}

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [emailTouched, setEmailTouched] = useState(false)
  const addToast = useToast()

  const [otpValues, setOtpValues] = useState(Array(OTP_LENGTH).fill(''))
  const otpRefs = useRef(Array.from({ length: OTP_LENGTH }, () => null))
  const [otpError, setOtpError] = useState('')
  const [timer, setTimer] = useState(OTP_RESEND_INTERVAL)
  const [isRequestingCode, setIsRequestingCode] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetSession, setResetSession] = useState(null)

  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' })
  const [passwordTouched, setPasswordTouched] = useState({ newPassword: false, confirmPassword: false })
  const [showPassword, setShowPassword] = useState({ newPassword: false, confirmPassword: false })

  const activeStep = step === 'success' ? 'reset' : step
  const { title, description } = stepMeta[activeStep]

  const isEmailValid = emailPattern.test(email.trim())
  const isOtpComplete = otpValues.every((digit) => digit.trim().length === 1)
  const passwordMatch =
    passwords.newPassword.trim() && passwords.confirmPassword.trim() && passwords.newPassword === passwords.confirmPassword

  const passwordMismatchError =
    passwordTouched.confirmPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword
      ? 'Passwords do not match.'
      : ''

  useEffect(() => {
    if (step === 'otp' && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(countdown)
    }
    if (step !== 'otp') {
      setTimer(OTP_RESEND_INTERVAL)
    }
  }, [step, timer])

  useEffect(() => {
    if (step === 'otp') {
      requestAnimationFrame(() => {
        otpRefs.current[0]?.focus()
      })
    }
  }, [step])

  const currentHeader = (
    <div className="space-y-3">
      <h1 className="text-3xl font-semibold text-slate-900 md:text-[34px]">{title}</h1>
      <p className="text-sm text-slate-500 md:text-base">{description}</p>
    </div>
  )

  const footer =
    step === 'email'
      ? (
          <p>
            Remembered your credentials?{' '}
            <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
              Back to Login
            </Link>
          </p>
        )
      : null

  const handleSendOtp = async (event) => {
    event.preventDefault()
    setEmailTouched(true)
    if (!isEmailValid || isRequestingCode) return

    const normalizedEmail = email.trim().toLowerCase()

    try {
      setIsRequestingCode(true)
      const response = await post(
        '/auth/password/reset/request',
        { email: normalizedEmail },
        { includeAuth: false }
      )

      setStep('otp')
      setOtpValues(Array(OTP_LENGTH).fill(''))
      setOtpError('')
      setResetSession(null)
      setTimer(OTP_RESEND_INTERVAL)

      if (response?.emailSent) {
        addToast({ type: 'success', message: 'Verification code sent! Check your email.' })
      } else {
        addToast({
          type: 'warning',
          message: 'Email delivery is not configured. Contact support to retrieve your verification code.',
        })
      }
    } catch (error) {
      const message = error?.message || 'Unable to send verification code.'
      addToast({ type: 'error', message })
    } finally {
      setIsRequestingCode(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return
    const next = [...otpValues]
    next[index] = value
    setOtpValues(next)
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      if (otpValues[index]) {
        const next = [...otpValues]
        next[index] = ''
        setOtpValues(next)
      } else if (index > 0) {
        otpRefs.current[index - 1]?.focus()
      }
    }
  }

  const handleVerifyOtp = async (event) => {
    event.preventDefault()
    if (isVerifyingCode) return

    if (!isOtpComplete) {
      setOtpError('Enter the 6-digit code.')
      const firstEmpty = otpValues.findIndex((digit) => !digit)
      if (firstEmpty >= 0) {
        otpRefs.current[firstEmpty]?.focus()
      }
      return
    }

    const code = otpValues.join('')

    try {
      setIsVerifyingCode(true)
      const response = await post(
        '/auth/password/reset/verify',
        { email: email.trim().toLowerCase(), code },
        { includeAuth: false }
      )

      setResetSession({ resetToken: response?.resetToken, expiresInMinutes: response?.expiresInMinutes ?? 30 })
      setOtpError('')
      setStep('reset')
      setPasswords({ newPassword: '', confirmPassword: '' })
      setPasswordTouched({ newPassword: false, confirmPassword: false })
      addToast({ type: 'success', message: 'Verification successful! Create a new password.' })
    } catch (error) {
      const status = error?.status
      if (status === 410 || status === 404) {
        addToast({ type: 'error', message: error?.message || 'Verification code expired. Request a new one.' })
        setStep('email')
        setOtpValues(Array(OTP_LENGTH).fill(''))
      } else {
        const message = error?.message || 'Unable to verify code. Please try again.'
        setOtpError(message)
      }
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const handleResendOtp = async () => {
    if (timer > 0 || isRequestingCode) return

    const normalizedEmail = email.trim().toLowerCase()
    if (!emailPattern.test(normalizedEmail)) {
      addToast({ type: 'error', message: 'Enter a valid email address to receive a new code.' })
      setStep('email')
      setEmailTouched(true)
      return
    }

    try {
      setIsRequestingCode(true)
      const response = await post(
        '/auth/password/reset/request',
        { email: normalizedEmail },
        { includeAuth: false }
      )

      setOtpValues(Array(OTP_LENGTH).fill(''))
      setOtpError('')
      setResetSession(null)
      setTimer(OTP_RESEND_INTERVAL)
      requestAnimationFrame(() => otpRefs.current[0]?.focus())

      if (response?.emailSent) {
        addToast({ type: 'success', message: 'We sent you a new verification code.' })
      } else {
        addToast({
          type: 'warning',
          message: 'Email delivery is not configured. Contact support to retrieve your verification code.',
        })
      }
    } catch (error) {
      const message = error?.message || 'Unable to resend verification code.'
      addToast({ type: 'error', message })
    } finally {
      setIsRequestingCode(false)
    }
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordBlur = (event) => {
    const { name } = event.target
    setPasswordTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleUpdatePassword = async (event) => {
    event.preventDefault()
    setPasswordTouched({ newPassword: true, confirmPassword: true })
    if (!passwordMatch || isResettingPassword) return

    if (!resetSession?.resetToken) {
      addToast({ type: 'error', message: 'Verification expired. Request a new code.' })
      setStep('email')
      return
    }

    const payload = {
      email: email.trim().toLowerCase(),
      resetToken: resetSession.resetToken,
      newPassword: passwords.newPassword.trim(),
    }

    try {
      setIsResettingPassword(true)
      await post('/auth/password/reset/complete', payload, { includeAuth: false })
      addToast({ type: 'success', message: 'Password updated! You can now sign in with your new password.' })
      setStep('success')
    } catch (error) {
      const status = error?.status
      if (status === 410 || status === 404) {
        addToast({ type: 'error', message: error?.message || 'Reset session expired. Please request a new code.' })
        setStep('email')
      } else {
        const message = error?.message || 'Unable to update password. Please try again.'
        addToast({ type: 'error', message })
      }
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleGoToLogin = () => {
    navigate('/login')
  }

  const renderStepContent = () => {
    if (activeStep === 'email') {
      return (
        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              placeholder="you@domain.com"
              className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)] ${
                emailTouched && !isEmailValid
                  ? 'border-red-400 focus:border-red-400 focus:shadow-[0_18px_36px_rgba(248,113,113,0.35)]'
                  : 'border-slate-200'
              }`}
              required
            />
            {emailTouched && !isEmailValid && (
              <p className="text-xs font-medium text-red-500">Please enter a valid email address.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isEmailValid}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD] ${
              isEmailValid
                ? 'bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:bg-[#1d4ed8]'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            Send OTP
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M7.5 4.5 12.5 10 7.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="text-sm text-slate-500">
            <Link to="/login" className="font-semibold text-[#2563EB] underline underline-offset-4 hover:text-[#1d4ed8]">
              Back to Login
            </Link>
          </div>
        </form>
      )
    }

    if (activeStep === 'otp') {
      return (
        <form onSubmit={handleVerifyOtp} className="space-y-8">
          <div className="flex justify-between text-sm text-slate-500">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="font-semibold text-[#2563EB] hover:text-[#1d4ed8]"
            >
              Change Email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timer > 0}
              className={`font-semibold ${
                timer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#2563EB] hover:text-[#1d4ed8]'
              }`}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between gap-2">
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  ref={(node) => {
                    otpRefs.current[index] = node
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleOtpChange(index, event.target.value)}
                  onKeyDown={(event) => handleOtpKeyDown(index, event)}
                  className="h-14 w-12 rounded-2xl border border-slate-200 text-center text-lg font-semibold text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                />
              ))}
            </div>
            {otpError && <p className="text-xs font-medium text-red-500">{otpError}</p>}
          </div>
          <button
            type="submit"
            disabled={!isOtpComplete}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD] ${
              isOtpComplete
                ? 'bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:bg-[#1d4ed8]'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            Verify OTP
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M7.5 4.5 12.5 10 7.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      )
    }

    return (
      <form onSubmit={handleUpdatePassword} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
            New Password
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPassword.newPassword ? 'text' : 'password'}
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              placeholder="Create a password"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => ({ ...prev, newPassword: !prev.newPassword }))}
              className="absolute inset-y-0 right-4 grid place-items-center text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8]"
            >
              {showPassword.newPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword.confirmPassword ? 'text' : 'password'}
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              placeholder="Re-type your password"
              className={`w-full rounded-2xl border bg-white px-4 py-3.5 pr-12 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)] ${
                passwordMismatchError ? 'border-red-400 focus:border-red-400 focus:shadow-[0_18px_36px_rgba(248,113,113,0.35)]' : 'border-slate-200'
              }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
              className="absolute inset-y-0 right-4 grid place-items-center text-sm font-semibold text-[#2563EB] hover:text-[#1d4ed8]"
            >
              {showPassword.confirmPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {passwordMismatchError && <p className="text-xs font-medium text-red-500">{passwordMismatchError}</p>}
        </div>
        <button
          type="submit"
          disabled={!passwordMatch}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD] ${
            passwordMatch
              ? 'bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:bg-[#1d4ed8]'
              : 'cursor-not-allowed bg-slate-200 text-slate-500'
          }`}
        >
          Update Password
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M7.5 4.5 12.5 10 7.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    )
  }

  return (
    <AuthTemplate header={currentHeader} footer={footer}>
      <div className="relative">
        {renderStepContent()}

        {step === 'success' && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
            <div className="w-full max-w-sm space-y-6 rounded-3xl bg-white p-8 text-center shadow-[0_40px_80px_rgba(15,23,42,0.18)] animate-fade-in">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-slate-900">Password Updated</h2>
                <p className="text-sm text-slate-500">Your password has been successfully reset.</p>
              </div>
              <button
                type="button"
                onClick={handleGoToLogin}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD]"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthTemplate>
  )
}

export default ForgotPassword
