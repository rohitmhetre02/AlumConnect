import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const PublicAlumniDirectory = () => {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  useEffect(() => {
    // Fetch real alumni data from database
    const fetchAlumni = async () => {
      try {
        setLoading(true)
        
        // Build query string for filters
        const queryParams = new URLSearchParams()
        if (searchTerm) queryParams.append('search', searchTerm)
        if (departmentFilter) queryParams.append('department', departmentFilter)
        if (yearFilter) queryParams.append('graduationYear', yearFilter)
        
        const response = await fetch(`/api/alumni?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch alumni data')
        }
        
        const data = await response.json()
        setAlumni(data.alumni || [])
      } catch (err) {
        console.error('Error fetching alumni:', err)
        setError(err.message)
        
        // Show empty state on error instead of mock data
        setAlumni([])
      } finally {
        setLoading(false)
      }
    }

    fetchAlumni()
  }, [searchTerm, departmentFilter, yearFilter])

  // Filter alumni based on search and filters
  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = !searchTerm || 
      alumnus.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.currentCompany?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alumnus.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesDepartment = !departmentFilter || alumnus.department === departmentFilter
    const matchesYear = !yearFilter || alumnus.graduationYear === yearFilter
    
    return matchesSearch && matchesDepartment && matchesYear
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alumni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Alumni Directory</h1>
        <p className="text-gray-600">Connect with our successful alumni across the globe</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search alumni by name, company, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Computer Engineering">Computer Engineering</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Electronics Engineering">Electronics Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
            <option value="2020">2020</option>
            <option value="2019">2019</option>
            <option value="2018">2018</option>
            <option value="2017">2017</option>
            <option value="2016">2016</option>
            <option value="2015">2015</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredAlumni.length} alumni {filteredAlumni.length !== alumni.length && `(filtered from ${alumni.length} total)`}
        </p>
      </div>

      {/* Alumni Grid */}
      {filteredAlumni.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumnus) => (
            <div key={alumnus._id || alumnus.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                {/* Profile Image */}
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    {alumnus.profileImage ? (
                      <img 
                        src={alumnus.profileImage} 
                        alt={`${alumnus.firstName} ${alumnus.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{display: alumnus.profileImage ? 'none' : 'flex'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>

                {/* Alumni Info */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {alumnus.firstName} {alumnus.lastName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{alumnus.email}</p>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-700">
                      <span className="font-medium">Class of:</span> {alumnus.graduationYear || 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Department:</span> {alumnus.department || 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Current:</span> {alumnus.currentCompany || 'N/A'}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Position:</span> {alumnus.position || 'N/A'}
                    </p>
                  </div>

                  {/* Skills */}
                  {alumnus.skills && alumnus.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {alumnus.skills.slice(0, 3).map((skill, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {alumnus.skills.length > 3 && (
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{alumnus.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex gap-2 justify-center">
                    <Link 
                      to={`/directory/profile/${alumnus._id || alumnus.id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      View Profile
                    </Link>
                    <button className="px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alumni found</h3>
          <p className="text-gray-600 mb-4">
            {error ? 'Unable to load alumni data. Please try again later.' : 'No alumni match your current filters.'}
          </p>
          {error && (
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          )}
          {!error && (searchTerm || departmentFilter || yearFilter) && (
            <button 
              onClick={() => {
                setSearchTerm('')
                setDepartmentFilter('')
                setYearFilter('')
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Login Prompt Section */}
      <div className="mt-12 bg-blue-50 rounded-lg p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h4m-4-4v8m-4-4h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h12z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Login to View More</h3>
        <p className="text-gray-600 mb-4">
          Sign in to access the complete alumni directory with advanced search, detailed profiles, and networking features.
        </p>
        <div className="flex gap-3 justify-center">
          <Link 
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link 
            to="/signup"
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PublicAlumniDirectory
