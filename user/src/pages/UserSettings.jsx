import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const UserSettings = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  // Email Update States
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [showEmailUpdateForm, setShowEmailUpdateForm] = useState(false)

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotOtpSent, setForgotOtpSent] = useState(false)
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [confirmResetPassword, setConfirmResetPassword] = useState('')

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setCurrentEmail(userData.email || '')
    }
  }, [])

  // Email Update Functions
  const handleSendEmailOtp = async () => {
    if (!newEmail) {
      toast.error('Please enter new email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      // API call to send OTP to new email
      const response = await fetch('/api/user/send-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ newEmail })
      })

      const data = await response.json()
      
      if (data.success) {
        setOtpSent(true)
        toast.success('OTP sent to new email address')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmailOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/verify-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ newEmail, otp })
      })

      const data = await response.json()
      
      if (data.success) {
        setEmailVerified(true)
        // Update user data in localStorage
        const updatedUser = { ...user, email: newEmail }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setCurrentEmail(newEmail)
        toast.success('Email verified successfully')
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmail = async () => {
    if (!emailVerified) {
      toast.error('Please verify OTP first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ newEmail })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Email updated successfully')
        // Reset email form
        setNewEmail('')
        setOtp('')
        setOtpSent(false)
        setEmailVerified(false)
        setShowEmailUpdateForm(false)
      } else {
        toast.error(data.message || 'Failed to update email')
      }
    } catch (error) {
      toast.error('Failed to update email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Password Update Functions
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`
        },
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Password updated successfully')
        // Reset password fields
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.message || 'Failed to update password')
      }
    } catch (error) {
      toast.error('Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Forgot Password Functions
  const handleSendForgotOtp = async () => {
    if (!forgotEmail) {
      toast.error('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: forgotEmail })
      })

      const data = await response.json()
      
      if (data.success) {
        setForgotOtpSent(true)
        toast.success('Password reset link sent to your email address')
      } else {
        toast.error(data.message || 'Failed to send reset link')
      }
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyForgotOtp = async () => {
    // Check if this is OTP verification or reset link verification
    const urlParams = new URLSearchParams(window.location.search)
    const resetToken = urlParams.get('token')
    
    if (resetToken) {
      // Reset link verification - allow password reset without OTP
      if (!resetPassword || !confirmResetPassword) {
        toast.error('Please fill all password fields')
        return
      }

      if (resetPassword.length < 8) {
        toast.error('Password must be at least 8 characters long')
        return
      }

      if (resetPassword !== confirmResetPassword) {
        toast.error('Passwords do not match')
        return
      }

      setLoading(true)
      try {
        const response = await fetch('/api/user/reset-password-with-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            token: resetToken,
            newPassword: resetPassword 
          })
        })

        const data = await response.json()
        
        if (data.success) {
          toast.success('Password reset successfully')
          // Reset forgot password form
          setForgotEmail('')
          setForgotOtp('')
          setForgotOtpSent(false)
          setForgotOtpVerified(false)
          setResetPassword('')
          setConfirmResetPassword('')
          setShowForgotPassword(false)
          // Redirect to login
          navigate('/login')
        } else {
          toast.error(data.message || 'Failed to reset password')
        }
      } catch (error) {
        toast.error('Failed to reset password. Please try again.')
      } finally {
        setLoading(false)
      }
    } else {
      // OTP verification
      if (!forgotOtp || forgotOtp.length !== 6) {
        toast.error('Please enter 6-digit OTP')
        return
      }

      setLoading(true)
      try {
        const response = await fetch('/api/user/verify-forgot-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: forgotEmail, otp: forgotOtp })
        })

        const data = await response.json()
        
        if (data.success) {
          setForgotOtpVerified(true)
          toast.success('OTP verified. Please set new password')
        } else {
          toast.error(data.message || 'Invalid OTP')
        }
      } catch (error) {
        toast.error('Failed to verify OTP. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleResetPassword = async () => {
    // Check if this is OTP verification or reset link verification
    const urlParams = new URLSearchParams(window.location.search)
    const resetToken = urlParams.get('token')
    
    if (resetToken) {
      // Reset link verification - already handled in handleVerifyForgotOtp
      return
    }
    
    // OTP verification flow
    if (!resetPassword || !confirmResetPassword) {
      toast.error('Please fill all password fields')
      return
    }

    if (resetPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    if (resetPassword !== confirmResetPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email: forgotEmail, 
          newPassword: resetPassword 
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Password reset successfully')
        // Reset forgot password form
        setForgotEmail('')
        setForgotOtp('')
        setForgotOtpSent(false)
        setForgotOtpVerified(false)
        setResetPassword('')
        setConfirmResetPassword('')
        setShowForgotPassword(false)
        // Redirect to login
        navigate('/login')
      } else {
        toast.error(data.message || 'Failed to reset password')
      }
    } catch (error) {
      toast.error('Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
        
        <div className="space-y-6">
          
          {/* Section 1: Email Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Email Settings</h2>
            
            {!showEmailUpdateForm ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Current Email</label>
                  <input
                    type="email"
                    value={currentEmail}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>
                
                <button
                  onClick={() => setShowEmailUpdateForm(true)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Update Email
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Step 1: Enter New Email */}
                {!otpSent ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Email</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new email address"
                    />
                    <button
                      onClick={handleSendEmailOtp}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </div>
                ) : !emailVerified ? (
                  /* Step 2: OTP Verification */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Enter OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <button
                      onClick={handleVerifyEmailOtp}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                ) : (
                  /* Step 3: Email Update */
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Email verified!</strong> Click below to update your email address.
                      </p>
                    </div>
                    <button
                      onClick={handleUpdateEmail}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowEmailUpdateForm(false)
                    setNewEmail('')
                    setOtp('')
                    setOtpSent(false)
                    setEmailVerified(false)
                  }}
                  className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Change Password */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter current password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handleUpdatePassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </div>

          {/* Section 3: Forgot Password */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Forgot Password</h2>
            
            {!showForgotPassword ? (
              <button
                onClick={() => setShowForgotPassword(true)}
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700"
              >
                Forgot Password
              </button>
            ) : (
              <div className="space-y-4">
                {!forgotOtpSent ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Recovery Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                    />
                    <button
                      onClick={handleSendForgotOtp}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                ) : !forgotOtpVerified ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Reset link sent!</strong> Please check your email and click the reset link to receive OTP.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Enter OTP</label>
                      <input
                        type="text"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                      />
                    </div>
                    <button
                      onClick={handleVerifyForgotOtp}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={handleResetPassword}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading ? 'Resetting...' : 'Update Password'}
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setForgotEmail('')
                    setForgotOtp('')
                    setForgotOtpSent(false)
                    setForgotOtpVerified(false)
                    setResetPassword('')
                    setConfirmResetPassword('')
                  }}
                  className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
