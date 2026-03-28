import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMentors } from '../../hooks/useMentors'
import { get } from '../../utils/api'
import MentorCard from '../../components/user/mentorship/MentorCard'
import MentorRecommendations from '../../components/mentorship/MentorRecommendations'
import MentorPreferences from '../../components/mentorship/MentorPreferences'

const Mentorship = () => {

  const navigate = useNavigate()
  const { user } = useAuth()
  const { items: mentors, loading } = useMentors()

  const [preferences, setPreferences] = useState({
    careerInterest: '',
    skills: [],
    preferredIndustry: '',
    preferredExperience: ''
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department: 'all',
    industry: 'all',
    experience: 'all'
  })

  const [remainingMentors, setRemainingMentors] = useState([])
  const [mentorRatings, setMentorRatings] = useState({})

  // Fetch mentor ratings from reviews
  const fetchMentorRatings = async () => {
    if (!mentors?.length) return
    
    const ratings = {}
    for (const mentor of mentors) {
      try {
        const mentorId = mentor._id || mentor.id || mentor.mentorId
        if (mentorId) {
          const response = await get(`/api/mentors/${mentorId}/reviews`)
          const reviews = Array.isArray(response) ? response : (response.data || [])
          if (reviews.length > 0) {
            const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            ratings[mentorId] = parseFloat(averageRating.toFixed(1))
          }
        }
      } catch (error) {
        console.log('Failed to fetch rating for mentor:', mentorId, error)
      }
    }
    setMentorRatings(ratings)
  }

  useEffect(() => {
    fetchMentorRatings()
  }, [mentors])

  const handlePreferencesChange = (newPreferences) => {
    setPreferences(newPreferences)

    setFilters({
      department: 'all',
      industry: newPreferences.preferredIndustry || 'all',
      experience: newPreferences.preferredExperience || 'all'
    })

    setSearchTerm(newPreferences.skills.join(' ') || '')
  }

  const handleFilteredMentorsUpdate = (filteredMentors) => {
    setRemainingMentors(filteredMentors)
  }

  const filteredMentors = useMemo(() => {

    if (!mentors?.length) return []

    return mentors.filter(mentor => {

      const matchesSearch =
        !searchTerm ||
        mentor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.company?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesDepartment =
        filters.department === 'all' ||
        mentor.department?.toLowerCase() === filters.department.toLowerCase()

      const matchesIndustry =
        filters.industry === 'all' ||
        mentor.industry?.toLowerCase() === filters.industry.toLowerCase()

      return matchesSearch && matchesDepartment && matchesIndustry

    })

  }, [mentors, searchTerm, filters])


  const browseAllMentors = useMemo(() => {

    const preferencesFilled =
      preferences.careerInterest ||
      preferences.skills.length > 0 ||
      preferences.preferredIndustry ||
      preferences.preferredExperience

    if (!preferencesFilled) {
      return filteredMentors
    }

    if (remainingMentors.length > 0) {
      return remainingMentors
    }

    return filteredMentors

  }, [filteredMentors, remainingMentors, preferences])


  return (

    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
            Find Your Mentor
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Connect with experienced alumni who can guide your career journey.
          </p>
        </div>

        {/* Mobile-first layout: Sidebar on top on mobile, side on desktop */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          <div className="flex-1 space-y-8 lg:space-y-12">

            <MentorRecommendations
              preferences={preferences}
              onFilteredMentorsUpdate={handleFilteredMentorsUpdate}
            />

            <div id="browse-all-mentors">

              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                Browse All Mentors
              </h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading mentors...</p>
                  </div>
                </div>
              ) : (

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

                  {browseAllMentors.map(mentor => {
                    const mentorId = mentor._id || mentor.id || mentor.mentorId
                    const currentRating = mentorRatings[mentorId] || mentor.rating || 0
                    
                    return (
                    <MentorCard
                      key={mentorId || mentor.fullName}
                      mentor={{
                        name: mentor.fullName,
                        position: mentor.currentJobTitle,
                        avatar: mentor.profilePhoto ? 
                          (mentor.profilePhoto.startsWith('http') ? 
                            mentor.profilePhoto : 
                            `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${mentor.profilePhoto}`) : 
                          null,
                        company: mentor.company,
                        department: mentor.department,
                        location: mentor.currentLocation,
                        rating: currentRating,
                        areas: mentor.mentorshipAreas,
                        mode: mentor.mentorshipMode,
                        available: mentor.availableDays
                      }}
                      onRequestMentorship={() => {
                        navigate(`/dashboard/mentorship/request/${mentorId}`)
                      }}
                      onViewProfile={() => {
                        navigate(`/dashboard/mentors/${mentorId}`)
                      }}
                    />
                  )
                  })}

                </div>

              )}

            </div>

          </div>

          {/* Sidebar - full width on mobile, fixed width on desktop */}
          <div className="lg:w-80 xl:w-96">
            <div className="lg:sticky lg:top-6">
              <MentorPreferences
                onPreferencesChange={handlePreferencesChange}
              />
            </div>
          </div>

        </div>

      </div>

    </div>
  )
}

export default Mentorship