import { useMentorSessions } from '../../../hooks/useMentorSessions'
import { useState } from 'react'

const MentorshipHistory = () => {
  const { sessions, loading, error, refresh, getSessionDetails } = useMentorSessions()
  const [selectedSession, setSelectedSession] = useState(null)

  const handleViewDetails = async (sessionId) => {
    try {
      const details = await getSessionDetails(sessionId)
      setSelectedSession(details)
    } catch (error) {
      console.error('Failed to fetch session details:', error)
    }
  }

  // Filter only completed sessions for history
  const completedSessions = sessions?.filter(s => s.status === 'completed') || []

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
          {completedSessions.length === 0 ? (
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
            <div className="space-y-4">
              {completedSessions.map((session) => (
                <div key={session._id} className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="font-medium text-slate-900">{session.menteeName}</h4>
                        <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Completed
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-500 mb-3">{session.menteeEmail}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">
                            <span className="font-medium">Session Date:</span>{' '}
                            {new Date(session.scheduledDate).toLocaleDateString()}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Completed:</span>{' '}
                            {new Date(session.completedAt).toLocaleDateString()}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Duration:</span> {session.duration || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-slate-600">
                            <span className="font-medium">Mode:</span> {session.mode || 'Video Call'}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Service:</span> {session.serviceTitle || 'Mentorship Session'}
                          </p>
                        </div>
                      </div>
                      
                      {session.feedback && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm font-medium text-slate-700 mb-1">Mentee Feedback:</p>
                          <p className="text-sm text-slate-600">{session.feedback}</p>
                        </div>
                      )}
                      
                      {session.rating && (
                        <div className="mt-3">
                          <p className="text-sm text-slate-600">
                            <span className="font-medium">Rating:</span>{' '}
                            <span className="text-yellow-500">
                              {'★'.repeat(Math.floor(session.rating))}{'☆'.repeat(5 - Math.floor(session.rating))}
                            </span>
                            <span className="ml-1">({session.rating}/5)</span>
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(session._id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

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
                <h4 className="font-medium text-slate-900 mb-2">Mentee Information</h4>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Name:</span> {selectedSession.menteeName}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Email:</span> {selectedSession.menteeEmail}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Session Information</h4>
                <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Status:</span>{' '}
                    <span className="inline-flex px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {selectedSession.status}
                    </span>
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Mode:</span> {selectedSession.mode || 'Video Call'}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Service:</span> {selectedSession.serviceTitle || 'Mentorship Session'}
                  </p>
                  {selectedSession.scheduledDate && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Scheduled:</span>{' '}
                      {new Date(selectedSession.scheduledDate).toLocaleString()}
                    </p>
                  )}
                  {selectedSession.completedAt && (
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Completed:</span>{' '}
                      {new Date(selectedSession.completedAt).toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Duration:</span> {selectedSession.duration || 'N/A'}
                  </p>
                </div>
              </div>
              
              {selectedSession.feedback && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Feedback</h4>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-600">{selectedSession.feedback}</p>
                  </div>
                </div>
              )}
              
              {selectedSession.rating && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Rating</h4>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-600">
                      <span className="text-yellow-500 text-lg">
                        {'★'.repeat(Math.floor(selectedSession.rating))}{'☆'.repeat(5 - Math.floor(selectedSession.rating))}
                      </span>
                      <span className="ml-2">({selectedSession.rating}/5)</span>
                    </p>
                  </div>
                </div>
              )}
              
              {selectedSession.notes && (
                <div>
                  <h4 className="font-medium text-slate-900 mb-2">Notes</h4>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-600">{selectedSession.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MentorshipHistory
