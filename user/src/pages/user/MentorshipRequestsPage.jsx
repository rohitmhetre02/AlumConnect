import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import useMentorRequests from '../../hooks/useMentorRequests'

const STATUS_TONE = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-700',
}

const formatDateTime = (value) => {
  if (!value) return '—'
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

const MentorshipRequestsPage = () => {

  const { user } = useAuth()
  const { requests, loading, error, refresh } = useMentorRequests()

  const [activeTab, setActiveTab] = useState('all')
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedReviewRequest, setSelectedReviewRequest] = useState(null)
  const [reviewData, setReviewData] = useState({
    rating: 5,
    feedback: ''
  })

  // Only requests sent by the user
  const userRequests = useMemo(() => {
    if (!Array.isArray(requests) || !user?.id) return []

    return requests.filter((request) => {
      const menteeId = request?.mentee?._id || request?.mentee || request?.menteeId
      const userId = user?.id || user?._id
      return String(menteeId) === String(userId)
    })

  }, [requests, user?.id, user?._id])


  // Categorize requests
  const categorizedRequests = useMemo(() => {

    const categories = {
      pending: [],
      accepted: [],
      rejected: [],
      completed: [],
    }

    userRequests.forEach((request) => {

      const status = String(request?.status ?? '').toLowerCase()

      switch (status) {

        case 'accepted':
          // Show normal accepted requests in accepted section
          categories.accepted.push(request)
          break

        case 'rejected':
          categories.rejected.push(request)
          break

        case 'completed':
          // All completed requests go to completed section
          categories.completed.push(request)
          break

        default:
          categories.pending.push(request)

      }

    })

    return categories

  }, [userRequests])


  // Filter based on tab
  const filteredRequests = useMemo(() => {

    switch (activeTab) {

      case 'pending':
        return categorizedRequests.pending

      case 'accepted':
        return categorizedRequests.accepted

      case 'rejected':
        return categorizedRequests.rejected

      case 'completed':
        return categorizedRequests.completed

      case 'all':
      default:
        return [
          ...categorizedRequests.pending,
          ...categorizedRequests.accepted,
          ...categorizedRequests.rejected,
          ...categorizedRequests.completed
        ]

    }

  }, [activeTab, categorizedRequests])

  const handleWriteReview = (request) => {
    setSelectedReviewRequest(request)
    setReviewData({
      rating: 5,
      feedback: ''
    })
    setReviewModalOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedReviewRequest) return

    try {
      const response = await fetch(`/api/mentors/my-requests/${selectedReviewRequest.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit review')
      }

      setReviewModalOpen(false)
      setSelectedReviewRequest(null)
      refresh() // Refresh the requests list
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const handleViewReview = (request) => {
    alert(`Review Details:\n\nRating: ${request.rating ? '⭐'.repeat(request.rating) : 'Not rated'}\n\nFeedback: ${request.feedback || 'No feedback provided'}`)
  }

  const renderRequestCard = (request) => {

    const status = String(request?.status ?? '').toLowerCase()
    const tone = STATUS_TONE[status] || STATUS_TONE.pending

    let mentorName = 'Mentor'
    let mentorEmail = 'No email'
    let mentorId = null

    if (request?.mentor?.firstName && request?.mentor?.lastName) {

      mentorName = `${request.mentor.firstName} ${request.mentor.lastName}`
      mentorEmail = request.mentor.email || 'No email'
      mentorId = request.mentor._id || request.mentor.id

    } else if (request.mentorName) {

      mentorName = request.mentorName
      mentorEmail = request.mentorEmail || 'No email'
      mentorId = request.mentor

    }

    const mentorAvatar = request?.mentor?.avatar || request.mentorAvatar || ''

    const handleMentorClick = () => {
      if (mentorId) {
        window.location.href = `/dashboard/mentorship/profile/${mentorId}`
      }
    }

    return (

      <div
        key={request._id}
        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
      >

        {/* Header */}
        <div className="flex justify-between items-start mb-3">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">

              {mentorAvatar ? (

                <img
                  src={mentorAvatar}
                  alt={mentorName}
                  className="w-full h-full rounded-full object-cover"
                />

              ) : (

                mentorName.slice(0, 2).toUpperCase()

              )}

            </div>

            <div>

              <h3
                className="font-semibold text-slate-900 hover:text-primary cursor-pointer"
                onClick={handleMentorClick}
              >
                {mentorName}
              </h3>

              <p className="text-sm text-slate-500">
                {mentorEmail}
              </p>

            </div>

          </div>

          <span className={`px-2 py-1 text-xs rounded-full ${tone}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>

        </div>


        {/* Request Details */}
        <div className="space-y-2">

          <div className="text-sm text-slate-600">
            <b>Service:</b> {request.serviceName || 'Mentorship Service'}
          </div>

          <div className="text-sm text-slate-600">
            <b>Mode:</b> {(request.serviceMode || 'online').toUpperCase()}
          </div>

          <div className="text-sm text-slate-600">
            <b>Duration:</b> {request.serviceDuration ? `${request.serviceDuration} minutes` : '—'}
          </div>

          <div className="text-sm text-slate-600">
            <b>Preferred Date:</b> {formatDateTime(request.preferredDateTime)}
          </div>


          {request.requestMessage && (

            <div className="text-sm text-slate-600">
              <b>Message:</b>
              <p className="text-slate-500">{request.requestMessage}</p>
            </div>

          )}


          {/* Accepted Session */}
          {status === 'accepted' && request.sessionDetails && (

            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">

              <div className="text-sm text-green-700 space-y-1">

                <div>
                  <b>Date:</b> {new Date(request.sessionDetails.sessionDate).toLocaleDateString()}
                </div>

                <div>
                  <b>Time:</b>
                  {new Date(request.sessionDetails.sessionStartTime).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                </div>

                {request.sessionDetails.meetingLink && (

                  <a
                    href={request.sessionDetails.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Join Meeting
                  </a>

                )}

              </div>

            </div>

          )}

          {/* Completed */}
          {status === 'completed' && (
            <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">

              {/* Debug logging */}
              {console.log('Completed request data:', {
                id: request.id,
                status: request.status,
                sessionOutcome: request.sessionOutcome,
                reviewSubmitted: request.reviewSubmitted,
                rating: request.rating,
                feedback: request.feedback
              })}

              {request.sessionOutcome && !(request.sessionOutcome === 'completed' && request.reviewSubmitted) && (
                <div>
                  <b>Session Outcome:</b> {request.sessionOutcome}
                </div>
              )}

              {request.sessionOutcome === 'missed' && request.remark && (
                <div>
                  <b>Remark:</b> {request.remark}
                </div>
              )}

              {request.sessionOutcome === 'completed' && !request.reviewSubmitted && (
                <div className="mt-2">
                  <div className="text-orange-600 font-medium mb-2">Review not submitted</div>
                  <button
                    onClick={() => handleWriteReview(request)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                  >
                    Write Review
                  </button>
                </div>
              )}

              {request.sessionOutcome === 'completed' && request.reviewSubmitted && (
                <div className="mt-2">
                  <div className="text-green-600 font-medium mb-2">✓ Review submitted</div>
                  {request.rating && (
                    <div className="mb-1">
                      <b>Rating:</b> {'⭐'.repeat(request.rating)}
                    </div>
                  )}
                  {request.feedback && (
                    <div className="mb-2">
                      <b>Feedback:</b> {request.feedback}
                    </div>
                  )}
                  <button
                    onClick={() => handleViewReview(request)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    View Review
                  </button>
                </div>
              )}

            </div>
          )}

        </div>


        <div className="flex justify-between mt-4 text-xs text-slate-500">

          <span>
            Requested: {formatDateTime(request.createdAt)}
          </span>

        </div>

      </div>

    )
  }


  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">

      <div className="mx-auto max-w-6xl px-4 py-8">


        {/* Header */}
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="flex justify-between items-start">

            <div>

              <p className="text-xs uppercase text-slate-400">
                My Activity
              </p>

              <h1 className="text-3xl font-bold text-slate-900 mt-1">
                Mentorship Requests
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                Track mentorship requests you sent to mentors
              </p>

            </div>

            <button
              onClick={refresh}
              className="border px-4 py-2 rounded-full text-sm hover:border-primary hover:text-primary"
            >
              Refresh
            </button>

          </div>


          {/* Tabs */}
          <div className="flex gap-3 mt-6">

            {['all','pending','accepted','rejected','completed'].map(tab => (

              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm border transition
                ${
                  activeTab === tab
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-600 hover:border-primary hover:text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>

            ))}

          </div>

        </header>


        {/* Content */}
        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

          {loading ? (

            <div className="text-center py-10">
              Loading mentorship requests...
            </div>

          ) : error ? (

            <div className="text-center text-red-500">
              Error loading requests
            </div>

          ) : filteredRequests.length === 0 ? (

            <div className="text-center text-slate-500">
              No requests found
            </div>

          ) : (

            <div className="space-y-4">

              {filteredRequests.map(renderRequestCard)}

            </div>

          )}

        </div>

      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedReviewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Write Review</h3>
              
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-2">
                  Review for: {selectedReviewRequest.mentorName || 'Mentor'}
                </p>
                <p className="text-sm text-slate-600">
                  Service: {selectedReviewRequest.serviceName || 'Mentorship Service'}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewData({...reviewData, rating: star})}
                      className={`text-2xl ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Feedback</label>
                <textarea
                  value={reviewData.feedback}
                  onChange={(e) => setReviewData({...reviewData, feedback: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>

  )

}

export default MentorshipRequestsPage