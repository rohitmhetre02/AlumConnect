import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useMentors } from '../../hooks/useMentors'
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

      <div className="max-w-7xl mx-auto px-4 py-10">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Find Your Mentor
          </h1>

          <p className="text-lg text-slate-600">
            Connect with experienced alumni who can guide your career journey.
          </p>
        </div>

        <div className="flex gap-10">

          <div className="flex-1 space-y-12">

            <MentorRecommendations
              preferences={preferences}
              onFilteredMentorsUpdate={handleFilteredMentorsUpdate}
            />

            <div id="browse-all-mentors">

              <h2 className="text-2xl font-bold mb-6">
                Browse All Mentors
              </h2>

              {loading ? (
                <p>Loading mentors...</p>
              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                  {browseAllMentors.map(mentor => (

                    <MentorCard
                      key={mentor._id}
                      mentor={{
                        name: mentor.fullName,
                        position: mentor.currentJobTitle,
                        avatar: mentor.profilePhoto
                          ? `http://localhost:5000${mentor.profilePhoto.startsWith('/') ? mentor.profilePhoto : '/' + mentor.profilePhoto}`
                          : `https://ui-avatars.com/api/?name=${encodeURIComponent(mentor.fullName)}&background=3b82f6&color=fff&size=200`,
                        rating: mentor.rating || 0
                      }}
                      onViewProfile={() => {
                        const mentorId = mentor.mentorId || mentor.id || mentor._id
                        navigate(`/dashboard/mentors/${mentorId}`)
                      }}
                    />

                  ))}

                </div>

              )}

            </div>

          </div>

          <div className="w-80">
            <MentorPreferences
              onPreferencesChange={handlePreferencesChange}
            />
          </div>

        </div>

      </div>

    </div>
  )
}

export default Mentorship