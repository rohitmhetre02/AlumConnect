import { useMentorSessions } from '../../../hooks/useMentorSessions'
import { useMentorRequests } from '../../../hooks/useMentorRequests'
import { useState } from 'react'

const MentorshipSessions = () => {
  const { sessions, loading: sessionsLoading, error: sessionsError, refresh: refreshSessions } = useMentorSessions()
  const { requests, loading: requestsLoading, updateRequestStatus, completeSession } = useMentorRequests()
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [sessionStatusModalOpen, setSessionStatusModalOpen] = useState(false)
  const [sessionOutcome, setSessionOutcome] = useState('')
  const [sessionRemark, setSessionRemark] = useState('')

  // Filter sessions by status
  const upcomingSessions = sessions?.filter(s => s.status === 'scheduled') || []
  const completedSessions = sessions?.filter(s => s.status === 'completed') || []
  
  // Get accepted requests from mentor requests
  const acceptedRequests = requests?.filter(r => r.status === 'accepted') || []
  const completedRequests = requests?.filter(r => r.status === 'completed') || []

  const handleViewDetails = async (sessionId) => {
    try {
      // Find the session in our sessions array
      const session = sessions.find(s => s.id === sessionId)
      setSelectedSession(session)
    } catch (error) {
      console.error('Failed to fetch session details:', error)
    }
  }

  const handleViewFullRequest = (request) => {
    console.log('View Full Request clicked:', request)
    setSelectedRequest(request)
  }

  const handleSessionStatus = (request) => {
    setSelectedRequest(request)
    setSessionOutcome('')
    setSessionRemark('')
    setSessionStatusModalOpen(true)
  }

  const handleSessionComplete = async () => {
    if (!selectedRequest || !sessionOutcome) return

    try {
      await completeSession(selectedRequest.id, sessionOutcome, sessionRemark)
      setSessionStatusModalOpen(false)
      refreshSessions()
    } catch (error) {
      console.error('Failed to update session status:', error)
    }
  }

  const handleViewReview = (request) => {
    // Show review details in modal or alert
    alert(`Review from ${request.menteeName}:\nRating: ${request.rating ? '⭐'.repeat(request.rating) : 'N/A'}\nFeedback: ${request.feedback || 'No feedback provided'}`)
  }

  const closeRequestModal = () => {
    setSelectedRequest(null)
  }

  if (sessionsLoading || requestsLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (sessionsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{sessionsError.message || 'Failed to load sessions'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Sessions</h2>
        <p className="text-sm text-slate-500">Manage your upcoming and completed mentorship sessions.</p>
      </div>

      {/* Upcoming Sessions - Show accepted requests */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-slate-900 mb-4">
          Upcoming Sessions ({acceptedRequests.length})
        </h3>
        {acceptedRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
            <p className="text-slate-500">No upcoming sessions scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {acceptedRequests
              .sort((a, b) => {
                const dateA = a.sessionDetails?.sessionStartTime ? new Date(a.sessionDetails.sessionStartTime) : new Date(0)
                const dateB = b.sessionDetails?.sessionStartTime ? new Date(b.sessionDetails.sessionStartTime) : new Date(0)
                return dateA - dateB // Earliest dates first
              })
              .map((request) => {
              const sessionStartTime = request.sessionDetails?.sessionStartTime ? new Date(request.sessionDetails.sessionStartTime) : 
                                    request.scheduledDateTime ? new Date(request.scheduledDateTime) : 
                                    request.sessionDetails?.sessionDate ? new Date(request.sessionDetails.sessionDate) : null;
              const sessionEndTime = request.sessionDetails?.sessionEndTime ? new Date(request.sessionDetails.sessionEndTime) : null;
              const currentTime = new Date();
              const isSessionTime = sessionStartTime && currentTime >= sessionStartTime && sessionEndTime && currentTime <= sessionEndTime;
              const fiveMinutesBefore = sessionStartTime && currentTime >= new Date(sessionStartTime.getTime() - 5 * 60000);
              const isSessionEnded = sessionEndTime && currentTime > sessionEndTime;
              const meetingLink = request.sessionDetails?.meetingLink || request.meetingLink;
              
              return (
                <div key={request.id} className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{request.menteeName}</h3>
                        <span className="text-sm text-slate-500">| {request.menteeEmail}</span>
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

                      {sessionStartTime && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-700">Scheduled Date: {sessionStartTime.toLocaleDateString('en-US', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}</p>
                          <p className="text-sm font-medium text-slate-700">Time: {sessionStartTime.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })} {sessionEndTime && `- ${sessionEndTime.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}`}</p>
                        </div>
                      )}

                      {meetingLink && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-700">Meeting Link:</p>
                          <a 
                            href={meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm underline"
                          >
                            {meetingLink}
                          </a>
                        </div>
                      )}

                      {request.requestMessage && (
                        <p className="text-sm text-slate-600 mt-2">{request.requestMessage}</p>
                      )}
                      
                    </div>
                    <div className="flex gap-2 mt-3">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded mt-2">
                        Accepted
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleViewFullRequest(request)}
                      className="px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm font-medium"
                    >
                      View Full Request
                    </button>
                    
                    {meetingLink ? (
                      <>
                        {isSessionTime ? (
                          <a
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Meeting
                          </a>
                        ) : fiveMinutesBefore && !isSessionEnded ? (
                          <a
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Join Meeting
                          </a>
                        ) : isSessionEnded ? (
                          <button
                            onClick={() => handleSessionStatus(request)}
                            className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 text-sm font-medium inline-flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Session Status
                          </button>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="px-3 py-2 bg-slate-100 text-slate-500 rounded text-sm font-medium inline-flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {sessionStartTime ? `Join at ${sessionStartTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : 'Join Meeting'}
                            </div>
                            <div className="text-xs text-slate-500">
                              💡 Note: Join Meeting button will be active 5 minutes before session time
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-3 py-2 bg-slate-100 text-slate-400 rounded text-sm font-medium inline-flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Join Meeting 
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completed Sessions */}
<div>
  <h3 className="text-lg font-medium text-slate-900 mb-4">
    Completed Sessions ({completedRequests.length})
  </h3>

  {completedRequests.length === 0 ? (
    <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
      <p className="text-slate-500">No completed sessions yet</p>
    </div>
  ) : (
    <div className="space-y-4">
      {completedRequests.map((request) => (
        <div key={request.id} className="bg-white border border-slate-200 rounded-lg p-4">

          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">

              {/* Content */}
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

              {/* Review Section */}
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

          {/* Buttons (FIXED POSITION) */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
            <button
              onClick={() => handleViewFullRequest(request)}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm font-medium"
            >
              Completed
            </button>

            <button
              onClick={() => handleViewFullRequest(request)}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm font-medium"
            >
              View Full Request
            </button>
          </div>

        </div>
      ))}
    </div>
  )}
</div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Session Details</h3>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900">Mentee Information</h4>
                <p className="text-sm text-slate-600">Name: {selectedSession.menteeName}</p>
                <p className="text-sm text-slate-600">Email: {selectedSession.menteeEmail}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900">Session Details</h4>
                <p className="text-sm text-slate-600">Status: {selectedSession.status}</p>
                <p className="text-sm text-slate-600">Service: {selectedSession.serviceName || 'Mentorship Session'}</p>
                <p className="text-sm text-slate-600">Mode: {selectedSession.mode || 'Online'}</p>
                {selectedSession.sessionDate && (
                  <p className="text-sm text-slate-600">
                    Scheduled: {selectedSession.sessionDate.toLocaleString()}
                  </p>
                )}
                {selectedSession.status === 'completed' && selectedSession.completedAt && (
                  <p className="text-sm text-slate-600">
                    Completed: {selectedSession.completedAt.toLocaleString()}
                  </p>
                )}
                {selectedSession.meetingLink && (
                  <p className="text-sm text-slate-600">
                    Meeting Link:{' '}
                    <a 
                      href={selectedSession.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {selectedSession.meetingLink}
                    </a>
                  </p>
                )}
              </div>
              
              {selectedSession.feedback && (
                <div>
                  <h4 className="font-medium text-slate-900">Feedback</h4>
                  {selectedSession.feedback.rating && (
                    <p className="text-sm text-slate-600">
                      Rating: {'⭐'.repeat(selectedSession.feedback.rating)} ({selectedSession.feedback.rating}/5)
                    </p>
                  )}
                  {selectedSession.feedback.comment && (
                    <p className="text-sm text-slate-600">
                      Comment: {selectedSession.feedback.comment}
                    </p>
                  )}
                  {selectedSession.feedback.submittedAt && (
                    <p className="text-sm text-slate-600">
                      Submitted: {selectedSession.feedback.submittedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
              
              {selectedSession.notes && (
                <div>
                  <h4 className="font-medium text-slate-900">Notes</h4>
                  <p className="text-sm text-slate-600">{selectedSession.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Request Details</h3>
              <button
                onClick={closeRequestModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-slate-900">Mentee Information</h4>
                <p className="text-sm text-slate-600">Name: {selectedRequest.menteeName}</p>
                <p className="text-sm text-slate-600">Email: {selectedRequest.menteeEmail}</p>
                <p className="text-sm text-slate-600">Department: {selectedRequest.menteeDepartment || selectedRequest.mentee?.department || 'Not specified'}</p>
                <p className="text-sm text-slate-600">Role: <span className="capitalize">{selectedRequest.menteeRole || selectedRequest.mentee?.role || 'Not specified'}</span></p>
                {(selectedRequest.menteeRole === 'student' || selectedRequest.mentee?.role === 'student') && selectedRequest.currentYear && (
                  <p className="text-sm text-slate-600">Year: {selectedRequest.currentYear}</p>
                )}
                {(selectedRequest.menteeRole === 'alumni' || selectedRequest.mentee?.role === 'alumni') && selectedRequest.passoutYear && (
                  <p className="text-sm text-slate-600">Passout Year: {selectedRequest.passoutYear}</p>
                )}
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900">Request Details</h4>
                <p className="text-sm text-slate-600">Service: {selectedRequest.serviceName || 'General Mentorship'}</p>
                <p className="text-sm text-slate-600">Status: <span className="capitalize">{selectedRequest.status}</span></p>
                {selectedRequest.requestMessage && (
                  <p className="text-sm text-slate-600">Message: {selectedRequest.requestMessage}</p>
                )}
              </div>

              {selectedRequest.sessionDetails?.sessionStartTime && (
                <div>
                  <h4 className="font-medium text-slate-900">Session Details</h4>
                  <p className="text-sm text-slate-600">
                    Scheduled: {new Date(selectedRequest.sessionDetails.sessionStartTime).toLocaleString()}
                  </p>
                  {selectedRequest.sessionDetails.sessionEndTime && (
                    <p className="text-sm text-slate-600">
                      End Time: {new Date(selectedRequest.sessionDetails.sessionEndTime).toLocaleString()}
                    </p>
                  )}
                  {selectedRequest.sessionDetails.meetingLink && (
                    <p className="text-sm text-slate-600">
                      Meeting Link:{' '}
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
              )}

              {selectedRequest.remark && (
                <div>
                  <h4 className="font-medium text-slate-900">Remarks</h4>
                  <p className="text-sm text-slate-600">{selectedRequest.remark}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Session Status Modal */}
      {sessionStatusModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Session Status</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Session Outcome</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="completed"
                      checked={sessionOutcome === 'completed'}
                      onChange={(e) => setSessionOutcome(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Completed</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="missed"
                      checked={sessionOutcome === 'missed'}
                      onChange={(e) => setSessionOutcome(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Mentee Did Not Attend</span>
                  </label>
                </div>
              </div>

              {sessionOutcome === 'missed' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Remark / Reason</label>
                  <textarea
                    value={sessionRemark}
                    onChange={(e) => setSessionRemark(e.target.value)}
                    placeholder="Example: Mentee did not join the session."
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    rows="3"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSessionStatusModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSessionComplete}
                  disabled={!sessionOutcome}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MentorshipSessions
