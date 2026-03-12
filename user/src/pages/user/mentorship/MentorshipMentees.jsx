import { useState } from 'react'
import { useMentorRequests } from '../../../hooks/useMentorRequests'

const MentorshipMentees = () => {
  const { requests, loading, error, acceptRequest, rejectRequest, reviewRequest } = useMentorRequests()
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [acceptModalOpen, setAcceptModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [acceptFormData, setAcceptFormData] = useState({
    sessionDate: '',
    sessionTime: '',
    meetingLink: '',
    message: ''
  })

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
      setSelectedDetails(null)
      setDetailsModalOpen(false)
    } catch (error) {
      console.error('Failed to reject request:', error)
    }
  }

  const handleReview = async (requestId) => {
    try {
      await reviewRequest(requestId)
      setSelectedDetails(null)
      setDetailsModalOpen(false)
    } catch (error) {
      console.error('Failed to review request:', error)
    }
  }

  const handleViewDetails = (request) => {
    setSelectedDetails(request)
    setDetailsModalOpen(true)
  }

  const handleCloseDetails = () => {
    setSelectedDetails(null)
    setDetailsModalOpen(false)
  }

  const handleAcceptClick = (request) => {
    setSelectedRequest(request)
    setAcceptModalOpen(true)
  }

  const handleAcceptSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedRequest) return
    
    try {
      // Create the payload with schedule options as expected by backend
      const acceptData = {
        notes: acceptFormData.message,
        proposedSlots: [
          {
            date: acceptFormData.sessionDate,
            time: acceptFormData.sessionTime,
            meetingLink: acceptFormData.meetingLink
          }
        ]
      }
      
      console.log('Submitting accept request with data:', acceptData)
      console.log('Request ID:', selectedRequest.id || selectedRequest._id)
      
      // Call the acceptRequest function from the hook
      await acceptRequest(selectedRequest.id || selectedRequest._id, acceptData)
      
      setAcceptModalOpen(false)
      setSelectedRequest(null)
      setAcceptFormData({
        sessionDate: '',
        sessionTime: '',
        meetingLink: '',
        message: ''
      })
      
      // Show success message
      alert('Mentorship request accepted successfully!')
      
      // Refresh the page to show updated requests
      window.location.reload()
      
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

  const pendingRequests = requests?.filter(r => r.status === 'pending') || []
  const reviewRequests = requests?.filter(r => r.status === 'review') || []
  const acceptedRequests = requests?.filter(r => r.status === 'accepted') || []

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Mentees & Requests</h1>
        <p className="text-slate-600 mb-4">Review new mentorship requests and manage accepted mentees.</p>
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
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-slate-900 mb-4">Pending Requests ({pendingRequests.length})</h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{request.menteeName}</h3>
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
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleReview(request._id)}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleAcceptClick(request)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
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
              <h2 className="text-lg font-medium text-slate-900 mb-4">Under Review ({reviewRequests.length})</h2>
              <div className="space-y-4">
                {reviewRequests.map((request) => (
                  <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{request.menteeName}</h3>
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
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleAcceptClick(request)}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
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
              <h2 className="text-lg font-medium text-slate-900 mb-4">Accepted Mentees ({acceptedRequests.length})</h2>
              <div className="space-y-4">
                {acceptedRequests.map((request) => {
                  const sessionDateTime = request.sessionDate && request.sessionTime ? 
                    new Date(`${request.sessionDate}T${request.sessionTime}`) : null;
                  const isSessionTime = sessionDateTime && new Date() >= sessionDateTime;
                  
                  return (
                    <div key={request._id} className="bg-white border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-slate-900">{request.menteeName}</h3>
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
                        <div className="flex gap-2 mt-3">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded mt-2">
                            Accepted
                          </span>
                          <button
                            onClick={() => handleViewDetails(request)}
                            className="px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 text-xs font-medium"
                          >
                            View Full Request
                          </button>
                          {request.meetingLink && (
                            <button
                              onClick={() => window.open(request.meetingLink, '_blank')}
                              disabled={!isSessionTime}
                              className={`ml-2 px-3 py-1 rounded text-xs font-medium ${
                                isSessionTime 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {isSessionTime ? 'Join Now' : `Join at ${sessionDateTime ? sessionDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Scheduled Time'}`}
                            </button>
                          )}
                        </div>
                      </div>
                      {sessionDateTime && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Scheduled Session:</strong> {sessionDateTime.toLocaleDateString()} at {sessionDateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                          {request.meetingLink && (
                            <p className="text-xs text-blue-600 mt-1">
                              Meeting Link: <span className="underline">{request.meetingLink}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Requests */}
          {pendingRequests.length === 0 && reviewRequests.length === 0 && acceptedRequests.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2 2H6a2 2 0 01-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-.707.293l-2.414 2.414A1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414 2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-lg font-medium">No mentorship requests yet</p>
                <p className="text-sm mt-1">When students send you mentorship requests, they'll appear here</p>
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
                <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Mentee Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Full Name</p>
                    <p className="text-slate-900 font-medium">{selectedDetails.menteeName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email Address</p>
                    <p className="text-slate-900">{selectedDetails.menteeEmail || 'N/A'}</p>
                  </div>
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
                      {selectedDetails.message || 'No message provided'}
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

              {/* Mentee Skills */}
              {selectedDetails.menteeSkills && selectedDetails.menteeSkills.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Mentee Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDetails.menteeSkills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                          {selectedDetails.sessionDate ? new Date(selectedDetails.sessionDate).toLocaleDateString('en-US', {
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
                          {selectedDetails.sessionTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Meeting Link</p>
                      {selectedDetails.meetingLink ? (
                        <a 
                          href={selectedDetails.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {selectedDetails.meetingLink}
                        </a>
                      ) : (
                        <p className="text-slate-500">No meeting link provided</p>
                      )}
                    </div>
                    {selectedDetails.notes && (
                      <div>
                        <p className="text-sm text-slate-500 mb-1">Mentor Notes</p>
                        <p className="text-slate-900 bg-white rounded p-3 border border-slate-200">
                          {selectedDetails.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-xl">
              <div className="flex justify-end">
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
    </div>
  )
}

export default MentorshipMentees
