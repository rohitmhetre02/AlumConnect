import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get } from '../utils/api'

const MentorProfile = () => {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch mentor details
  const fetchMentorProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await get(`/api/mentors/${mentorId}`)
      const mentorData = response.data || response
      setMentor(mentorData)
      
    } catch (err) {
      setError(err.message || 'Failed to fetch mentor profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mentorId) {
      fetchMentorProfile()
    }
  }, [mentorId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <p className="text-gray-700">Mentor not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/mentorship')}
          className="mb-4 px-4- py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          ← Back to Mentorship
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <div className="flex items-start">
          <img 
            src={mentor.profilePhoto || mentor.avatar || '/default-avatar.png'} 
            alt={mentor.fullName || mentor.name}
            className="h-24 w-24 rounded-full object-cover border border-gray-200 mr-6"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mentor.fullName || mentor.name}
            </h1>
            <p className="text-lg text-gray-600 mb-1">{mentor.currentJobTitle}</p>
            <p className="text-gray-600 mb-2">{mentor.company}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>📧 {mentor.email}</span>
              <span>📱 {mentor.phoneNumber || 'Not provided'}</span>
              <span>📍 {mentor.currentLocation}</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`px-3- py-1 text-sm rounded-full ${
              mentor.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : mentor.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {mentor.status?.charAt(0).toUpperCase() + mentor.status?.slice(1) || 'Unknown'}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Joined: {new Date(mentor.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Education & Background */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Education & Background</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-gray-900">{mentor.department || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Degree</p>
              <p className="text-gray-900">{mentor.degree || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Graduation Year</p>
              <p className="text-gray-900">{mentor.graduationYear || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Industry</p>
              <p className="text-gray-900">{mentor.industry || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Experience</p>
              <p className="text-gray-900">{mentor.yearsOfExperience || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Mentorship Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mentorship Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">Mentorship Mode</p>
              <p className="text-gray-900">{mentor.mentorshipMode || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Available Days</p>
              <p className="text-gray-900">{mentor.availableDays || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Time Commitment</p>
              <p className="text-gray-900">{mentor.timeCommitment || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Max Mentees</p>
              <p className="text-gray-900">{mentor.maxMentees || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Mentorship Preference</p>
              <p className="text-gray-900">{mentor.mentorshipPreference || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Expertise & Skills */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expertise & Skills</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Mentorship Areas</p>
              <div className="flex flex-wrap gap-1">
                {mentor.mentorshipAreas?.length > 0 ? (
                  mentor.mentorshipAreas.map((area, index) => (
                    <span key={index} className="px-ki py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {area}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No areas specified</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-1">
                {mentor.expertise?.length > 0 ? (
                  mentor.expertise.map((skill, index) => (
                    <span key={index} className="pxki py-1 bg-green-100 text-green-800 text-xs rounded">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400">No expertise specified</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio & Experience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bio</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {mentor.bio || 'No bio provided'}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Experience Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {mentor.experienceDescription || mentor.experience || 'No experience description provided'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-ki font-bold text-blue-600">{mentor.rating || 'N/A'}</p>
            <p className="text-sm text-gray-500">Rating</p>
          </div>
          <div className="text-center">
            <p className="textki font-bold text-green-600">{mentor.feedbackCount || 0}</p>
            <p className="text-sm text-gray-500">Reviews</p>
          </div>
          <div className="text-center">
            <p className="textki font-bold text-purple-600">0</p>
            <p className="text-sm text-gray-500">Sessions</p>
          </div>
          <div className="text-center">
            <p className="textki font-bold text-orange-600">{mentor.maxMentees || 'N/A'}</p>
            <p className="text-sm text-gray-500">Max Mentees</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorProfile
