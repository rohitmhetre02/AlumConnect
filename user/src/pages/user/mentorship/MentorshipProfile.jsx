import { useState, useEffect } from 'react'
import { useMentors } from '../../../hooks/useMentors'
import { useAuth } from '../../../context/AuthContext'
import useToast from '../../../hooks/useToast'

const MentorshipProfile = () => {
  const { getMyProfile, updateMyProfile } = useMentors()
  const { user } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState(null)
  const [originalProfile, setOriginalProfile] = useState(null) // Store original data
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
        setError(null)
        
        const data = await getMyProfile()
        
        // Debug: Log fetched data
        console.log('Fetched profile data:', data)
        
        if (data) {
          // Handle the actual data structure from backend
          const profileData = {
            ...data,
            // Map backend fields to frontend expected fields
            fullName: data.fullName || '',
            email: data.email || '',
            phoneNumber: data.phoneNumber || '',
            graduationYear: data.graduationYear || '',
            degree: data.degree || '',
            department: data.department || '',
            currentLocation: data.currentLocation || '',
            linkedinProfile: data.linkedin || data.linkedinProfile || '', // Handle both linkedin and linkedinProfile
            shortBio: data.shortBio || '',
            currentJobTitle: data.currentJobTitle || data.position || '', // Handle both currentJobTitle and position
            company: data.company || '',
            industry: data.industry || '',
            yearsOfExperience: data.yearsOfExperience || data.experience || '', // Handle both yearsOfExperience and experience
            bio: data.bio || '',
            experienceDescription: data.experienceDescription || '',
            mentorshipAreas: Array.isArray(data.mentorshipAreas) ? data.mentorshipAreas : [],
            expertise: Array.isArray(data.expertise) ? data.expertise : Array.isArray(data.skills) ? data.skills.split(',').map(s => s.trim()) : [], // Handle both expertise and skills
            mentorshipMode: data.mentorshipMode || data.modes || '', // Handle both mentorshipMode and modes
            availableDays: data.availableDays || '',
            timeCommitment: data.timeCommitment || data.weeklyHours || '', // Handle both timeCommitment and weeklyHours
            mentorshipPreference: data.mentorshipPreference || data.preferredStudents || '', // Handle both mentorshipPreference and preferredStudents
            maxMentees: data.maxMentees || data.maxStudents || '', // Handle both maxMentees and maxStudents
            status: data.status || '',
            consent1: data.consent1 || false,
            consent2: data.consent2 || false,
            consent3: data.consent3 || false,
            profilePhoto: data.profilePhoto || data.avatar || '' // Handle both profilePhoto and avatar
          }
          
          console.log('Processed profile data for frontend:', profileData)
          
          setProfile(profileData)
          setOriginalProfile(JSON.parse(JSON.stringify(profileData))) // Store deep copy
          
          if (data?.profilePhoto || data?.avatar) {
            setPhotoPreview(data.profilePhoto || data.avatar)
          }
        } else {
          throw new Error('No profile data received')
        }
      } catch (err) {
        console.error('Profile load error:', err)
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
    
    if (!profile) return

    try {
      setSaving(true)
      setError(null)

      // Prepare updated profile data matching backend structure exactly
      const updatedProfile = {
        // Basic Information (matching backend fields exactly)
        fullName: profile.fullName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        graduationYear: profile.graduationYear || '',
        degree: profile.degree || '',
        department: profile.department || '',
        currentLocation: profile.currentLocation || '',
        linkedinProfile: profile.linkedinProfile || '',
        shortBio: profile.shortBio || '',
        
        // Professional Information (matching backend fields exactly)
        currentJobTitle: profile.currentJobTitle || '',
        company: profile.company || '',
        industry: profile.industry || '',
        yearsOfExperience: profile.yearsOfExperience || '',
        bio: profile.bio || '',
        experienceDescription: profile.experienceDescription || '',
        
        // Skills & Expertise (matching backend fields exactly)
        mentorshipAreas: Array.isArray(profile.mentorshipAreas) ? profile.mentorshipAreas : [],
        expertise: Array.isArray(profile.expertise) ? profile.expertise : [],
        
        // Mentorship Preferences (matching backend fields exactly)
        mentorshipMode: profile.mentorshipMode || '',
        availableDays: profile.availableDays || '',
        timeCommitment: profile.timeCommitment || '',
        mentorshipPreference: profile.mentorshipPreference || '',
        maxMentees: profile.maxMentees || '',
        
        // Status fields (matching backend fields exactly)
        consent1: profile.consent1 || false,
        consent2: profile.consent2 || false,
        consent3: profile.consent3 || false,
      }

      // Debug: Log the exact data being sent to backend
      console.log('=== BACKEND DEBUG INFO ===')
      console.log('Submitting profile data to backend:', updatedProfile)

      // Try FormData first (for file uploads)
      if (profilePhoto && profilePhoto instanceof File) {
        console.log('Using FormData for file upload...')
        
        const submitData = new FormData()
        submitData.append('data', JSON.stringify(updatedProfile))
        submitData.append('profilePhoto', profilePhoto)
        
        console.log('FormData contents:')
        for (let [key, value] of submitData.entries()) {
          console.log(`${key}:`, value)
        }
        
        try {
          const response = await updateMyProfile(submitData)
          await handleBackendResponse(response, updatedProfile)
        } catch (formDataError) {
          console.error('FormData update failed, trying JSON:', formDataError)
          await tryJsonUpdate(updatedProfile)
        }
      } else {
        // No file upload, use JSON directly
        console.log('Using JSON data (no file upload)...')
        await tryJsonUpdate(updatedProfile)
      }
      
    } catch (err) {
      console.error('Profile update error:', err)
      console.error('Error details:', err.details)
      console.error('Error status:', err.status)
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

  const tryJsonUpdate = async (updatedProfile) => {
    try {
      console.log('Trying JSON update with data:', updatedProfile)
      const response = await updateMyProfile(updatedProfile)
      await handleBackendResponse(response, updatedProfile)
    } catch (jsonError) {
      console.error('JSON update failed:', jsonError)
      throw jsonError
    }
  }

  const handleBackendResponse = async (response, updatedProfile) => {
    // Debug: Log the response from backend
    console.log('=== BACKEND RESPONSE DEBUG ===')
    console.log('Backend response:', response)
    console.log('Response status:', response?.status)
    console.log('Response data:', response?.data)
    
    // Compare what we sent vs what we got back
    const updatedData = response?.data ?? response
    if (updatedData) {
      console.log('=== DATA COMPARISON ===')
      console.log('SENT TO BACKEND:')
      console.log('  currentJobTitle:', updatedProfile.currentJobTitle)
      console.log('  company:', updatedProfile.company)
      console.log('  currentLocation:', updatedProfile.currentLocation)
      console.log('  yearsOfExperience:', updatedProfile.yearsOfExperience)
      
      console.log('RECEIVED FROM BACKEND:')
      console.log('  currentJobTitle:', updatedData.currentJobTitle)
      console.log('  position:', updatedData.position)
      console.log('  company:', updatedData.company)
      console.log('  currentLocation:', updatedData.currentLocation)
      console.log('  yearsOfExperience:', updatedData.yearsOfExperience)
      console.log('  experience:', updatedData.experience)
      
      console.log('CHANGES DETECTED:')
      console.log('  currentJobTitle changed:', updatedProfile.currentJobTitle !== updatedData.currentJobTitle)
      console.log('  company changed:', updatedProfile.company !== updatedData.company)
      console.log('  currentLocation changed:', updatedProfile.currentLocation !== updatedData.currentLocation)
      console.log('  yearsOfExperience changed:', updatedProfile.yearsOfExperience !== updatedData.yearsOfExperience)
      console.log('=== END DATA COMPARISON ===')
      
      // Check if backend actually updated the data
      const hasChanges = updatedProfile.currentJobTitle !== updatedData.currentJobTitle ||
                        updatedProfile.company !== updatedData.company ||
                        updatedProfile.currentLocation !== updatedData.currentLocation ||
                        updatedProfile.yearsOfExperience !== updatedData.yearsOfExperience

      if (!hasChanges && response?.success) {
        console.warn('⚠️ Backend claims success but data not updated! Using frontend data as fallback.')
        // Use frontend data as fallback since backend didn't update
        const fallbackData = { ...updatedProfile, ...updatedData, ...updatedProfile }
        await updateLocalState(fallbackData)
      } else {
        await updateLocalState(updatedData)
      }
    }
    console.log('=== END BACKEND RESPONSE DEBUG ===')
  }

  const updateLocalState = async (responseData) => {
    console.log('Updated data from backend:', responseData)
    
    // Handle the response data structure with proper field mapping
    const profileData = {
      ...responseData,
      // Map backend response fields to frontend expected fields
      fullName: responseData.fullName || '',
      email: responseData.email || '',
      phoneNumber: responseData.phoneNumber || '',
      graduationYear: responseData.graduationYear || '',
      degree: responseData.degree || '',
      department: responseData.department || '',
      currentLocation: responseData.currentLocation || '',
      linkedinProfile: responseData.linkedin || responseData.linkedinProfile || '', // Handle both linkedin and linkedinProfile
      shortBio: responseData.shortBio || '',
      currentJobTitle: responseData.currentJobTitle || responseData.position || '', // Handle both currentJobTitle and position
      company: responseData.company || '',
      industry: responseData.industry || '',
      yearsOfExperience: responseData.yearsOfExperience || responseData.experience || '', // Handle both yearsOfExperience and experience
      bio: responseData.bio || '',
      experienceDescription: responseData.experienceDescription || '',
      mentorshipAreas: Array.isArray(responseData.mentorshipAreas) ? responseData.mentorshipAreas : [],
      expertise: Array.isArray(responseData.expertise) ? responseData.expertise : Array.isArray(responseData.skills) ? responseData.skills.split(',').map(s => s.trim()) : [], // Handle both expertise and skills
      mentorshipMode: responseData.mentorshipMode || responseData.modes || '', // Handle both mentorshipMode and modes
      availableDays: responseData.availableDays || '',
      timeCommitment: responseData.timeCommitment || responseData.weeklyHours || '', // Handle both timeCommitment and weeklyHours
      mentorshipPreference: responseData.mentorshipPreference || responseData.preferredStudents || '', // Handle both mentorshipPreference and preferredStudents
      maxMentees: responseData.maxMentees || responseData.maxStudents || '', // Handle both maxMentees and maxStudents
      status: responseData.status || '',
      consent1: responseData.consent1 || false,
      consent2: responseData.consent2 || false,
      consent3: responseData.consent3 || false,
      profilePhoto: responseData.profilePhoto || responseData.avatar || '' // Handle both profilePhoto and avatar
    }
    
    console.log('Processed profile data for state:', profileData)
    
    setProfile(profileData)
    setOriginalProfile(JSON.parse(JSON.stringify(profileData))) // Update original
    
    if (responseData?.profilePhoto || responseData?.avatar) {
      setPhotoPreview(responseData.profilePhoto || responseData.avatar)
    }
    
    setEditing(false)
    
    toast({
      title: 'Profile Updated',
      description: 'Your mentor profile has been updated successfully.',
      tone: 'success'
    })
    
    // Force a refresh of profile data after successful update
    setTimeout(async () => {
      try {
        console.log('Refreshing profile data after update...')
        const freshData = await getMyProfile()
        console.log('Fresh data after update:', freshData)
        
        if (freshData) {
          // Handle fresh data structure with proper field mapping
          const profileData = {
            ...freshData,
            // Map backend fields to frontend expected fields
            fullName: freshData.fullName || '',
            email: freshData.email || '',
            phoneNumber: freshData.phoneNumber || '',
            graduationYear: freshData.graduationYear || '',
            degree: freshData.degree || '',
            department: freshData.department || '',
            currentLocation: freshData.currentLocation || '',
            linkedinProfile: freshData.linkedin || freshData.linkedinProfile || '', // Handle both linkedin and linkedinProfile
            shortBio: freshData.shortBio || '',
            currentJobTitle: freshData.currentJobTitle || freshData.position || '', // Handle both currentJobTitle and position
            company: freshData.company || '',
            industry: freshData.industry || '',
            yearsOfExperience: freshData.yearsOfExperience || freshData.experience || '', // Handle both yearsOfExperience and experience
            bio: freshData.bio || '',
            experienceDescription: freshData.experienceDescription || '',
            mentorshipAreas: Array.isArray(freshData.mentorshipAreas) ? freshData.mentorshipAreas : [],
            expertise: Array.isArray(freshData.expertise) ? freshData.expertise : Array.isArray(freshData.skills) ? freshData.skills.split(',').map(s => s.trim()) : [], // Handle both expertise and skills
            mentorshipMode: freshData.mentorshipMode || freshData.modes || '', // Handle both mentorshipMode and modes
            availableDays: freshData.availableDays || '',
            timeCommitment: freshData.timeCommitment || freshData.weeklyHours || '', // Handle both timeCommitment and weeklyHours
            mentorshipPreference: freshData.mentorshipPreference || freshData.preferredStudents || '', // Handle both mentorshipPreference and preferredStudents
            maxMentees: freshData.maxMentees || freshData.maxStudents || '', // Handle both maxMentees and maxStudents
            status: freshData.status || '',
            consent1: freshData.consent1 || false,
            consent2: freshData.consent2 || false,
            consent3: freshData.consent3 || false,
            profilePhoto: freshData.profilePhoto || freshData.avatar || '' // Handle both profilePhoto and avatar
          }
          
          console.log('Setting refreshed profile data:', profileData)
          setProfile(profileData)
          setOriginalProfile(JSON.parse(JSON.stringify(profileData)))
        }
      } catch (refreshErr) {
        console.error('Error refreshing profile:', refreshErr)
      }
    }, 1000) // Increased delay to ensure backend has time to update
  }

  const handleCancel = () => {
    setEditing(false)
    // Reset to original profile data
    if (originalProfile) {
      setProfile(JSON.parse(JSON.stringify(originalProfile)))
    }
    // Reset photo
    setProfilePhoto(null)
    if (originalProfile?.profilePhoto) {
      setPhotoPreview(originalProfile.profilePhoto)
    } else {
      setPhotoPreview('')
    }
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
                <div>
                  <p className="text-sm text-slate-600">
                    Profile photo is fetched from your account.
                  </p>
                  <p className="text-xs text-slate-500">
                    To update, please change it from your profile settings.
                  </p>
                </div>
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
                  type="text"
                  value={profile.graduationYear || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Fetched from your profile - read-only</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Degree</label>
                <input
                  type="text"
                  value={profile.degree || ''}
                  onChange={handleChange('degree')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                <input
                  type="text"
                  value={profile.department || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Fetched from your profile - read-only</p>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea
                  value={profile.bio || ''}
                  onChange={handleChange('bio')}
                  disabled={!editing}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Tell us about your professional background and mentoring approach..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Experience Description</label>
                <textarea
                  value={profile.experienceDescription || ''}
                  onChange={handleChange('experienceDescription')}
                  disabled={!editing}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Describe your relevant experience and expertise..."
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
                <label className="block text-sm font-medium text-slate-700 mb-2">Mentorship Preference</label>
                <select
                  value={profile.mentorshipPreference || ''}
                  onChange={handleChange('mentorshipPreference')}
                  disabled={!editing}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Preference</option>
                  <option value="Students">Students</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Both">Both</option>
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
            <div className="space-y-4">
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
                  {profile.status === 'pending' && 'Your mentor profile is under review.'}
                  {profile.status === 'rejected' && 'Your mentor profile has been rejected.'}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Consent Status</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    profile.consent1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.consent1 ? '✓ Privacy Policy' : '✗ Privacy Policy'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    profile.consent2 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.consent2 ? '✓ Terms of Service' : '✗ Terms of Service'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    profile.consent3 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.consent3 ? '✓ Code of Conduct' : '✗ Code of Conduct'}
                  </span>
                </div>
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
