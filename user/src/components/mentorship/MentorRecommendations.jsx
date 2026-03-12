import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../utils/api'
import useToast from '../../hooks/useToast'

const MentorRecommendations = ({ preferences, onPreferencesChange, onFilteredMentorsUpdate }) => {
  const [recommendedMentors, setRecommendedMentors] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const toast = useToast()
  const navigate = useNavigate()

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
      const allMentors = response.mentors || []
      
      // Filter mentors with 75% or higher match score
      const highMatchMentors = allMentors.filter(mentor => {
        const matchScore = mentor.matchPercentage || 0
        console.log(`Mentor ${mentor.fullName}: Match Score ${matchScore}%`)
        return matchScore >= 75
      })
      
      // Get mentors filtered out (below 75% match)
      const filteredOutMentors = allMentors.filter(mentor => {
        const matchScore = mentor.matchPercentage || 0
        return matchScore < 75
      })
      
      console.log(`Total mentors: ${allMentors.length}, High match mentors (75%+): ${highMatchMentors.length}, Filtered out: ${filteredOutMentors.length}`)
      
      setRecommendedMentors(highMatchMentors)
      
      // Pass filtered-out mentors to parent component
      if (onFilteredMentorsUpdate && filteredOutMentors.length > 0) {
        // Convert to format expected by MentorCard component
        const formattedMentors = filteredOutMentors.map(mentor => ({
          id: mentor.mentorId || mentor.id || mentor._id,
          fullName: mentor.fullName,
          currentJobTitle: mentor.currentJobTitle,
          company: mentor.company,
          industry: mentor.industry,
          department: mentor.department,
          experience: mentor.experience,
          profilePhoto: mentor.profilePhoto,
          rating: mentor.rating || 0,
          expertise: mentor.expertise || [],
          matchPercentage: mentor.matchPercentage // Keep match score for display
        }))
        
        onFilteredMentorsUpdate(formattedMentors)
        console.log('Passed filtered-out mentors to parent:', formattedMentors.map(m => `${m.fullName} (${m.matchPercentage}%)`))
      }
      
      // Log mentors that were filtered out (for debugging)
      if (filteredOutMentors.length > 0) {
        console.log('Mentors filtered out (below 75% match):', filteredOutMentors.map(m => `${m.fullName} (${m.matchPercentage}%)`))
      }
      
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
          <h3 className="text-lg font-medium text-slate-900 mb-2">No High-Match Mentors Found</h3>
          <p className="text-slate-600">No mentors found with 75% or higher compatibility score. Try adjusting your preferences or browse all mentors below.</p>
          <button
            onClick={() => {
              // Scroll to Browse All Mentors section
              const browseSection = document.getElementById('browse-all-mentors')
              if (browseSection) {
                browseSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Mentors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
          AI Recommended Mentors (75%+ Match)
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
                      src={`http://localhost:5000${mentor.profilePhoto}`}
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

              {/* Match Percentage & AI Similarity */}
              <div className="flex items-center justify-between mb-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(mentor.matchPercentage)}`}>
                  {mentor.matchPercentage}% Match
                </div>
                <div className="flex items-center gap-2">
                  {mentor.tfidfSimilarity > 0.1 && (
                    <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      AI Match {Math.round(mentor.tfidfSimilarity * 100)}%
                    </div>
                  )}
                  {mentor.rating > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {mentor.rating.toFixed(1)}
                    </div>
                  )}
                </div>
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
              <div className="space-y-2">
                {mentor.recommendationReasons?.map((reason, reasonIndex) => {
                  let iconColor = 'text-green-500'
                  let icon = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  
                  // Customize icons based on reason type
                  if (reason.includes('skill')) {
                    iconColor = 'text-blue-500'
                    icon = 'M13 10V3L4 14h7v7l9-11h-7z'
                  } else if (reason.includes('department')) {
                    iconColor = 'text-purple-500'
                    icon = 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  } else if (reason.includes('rating')) {
                    iconColor = 'text-amber-500'
                    icon = 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
                  } else if (reason.includes('similarity')) {
                    iconColor = 'text-purple-500'
                    icon = 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                  }
                  
                  return (
                    <div key={reasonIndex} className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className={`h-4 w-4 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={icon} clipRule="evenodd" />
                      </svg>
                      <span>{reason}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Navigate to mentor profile using the correct mentor ID
                  const mentorId = mentor.mentorId || mentor.id || mentor._id
                  console.log('Navigating to mentor profile:', mentorId)
                  navigate(`/dashboard/mentors/${mentorId}`)
                }}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  // Open mentorship request modal using correct mentor ID
                  const mentorId = mentor.mentorId || mentor.id || mentor._id
                  navigate(`/dashboard/mentors/${mentorId}`)
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
