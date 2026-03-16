import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { get, post, del, patch } from '../utils/api'

const AdminMentorship = () => {
  const navigate = useNavigate()
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionsDropdown, setActionsDropdown] = useState(null) // Track which dropdown is open
  const [stats, setStats] = useState({
    totalMentors: 0,
    approvedMentors: 0,
    suspendedMentors: 0,
    totalRequests: 0,
    completedSessions: 0,
    totalReviews: 0
  })

  // Handle row click to open mentor profile
  const handleRowClick = (mentorId) => {
    navigate(`/admin/mentorship/${mentorId}`)
  }

  // Handle name click specifically (prevent dropdown interference)
  const handleNameClick = (e, mentorId) => {
    e.stopPropagation()
    navigate(`/admin/mentorship/${mentorId}`)
  }

  // Calculate experience years from graduation year
  const calculateExperience = (graduationYear) => {
    if (!graduationYear) return '—'
    const currentYear = new Date().getFullYear()
    const years = currentYear - graduationYear
    return years > 0 ? `${years} years` : '—'
  }

  // Map department names to short codes
  const getDepartmentCode = (department) => {
    const departmentMap = {
      'Civil Engineering': 'CE',
      'Computer Engineering': 'CSE',
      'Information Technology': 'IT',
      'Electronics & Telecommunication Engineering': 'ENTC',
      'Mechanical Engineering': 'ME',
      'Artificial Intelligence & Data Science': 'AI&DS',
      'Electronics Engineering (VLSI Design And Technology)': 'VLSI',
      'Electronics & Communication (Advanced Communication Technology)': 'ECE-ACT'
    }
    return departmentMap[department] || department || '—'
  }

  // Handle suspend mentor
  const handleSuspendMentor = async (mentorId) => {
    try {
      await patch(`/admin/mentorship/mentors/${mentorId}/suspend`)
      fetchMentors() // Refresh data
      setActionsDropdown(null) // Close dropdown
    } catch (err) {
      setError(err.message)
    }
  }

  // Handle delete mentor
  const handleDeleteMentor = async (mentorId) => {
    if (window.confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      try {
        await del(`/admin/mentorship/mentors/${mentorId}`)
        fetchMentors() // Refresh data
        setActionsDropdown(null) // Close dropdown
      } catch (err) {
        setError(err.message)
      }
    }
  }

  // Fetch mentors
  const fetchMentors = async () => {
    try {
      const response = await get('/admin/mentorship/mentors')
      setMentors(response.data || [])
      
      // Calculate stats from mentor data
      const total = response.data?.length || 0
      const approved = response.data?.filter(m => m.status === 'approved')?.length || 0
      const suspended = response.data?.filter(m => m.status === 'suspended')?.length || 0
      
      setStats({
        totalMentors: total,
        approvedMentors: approved,
        suspendedMentors: suspended,
        totalRequests: 0, // Would need separate API call
        completedSessions: 0, // Would need separate API call
        totalReviews: 0 // Would need separate API call
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMentors()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActionsDropdown(null)
    }
    
    if (actionsDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [actionsDropdown])

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = !searchTerm || 
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || mentor.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleViewProfile = (mentorId) => {
    // Navigate to mentor profile details page
    window.open(`/admin/mentorship/mentor/${mentorId}`, '_blank')
  }

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

  return (
    <div className="p-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Mentors</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.totalMentors}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved Mentors</h3>
          <p className="text-2xl font-bold text-green-600">{stats.approvedMentors}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Suspended Mentors</h3>
          <p className="text-2xl font-bold text-red-600">{stats.suspendedMentors}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Completed Sessions</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.completedSessions}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Reviews</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.totalReviews}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Mentors</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Mentors Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">Mentor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Experience</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Sessions</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMentors.map((mentor, index) => (
                <tr 
                  key={mentor.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors cursor-pointer`}
                  onClick={() => handleRowClick(mentor.id)}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <img 
                        src={mentor.avatar || '/default-avatar.png'} 
                        alt={mentor.name}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200 mr-3 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div 
                          className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors"
                          onClick={(e) => handleNameClick(e, mentor.id)}
                        >
                          {mentor.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{mentor.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate">{mentor.jobTitle}</div>
                      <div className="text-sm text-gray-500 truncate">{mentor.company}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 truncate">{getDepartmentCode(mentor.department)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {calculateExperience(mentor.graduationYear)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">0</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      mentor.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mentor.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(mentor.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActionsDropdown(actionsDropdown === mentor.id ? null : mentor.id)
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      >
                        Actions
                      </button>
                      
                      {actionsDropdown === mentor.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSuspendMentor(mentor.id)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 transition-colors"
                          >
                            Suspend
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteMentor(mentor.id)
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredMentors.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-500">No mentors found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

export default AdminMentorship
