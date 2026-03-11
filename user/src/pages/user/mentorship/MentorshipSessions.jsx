import { useMentorSessions } from '../../../hooks/useMentorSessions'
import { useState } from 'react'

const MentorshipSessions = () => {
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

  const upcomingSessions = sessions?.filter(s => s.status === 'scheduled') || []
  const completedSessions = sessions?.filter(s => s.status === 'completed') || []

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Sessions</h2>
        <p className="text-sm text-slate-500">Manage your upcoming and completed mentorship sessions.</p>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-slate-500">Loading sessions...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error.message || 'Failed to load sessions'}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Upcoming Sessions */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Upcoming Sessions ({upcomingSessions.length})
            </h3>
            {upcomingSessions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <p className="text-slate-500">No upcoming sessions scheduled</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session._id} className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-900">{session.menteeName}</h4>
                        <p className="text-sm text-slate-500 mt-1">{session.menteeEmail}</p>
                        
                        <div className="mt-3 space-y-1 text-sm">
                          <p className="text-slate-600">
                            <span className="font-medium">Date:</span> {new Date(session.scheduledDate).toLocaleDateString()}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Time:</span> {new Date(session.scheduledDate).toLocaleTimeString()}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Mode:</span> {session.mode || 'Video Call'}
                          </p>
                          {session.meetingLink && (
                            <p className="text-slate-600">
                              <span className="font-medium">Meeting Link:</span>{' '}
                              <a 
                                href={session.meetingLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Join Meeting
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
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
          </div>

          {/* Completed Sessions */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-4">
              Completed Sessions ({completedSessions.length})
            </h3>
            {completedSessions.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-lg p-6 text-center">
                <p className="text-slate-500">No completed sessions yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedSessions.map((session) => (
                  <div key={session._id} className="bg-white border border-slate-200 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-slate-900">{session.menteeName}</h4>
                        <p className="text-sm text-slate-500 mt-1">{session.menteeEmail}</p>
                        
                        <div className="mt-3 space-y-1 text-sm">
                          <p className="text-slate-600">
                            <span className="font-medium">Completed:</span> {new Date(session.completedAt).toLocaleDateString()}
                          </p>
                          <p className="text-slate-600">
                            <span className="font-medium">Duration:</span> {session.duration || 'N/A'}
                          </p>
                          {session.feedback && (
                            <p className="text-slate-600">
                              <span className="font-medium">Feedback:</span> {session.feedback}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
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
          </div>

          {/* No Sessions */}
          {sessions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-slate-400">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium">No sessions scheduled yet</p>
                <p className="text-sm mt-1">Accepted requests and completed sessions will appear here</p>
              </div>
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
                <h4 className="font-medium text-slate-900">Mentee Information</h4>
                <p className="text-sm text-slate-600">Name: {selectedSession.menteeName}</p>
                <p className="text-sm text-slate-600">Email: {selectedSession.menteeEmail}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-900">Session Details</h4>
                <p className="text-sm text-slate-600">Status: {selectedSession.status}</p>
                <p className="text-sm text-slate-600">Mode: {selectedSession.mode || 'Video Call'}</p>
                {selectedSession.scheduledDate && (
                  <p className="text-sm text-slate-600">
                    Scheduled: {new Date(selectedSession.scheduledDate).toLocaleString()}
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
    </div>
  )
}

export default MentorshipSessions
