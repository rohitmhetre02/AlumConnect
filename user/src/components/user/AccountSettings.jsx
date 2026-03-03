import { useState, useEffect } from 'react'
import { put, post, get } from '../../utils/api'
import useToast from '../../hooks/useToast'
import Modal from '../ui/Modal'
import Input from '../forms/Input'

const AccountSettings = ({ userRole = 'user' }) => {
  const addToast = useToast()
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

  // Email Update State
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailStep, setEmailStep] = useState(1)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailOTP, setEmailOTP] = useState('')
  const [emailTempToken, setEmailTempToken] = useState('')
  const [emailCooldown, setEmailCooldown] = useState(0)

  // Password Update State
  const [currentPasswordForUpdate, setCurrentPasswordForUpdate] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')

  // Forgot Password State
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOTP, setForgotOTP] = useState('')
  const [forgotTempToken, setForgotTempToken] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotCooldown, setForgotCooldown] = useState(0)

  // Show/Hide Password States
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false)
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false)

  useEffect(() => {
    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [emailCooldown])

  useEffect(() => {
    if (forgotCooldown > 0) {
      const timer = setTimeout(() => setForgotCooldown(forgotCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [forgotCooldown])

  const fetchUserProfile = async () => {
    try {
      const response = await get('/auth/profile')
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  }

  // Email Update Functions
  const handleEmailUpdate = async () => {
    if (emailStep === 1) {
      // Verify current password
      try {
        setLoading(true)
        const response = await put('/auth/update-email', {
          currentPassword,
          newEmail
        })

        if (response.success) {
          setEmailStep(2)
          setEmailTempToken(response.tempToken)
          setEmailCooldown(30)
          addToast({ type: 'success', message: 'OTP sent to your email' })
        }
      } catch (error) {
        addToast({ type: 'error', message: error?.response?.data?.error || 'Failed to update email' })
      } finally {
        setLoading(false)
      }
    } else if (emailStep === 2) {
      // Verify OTP
      try {
        setLoading(true)
        const response = await put('/auth/verify-email-otp', {
          tempToken: emailTempToken,
          otp: emailOTP
        })

        if (response.success) {
          setShowEmailModal(false)
          resetEmailModal()
          fetchUserProfile()
          addToast({ type: 'success', message: 'Email updated successfully' })
        }
      } catch (error) {
        addToast({ type: 'error', message: error?.response?.data?.error || 'Invalid OTP' })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResendEmailOTP = async () => {
    try {
      setLoading(true)
      const response = await put('/auth/resend-email-otp', {
        tempToken: emailTempToken
      })

      if (response.success) {
        setEmailTempToken(response.tempToken)
        setEmailCooldown(30)
        addToast({ type: 'success', message: 'OTP resent successfully' })
      }
    } catch (error) {
      addToast({ type: 'error', message: error?.response?.data?.error || 'Failed to resend OTP' })
    } finally {
      setLoading(false)
    }
  }

  const resetEmailModal = () => {
    setEmailStep(1)
    setCurrentPassword('')
    setNewEmail('')
    setEmailOTP('')
    setEmailTempToken('')
    setEmailCooldown(0)
  }

  // Password Update Functions
  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmNewPassword) {
      addToast({ type: 'error', message: 'Passwords do not match' })
      return
    }

    // Password validation
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      addToast({ type: 'error', message: passwordValidation.message })
      return
    }

    try {
      setLoading(true)
      const response = await put('/auth/update-password', {
        currentPassword: currentPasswordForUpdate,
        newPassword
      })

      if (response.success) {
        setCurrentPasswordForUpdate('')
        setNewPassword('')
        setConfirmNewPassword('')
        addToast({ type: 'success', message: 'Password updated successfully' })
      }
    } catch (error) {
      addToast({ type: 'error', message: error?.response?.data?.error || 'Failed to update password' })
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Functions
  const handleForgotPassword = async () => {
    if (forgotStep === 1) {
      // Send OTP
      try {
        setLoading(true)
        const response = await post('/auth/forgot-password', {
          email: forgotEmail
        })

        if (response.success) {
          setForgotStep(2)
          setForgotTempToken(response.tempToken)
          setForgotCooldown(30)
          addToast({ type: 'success', message: 'OTP sent to your email' })
        }
      } catch (error) {
        addToast({ type: 'error', message: error?.response?.data?.error || 'Failed to send OTP' })
      } finally {
        setLoading(false)
      }
    } else if (forgotStep === 2) {
      // Verify OTP and reset password
      if (forgotNewPassword !== forgotConfirmPassword) {
        addToast({ type: 'error', message: 'Passwords do not match' })
        return
      }

      const passwordValidation = validatePassword(forgotNewPassword)
      if (!passwordValidation.valid) {
        addToast({ type: 'error', message: passwordValidation.message })
        return
      }

      try {
        setLoading(true)
        const response = await post('/auth/verify-forgot-password-otp', {
          tempToken: forgotTempToken,
          otp: forgotOTP,
          newPassword: forgotNewPassword
        })

        if (response.success) {
          setShowForgotPasswordModal(false)
          resetForgotPasswordModal()
          addToast({ type: 'success', message: 'Password reset successfully' })
          // Redirect to login page
          window.location.href = '/login'
        }
      } catch (error) {
        addToast({ type: 'error', message: error?.response?.data?.error || 'Failed to reset password' })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResendForgotOTP = async () => {
    try {
      setLoading(true)
      const response = await post('/auth/resend-forgot-password-otp', {
        tempToken: forgotTempToken
      })

      if (response.success) {
        setForgotTempToken(response.tempToken)
        setForgotCooldown(30)
        addToast({ type: 'success', message: 'OTP resent successfully' })
      }
    } catch (error) {
      addToast({ type: 'error', message: error?.response?.data?.error || 'Failed to resend OTP' })
    } finally {
      setLoading(false)
    }
  }

  const resetForgotPasswordModal = () => {
    setForgotStep(1)
    setForgotEmail('')
    setForgotOTP('')
    setForgotTempToken('')
    setForgotNewPassword('')
    setForgotConfirmPassword('')
    setForgotCooldown(0)
  }

  const validatePassword = (password) => {
    const minLength = 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    if (password.length < minLength) {
      return { valid: false, message: `Password must be at least ${minLength} characters long` }
    }
    if (!hasUppercase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' }
    }
    if (!hasLowercase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' }
    }
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number' }
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' }
    }

    return { valid: true }
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            General Settings
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'security'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Security
          </button>
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Email Section */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Email Address</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  {user.emailVerified && (
                    <p className="text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(true)}
                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Reset Password */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPasswordForUpdate}
                    onChange={(e) => setCurrentPasswordForUpdate(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Re-enter New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmNewPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <button
                onClick={handlePasswordUpdate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Reset Password'}
              </button>
              
              <div className="text-center">
                <button
                  onClick={() => setShowForgotPasswordModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Update Modal */}
      <Modal isOpen={showEmailModal} onClose={() => { setShowEmailModal(false); resetEmailModal(); }} title="Update Email Address">
        <div className="space-y-4">
          {emailStep === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🔐 Current Password
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Email Address
                </label>
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter new email address"
                  required
                />
              </div>
              
              <button
                onClick={handleEmailUpdate}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Send OTP'}
              </button>
            </>
          )}
          
          {emailStep === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP sent to {newEmail}
                </label>
                <Input
                  type="text"
                  value={emailOTP}
                  onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleEmailUpdate}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                
                <button
                  onClick={handleResendEmailOTP}
                  disabled={loading || emailCooldown > 0}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {emailCooldown > 0 ? `Resend (${emailCooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal isOpen={showForgotPasswordModal} onClose={() => { setShowForgotPasswordModal(false); resetForgotPasswordModal(); }} title="Forgot Password">
        <div className="space-y-4">
          {forgotStep === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Registered Email
                </label>
                <Input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
              </div>
              
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          )}
          
          {forgotStep === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <Input
                  type="text"
                  value={forgotOTP}
                  onChange={(e) => setForgotOTP(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set New Password
                </label>
                <div className="relative">
                  <Input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showForgotNewPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showForgotConfirmPassword ? 'text' : 'password'}
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showForgotConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                
                <button
                  onClick={handleResendForgotOTP}
                  disabled={loading || forgotCooldown > 0}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  {forgotCooldown > 0 ? `Resend (${forgotCooldown}s)` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default AccountSettings
