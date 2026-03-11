import { useState, useEffect } from 'react'
import { get } from '../../utils/api'
import useToast from '../../hooks/useToast'

const MentorRecommendations = ({ preferences, onPreferencesChange }) => {
  const [recommendedMentors, setRecommendedMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()

  // Fetch recommendations when component mounts or preferences change
  useEffect(() => {
    if (preferences && (preferences.careerInterest || preferences.skills.length > 0)) {
      fetchRecommendations()
    } else {
      setRecommendedMentors([])
    }
  }, [preferences])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await get('/students/recommendations')
      setRecommendedMentors(response.mentors || [])
    } catch (err) {
      console.error('Error fetching recommendations:', err)
      setError(err.message || 'Failed to fetch recommendations')
      toast({
        title: 'Error',
        description: 'Failed to load mentor recommendations',
        tone: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100'
    if (percentage >= 60) return 'text-blue-600 bg-blue-100'
    if (percentage >= 40) return 'text-amber-600 bg-amber-100'
    return 'text-slate-600 bg-slate-100'
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-slate-200 rounded-lg p-4">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center py-8">
          <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Unable to Load Recommendations</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!preferences || (!preferences.careerInterest && preferences.skills.length === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center py-8">
          <svg className="h-12 w-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Set Your Preferences</h3>
          <p className="text-slate-600">Tell us about your career interests and skills to get personalized mentor recommendations.</p>
        </div>
      </div>
    )
  }

  if (recommendedMentors.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="text-center py-8">
          <svg className="h-12 w-12 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No Mentors Found</h3>
          <p className="text-slate-600">We couldn't find any mentors matching your preferences. Try adjusting your criteria.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
          AI Recommended Mentors
        </h2>
        <p className="text-slate-600 mt-2">Personalized recommendations based on your profile and preferences</p>
      </div>

      <div className="space-y-4">
        {recommendedMentors.map((mentor, index) => (
          <div key={mentor.mentorId} className="border border-slate-200 rounded-lg p-6 hover:border-purple-300 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Mentor Photo */}
                <div className="relative">
                  {mentor.profilePhoto ? (
                    <img
                      src={mentor.profilePhoto}
                      alt={mentor.fullName}
                      className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                      {mentor.fullName?.charAt(0) || 'M'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Mentor Info */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{mentor.fullName}</h3>
                  <p className="text-slate-600">{mentor.currentJobTitle}</p>
                  <p className="text-sm text-slate-500">{mentor.company} • {mentor.industry}</p>
                </div>
              </div>

              {/* Match Percentage */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(mentor.matchPercentage)}`}>
                {mentor.matchPercentage}% Match
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise?.slice(0, 5).map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {mentor.expertise?.length > 5 && (
                  <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full">
                    +{mentor.expertise.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Recommendation Reasons */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Recommended because:</h4>
              <div className="space-y-1">
                {mentor.recommendationReasons?.map((reason, reasonIndex) => (
                  <div key={reasonIndex} className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Navigate to mentor profile or connect
                  window.location.href = `/dashboard/mentorship/mentor/${mentor.mentorId}`
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  // Open mentorship request modal
                  window.location.href = `/dashboard/mentorship/request/${mentor.mentorId}`
                }}
                className="flex-1 px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                Request Mentorship
              </button>
            </div>
          </div>
        ))}
      </div>

      {recommendedMentors.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={fetchRecommendations}
            className="text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            Refresh Recommendations
          </button>
        </div>
      )}
    </div>
  )
}

export default MentorRecommendations
