import { useState, useEffect } from 'react'
import { useMentors } from '../../../hooks/useMentors'
import { useAuth } from '../../../context/AuthContext'
import useToast from '../../../hooks/useToast'

const MentorshipProfile = () => {
  const { getMyProfile, updateMyProfile } = useMentors()
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true)
        const data = await getMyProfile()
        setProfile(data)
        if (data?.profilePhoto) {
          setPhotoPreview(data.profilePhoto)
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [getMyProfile])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field) => (value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Profile photo must be less than 2MB',
          tone: 'error'
        })
        return
      }
      setProfilePhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      // Create form data for file upload
      const submitData = new FormData()
      
      // Prepare updated profile data
      const updatedProfile = {
        ...profile,
        // Ensure all fields are included
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        graduationYear: profile.graduationYear || '',
        degree: profile.degree || '',
        department: profile.department || '',
        currentLocation: profile.currentLocation || '',
        linkedinProfile: profile.linkedinProfile || '',
        shortBio: profile.shortBio || '',
        currentJobTitle: profile.currentJobTitle || '',
        company: profile.company || '',
        industry: profile.industry || '',
        yearsOfExperience: profile.yearsOfExperience || '',
        experience: profile.yearsOfExperience || profile.experience || '',
        mentorshipAreas: Array.isArray(profile.mentorshipAreas) ? profile.mentorshipAreas : [],
        expertise: Array.isArray(profile.expertise) ? profile.expertise : [],
        mentorshipMode: profile.mentorshipMode || '',
        availableDays: profile.availableDays || '',
        timeCommitment: profile.timeCommitment || '',
        mentorshipPreference: profile.mentorshipPreference || '',
        maxMentees: profile.maxMentees || '',
      }

      // Add profile data as JSON
      submitData.append('data', JSON.stringify(updatedProfile))
      
      // Add profile photo if changed
      if (profilePhoto && profilePhoto instanceof File) {
        submitData.append('profilePhoto', profilePhoto)
      }

      const response = await updateMyProfile(submitData)
      setProfile(response.data || response)
      setEditing(false)
      
      toast({
        title: 'Profile Updated',
        description: 'Your mentor profile has been updated successfully.',
        tone: 'success'
      })
    } catch (err) {
      setError(err.message || 'Failed to update profile')
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update profile. Please try again.',
        tone: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset to original profile data would need to store original state
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading mentor profile...</p>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Profile</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Mentor Profile Found</h3>
          <p className="text-slate-600 mb-4">You haven't registered as a mentor yet.</p>
          <a 
            href="/dashboard/mentorship/become" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Become a Mentor
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Mentor Profile</h1>
              <p className="text-blue-100 mt-1">Manage your mentorship information</p>
            </div>
            <div className="flex gap-3">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-medium"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photo Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-2xl">
                    {profile?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                  </div>
                )}
              </div>
              <div className="flex-1">
                {editing && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Update Profile Photo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                )}
                {!editing && (
                  <div>
                    <p className="text-sm text-slate-600">Your current profile photo</p>
                    <p className="text-xs text-slate-500 mt-1">Click "Edit Profile" to update</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName || ''}
                  onChange={handleChange('fullName')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={handleChange('email')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phoneNumber || ''}
                  onChange={handleChange('phoneNumber')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Location</label>
                <input
                  type="text"
                  value={profile.currentLocation || ''}
                  onChange={handleChange('currentLocation')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  value={profile.linkedinProfile || ''}
                  onChange={handleChange('linkedinProfile')}
                  disabled={!editing}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Graduation Year</label>
                <input
                  type="number"
                  value={profile.graduationYear || ''}
                  onChange={handleChange('graduationYear')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Short Bio</label>
                <textarea
                  value={profile.shortBio || ''}
                  onChange={handleChange('shortBio')}
                  disabled={!editing}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Tell us about yourself and your passion for mentoring..."
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Professional Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Job Title</label>
                <input
                  type="text"
                  value={profile.currentJobTitle || ''}
                  onChange={handleChange('currentJobTitle')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                <input
                  type="text"
                  value={profile.company || ''}
                  onChange={handleChange('company')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Industry</label>
                <select
                  value={profile.industry || ''}
                  onChange={handleChange('industry')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Industry</option>
                  <option value="IT / Software">IT / Software</option>
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="Management">Management</option>
                  <option value="Startup">Startup</option>
                  <option value="Government">Government</option>
                  <option value="Research / Academia">Research / Academia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={profile.yearsOfExperience || profile.experience || ''}
                  onChange={handleChange('yearsOfExperience')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Skills & Expertise */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Skills & Expertise</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Areas of Expertise</label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(profile.expertise) && profile.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {(!profile.expertise || profile.expertise.length === 0) && (
                    <span className="text-slate-500 text-sm">No expertise added yet</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mentorship Areas</label>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(profile.mentorshipAreas) && profile.mentorshipAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {area}
                    </span>
                  ))}
                  {(!profile.mentorshipAreas || profile.mentorshipAreas.length === 0) && (
                    <span className="text-slate-500 text-sm">No mentorship areas specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mentorship Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Mentorship Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Mentorship Mode</label>
                <select
                  value={profile.mentorshipMode || ''}
                  onChange={handleChange('mentorshipMode')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Mode</option>
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Days</label>
                <input
                  type="text"
                  value={profile.availableDays || ''}
                  onChange={handleChange('availableDays')}
                  disabled={!editing}
                  placeholder="Weekdays, Weekends, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Time Commitment</label>
                <select
                  value={profile.timeCommitment || ''}
                  onChange={handleChange('timeCommitment')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Commitment</option>
                  <option value="1-2 hours/week">1-2 hours/week</option>
                  <option value="3-5 hours/week">3-5 hours/week</option>
                  <option value="5+ hours/week">5+ hours/week</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Mentees</label>
                <input
                  type="number"
                  value={profile.maxMentees || ''}
                  onChange={handleChange('maxMentees')}
                  disabled={!editing}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Status Information</h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  profile.status === 'approved' 
                    ? 'bg-green-100 text-green-800'
                    : profile.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {profile.status === 'approved' ? '✓ Approved' : 
                   profile.status === 'pending' ? '⏳ Pending Review' : 
                   '✗ Rejected'}
                </span>
              </div>
              <div className="text-sm text-slate-600">
                {profile.status === 'approved' && 'Your mentor profile is active and visible to students.'}
                {profile.status === 'pending' && 'Your profile is under review by the admin team.'}
                {profile.status === 'rejected' && 'Your profile was not approved. Please contact support.'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {editing && (
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default MentorshipProfile
