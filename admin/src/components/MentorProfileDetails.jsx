import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get, patch, del } from '../utils/api'

const MentorProfileDetails = () => {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const [mentor, setMentor] = useState(null)
  const [requests, setRequests] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('requests')

  // Fetch mentor details
  const fetchMentorDetails = async () => {
    try {
      // Fetch mentor data
      const mentorResponse = await get('/admin/mentorship/mentors')
      const mentorData = mentorResponse.data?.find(m => m.id === mentorId)
      setMentor(mentorData)

      // Fetch mentor requests and reviews
      const [requestsResponse, reviewsResponse] = await Promise.all([
        get(`/admin/mentorship/mentors/${mentorId}/requests`),
        get(`/admin/mentorship/mentors/${mentorId}/reviews`)
      ])
      setRequests(requestsResponse.data || [])
      setReviews(reviewsResponse.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMentorDetails()
  }, [mentorId])

  // Calculate mentorship analytics
  const getAnalytics = () => {
    const totalRequests = requests.length
    const pendingRequests = requests.filter(r => r.status === 'pending').length
    const acceptedRequests = requests.filter(r => r.status === 'accepted').length
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length
    const completedSessions = requests.filter(r => r.status === 'completed').length
    const totalReviews = reviews.length
    const averageRating = reviews.length > 0 
      ? (reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length).toFixed(1)
      : '0.0'

    return {
      totalRequests,
      pendingRequests,
      acceptedRequests,
      rejectedRequests,
      completedSessions,
      totalReviews,
      averageRating
    }
  }

  const handleApproveMentor = async () => {
    try {
      await patch(`/admin/mentorship/mentors/${mentorId}/approve`)
      fetchMentorDetails() // Refresh data
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSuspendMentor = async () => {
    try {
      await patch(`/admin/mentorship/mentors/${mentorId}/suspend`)
      fetchMentorDetails() // Refresh data
    } catch (err) {
      setError(err.message)
    }
  }

  const handleReactivateMentor = async () => {
    try {
      await patch(`/admin/mentorship/mentors/${mentorId}/reactivate`)
      fetchMentorDetails() // Refresh data
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteMentor = async () => {
    if (window.confirm('Are you sure you want to delete this mentor? This action cannot be undone.')) {
      try {
        await del(`/admin/mentorship/mentors/${mentorId}`)
        navigate('/admin/mentorship')
      } catch (err) {
        setError(err.message)
      }
    }
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

  if (!mentor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-500">Mentor not found</p>
        </div>
      </div>
    )
  }

  const analytics = getAnalytics()

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/mentorship')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back to Mentors
        </button>
      </div>

      {/* Top Section: Mentor Profile Card */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <img 
              src={mentor.avatar || '/default-avatar.png'} 
              alt={mentor.name}
              className="h-32 w-32 rounded-full object-cover border border-gray-200"
            />
          </div>

          {/* Profile Information */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
              <p className="text-lg font-semibold text-gray-900">{mentor.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="text-gray-900">{mentor.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Phone</h3>
              <p className="text-gray-900">{mentor.phone || '—'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Department</h3>
              <p className="text-gray-900">{mentor.department}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Graduation Year</h3>
              <p className="text-gray-900">{mentor.graduationYear || '—'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Bio</h3>
              <p className="text-gray-900 line-clamp-2">{mentor.bio || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Mentorship Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRequests}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{analytics.pendingRequests}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{analytics.acceptedRequests}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{analytics.completedSessions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{analytics.rejectedRequests}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reviews</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.totalReviews}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Rating</p>
              <p className="text-2xl font-bold text-orange-600">{analytics.averageRating} ⭐</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Response Rate</p>
              <p className="text-2xl font-bold text-teal-600">100%</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Mentor Stats Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentor Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Total Mentees</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-500">Sessions Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">100%</p>
            <p className="text-sm text-gray-500">Response Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">24 hours</p>
            <p className="text-sm text-gray-500">Avg Response Time</p>
          </div>
        </div>
      </div>

      {/* Availability Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
            <p className="text-gray-900">Available for mentorship</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Available Days</h4>
            <p className="text-gray-900">Flexible</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Time Commitment</h4>
            <p className="text-gray-900">3-5 hours/week</p>
          </div>
        </div>
      </div>

      {/* Services & Resources Section */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Services Offered</h4>
            <ul className="text-gray-900 space-y-1">
              <li>• Career Guidance</li>
              <li>• Technical Mentorship</li>
              <li>• Industry Insights</li>
              <li>• Resume Review</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Resources & Materials</h4>
            <ul className="text-gray-900 space-y-1">
              <li>• Study Materials</li>
              <li>• Industry Templates</li>
              <li>• Interview Preparation</li>
              <li>• Networking Guidance</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section: Tabs for Requests and Reviews */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Mentee Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reviews'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'requests' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentee Requests</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Topic</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request, index) => (
                      <tr key={request.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.menteeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.menteeEmail}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.menteeDepartment || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.serviceName || request.requestMessage || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {requests.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No mentee requests found.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mentee Reviews</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentee Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Comment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review, index) => (
                      <tr key={review.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.menteeName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            {review.rating ? (
                              <>
                                <span className="text-yellow-400">{'⭐'.repeat(review.rating)}</span>
                                <span className="ml-2 text-gray-600">({review.rating}.0)</span>
                              </>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={review.feedback}>
                            {review.feedback || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reviews.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No reviews found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MentorProfileDetails
