import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AdminSettings = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  // Email Update States
  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  // Password Update States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState('')
  const [forgotOtpSent, setForgotOtpSent] = useState(false)
  const [forgotOtpVerified, setForgotOtpVerified] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [confirmResetPassword, setConfirmResetPassword] = useState('')

  // Delete Account States
  const [deleteOtp, setDeleteOtp] = useState('')
  const [deleteOtpSent, setDeleteOtpSent] = useState(false)
  const [deleteOtpVerified, setDeleteOtpVerified] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('adminUser')
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
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ newEmail, otp })
      })

      const data = await response.json()
      
      if (data.success) {
        setEmailVerified(true)
        // Update user data in localStorage
        const updatedUser = { ...user, email: newEmail }
        localStorage.setItem('adminUser', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setCurrentEmail(newEmail)
        toast.success('Email updated successfully')
        // Reset email form
        setNewEmail('')
        setOtp('')
        setOtpSent(false)
        setEmailVerified(false)
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.')
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
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: forgotEmail })
      })

      const data = await response.json()
      
      if (data.success) {
        setForgotOtpSent(true)
        toast.success('OTP sent to your email address')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyForgotOtp = async () => {
    if (!forgotOtp || forgotOtp.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-forgot-otp', {
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

  const handleResetPassword = async () => {
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
      const response = await fetch('/api/auth/reset-password', {
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

  // Delete Account Functions
  const handleSendDeleteOtp = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/send-delete-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setDeleteOtpSent(true)
        toast.success('OTP sent to your email address')
      } else {
        toast.error(data.message || 'Failed to send OTP')
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyDeleteOtp = async () => {
    if (!deleteOtp || deleteOtp.length !== 6) {
      toast.error('Please enter 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/verify-delete-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ otp: deleteOtp })
      })

      const data = await response.json()
      
      if (data.success) {
        setDeleteOtpVerified(true)
        toast.success('OTP verified. Click confirm to delete account')
      } else {
        toast.error(data.message || 'Invalid OTP')
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!deleteOtpVerified) {
      toast.error('Please verify OTP first')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Account deleted successfully')
        // Clear localStorage and redirect to login
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        navigate('/login')
      } else {
        toast.error(data.message || 'Failed to delete account')
      }
    } catch (error) {
      toast.error('Failed to delete account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Email Update Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Email Update</h2>
            
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
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">New Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new email address"
                />
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendEmailOtp}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
              ) : (
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
                    {loading ? 'Verifying...' : 'Verify OTP & Update Email'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Section */}
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
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>

          {/* Forgot Password Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Forgot Password</h2>
            
            <div className="space-y-4">
              {!forgotOtpSent ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
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
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              ) : !forgotOtpVerified ? (
                <div className="space-y-3">
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
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Delete Account</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              {!deleteOtpSent ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                >
                  Delete Account
                </button>
              ) : !deleteOtpVerified ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={deleteOtp}
                      onChange={(e) => setDeleteOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={handleVerifyDeleteOtp}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                      OTP verified. Click below to permanently delete your account.
                    </p>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Confirm Delete Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Confirm Account Deletion</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete your account? We will send an OTP to your email for verification.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDeleteOtp}
                disabled={loading}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSettings
