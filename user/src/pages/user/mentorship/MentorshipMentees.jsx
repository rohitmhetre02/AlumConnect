import { useState } from 'react'
import { useMentorRequests } from '../../../hooks/useMentorRequests'
import { useAuth } from '../../../context/AuthContext'
import { get } from '../../../utils/api'

const MentorshipMentees = () => {
  const { user } = useAuth()
  const { requests, loading, error, acceptRequest, rejectRequest, reviewRequest, refresh, completeSession } = useMentorRequests()
  
  // Filter requests where current user is the mentor (requests received)
  const mentorRequests = requests?.filter(request => {
    const mentorId = request?.mentor?._id || request?.mentor || request?.mentorId
    const userId = user?.id || user?._id
    return String(mentorId) === String(userId)
  }) || []
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [sessionStatusModalOpen, setSessionStatusModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [sessionOutcome, setSessionOutcome] = useState('')
  const [sessionRemark, setSessionRemark] = useState('')
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [acceptFormData, setAcceptFormData] = useState({
    sessionDate: '',
    sessionTime: '',
    meetingLink: '',
    message: ''
  })
  const [activeTab, setActiveTab] = useState('all')
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedReviewRequest, setSelectedReviewRequest] = useState(null)

  const handleAccept = async (requestId) => {
    try {
      await acceptRequest(requestId)
      setSelectedDetails(null)
      setDetailsModalOpen(false)
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const handleReject = async (requestId) => {
    try {
      await rejectRequest(requestId)
    } catch (err) {
      console.error('Reject error:', err)
    }
  }

  const handleSessionStatus = (request) => {
    setSelectedRequest(request)
    setSessionOutcome('')
    setSessionRemark('')
    setSessionStatusModalOpen(true)
  }

  const handleViewReview = (request) => {
    setSelectedReviewRequest(request)
    setReviewModalOpen(true)
  }

  const handleSessionComplete = async () => {
    if (!selectedRequest || !sessionOutcome) return

    try {
      await completeSession(selectedRequest.id, sessionOutcome, sessionRemark)
      setSessionStatusModalOpen(false)
      setSelectedRequest(null)
      setSessionOutcome('')
      setSessionRemark('')
    } catch (err) {
      console.error('Session complete error:', err)
    }
  }
 

  const handleViewDetails = async (request) => {
    console.log('handleViewDetails called with request:', request)
    console.log('request.id:', request.id)
    console.log('request._id:', request._id)
    
    setDetailsLoading(true)
    try {
      // Fetch fresh request details from API
      const requestId = request.id || request._id
      console.log('Using requestId:', requestId)
      
      if (!requestId) {
        console.error('Request ID is missing from request object:', request)
        throw new Error('Request ID is missing')
      }

      if (requestId === 'me') {
        console.error('Invalid requestId "me" - this should not happen')
        throw new Error('Invalid request ID')
      }
      
      const data = await get(`/api/mentors/me/requests/${requestId}`)
      const detailedRequest = data.request || data
      
      console.log('API Response data:', data)
      console.log('Detailed request object:', detailedRequest)
      console.log('sessionDetails:', detailedRequest?.sessionDetails)
      console.log('scheduledDateTime:', detailedRequest?.scheduledDateTime)
      
      setSelectedDetails(detailedRequest)
      setDetailsModalOpen(true)
    } catch (error) {
      console.error('Error fetching request details:', error)
      // Fallback to using the request data from the list
      setSelectedDetails(request)
      setDetailsModalOpen(true)
    } finally {
      setDetailsLoading(false)
    }
  }

  const handleCloseDetails = () => {
    setSelectedDetails(null)
    setDetailsModalOpen(false)
  }

  const handleAcceptClick = (request) => {
    console.log('handleAcceptClick called with request:', request)
    console.log('request.id:', request.id)
    console.log('request._id:', request._id)
    setSelectedRequest(request)
    setAcceptModalOpen(true)
  }

  const handleAcceptSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedRequest) return
    
    try {
      // Create payload with schedule options as expected by backend
      const acceptData = {
        sessionDate: acceptFormData.sessionDate,
        sessionTime: acceptFormData.sessionTime,
        meetingLink: acceptFormData.meetingLink,
        mentorMessage: acceptFormData.message
      }
      
      console.log('Submitting accept request with data:', acceptData)
      console.log('Request ID:', selectedRequest.id)
      
      // Call the acceptRequest function from the hook
      await acceptRequest(selectedRequest.id, acceptData)
      
      setAcceptModalOpen(false)
      setSelectedRequest(null)
      setAcceptFormData({
        sessionDate: '',
        sessionTime: '',
        meetingLink: '',
        message: ''
      })
      
      // Show success message
      alert('Mentorship request accepted and scheduled successfully!')
      
      // Refresh requests data
      refresh()
      
    } catch (error) {
      console.error('Accept failed:', error)
      alert(`Failed to accept request: ${error.message || 'Please try again.'}`)
    }
  }

  const handleCloseAcceptModal = () => {
    setAcceptModalOpen(false)
    setSelectedRequest(null)
    setAcceptFormData({
      sessionDate: '',
      sessionTime: '',
      meetingLink: '',
      message: ''
    })
  }

  const pendingRequests = mentorRequests?.filter(r => r.status === 'pending') || []
  const acceptedRequests = mentorRequests?.filter(r => r.status === 'accepted') || []
  const completedRequests = mentorRequests?.filter(r => r.status === 'completed') || []

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Mentees & Requests</h1>
        <p className="text-slate-600 mb-4">Review new mentorship requests and manage accepted mentees.</p>
        
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'completed', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
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
        <div className="space-y-8">
          {/* Pending Requests */}
          {(activeTab === 'all' || activeTab === 'pending') && pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-slate-900 mb-4">Pending Requests ({pendingRequests.length})</h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {request.menteeAvatar && (
                            <img 
                              src={request.menteeAvatar} 
                              alt={request.menteeName}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-slate-900">{request.menteeName}</h3>
                            <p className="text-sm text-slate-500">{request.menteeEmail}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-2">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            {request.menteeDepartment || request.mentee?.department || request.department || 'Not specified'}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="capitalize">{request.menteeRole || request.mentee?.role || request.role || 'Not specified'}</span>
                          </span>
                          {(request.menteeRole === 'student' || request.mentee?.role === 'student' || request.role === 'student') && (request.currentYear || request.mentee?.currentYear || request.mentee?.admissionYear || request.admissionYear) && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {request.currentYear || request.mentee?.currentYear || request.mentee?.admissionYear || request.admissionYear}
                            </span>
                          )}
                          {(request.menteeRole === 'alumni' || request.mentee?.role === 'alumni' || request.role === 'alumni') && (request.passoutYear || request.mentee?.passoutYear || request.mentee?.expectedPassoutYear || request.expectedPassoutYear) && (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {request.passoutYear || request.mentee?.passoutYear || request.mentee?.expectedPassoutYear || request.expectedPassoutYear}
                            </span>
                          )}
                        </div>
                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-700">Service: {request.serviceName || 'General Mentorship'}</p>
                          <p className="text-sm text-slate-600">
                            Preferred: {request.preferredDateTime ? new Date(request.preferredDateTime).toLocaleDateString() : 'Not specified'}
                          </p>
                        </div>
                        {request.requestMessage && (
                          <p className="text-sm text-slate-600 bg-slate-50 rounded p-2">{request.requestMessage}</p>
                        )}
                        {request.menteeSkills && request.menteeSkills.length > 0 && (
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-1">
                              
                            </div>
                          </div>
                        )}
                        
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {request.status?.charAt(0).toUpperCase() + request.status?.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(request)}
                        disabled={detailsLoading}
                        className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium disabled:opacity-50"
                      >
                        {detailsLoading ? 'Loading...' : 'View Details'}
                      </button>
                     
                      <button
                        onClick={() => handleAcceptClick(request)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accepted Mentees */}
          {(activeTab === 'all' || activeTab === 'accepted') && acceptedRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-slate-900 mb-4">Accepted Mentees ({acceptedRequests.length})</h2>
              <div className="space-y-4">
                {acceptedRequests.map((request) => {
                  // Try multiple sources for the session date/time
                  const sessionStartTime = request.sessionDetails?.sessionStartTime ? new Date(request.sessionDetails.sessionStartTime) : 
                                        request.scheduledDateTime ? new Date(request.scheduledDateTime) : 
                                        request.sessionDetails?.sessionDate ? new Date(request.sessionDetails.sessionDate) : null;
                  const sessionEndTime = request.sessionDetails?.sessionEndTime ? new Date(request.sessionDetails.sessionEndTime) : null;
                  const currentTime = new Date();
                  const isSessionTime = sessionStartTime && currentTime >= sessionStartTime && sessionEndTime && currentTime <= sessionEndTime;
                  const fiveMinutesBefore = sessionStartTime && currentTime >= new Date(sessionStartTime.getTime() - 5 * 60000);
                  const isSessionEnded = sessionEndTime && currentTime > sessionEndTime;
                  const meetingLink = request.sessionDetails?.meetingLink || request.meetingLink;
                  
                  // Debug logging
                  console.log('Request:', request.menteeName, {
                    sessionStartTime,
                    sessionEndTime,
                    currentTime,
                    isSessionTime,
                    fiveMinutesBefore,
                    isSessionEnded,
                    meetingLink: !!meetingLink,
                    shouldShowNote: !fiveMinutesBefore && !!meetingLink,
                    sessionDetails: request.sessionDetails
                  });
                  
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
                          onClick={() => handleViewDetails(request)}
                          className="px-3 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-sm font-medium"
                        >
                          View Full Request
                        </button>
                        
                        {meetingLink ? (
                          <>
                            {isSessionTime ? (
                              // ACTIVE: During session time
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
                              // 5 MINUTES BEFORE: Button is active
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
                              // AFTER SESSION: Show Session Status button
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
                              // BEFORE 5 MINUTES: Inactive button with note
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
                          // NO MEETING LINK
                          <div className="px-3 py-2 bg-slate-100 text-slate-400 rounded text-sm font-medium inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Join Meeting 
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Sessions */}
          {(activeTab === 'all' || activeTab === 'completed') && completedRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-slate-900 mb-4">Completed Sessions ({completedRequests.length})</h2>
              <div className="space-y-4">
                {completedRequests.map((request) => (
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
                      <div className="flex gap-2 mt-3">
                        <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                          request.sessionOutcome === 'missed' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {request.sessionOutcome === 'missed' ? 'Missed' : 'Completed'}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
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

          {/* No Requests */}
          {((activeTab === 'all' && pendingRequests.length === 0 && acceptedRequests.length === 0 && completedRequests.length === 0) ||
            (activeTab === 'pending' && pendingRequests.length === 0) ||
            (activeTab === 'accepted' && acceptedRequests.length === 0) ||
            (activeTab === 'completed' && completedRequests.length === 0)) && (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  {activeTab === 'all' ? 'No mentorship requests yet' : `No ${activeTab} requests`}
                </h3>
                <p className="text-sm mt-1">
                  {activeTab === 'all' ? 'When students send you mentorship requests, they\'ll appear here' : `No ${activeTab} mentorship requests at this time`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Request Details Modal */}
      {detailsModalOpen && selectedDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Request Details</h2>
                  <p className="text-sm text-slate-500 mt-1">Complete mentorship request information</p>
                </div>
                <button
                  onClick={handleCloseDetails}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedDetails.status === 'pending' ? 'bg-slate-100 text-slate-700' :
                  selectedDetails.status === 'review' ? 'bg-purple-100 text-purple-700' :
                  selectedDetails.status === 'accepted' ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selectedDetails.status?.charAt(0).toUpperCase() + selectedDetails.status?.slice(1) || 'Unknown'}
                </span>
                <span className="text-sm text-slate-500">
                  Requested {selectedDetails.createdAt ? new Date(selectedDetails.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {/* Mentee Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-widest mb-4">Mentee Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Full Name</p>
                    <p className="text-slate-900 font-medium">{selectedDetails.menteeName || selectedDetails.mentee?.firstName + ' ' + selectedDetails.mentee?.lastName || selectedDetails.firstName + ' ' + selectedDetails.lastName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email Address</p>
                    <p className="text-slate-900">{selectedDetails.menteeEmail || selectedDetails.mentee?.email || selectedDetails.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Department</p>
                    <p className="text-slate-900 font-medium">{selectedDetails.menteeDepartment || selectedDetails.mentee?.department || selectedDetails.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Role</p>
                    <p className="text-slate-900 font-medium capitalize">{selectedDetails.menteeRole || selectedDetails.mentee?.role || selectedDetails.role || 'Not specified'}</p>
                  </div>
                  {(selectedDetails.menteeRole === 'student' || selectedDetails.mentee?.role === 'student' || selectedDetails.role === 'student') && (selectedDetails.currentYear || selectedDetails.mentee?.currentYear || selectedDetails.mentee?.admissionYear || selectedDetails.admissionYear) && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Current Year</p>
                      <p className="text-slate-900 font-medium">{selectedDetails.currentYear || selectedDetails.mentee?.currentYear || selectedDetails.mentee?.admissionYear || selectedDetails.admissionYear}</p>
                    </div>
                  )}
                  {(selectedDetails.menteeRole === 'alumni' || selectedDetails.mentee?.role === 'alumni' || selectedDetails.role === 'alumni') && (selectedDetails.passoutYear || selectedDetails.mentee?.passoutYear || selectedDetails.mentee?.expectedPassoutYear || selectedDetails.expectedPassoutYear) && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Passout Year</p>
                      <p className="text-slate-900 font-medium">{selectedDetails.passoutYear || selectedDetails.mentee?.passoutYear || selectedDetails.mentee?.expectedPassoutYear || selectedDetails.expectedPassoutYear}</p>
                    </div>
                  )}
                </div>
                
              </div>

              {/* Request Details */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Request Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Request Message</p>
                    <p className="text-slate-900 bg-white rounded p-3 border border-slate-200">
                      {selectedDetails.requestMessage || selectedDetails.message || 'No message provided'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Selected Service</p>
                      <p className="text-slate-900 font-medium">
                        {selectedDetails.serviceName || selectedDetails.service?.title || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Mentorship Mode</p>
                      <p className="text-slate-900 font-medium">
                        {selectedDetails.preferredMode || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Preferred Date (from Request)</p>
                    <p className="text-slate-900 font-medium">
                      {selectedDetails.preferredDate || selectedDetails.preferredDateTime ? 
                        new Date(selectedDetails.preferredDate || selectedDetails.preferredDateTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              

              {/* Session Details (for accepted requests) */}
              {selectedDetails.status === 'accepted' && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Session Details
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Scheduled Date</p>
                        <p className="text-slate-900 font-medium">
                          {selectedDetails.sessionDetails?.sessionDate ? new Date(selectedDetails.sessionDetails.sessionDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : selectedDetails.scheduledDateTime ? new Date(selectedDetails.scheduledDateTime).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Scheduled Time</p>
                        <p className="text-slate-900 font-medium">
                          {selectedDetails.sessionDetails?.sessionTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Meeting Link</p>
                      {selectedDetails.sessionDetails?.meetingLink || selectedDetails.meetingLink ? (
                        <a 
                          href={selectedDetails.sessionDetails?.meetingLink || selectedDetails.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {selectedDetails.sessionDetails?.meetingLink || selectedDetails.meetingLink}
                        </a>
                      ) : (
                        <p className="text-slate-500">No meeting link provided</p>
                      )}
                    </div>
                    {(selectedDetails.sessionDetails?.mentorMessage || selectedDetails.notes) && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Mentor Notes</p>
                        <p className="text-slate-900 bg-white rounded p-3 border border-slate-200">
                          {selectedDetails.sessionDetails?.mentorMessage || selectedDetails.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-xl">
              <div className="flex justify-between">
                
               
                <button
                  onClick={handleCloseDetails}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Modal */}
      {acceptModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Accept Mentorship Request</h2>
              <button
                onClick={handleCloseAcceptModal}
                className="text-slate-400 hover:text-slate-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAcceptSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message to Mentee
                </label>
                <textarea
                  value={acceptFormData.message}
                  onChange={(e) => setAcceptFormData({...acceptFormData, message: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add a message for the mentee..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Selected Service
                </label>
                <input
                  type="text"
                  value={selectedRequest.serviceName || selectedRequest.service?.title || 'N/A'}
                  readOnly
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preferred Date (from Request)
                </label>
                <input
                  type="text"
                  value={selectedRequest.preferredDate || selectedRequest.preferredDateTime ? 
                    new Date(selectedRequest.preferredDate || selectedRequest.preferredDateTime).toLocaleDateString() : 'N/A'}
                  readOnly
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Session Date *
                </label>
                <input
                  type="date"
                  value={acceptFormData.sessionDate}
                  onChange={(e) => setAcceptFormData({...acceptFormData, sessionDate: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Session Time
                </label>
                <input
                  type="time"
                  value={acceptFormData.sessionTime}
                  onChange={(e) => setAcceptFormData({...acceptFormData, sessionTime: e.target.value})}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={acceptFormData.meetingLink}
                  onChange={(e) => setAcceptFormData({...acceptFormData, meetingLink: e.target.value})}
                  placeholder="https://meet.google.com/..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseAcceptModal}
                  className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Accept & Schedule
                </button>
              </div>
            </form>
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

      {/* Review Modal */}
      {reviewModalOpen && selectedReviewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Review Details</h3>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Mentee:</span> {selectedReviewRequest.menteeName}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Email:</span> {selectedReviewRequest.menteeEmail}
                </p>
                <p className="text-sm text-slate-600 mb-2">
                  <span className="font-medium">Service:</span> {selectedReviewRequest.serviceName || 'General Mentorship'}
                </p>
              </div>

              {selectedReviewRequest.rating && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-2xl ${star <= selectedReviewRequest.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedReviewRequest.feedback && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Feedback</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <p className="text-sm text-slate-700">{selectedReviewRequest.feedback}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MentorshipMentees
