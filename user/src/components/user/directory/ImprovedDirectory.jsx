import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import UserDirectoryCard from './UserDirectoryCard'
import { useDirectoryData } from '../../../hooks/useDirectoryData'

const roleLabels = {
  students: 'Students',
  alumni: 'Alumni', 
  faculty: 'Faculty'
}

const FILTER_OPTIONS = {
  students: {
    departments: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science'],
    currentYears: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Final Year']
  },
  alumni: {
    departments: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science'],
    passoutYears: ['2020', '2021', '2022', '2023', '2024']
  },
  faculty: {
    departments: ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Arts', 'Science']
  }
}

const ImprovedDirectory = ({ role }) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    department: '',
    currentYear: '',
    passoutYear: ''
  })

  const { loading, members: profiles, error } = useDirectoryData(role)

  const filteredProfiles = useMemo(() => {
    if (!profiles) return []
    
    return profiles.filter(profile => {
      // Search by name
      const matchesSearch = !searchQuery || 
        profile.name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (!matchesSearch) return false
      
      // Filter by department
      if (selectedFilters.department && 
          profile.department?.toLowerCase() !== selectedFilters.department.toLowerCase()) {
        return false
      }
      
      // Filter by current year (students)
      if (role === 'students' && selectedFilters.currentYear) {
        const profileYear = profile.classYear || profile.currentYear
        if (!profileYear || !profileYear.toLowerCase().includes(selectedFilters.currentYear.toLowerCase())) {
          return false
        }
      }
      
      // Filter by passout year (alumni)
      if (role === 'alumni' && selectedFilters.passoutYear) {
        const profileYear = profile.graduationYear || profile.passoutYear
        if (!profileYear || profileYear.toString() !== selectedFilters.passoutYear) {
          return false
        }
      }
      
      return true
    })
  }, [profiles, searchQuery, selectedFilters, role])

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const clearFilters = () => {
    setSelectedFilters({
      department: '',
      currentYear: '',
      passoutYear: ''
    })
  }

  const handleProfileClick = (person) => {
    navigate(`/dashboard/directory/profile/${person.id}`)
  }

  const activeFilterCount = Object.values(selectedFilters).filter(value => value !== '').length

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {roleLabels[role]} Directory
          </h1>
          <p className="text-slate-600">
            Connect with {roleLabels[role].toLowerCase()} from our community
          </p>
        </div>

        {/* Search Bar with Filter Button */}
        <div className="mb-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${roleLabels[role].toLowerCase()} by name...`}
                  className="block w-full pl-12 pr-4 py-3 text-lg border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg border font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                showFilters || activeFilterCount > 0
                  ? 'border-primary bg-primary text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Department Filter */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department
                </label>
                <select
                  value={selectedFilters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">All Departments</option>
                  {FILTER_OPTIONS[role].departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter - Students */}
              {role === 'students' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Current Year
                  </label>
                  <select
                    value={selectedFilters.currentYear}
                    onChange={(e) => handleFilterChange('currentYear', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {FILTER_OPTIONS.students.currentYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Passout Year Filter - Alumni */}
              {role === 'alumni' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Passout Year
                  </label>
                  <select
                    value={selectedFilters.passoutYear}
                    onChange={(e) => handleFilterChange('passoutYear', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Years</option>
                    {FILTER_OPTIONS.alumni.passoutYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Faculty only has department filter */}
              {role === 'faculty' && (
                <div className="text-sm text-slate-500 italic flex items-center">
                  Faculty profiles can be filtered by department only.
                </div>
              )}
            </div>

            {/* Clear Filters Button */}
            {activeFilterCount > 0 && (
              <div className="mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            {loading ? 'Loading...' : (
              <>
                Showing <span className="font-semibold">{filteredProfiles.length}</span> of{' '}
                <span className="font-semibold">{profiles?.length || 0}</span> {roleLabels[role].toLowerCase()}
              </>
            )}
          </p>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Error loading directory. Please try again.</p>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">
              {searchQuery || activeFilterCount > 0 
                ? 'No profiles match your search criteria.' 
                : `No ${roleLabels[role].toLowerCase()} found.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredProfiles.map((profile) => (
              <UserDirectoryCard 
                key={profile.id} 
                person={profile} 
                onOpen={handleProfileClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImprovedDirectory
