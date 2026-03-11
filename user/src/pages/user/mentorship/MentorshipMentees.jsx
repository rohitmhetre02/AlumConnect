import { useState } from 'react'
import { useMentorRequests } from '../../../hooks/useMentorRequests'

const MentorshipMentees = () => {
  const { requests, loading, error, acceptRequest, rejectRequest, reviewRequest } = useMentorRequests()
  const [selectedDetails, setSelectedDetails] = useState(null)

  const handleAccept = async (requestId) => {
    try {
      await acceptRequest(requestId)
      setSelectedDetails(null)
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId)
      setSelectedDetails(null)
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleReview = async (requestId) => {
    try {
      await reviewRequest(requestId)
      setSelectedDetails(null)
    } catch (error) {
      console.error('Failed to review request:', error)
    }
  }

  const pendingRequests = requests?.filter(r => r.status === 'pending') || []
  const reviewRequests = requests?.filter(r => r.status === 'review') || []
  const acceptedRequests = requests?.filter(r => r.status === 'accepted') || []

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-slate-900">Mentees & Requests</h2>
      <p className="text-sm text-slate-500">Review new mentorship requests and manage accepted mentees.</p>
      
      {loading && (
        <div className="mt-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading requests...</p>
        </div>
      )}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error.message || 'Failed to load requests'}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-6 space-y-8">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Pending Requests ({pendingRequests.length})</h3>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-900">{request.menteeName}</h4>
                        <p className="text-sm text-slate-500 mt-1">{request.menteeEmail}</p>
                        {request.message && (
                          <p className="text-sm text-slate-600 mt-2">{request.message}</p>
                        )}
                        {request.menteeSkills && request.menteeSkills.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-slate-500">Skills:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {request.menteeSkills.map((skill, index) => (
                                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(request._id)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleAccept(request._id)}
                          className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Under Review */}
          {reviewRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Under Review ({reviewRequests.length})</h3>
              <div className="space-y-4">
                {reviewRequests.map((request) => (
                  <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-900">{request.menteeName}</h4>
                        <p className="text-sm text-slate-500 mt-1">{request.menteeEmail}</p>
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded mt-2">
                          Under Review
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(request._id)}
                          className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Mentees */}
          {acceptedRequests.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Accepted Mentees ({acceptedRequests.length})</h3>
              <div className="space-y-4">
                {acceptedRequests.map((request) => (
                  <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-900">{request.menteeName}</h4>
                        <p className="text-sm text-slate-500 mt-1">{request.menteeEmail}</p>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded mt-2">
                          Accepted
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Requests */}
          {pendingRequests.length === 0 && reviewRequests.length === 0 && acceptedRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-medium">No mentorship requests yet</p>
                <p className="text-sm mt-1">When students send you mentorship requests, they'll appear here</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MentorshipMentees
