import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { get } from '../utils/api'
import useToast from '../hooks/useToast'
import getStatusBadgeClass from '../utils/status'

const MentorDetails = () => {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const [mentor, setMentor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        setIsLoading(true)
        const response = await get(`/mentors/${mentorId}`)
        if (response.mentor || response.fullName) {
          setMentor(response.mentor || response)
        } else {
          setError('Failed to load mentor details')
        }
      } catch (err) {
        setError(err.message || 'Failed to load mentor details')
      } finally {
        setIsLoading(false)
      }
    }

    if (mentorId) {
      fetchMentorDetails()
    }
  }, [mentorId])

  const handleEdit = () => {
    navigate(`/admin/mentorship/${mentorId}/edit`)
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      try {
        // Add delete API call here
        addToast({ type: 'success', message: 'Mentor deleted successfully' })
        navigate('/admin/mentorship')
      } catch (err) {
        addToast({ type: 'error', message: 'Failed to delete mentor' })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading mentor details...</p>
        </div>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Mentor not found'}</p>
          <Link 
            to="/admin/mentorship"
            className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Back to Mentorship Hub
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/mentorship')}
                className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-slate-900">Mentor Details</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleEdit}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Edit Mentor
              </button>
              <button
                onClick={handleDelete}
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              {/* Profile Image */}
              <div className="text-center">
                {mentor.profilePhoto || mentor.avatar ? (
                  <img
                    src={mentor.profilePhoto || mentor.avatar}
                    alt={mentor.fullName}
                    className="w-24 h-24 rounded-full mx-auto border-4 border-slate-100 object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-2xl">
                    {(mentor.fullName || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="mt-4">
                  <h2 className="text-xl font-bold text-slate-900">{mentor.fullName}</h2>
                  <p className="text-sm text-slate-600 mt-1">{mentor.currentJobTitle}</p>
                  {mentor.company && (
                    <p className="text-sm text-slate-500">{mentor.company}</p>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass(mentor.status)}`}>
                      {mentor.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 4H8m8-8H8m12-2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h10l4 4z" />
                    </svg>
                    <a href={`mailto:${mentor.email}`} className="text-sm text-primary hover:underline">
                      {mentor.email}
                    </a>
                  </div>
                  {mentor.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h2l3 7-1.34 2.68A1 1 0 007.58 16H19" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 18a2 2 0 104 0 2 2 0 00-4 0zM7 18a2 2 0 104 0 2 2 0 00-4 0z" />
                      </svg>
                      <span className="text-sm text-slate-600">{mentor.phoneNumber}</span>
                    </div>
                  )}
                  {mentor.currentLocation && (
                    <div className="flex items-center gap-3">
                      <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 1118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-sm text-slate-600">{mentor.currentLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-primary">{mentor.maxMentees || mentor.maxStudents || 0}</div>
                    <div className="text-xs text-slate-600">Max Mentees</div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className="text-2xl font-bold text-amber-500">{mentor.rating || 0}</div>
                    <div className="text-xs text-slate-600">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">About</h3>
              <p className="text-slate-600 leading-relaxed">
                {mentor.bio || mentor.description || 'No bio available.'}
              </p>
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Professional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <p className="text-slate-600">{mentor.department || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Job Role</label>
                  <p className="text-slate-600">{mentor.currentJobTitle || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Company</label>
                  <p className="text-slate-600">{mentor.company || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Industry</label>
                  <p className="text-slate-600">{mentor.industry || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Graduation Year</label>
                  <p className="text-slate-600">{mentor.graduationYear || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Degree</label>
                  <p className="text-slate-600">{mentor.degree || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Experience</label>
                  <p className="text-slate-600">{mentor.experience || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Availability</label>
                  <p className="text-slate-600">{mentor.availability || '—'}</p>
                </div>
              </div>
            </div>

            {/* Expertise */}
            {mentor.expertise && mentor.expertise.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, index) => (
                    <span key={index} className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            {mentor.services && mentor.services.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Services Offered</h3>
                <ul className="space-y-2">
                  {mentor.services.map((service, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-600">
                      <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {service.title || service}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Weekly Hours</label>
                  <p className="text-slate-600">{mentor.weeklyHours || mentor.timeCommitment || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Max Students</label>
                  <p className="text-slate-600">{mentor.maxMentees || mentor.maxStudents || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Available Days</label>
                  <p className="text-slate-600">{mentor.availableDays || '—'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Mentorship Mode</label>
                  <p className="text-slate-600">{mentor.mentorshipMode || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorDetails
