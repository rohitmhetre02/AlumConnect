import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { get, put } from '../utils/api'
import useToast from '../hooks/useToast'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const addToast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await get('/auth/profile/me')
      setProfile(response.data)
      setFormData(response.data)
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await put('/auth/profile/me', formData)
      setProfile(response.data)
      setIsEditing(false)
      addToast({ type: 'success', message: 'Profile updated successfully' })
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to update profile' })
    }
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Administrator',
        icon: '👑'
      },
      coordinator: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Coordinator',
        icon: '🎯'
      }
    }
    return roleConfig[role] || roleConfig.admin
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Profile not found</h2>
          <p className="mt-2 text-gray-600">Unable to load your profile information.</p>
        </div>
      </div>
    )
  }

  const roleBadge = getRoleBadge(profile.role)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
              <p className="mt-1 text-sm text-gray-600">Manage your personal information and account settings</p>
            </div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-300">
                        <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {profile.firstName && profile.lastName 
                      ? `${profile.firstName} ${profile.lastName}`
                      : profile.email || 'Admin User'
                    }
                  </h3>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  
                  {/* Role Badge */}
                  <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${roleBadge.bg} ${roleBadge.text}`}>
                    <span>{roleBadge.icon}</span>
                    {roleBadge.label}
                  </div>

                  {/* Additional Info */}
                  {profile.department && (
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-900">{profile.department}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    {profile.role === 'coordinator' && (
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <input
                          type="text"
                          id="department"
                          name="department"
                          value={formData.department || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-gray-500">First Name</p>
                        <p className="mt-1 text-sm text-gray-900">{profile.firstName || 'Not specified'}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Name</p>
                        <p className="mt-1 text-sm text-gray-900">{profile.lastName || 'Not specified'}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                    </div>

                    {profile.department && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="mt-1 text-sm text-gray-900">{profile.department}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="mt-1 text-sm text-gray-900">{profile.phone || 'Not specified'}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Account Status</p>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                          profile.isProfileApproved 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <span>{profile.isProfileApproved ? '✓' : '⏳'}</span>
                          {profile.isProfileApproved ? 'Approved' : 'Pending Approval'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
