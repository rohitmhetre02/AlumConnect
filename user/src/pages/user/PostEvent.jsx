import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useEvents, { EVENT_MODES } from '../../hooks/useEvents'
import { useAuth } from '../../context/AuthContext'

const DEFAULT_FORM_STATE = {
  title: '',
  description: '',
  startDate: '',
  startTime: '',
  location: '',
  coverImage: '',
  mode: 'in-person',
  registrationLink: '',
  organization: '',
  department: '',
  branch: '',
}

const buildISODateTime = (date, time) => {
  if (!date) return ''
  const normalizedTime = time && time.trim() !== '' ? time : '00:00'
  const iso = new Date(`${date}T${normalizedTime}`)
  return Number.isNaN(iso.getTime()) ? '' : iso.toISOString()
}

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

const PostEvent = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createEvent } = useEvents()

  const [form, setForm] = useState(DEFAULT_FORM_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Check if user is authenticated and has proper role
  if (!user) {
    alert('Please log in to create an event.')
    navigate('/login')
    return null
  }

  const allowedRoles = ['alumni', 'faculty']
  if (!allowedRoles.includes(user.role?.toLowerCase())) {
    alert('Only alumni and faculty can create events.')
    navigate('/dashboard/events')
    return null
  }

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Business Administration',
    'Physics',
    'Chemistry',
    'Mathematics',
    'English'
  ]

  const branches = {
    'Computer Science': ['AI & ML', 'Data Science', 'Software Engineering', 'Cybersecurity', 'Web Development'],
    'Electrical Engineering': ['Power Systems', 'Electronics', 'Communication', 'Control Systems', 'VLSI'],
    'Mechanical Engineering': ['Automotive', 'Aerospace', 'Thermal', 'Design', 'Manufacturing'],
    'Civil Engineering': ['Structural', 'Transportation', 'Environmental', 'Geotechnical', 'Water Resources'],
    'Chemical Engineering': ['Petrochemical', 'Pharmaceutical', 'Food Technology', 'Polymer', 'Environmental'],
    'Business Administration': ['Finance', 'Marketing', 'HR', 'Operations', 'International Business'],
    'Physics': ['Quantum Physics', 'Astrophysics', 'Nuclear Physics', 'Condensed Matter', 'Optics'],
    'Chemistry': ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry'],
    'Mathematics': ['Pure Math', 'Applied Math', 'Statistics', 'Computational', 'Discrete'],
    'English': ['Literature', 'Linguistics', 'Creative Writing', 'Communication', 'Journalism']
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Please upload an image smaller than 5MB.')
      return
    }

    setUploadingImage(true)
    
    try {
      // Create a preview URL for now (in production, you'd upload to a service like Cloudinary)
      const previewUrl = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, coverImage: previewUrl }))
      
      alert('Event banner image has been uploaded successfully.')
    } catch (error) {
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const resetForm = () => {
    setForm(DEFAULT_FORM_STATE)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const startAtISO = buildISODateTime(form.startDate, form.startTime)
    if (!startAtISO) {
      alert('Please select a valid start date and time.')
      return
    }

    // Validate organization
    if (!form.organization) {
      alert('Please select an organization type.')
      return
    }

    // Validate department for department organization
    if (form.organization === 'department' && !form.department) {
      alert('Please select a department when organization is department.')
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Submitting event data:', {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        coverImage: form.coverImage.trim(),
        startAt: startAtISO,
        mode: form.mode,
        registrationLink: form.registrationLink.trim(),
        organization: form.organization,
        department: form.department.trim(),
        branch: form.branch.trim(),
      })
      
      const result = await createEvent({
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        coverImage: form.coverImage.trim(),
        startAt: startAtISO,
        mode: form.mode,
        registrationLink: form.registrationLink.trim(),
        organization: form.organization,
        department: form.department.trim(),
        branch: form.branch.trim(),
      })
      
      console.log('Event created successfully:', result)
      alert('Your event has been successfully published.')
      navigate('/dashboard/events')
    } catch (createError) {
      console.error('Failed to publish event:', createError)
      alert(`Failed to publish event: ${createError.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard/events')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Event</h1>
          <p className="text-slate-600">Share an upcoming event with the alumni community</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Banner Image */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Event Banner</h2>
              <div className="space-y-3">
                {/* Image Preview */}
                {form.coverImage && (
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                      src={form.coverImage} 
                      alt="Event banner preview" 
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, coverImage: '' }))}
                      className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-slate-600 hover:bg-white hover:text-red-500 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* Upload Button */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-center w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-primary hover:bg-primary/5">
                    <div className="space-y-2">
                      <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <div className="text-sm text-slate-600">
                        {uploadingImage ? 'Uploading...' : 'Click to upload or drag and drop'}
                      </div>
                      <div className="text-xs text-slate-500">
                        PNG, JPG, GIF up to 5MB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="Annual Alumni Meetup 2024"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={handleChange('location')}
                    placeholder="Grand Hall, City Center"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Event Format *
                  </label>
                  <div className="relative">
                    <select
                      value={form.mode}
                      onChange={handleChange('mode')}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {EVENT_MODES.map((value) => (
                        <option key={value} value={value}>
                          {capitalize(value)}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Date and Time</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={handleChange('startDate')}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={handleChange('startTime')}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Organization */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Organization</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Organization Type *
                  </label>
                  <div className="relative">
                    <select
                      value={form.organization}
                      onChange={(e) => {
                        setForm((prev) => ({ 
                          ...prev, 
                          organization: e.target.value,
                          department: '',
                          branch: ''
                        }))
                      }}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    >
                      <option value="">Select Organization</option>
                      <option value="alumni">Alumni Community</option>
                      <option value="college">College</option>
                      <option value="department">Department</option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {form.organization === 'department' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Department *
                    </label>
                    <div className="relative">
                      <select
                        value={form.department}
                        onChange={(e) => {
                          setForm((prev) => ({ 
                            ...prev, 
                            department: e.target.value,
                            branch: ''
                          }))
                        }}
                        className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                )}

                {form.organization === 'department' && form.department && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Branch *
                    </label>
                    <div className="relative">
                      <select
                        value={form.branch}
                        onChange={handleChange('branch')}
                        className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                        required
                      >
                        <option value="">Select Branch</option>
                        {branches[form.department]?.map((branch) => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Event Description *
              </label>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Share what attendees can expect, key speakers, agenda, and why this event is impactful."
                rows={6}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Registration Options */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Registration Options</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    External Registration Link
                  </label>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={form.registrationLink}
                      onChange={handleChange('registrationLink')}
                      placeholder="https://example.com/register"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <p className="text-xs text-slate-500">
                      If provided, users will be redirected to this link when they click "Register". 
                      If left empty, users will see a registration popup form to fill out directly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  navigate('/dashboard/events')
                }}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PostEvent
