import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get } from '../utils/api'

const MentorSessions = () => {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch mentor details and sessions
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch mentor details
      const mentorResponse = await get(`/api/mentors/${mentorId}`)
      setMentor(mentorResponse.data || mentorResponse)
      
      // Fetch mentor sessions (placeholder - would need actual API endpoint)
      const sessionsResponse = await get(`/api/mentors/${mentorId}/sessions`)
      const sessionData = Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : []
      setSessions(sessionData)
      
    } catch (err) {
      setError(err.message || 'Failed to fetch mentor sessions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mentorId) {
      fetchData()
    }
  }, [mentorId])

  // Filter sessions into completed and upcoming
  const completedSessions = sessions.filter(session => 
    session.status === 'completed' || new Date(session.endTime) < new Date()
  )
  
  const upcomingSessions = sessions.filter(session => 
    session.status === 'scheduled' || new Date(session.startTime) > new Date()
  )

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
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/mentorship')}
          className="mb-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          ← Back to Mentorship
        </button>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <img 
              src={mentor?.profilePhoto || mentor?.avatar || '/default-avatar.png'} 
              alt={mentor?.fullName || mentor?.name}
              className="h-16 w-16 rounded-full object-cover border border-gray-200 mr-4"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mentor?.fullName || mentor?.name}
              </h1>
              <p className="text-gray-600">{mentor?.email}</p>
              <p className="text-sm text-gray-500">{mentor?.department}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming Sessions ({upcomingSessions.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingSessions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No upcoming sessions
                    </td>
                  </tr>
                ) : (
                  upcomingSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(session.startTime).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {session.menteeName || '—'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {session.status || 'Scheduled'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Completed Sessions ({completedSessions.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mentee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedSessions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No completed sessions
                    </td>
                  </tr>
                ) : (
                  completedSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(session.startTime).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {session.menteeName || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {session.rating ? (
                          <div className="flex items-center">
                            <span className="text-yellow-400">★</span>
                            <span className="ml-1">{session.rating}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MentorSessions
