import { useState, useEffect } from 'react'
import { get, put, post } from '../utils/api'
import useToast from '../hooks/useToast'

const Settings = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const [currentEmail, setCurrentEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [emailPassword, setEmailPassword] = useState('')
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [updatingEmail, setUpdatingEmail] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updatingPassword, setUpdatingPassword] = useState(false)

  const [deletePassword, setDeletePassword] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const addToast = useToast()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await get('/auth/profile/me')
      const user = response.data
      setProfile(user)
      setCurrentEmail(user.email || '')
      setNewEmail(user.email || '')
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailUpdate = async (e) => {
    e.preventDefault()
    if (!newEmail.trim()) {
      addToast({ type: 'error', message: 'New email is required' })
      return
    }
    if (!emailPassword) {
      addToast({ type: 'error', message: 'Current password is required to change email' })
      return
    }
    if (newEmail === currentEmail) {
      addToast({ type: 'error', message: 'New email is same as current email' })
      return
    }

    try {
      setUpdatingEmail(true)
      await put('/auth/update-email', {
        currentPassword: emailPassword,
        newEmail: newEmail.trim()
      })
      addToast({ type: 'success', message: 'Email updated successfully' })
      setCurrentEmail(newEmail.trim())
      setEmailPassword('')
      setIsEditingEmail(false)
    } catch (error) {
      addToast({ type: 'error', message: error.message || 'Failed to update email' })
    } finally {
      setUpdatingEmail(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (!currentPassword) {
      addToast({ type: 'error', message: 'Current password is required' })
      return
    }
    if (!newPassword) {
      addToast({ type: 'error', message: 'New password is required' })
      return
    }
    if (newPassword.length < 8) {
      addToast({ type: 'error', message: 'Password must be at least 8 characters' })
      return
    }
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', message: 'Passwords do not match' })
      return
    }

    try {
      setUpdatingPassword(true)
      await post('/auth/update-password', {
        currentPassword,
        newPassword
      })
      addToast({ type: 'success', message: 'Password updated successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      addToast({ type: 'error', message: error.message || 'Failed to update password' })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!deletePassword) {
      addToast({ type: 'error', message: 'Password is required to delete account' })
      return
    }

    try {
      setDeletingAccount(true)
      await post('/auth/delete-account', {
        password: deletePassword
      })
      addToast({ type: 'success', message: 'Account deleted successfully' })
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminUser')
        localStorage.removeItem('userRole')
        window.location.href = '/login'
      }
    } catch (error) {
      addToast({ type: 'error', message: error.message || 'Failed to delete account' })
    } finally {
      setDeletingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">
            Manage your account settings and preferences
          </p>
        </div>

        {/* CHANGE EMAIL */}
        <div className="bg-white border border-slate-200 rounded-xl mb-6">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">Change Email</h2>
            <p className="text-xs text-slate-500 mt-1">
              Update your email address
            </p>
          </div>

          <form onSubmit={handleEmailUpdate} className="p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-500">Current Email</label>
              <input
                type="email"
                value={currentEmail}
                disabled
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-100 text-slate-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">New Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={!isEditingEmail}
                placeholder="Enter new email address"
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
              />
            </div>

            {isEditingEmail && (
              <div>
                <label className="text-xs text-slate-500">Current Password</label>
                <input
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              {!isEditingEmail ? (
                <button
                  type="button"
                  onClick={() => setIsEditingEmail(true)}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={updatingEmail}
                    className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updatingEmail ? 'Updating...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(false)
                      setNewEmail(currentEmail)
                      setEmailPassword('')
                    }}
                    className="text-sm text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </form>
        </div>

        {/* CHANGE PASSWORD */}
        <div className="bg-white border border-slate-200 rounded-xl mb-6">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-800">Change Password</h2>
            <p className="text-xs text-slate-500 mt-1">
              Update your account password
            </p>
          </div>

          <form onSubmit={handlePasswordUpdate} className="p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-500">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-500">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="mt-1 w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={updatingPassword}
                className="bg-blue-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </form>
        </div>

        {/* DELETE ACCOUNT */}
        <div className="bg-white border border-red-200 rounded-xl">
          <div className="p-5 border-b border-red-200">
            <h2 className="text-sm font-semibold text-red-600">Delete Account</h2>
            <p className="text-xs text-slate-500 mt-1">
              Permanently delete your account and all data
            </p>
          </div>

          <div className="p-5">
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg mb-4">
              This action cannot be undone. Deleting your account will permanently
              remove all your data including profile information and activity history.
            </div>

            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-700"
              >
                Delete Account
              </button>
            ) : (
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-500">Enter your password to confirm</label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-1 w-full px-3 py-2 text-sm border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    autoFocus
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={deletingAccount}
                    className="bg-red-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingAccount ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setDeletePassword('')
                    }}
                    className="text-sm text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
