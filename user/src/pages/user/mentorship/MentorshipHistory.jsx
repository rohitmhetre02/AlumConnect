import useMentorRequests from '../../../hooks/useMentorRequests'
import { useState } from 'react'

const MentorshipHistory = () => {
  const { requests, loading, error, refresh } = useMentorRequests()
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Filter only completed requests for history
  const completedRequests = requests?.filter(r => r.status === 'completed') || []

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
  }

  const closeDetailsModal = () => {
    setSelectedRequest(null)
  }

  const handleViewReview = (request) => {
    setSelectedRequest(request)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Mentorship Session History</h2>
        <p className="text-sm text-slate-500">Review past mentorship sessions and feedback from mentees.</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading session history...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error.message || 'Failed to load session history'}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {completedRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-slate-400">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">No session history yet</p>
                <p className="text-sm mt-1">Completed mentorship sessions will appear here</p>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">
                Completed Sessions ({completedRequests.length})
              </h3>
              <div className="space-y-4">
                {completedRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-slate-900">{request.menteeName}</h3>
                          <span className="text-sm text-slate-500">| {request.menteeEmail}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            request.sessionOutcome === 'missed' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {request.sessionOutcome === 'missed' ? 'Missed' : 'Completed'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-2">
                          <span>
                            <span className="font-medium">Department:</span> {request.menteeDepartment || request.mentee?.department || 'Not specified'}
                          </span>
                          <span>
                            <span className="font-medium">Role:</span> <span className="capitalize">{request.menteeRole || request.mentee?.role || 'Not specified'}</span>
                            {(request.menteeRole === 'student' || request.mentee?.role === 'student') && request.currentYear && (
                              <span> | {request.currentYear}</span>
                            )}
                            {(request.menteeRole === 'alumni' || request.mentee?.role === 'alumni') && request.passoutYear && (
                              <span> | {request.passoutYear}</span>
                            )}
                          </span>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-700">Service: {request.serviceName || 'General Mentorship'}</p>
                        </div>

                        {request.sessionDetails?.sessionStartTime && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-slate-700">Session Date: {new Date(request.sessionDetails.sessionStartTime).toLocaleDateString('en-US', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}</p>
                            <p className="text-sm font-medium text-slate-700">Time: {new Date(request.sessionDetails.sessionStartTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })} {request.sessionDetails.sessionEndTime && `- ${new Date(request.sessionDetails.sessionEndTime).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}`}</p>
                          </div>
                        )}

                        {request.remark && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-slate-700">Remark: {request.remark}</p>
                          </div>
                        )}

                        {request.sessionOutcome === 'completed' && (
                          <div className="mb-2">
                            {request.reviewSubmitted ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800 mb-1">✓ Review Submitted by {request.menteeName}</p>
                                    {request.rating && (
                                      <p className="text-sm text-green-700 mb-1">
                                        <span className="font-medium">Rating:</span> {'⭐'.repeat(request.rating)}
                                      </p>
                                    )}
                                    {request.feedback && (
                                      <p className="text-sm text-green-700">
                                        <span className="font-medium">Feedback:</span> {request.feedback}
                                      </p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleViewReview(request)}
                                    className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                                  >
                                    View Review
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm font-medium text-orange-800">⏳ Review not submitted</p>
                                    <p className="text-xs text-orange-600">Waiting for {request.menteeName} to submit feedback</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm font-medium"
                      >
                        Completed
                      </button>

                      <button
                        onClick={() => handleViewDetails(request)}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm font-medium"
                      >
                        View Full Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-slate-900">Request Details</h3>
                <button
                  onClick={closeDetailsModal}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Status Section */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Status Information</h4>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-700">
                      Completed
                    </span>
                    {selectedRequest.sessionOutcome && (
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedRequest.sessionOutcome === 'missed' 
                          ? 'bg-orange-100 text-orange-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {selectedRequest.sessionOutcome === 'missed' ? 'Session Missed' : 'Session Completed'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mentee Information */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Mentee Information</h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedRequest.menteeName || 'Not specified'}</p>
                    <p><span className="font-medium">Email:</span> {selectedRequest.menteeEmail || 'Not specified'}</p>
                    <p><span className="font-medium">Department:</span> {selectedRequest.menteeDepartment || selectedRequest.mentee?.department || 'Not specified'}</p>
                    <p><span className="font-medium">Role:</span> <span className="capitalize">{selectedRequest.menteeRole || selectedRequest.mentee?.role || 'Not specified'}</span></p>
                    {(selectedRequest.menteeRole === 'student' || selectedRequest.mentee?.role === 'student') && selectedRequest.currentYear && (
                      <p><span className="font-medium">Year:</span> {selectedRequest.currentYear}</p>
                    )}
                    {(selectedRequest.menteeRole === 'alumni' || selectedRequest.mentee?.role === 'alumni') && selectedRequest.passoutYear && (
                      <p><span className="font-medium">Passout Year:</span> {selectedRequest.passoutYear}</p>
                    )}
                  </div>
                </div>

                {/* Request Details */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Request Details</h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <p><span className="font-medium">Service:</span> {selectedRequest.serviceName || 'General Mentorship'}</p>
                    <p><span className="font-medium">Requested:</span> {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'Not specified'}</p>
                    {selectedRequest.requestMessage && (
                      <p><span className="font-medium">Message:</span> {selectedRequest.requestMessage}</p>
                    )}
                  </div>
                </div>

                {/* Session Details */}
                {selectedRequest.sessionDetails?.sessionStartTime && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Session Details</h4>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <p>
                        <span className="font-medium">Scheduled:</span>{' '}
                        {new Date(selectedRequest.sessionDetails.sessionStartTime).toLocaleString()}
                      </p>
                      {selectedRequest.sessionDetails.sessionEndTime && (
                        <p>
                          <span className="font-medium">End Time:</span>{' '}
                          {new Date(selectedRequest.sessionDetails.sessionEndTime).toLocaleString()}
                        </p>
                      )}
                      {selectedRequest.sessionDetails.meetingLink && (
                        <p>
                          <span className="font-medium">Meeting Link:</span>{' '}
                          <a 
                            href={selectedRequest.sessionDetails.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedRequest.sessionDetails.meetingLink}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Remarks */}
                {selectedRequest.remark && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Remarks</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p>{selectedRequest.remark}</p>
                    </div>
                  </div>
                )}

                {/* Review Information */}
                {selectedRequest.status === 'completed' && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Review Information</h4>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <p>
                        <span className="font-medium">Review Submitted:</span>{' '}
                        {selectedRequest.reviewSubmitted ? 
                          <span className="text-green-600">Yes</span> : 
                          <span className="text-orange-600">No</span>
                        }
                      </p>
                      {selectedRequest.rating && (
                        <p>
                          <span className="font-medium">Rating:</span>{' '}
                          {'⭐'.repeat(selectedRequest.rating)} ({selectedRequest.rating}/5)
                        </p>
                      )}
                      {selectedRequest.feedback && (
                        <p><span className="font-medium">Feedback:</span> {selectedRequest.feedback}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MentorshipHistory
