import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { post } from '../../utils/api'
import useToast from '../../hooks/useToast'

const BecomeMentor = () => {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  const [formData, setFormData] = useState({
    // Step 1: Basic Profile Details
    fullName: '',
    email: '',
    phoneNumber: '',
    graduationYear: '',
    degree: '',
    department: '',
    currentLocation: '',
    
    // Step 2: Professional & Mentorship Details
    currentJobTitle: '',
    company: '',
    industry: '',
    mentorshipAreas: [],
    expertise: [],
    
    // Step 3: Availability & Consent
    mentorshipMode: '',
    availableDays: '',
    timeCommitment: '',
    mentorshipPreference: '',
    maxMentees: '',
    consent1: false,
    consent2: false,
    consent3: false
  })

  // Industry options as per requirements
  const industryOptions = [
    'IT / Software',
    'Core Engineering',
    'Management',
    'Government',
    'Startup',
    'Research / Academia',
    'Other'
  ]

  // Mentorship areas as per requirements
  const mentorshipAreaOptions = [
    'Career Guidance',
    'Resume Review',
    'Interview Preparation',
    'Higher Studies Guidance',
    'Startup / Entrepreneurship',
    'Technical Mentorship',
    'Leadership & Soft Skills'
  ]

  // Department options
  const departmentOptions = [
    'Computer Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Telecommunication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Other'
  ]

  // Degree/Program options
  const degreeOptions = [
    'B.E. Computer Engineering',
    'B.E. Information Technology',
    'B.E. Electronics & Telecommunication',
    'B.E. Mechanical Engineering',
    'B.E. Civil Engineering',
    'B.Tech Computer Engineering',
    'B.Tech Information Technology',
    'M.E. Computer Engineering',
    'M.E. Information Technology',
    'M.Tech Computer Engineering',
    'MCA',
    'Other'
  ]

  const steps = [
    { 
      title: 'Basic Profile Details', 
      description: 'Identify the mentor clearly' 
    },
    { 
      title: 'Professional & Mentorship Details', 
      description: 'Understand what help the mentor can offer' 
    },
    { 
      title: 'Availability & Consent', 
      description: 'Set expectations clearly' 
    }
  ]

  // Pre-fill form with user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim(),
        email: user.email || '',
        phoneNumber: user.profile?.phone || '',
        graduationYear: user.profile?.graduationYear || '',
        department: user.profile?.department || '',
        currentLocation: user.profile?.location || ''
      }))
    }
  }, [user])

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMentorshipAreaToggle = (area) => {
    setFormData(prev => ({
      ...prev,
      mentorshipAreas: prev.mentorshipAreas.includes(area)
        ? prev.mentorshipAreas.filter(a => a !== area)
        : [...prev.mentorshipAreas, area]
    }))
  }

  const handleSkillAdd = () => {
    if (skillInput.trim() && skills.length < 10) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const handleSkillRemove = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove))
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (2MB max)
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

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!formData.fullName.trim()) return 'Full name is required'
        if (!formData.email.trim()) return 'Email is required'
        if (!formData.graduationYear.trim()) return 'Graduation year is required'
        if (!formData.department.trim()) return 'Department is required'
        return null
        
      case 1:
        if (!formData.currentJobTitle.trim()) return 'Current job title is required'
        if (!formData.company.trim()) return 'Company is required'
        if (!formData.industry.trim()) return 'Industry is required'
        if (formData.mentorshipAreas.length === 0) return 'At least one mentorship area is required'
        if (skills.length === 0) return 'At least one skill is required'
        return null
        
      case 2:
        if (!formData.mentorshipMode.trim()) return 'Preferred mentorship mode is required'
        if (!formData.availableDays.trim()) return 'Available days selection is required'
        if (!formData.timeCommitment.trim()) return 'Time commitment is required'
        if (!formData.mentorshipPreference.trim()) return 'Mentorship preference is required'
        if (!formData.maxMentees.trim()) return 'Maximum mentees is required'
        if (!formData.consent1 || !formData.consent2 || !formData.consent3) {
          return 'All consent checkboxes must be checked'
        }
        return null
        
      default:
        return null
    }
  }

  const nextStep = () => {
    const validationError = validateStep()
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        tone: 'error'
      })
      return
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const validationError = validateStep()
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        tone: 'error'
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Create form data for file upload
      const submitData = new FormData()
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key.startsWith('consent')) {
          submitData.append(key, formData[key] ? 'true' : 'false')
        } else {
          submitData.append(key, formData[key])
        }
      })
      
      // Add arrays
      submitData.append('mentorshipAreas', JSON.stringify(formData.mentorshipAreas))
      submitData.append('expertise', JSON.stringify(skills))
      
      // Add profile photo if exists
      if (profilePhoto) {
        submitData.append('profilePhoto', profilePhoto)
      }

      const response = await post('/mentors/applications', submitData)

      if (response.success) {
        // Update user context to mark as mentor
        updateUser({
          isMentor: true,
          profile: {
            ...(user?.profile || {}),
            isMentor: true
          }
        })

        toast({
          title: 'Registration Successful!',
          description: 'You have been successfully registered as a mentor.',
          tone: 'success'
        })

        // Navigate to mentor dashboard
        setTimeout(() => {
          navigate('/user/mentorship/dashboard')
        }, 2000)
      } else {
        throw new Error(response.message || 'Failed to register as mentor')
      }
    } catch (error) {
      console.error('Mentor registration error:', error)
      toast({
        title: 'Registration Failed',
        description: error.message || 'Failed to register as mentor. Please try again.',
        tone: 'error'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">🔹 STEP 1: Basic Profile Details</h3>
              <p className="text-sm text-slate-600">👉 Purpose: Identify the mentor clearly.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={handleInputChange('fullName')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email ID *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 bg-slate-50"
                  placeholder="john.doe@example.com"
                  readOnly
                  required
                />
                <p className="text-xs text-slate-500 mt-1">Auto-filled, read-only</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleInputChange('phoneNumber')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+91 98765 43210"
                />
                <p className="text-xs text-slate-500 mt-1">Optional, hidden from students</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Graduation Year *</label>
                <input
                  type="text"
                  value={formData.graduationYear}
                  onChange={handleInputChange('graduationYear')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="2020"
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Degree / Program *</label>
                <select
                  value={formData.degree}
                  onChange={handleInputChange('degree')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Degree</option>
                  {degreeOptions.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Department *</label>
                <select
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Current Location (City, Country) *</label>
              <input
                type="text"
                value={formData.currentLocation}
                onChange={handleInputChange('currentLocation')}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Pune, India"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Photo</label>
              <div className="flex items-center space-x-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center">
                    <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-slate-500 mt-1">Optional but recommended • Max size: 2MB</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">🔹 STEP 2: Professional & Mentorship Details</h3>
              <p className="text-sm text-slate-600">👉 Purpose: Understand what help the mentor can offer.</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-slate-800">🧑‍💼 Professional Information</h4>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Job Title *</label>
                  <input
                    type="text"
                    value={formData.currentJobTitle}
                    onChange={handleInputChange('currentJobTitle')}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Senior Software Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Company / Organization *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange('company')}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Tech Corp"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Industry *</label>
                <select
                  value={formData.industry}
                  onChange={handleInputChange('industry')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Industry</option>
                  {industryOptions.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-slate-800">🎯 Mentorship Areas (Multi-select)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {mentorshipAreaOptions.map(area => {
                  const isSelected = formData.mentorshipAreas.includes(area)
                  return (
                    <button
                      key={area}
                      type="button"
                      onClick={() => handleMentorshipAreaToggle(area)}
                      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isSelected 
                          ? 'bg-blue-500 text-white' 
                          : 'border border-slate-300 text-slate-600 hover:border-blue-500 hover:text-blue-500'
                      }`}
                    >
                      {area}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-slate-800">🧠 Skills / Expertise</h4>
              <p className="text-xs text-slate-600">Tags input – max 10 (Example: Java, Python, React, Data Structures, Product Management)</p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleSkillAdd())}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Add a skill..."
                  disabled={skills.length >= 10}
                />
                <button
                  type="button"
                  onClick={handleSkillAdd}
                  disabled={skills.length >= 10}
                  className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillRemove(skill)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {skills.length >= 10 && (
                <p className="text-xs text-amber-600">Maximum 10 skills reached</p>
              )}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">🔹 STEP 3: Availability & Consent</h3>
              <p className="text-sm text-slate-600">👉 Purpose: Set expectations clearly.</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-slate-800">⏰ Availability</h4>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Mentorship Mode *</label>
                <select
                  value={formData.mentorshipMode}
                  onChange={handleInputChange('mentorshipMode')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Mode</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Available Days *</label>
                <select
                  value={formData.availableDays}
                  onChange={handleInputChange('availableDays')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Days</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Time Commitment *</label>
                <select
                  value={formData.timeCommitment}
                  onChange={handleInputChange('timeCommitment')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Commitment</option>
                  <option value="1-2">1–2 hours / month</option>
                  <option value="3-5">3–5 hours / month</option>
                  <option value="on-demand">On demand</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-slate-800">👥 Mentorship Preference</h4>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Who can connect *</label>
                <select
                  value={formData.mentorshipPreference}
                  onChange={handleInputChange('mentorshipPreference')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Preference</option>
                  <option value="students">Students</option>
                  <option value="alumni">Alumni</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Max Mentees at a time *</label>
                <select
                  value={formData.maxMentees}
                  onChange={handleInputChange('maxMentees')}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                >
                  <option value="">Select Number</option>
                  <option value="1">1</option>
                  <option value="3">3</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-md font-semibold text-slate-800">✅ Consent & Agreement</h4>
              
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consent1}
                    onChange={handleInputChange('consent1')}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="ml-3 text-sm text-slate-700">
                    I agree to be listed as a mentor on the alumni portal
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consent2}
                    onChange={handleInputChange('consent2')}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="ml-3 text-sm text-slate-700">
                    I understand that my profile will be visible to registered users
                  </span>
                </label>

                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={formData.consent3}
                    onChange={handleInputChange('consent3')}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    required
                  />
                  <span className="ml-3 text-sm text-slate-700">
                    I agree to follow mentorship guidelines
                  </span>
                </label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Mentors Registration – 3-Step Form</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Keep it short, clean, and useful. Don't overload Step-1.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentStep >= index 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 transition-colors ${
                    currentStep > index ? 'bg-blue-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-lg font-semibold text-slate-900">{steps[currentStep].title}</h2>
            <p className="text-sm text-slate-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <form onSubmit={handleSubmit}>
            {renderStepContent()}
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Registering...' : '👉 Register as Mentor'}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Questions about becoming a mentor? <a href="#" className="text-blue-600 hover:text-blue-700 underline">Contact our team</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default BecomeMentor
