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
  const { items: mentors, loading, error } = useMentors()
  
  // Student preferences state
  const [preferences, setPreferences] = useState({
    careerInterest: '',
    skills: [],
    preferredIndustry: '',
    preferredExperience: ''
  })
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department: 'all',
    industry: 'all',
    experience: 'all'
  })

  // Handle preferences change from MentorPreferences component
  const handlePreferencesChange = (newPreferences) => {
    setPreferences(newPreferences)
    // Apply preferences to filters
    setFilters({
      department: 'all',
      industry: newPreferences.preferredIndustry || 'all',
      experience: newPreferences.preferredExperience || 'all'
    })
    setSearchTerm(newPreferences.skills.join(' ') || '')
  }

  // Filter mentors based on search and filters
  const filteredMentors = useMemo(() => {
    if (!mentors?.length) return []
    
    return mentors.filter(mentor => {
      // Search filter
      const matchesSearch = !searchTerm || 
        mentor.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.currentJobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentor.expertise?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // Department filter
      const matchesDepartment = filters.department === 'all' || 
        mentor.department?.toLowerCase() === filters.department.toLowerCase()
      
      // Industry filter
      const matchesIndustry = filters.industry === 'all' ||
        mentor.industry?.toLowerCase() === filters.industry.toLowerCase()
      
      // Experience filter
      const matchesExperience = filters.experience === 'all' ||
        (filters.experience === '0-3' && parseInt(mentor.experience) <= 3) ||
        (filters.experience === '4-7' && parseInt(mentor.experience) >= 4 && parseInt(mentor.experience) <= 7) ||
        (filters.experience === '8+' && parseInt(mentor.experience) >= 8)
      
      return matchesSearch && matchesDepartment && matchesIndustry && matchesExperience
    })
  }, [mentors, searchTerm, filters])

  const handleFilterChange = (field) => (e) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Find Your Mentor</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Connect with experienced alumni who can guide your career journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area - Left Side */}
          <div className="flex-1 space-y-8">
            
            {/* AI Recommended Mentors Card */}
            <MentorRecommendations 
              preferences={preferences} 
              onPreferencesChange={handlePreferencesChange}
            />

            {/* Quick Stats Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-8 bg-green-600 rounded-full"></span>
                  Mentorship Program Stats
                </h2>
                <p className="text-slate-600 mt-2">Overview of our mentorship community</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {mentors?.length || 0}
                  </div>
                  <div className="text-sm text-slate-700 font-medium">Active Mentors</div>
                  <div className="text-xs text-slate-500 mt-1">Ready to guide you</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.floor((mentors?.length || 0) * 1.5)}
                  </div>
                  <div className="text-sm text-slate-700 font-medium">Mentorship Sessions</div>
                  <div className="text-xs text-slate-500 mt-1">Completed this month</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {preferences.careerInterest ? '5' : '0'}
                  </div>
                  <div className="text-sm text-slate-700 font-medium">AI Matches</div>
                  <div className="text-xs text-slate-500 mt-1">Found for you</div>
                </div>
              </div>
            </div>

            {/* Browse All Mentors Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-8 bg-purple-600 rounded-full"></span>
                  Browse All Mentors
                </h2>
                <p className="text-slate-600 mt-2">Explore our complete mentor network</p>
              </div>
              
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, skills, company, or expertise..."
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <svg
                    className="absolute left-3 top-3.5 h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <select
                  value={filters.department}
                  onChange={handleFilterChange('department')}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Departments</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
                
                <select
                  value={filters.industry}
                  onChange={handleFilterChange('industry')}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Industries</option>
                  <option value="IT / Software">IT / Software</option>
                  <option value="Core Engineering">Core Engineering</option>
                  <option value="Management">Management</option>
                  <option value="Startup">Startup</option>
                  <option value="Government">Government</option>
                  <option value="Research / Academia">Research / Academia</option>
                </select>
                
                <select
                  value={filters.experience}
                  onChange={handleFilterChange('experience')}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Experience Levels</option>
                  <option value="0-3">0-3 years</option>
                  <option value="4-7">4-7 years</option>
                  <option value="8+">8+ years</option>
                </select>
              </div>
              
              {/* Mentors Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-slate-600">Loading mentors...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error loading mentors. Please try again.</p>
                </div>
              ) : filteredMentors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMentors.slice(0, 6).map((mentor) => (
                    <MentorCard 
                      key={mentor._id} 
                      mentor={{
                        name: mentor.fullName,
                        position: mentor.currentJobTitle,
                        avatar: mentor.profilePhoto || `https://ui-avatars.com/api/?name=${mentor.fullName}&background=3b82f6&color=fff`,
                        rating: mentor.rating || 0
                      }}
                      onViewProfile={() => navigate(`/dashboard/mentors/${mentor._id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No mentors found</h3>
                  <p className="text-sm text-slate-500">Try adjusting your search terms or filters</p>
                </div>
              )}
              
              {filteredMentors.length > 6 && (
                <div className="mt-6 text-center">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Load More Mentors
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Your Preferences */}
          <div className="lg:w-80 flex-shrink-0">
            <MentorPreferences onPreferencesChange={handlePreferencesChange} />
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
              <h3 className="text-sm font-medium text-slate-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/dashboard/mentorship/become')}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Become a Mentor →
                </button>
                <button
                  onClick={() => navigate('/dashboard/mentorship/dashboard')}
                  className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Mentor Dashboard →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Mentorship