import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post, put } from '../utils/api'

const UserSettings = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  // Email Update States
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [tempToken, setTempToken] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [showEmailPassword, setShowEmailPassword] = useState(false)

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Delete Account States
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotOtpSent, setForgotOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [confirmResetPassword, setConfirmResetPassword] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  useEffect(() => {
    // Update currentEmail when user data changes
    if (user?.email) {
      setCurrentEmail(user.email)
    }
  }, [user])

  const fetchUserData = async () => {
    try {
      const response = await get('/api/auth/profile', { includeAuth: true })
      if (response?.data) {
        setUser(response.data)
        setCurrentEmail(response.data.email || '')
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    }
  }

  // Email Update Functions
  const handleVerifyPasswordForEmail = async () => {
    if (!emailPassword) {
      showToast('Please enter your current password', 'error')
      return
    }

    setLoading(true)
    try {
      // First verify password using current email
      const response = await post('/api/auth/verify-password', {
        password: emailPassword,
        email: currentEmail
      })

      if (response?.success) {
        setIsEmailVerified(true)
        showToast('Password verified. You can now update your email.', 'success')
      } else {
        showToast(response?.error || 'Invalid password', 'error')
      }
    } catch (error) {
      showToast('Failed to verify password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!newEmail) {
      showToast('Please enter new email address', 'error')
      return
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await put('/api/auth/update-email', {
        currentPassword: emailPassword,
        newEmail: newEmail
      }, { includeAuth: true })

      if (response?.success) {
        // Update frontend state immediately
        setCurrentEmail(newEmail)

        // Update user state with returned data or create updated object
        const updatedUserData = response?.user || { ...user, email: newEmail }
        setUser(updatedUserData)

        // Update user in localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          const localStorageUser = JSON.parse(storedUser)
          localStorageUser.email = newEmail
          localStorage.setItem('user', JSON.stringify(localStorageUser))
        }

        // Reset form
        setNewEmail('')
        setEmailPassword('')
        setIsEditingEmail(false)
        setIsEmailVerified(false)

        showToast('Email updated successfully', 'success')

        // Optional: Fetch fresh data to ensure consistency
        setTimeout(() => {
          fetchUserData()
        }, 1000)
      } else {
        showToast(response?.message || 'Failed to update email', 'error')
      }
    } catch (error) {
      showToast('Failed to update email', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Password Update Functions
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }

    if (newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error')
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      showToast('Must include uppercase letter', 'error')
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      showToast('Must include lowercase letter', 'error')
      return
    }

    if (!/\d/.test(newPassword)) {
      showToast('Must include number', 'error')
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      showToast('Must include special character', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await post('/api/auth/update-password', {
        currentPassword,
        newPassword
      }, { includeAuth: true })
      
      if (response?.success) {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        showToast('Password updated successfully', 'success')
      } else {
        showToast(response?.message || 'Failed to update password', 'error')
      }
    } catch (error) {
      showToast('Failed to update password', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Functions
  const handleSendForgotOtp = async () => {
    if (!forgotEmail) {
      showToast('Please enter your email address', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await post('/api/auth/forgot-password', {
  email: forgotEmail
})

console.log('Forgot password response:', response);

if (response?.success) {
  setForgotOtpSent(true)
  setTempToken(response.tempToken) // ⭐ IMPORTANT
  
  // Show OTP if available (development mode)
  if (response.otp) {
    showToast(`OTP sent to your email. For development: ${response.otp}`, 'success')
  } else {
    showToast('OTP sent to your email', 'success')
  }
} else {
  showToast(response?.error || response?.message || 'Failed to send OTP', 'error')
}
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to send OTP';
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyForgotOtp = async () => {
    if (!forgotOtp || forgotOtp.length !== 6) {
      showToast('Please enter 6-digit OTP', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await post('/api/auth/verify-forgot-password-otp', {
        tempToken,
        otp: forgotOtp
      })

      console.log('Verify OTP response:', response);

      if (response?.success) {
        showToast('OTP verified. Now enter your new password.', 'success')
        setOtpVerified(true)
      } else {
        showToast(response?.error || response?.message || 'Invalid OTP', 'error')
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to verify OTP';
      showToast(errorMessage, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
  if (!resetPassword || !confirmResetPassword) {
    showToast('Fill all password fields', 'error')
    return
  }

  if (resetPassword !== confirmResetPassword) {
    showToast('Passwords do not match', 'error')
    return
  }

  // Validate new password
  if (resetPassword.length < 8) {
    showToast('Password must be at least 8 characters', 'error')
    return
  }

  if (!/[A-Z]/.test(resetPassword)) {
    showToast('Must include uppercase letter', 'error')
    return
  }

  if (!/[a-z]/.test(resetPassword)) {
    showToast('Must include lowercase letter', 'error')
    return
  }

  if (!/\d/.test(resetPassword)) {
    showToast('Must include number', 'error')
    return
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(resetPassword)) {
    showToast('Must include special character', 'error')
    return
  }

  setLoading(true)

  try {
    const response = await post('/api/auth/verify-forgot-password-otp', {
      tempToken,
      otp: forgotOtp,
      newPassword: resetPassword
    })

    console.log('Reset password response:', response);
 
    if (response?.success) {
      showToast('Password reset successfully! You can now login with your new password.', 'success')
      // Reset all forgot password states
      setShowForgotPassword(false)
      setForgotEmail('')
      setForgotOtp('')
      setForgotOtpSent(false)
      setOtpVerified(false)
      setResetPassword('')
      setConfirmResetPassword('')
      setTempToken('')
    } else {
      showToast(response?.error || response?.message || 'Failed to reset password', 'error')
    }
  } catch (error) {
    console.error('Reset password error:', error);
    const errorMessage = error?.response?.data?.error || error?.response?.data?.message || 'Failed to reset password';
    showToast(errorMessage, 'error')
  } finally {
    setLoading(false)
  }
}
  

  // Delete Account Functions
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      showToast('Please enter your password to confirm', 'error')
      return
    }

    setLoading(true)
    try {
      const response = await post('/api/auth/delete-account', {
        password: deletePassword
      }, { includeAuth: true })

      if (response?.success) {
        showToast('Account deleted successfully', 'success')
        localStorage.removeItem('userToken')
        localStorage.removeItem('user')
        navigate('/login')
      } else {
        showToast(response?.message || 'Failed to delete account', 'error')
      }
    } catch (error) {
      showToast('Failed to delete account', 'error')
    } finally {
      setLoading(false)
      setShowDeleteModal(false)
      setDeletePassword('')
    }
  }

  // Toast notification helper
  const showToast = (message, type = 'info') => {
    // Create toast notification
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 ${type === 'success' ? 'bg-emerald-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
          'bg-blue-500 text-white'
      }`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Change Email Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Change Email</h2>
              <p className="text-sm text-slate-600 mt-1">Update your email address</p>
            </div>
            <div className="p-6">
              {!isEditingEmail ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Email
                    </label>
                    <input
                      type="email"
                      value={currentEmail}
                      readOnly
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                    />
                  </div>
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {!isEmailVerified ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Enter Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showEmailPassword ? "text" : "password"}
                            value={emailPassword}
                            onChange={(e) => setEmailPassword(e.target.value)}
                            placeholder="Enter your current password"
                            className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => setShowEmailPassword(!showEmailPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showEmailPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 2.076M3 12l3-9m4.5 9l4.5-9" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-9.542 7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email address"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleVerifyPasswordForEmail}
                          disabled={loading}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Verifying...' : 'Verify Password'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingEmail(false)
                            setEmailPassword('')
                            setIsEmailVerified(false)
                          }}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          New Email Address
                        </label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="Enter new email address"
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleUpdateEmail}
                          disabled={loading}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {loading ? 'Updating...' : 'Update Email'}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditingEmail(false)
                            setNewEmail('')
                            setEmailPassword('')
                            setIsEmailVerified(false)
                          }}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Change Password Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
              <p className="text-sm text-slate-600 mt-1">Update your account password</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showCurrentPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 2.076M3 12l3-9m4.5 9l4.5-9" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-9.542 7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showNewPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 2.076M3 12l3-9m4.5 9l4.5-9" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-9.542 7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 2.076M3 12l3-9m4.5 9l4.5-9" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-9.542 7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                  <button
                    onClick={() => setShowForgotPassword(true)}
                    className="px-4 py-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
            <div className="p-6 border-b border-red-200">
              <h2 className="text-xl font-semibold text-red-600">Delete Account</h2>
              <p className="text-sm text-slate-600 mt-1">Permanently delete your account and all data</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-800">
                    ⚠️ This action cannot be undone.
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Deleting your account will permanently remove all your data, including profile information, donations, and activity history.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirm Account Deletion</h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Enter your password to confirm
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showDeletePassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 2.076M3 12l3-9m4.5 9l4.5-9" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-9.542 7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletePassword('')
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reset Password</h3>

            {!forgotOtpSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSendForgotOtp}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false)
                      setForgotEmail('')
                      setForgotOtp('')
                      setForgotOtpSent(false)
                    }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleVerifyForgotOtp}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? "text" : "password"}
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showResetPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 2.076M3 12l3-9m4.5 9l4.5-9" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-9.542 7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmResetPassword ? "text" : "password"}
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmResetPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 2.076M3 12l3-9m4.5 9l4.5-9" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7a10.05 10.05 0 01-9.542 7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                    <button
                      onClick={() => {
                        setShowForgotPassword(false)
                        setForgotEmail('')
                        setForgotOtp('')
                        setForgotOtpSent(false)
                        setResetPassword('')
                        setConfirmResetPassword('')
                      }}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UserSettings
