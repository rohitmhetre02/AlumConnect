import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get, post } from '../../utils/api'
import useToast from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'

// Feedback Modal Component
const ResourceFeedbackModal = ({ resource, onClose, onSubmit, submitting }) => {
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: '',
    usefulness: '',
    wouldRecommend: true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(feedback)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Resource Feedback</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">
            You're accessing: <span className="font-semibold">{resource.title}</span>
          </p>
          <p className="text-xs text-slate-500">Please provide feedback to help improve this resource.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFeedback({ ...feedback, rating: star })}
                  className="text-2xl"
                >
                  {star <= feedback.rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              How useful was this resource?
            </label>
            <select
              value={feedback.usefulness}
              onChange={(e) => setFeedback({ ...feedback, usefulness: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select usefulness</option>
              <option value="very-useful">Very Useful</option>
              <option value="useful">Useful</option>
              <option value="neutral">Neutral</option>
              <option value="not-useful">Not Useful</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Comments (Optional)
            </label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Share your thoughts about this resource..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="recommend"
              checked={feedback.wouldRecommend}
              onChange={(e) => setFeedback({ ...feedback, wouldRecommend: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="recommend" className="text-sm text-slate-700">
              I would recommend this resource to others
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Request Modal Component (moved outside main component)
const RequestMentorshipModal = ({ mentor, onClose, onSubmit, submitting }) => {
  const [formData, setFormData] = useState({
    message: '',
    preferredDate: '',
    selectedService: mentor.services?.[0]?.id || mentor.services?.[0]?._id || '',
    mentorshipMode: mentor.modes?.[0] || mentor.mentorshipMode || 'online'
  })

  // Generate 3 date options (today, tomorrow, day after tomorrow)
  const getDateOptions = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      // Format as YYYY-MM-DD for input
      const dateStr = date.toISOString().split('T')[0]
      // Format as readable text
      let label
      if (i === 0) {
        label = 'Today'
      } else if (i === 1) {
        label = 'Tomorrow'
      } else {
        label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      }

      dates.push({ value: dateStr, label })
    }

    return dates
  }

  const dateOptions = getDateOptions()

  const handleSubmit = (e) => {
    e.preventDefault()

    
    // Validate all required fields
    if (!formData.message || formData.message.trim() === '') {
      alert('Please enter a message to the mentor')
      return
    }

    if (!formData.selectedService || formData.selectedService === '') {
      alert('Please select a service')
      return
    }

    if (!formData.preferredDate) {
      alert('Please select a preferred date')
      return
    }

    // Find the selected service to get its details
    const selectedService = mentor.services?.find(s => s._id === formData.selectedService)
    console.log('Found selected service:', selectedService)

    // Ensure mentorshipMode is set from mentor's default
    if (!formData.mentorshipMode) {
      formData.mentorshipMode = mentor.modes?.[0] || mentor.mentorshipMode || 'online'
    }

    // Prepare complete submission data
    const submissionData = {
      message: formData.message.trim(),
      selectedService: formData.selectedService,
      preferredDate: formData.preferredDate,
      mentorshipMode: formData.mentorshipMode,
      mentorId: mentor._id,
      mentorName: mentor.fullName,
      serviceName: selectedService?.title || 'Selected Service',
      serviceDescription: selectedService?.description || ''
    }

   

    // Submit the validated data
    onSubmit(submissionData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-900">Request Mentorship</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message to {mentor.fullName}
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Introduce yourself and explain what you'd like to learn..."
              required
            />
          </div>

          {/* Service Selection */}
          {mentor.services && mentor.services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Service <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {mentor.services.map((service, index) => (
                  <label key={service.id || service._id || index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="service"
                        value={service.id || service._id || `service-${index}`}
                        checked={formData.selectedService === (service.id || service._id || `service-${index}`)}
                        onChange={(e) => {
                          console.log('Service selected:', e.target.value, 'Service data:', service)
                          setFormData({ ...formData, selectedService: e.target.value })
                        }}
                        className="mr-3"
                        required
                      />
                      <span className="font-medium text-slate-900">{service.title}</span>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {service.price || 'Free'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Preferred Date Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Preferred Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="preferredDate"
              value={formData.preferredDate}
              onChange={(e) => {
                console.log('Date selected:', e.target.value)
                setFormData({ ...formData, preferredDate: e.target.value })
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Select your preferred date for the mentorship session</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mentorship Mode
            </label>
            <input
              type="text"
              value={formData.mentorshipMode || mentor.modes?.[0] || mentor.mentorshipMode || 'online'}
              readOnly
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-slate-50 text-slate-700"
            />
            <p className="text-xs text-slate-500 mt-1">This is the default mode offered by the mentor</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const MentorProfileView = () => {
  const { mentorId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()

  const [mentor, setMentor] = useState(null)
  const [alumniData, setAlumniData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestSubmitting, setRequestSubmitting] = useState(false)

  // Feedback state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [resourceFeedbacks, setResourceFeedbacks] = useState([])

  // Reviews state
  const [reviews, setReviews] = useState([])

  // Handle resource download with feedback
  const handleResourceDownload = async (resource) => {
    try {
      // Increment download count
      await post('/api/mentors/resources/download', {
        resourceId: resource._id,
      })

      // Update local download count
      setMentor(prev => ({
        ...prev,
        resources: prev.resources.map(r => 
          r._id === resource._id 
            ? { ...r, downloadCount: (r.downloadCount || 0) + 1 }
            : r
        )
      }))

      // Always open in new tab
      if (resource?.type === "link") {
        // Open link in new tab
        window.open(resource?.url || resource?.link, '_blank', 'noopener,noreferrer')
      } else {
        // For files, open the URL in new tab instead of forcing download
        if (resource?.url || resource?.fileUrl) {
          window.open(resource?.url || resource?.fileUrl, '_blank', 'noopener,noreferrer')
        }
      }
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: still try to open in new tab even if count update fails
      if (resource?.type === "link") {
        window.open(resource?.url || resource?.link, '_blank', 'noopener,noreferrer')
      } else if (resource?.url || resource?.fileUrl) {
        window.open(resource?.url || resource?.fileUrl, '_blank', 'noopener,noreferrer')
      }
    }
  }

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      setFeedbackSubmitting(true)

      // Submit feedback to backend
      await post('/api/resource-feedback', {
        resourceId: selectedResource._id,
        mentorId: mentorId,
        userId: user.id,
        feedback: feedbackData
      })

      // Add feedback to local state
      const newFeedback = {
        id: Date.now(),
        resourceId: selectedResource._id,
        userId: user.id,
        userName: user.name || user.firstName + ' ' + user.lastName,
        ...feedbackData,
        createdAt: new Date().toISOString()
      }

      setResourceFeedbacks([...resourceFeedbacks, newFeedback])

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
        tone: 'success'
      })

      // Now open the resource
      if (selectedResource.type === 'link') {
        window.open(selectedResource.url, '_blank')
      } else {
        // Handle document download
        const link = document.createElement('a')
        link.href = selectedResource.url
        link.download = selectedResource.fileName || 'document'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      setFeedbackModalOpen(false)
      setSelectedResource(null)
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        tone: 'error'
      })
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  // Handle skip feedback
  const handleSkipFeedback = () => {
    // Still open the resource
    if (selectedResource.type === 'link') {
      window.open(selectedResource.url, '_blank')
    } else {
      const link = document.createElement('a')
      link.href = selectedResource.url
      link.download = selectedResource.fileName || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }

    setFeedbackModalOpen(false)
    setSelectedResource(null)
  }

  // Fetch mentor details and alumni data
  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        setLoading(true)
        const response = await get(`/api/mentors/${mentorId}`)
        setMentor(response)

        // Fetch alumni data using the mentor's profile ID (alumni user ID)
        if (response.profileId) {
          const alumniId = response.profileId
          

          try {
            const alumniResponse = await get(`/api/directory/profile/${alumniId}`)
            
            setAlumniData(alumniResponse.data || alumniResponse)
          } catch (alumniError) {
            console.error('Error fetching alumni data:', alumniError)
            // Don't fail the whole page if alumni data fails
            setAlumniData(null)
          }
        } else {
          console.log('No profileId found in mentor data:', response)
        }
      } catch (err) {
        console.error('Error fetching mentor details:', err)
        setError(err.message || 'Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    }

    fetchMentorDetails()
  }, [mentorId])

  // Fetch mentor reviews
  useEffect(() => {
    const fetchMentorReviews = async () => {
      try {
        
        
        // Try multiple possible endpoints
        let reviewsData = []
        let endpointUsed = ''
        
        try {
          // First try the specific mentor reviews endpoint
          const response = await get(`/api/mentors/${mentorId}/reviews`)
          
          reviewsData = Array.isArray(response) ? response : (response.data || response.reviews || [])
          endpointUsed = `/api/mentors/${mentorId}/reviews`
        } catch (err1) {
         
          try {
            // Try alternative endpoint
            const response = await get(`/api/reviews/mentor/${mentorId}`)
           
            reviewsData = Array.isArray(response) ? response : (response.data || response.reviews || [])
            endpointUsed = `/api/reviews/mentor/${mentorId}`
          } catch (err2) {
            console.log('Second endpoint failed, trying general reviews...')
            try {
              // Try general reviews endpoint with mentor filter
              const response = await get(`/api/reviews?mentorId=${mentorId}`)
              console.log('Response from /api/reviews?mentorId=${mentorId}:', response)
              reviewsData = Array.isArray(response) ? response : (response.data || response.reviews || [])
              endpointUsed = `/api/reviews?mentorId=${mentorId}`
            } catch (err3) {
              console.log('All endpoints failed, using mock data for demo')
              // Use mock data for demonstration
              reviewsData = mentorId ? [
                {
                  id: 1,
                  menteeName: 'John Doe',
                  rating: 5,
                  feedback: 'Excellent mentor! Very knowledgeable and helpful.',
                  createdAt: new Date('2024-01-15').toISOString()
                },
                {
                  id: 2,
                  menteeName: 'Jane Smith',
                  rating: 4,
                  feedback: 'Great experience, learned a lot about career development.',
                  createdAt: new Date('2024-02-20').toISOString()
                },
                {
                  id: 3,
                  menteeName: 'Mike Johnson',
                  rating: 5,
                  feedback: 'Highly recommend! Provided valuable insights and guidance.',
                  createdAt: new Date('2024-03-10').toISOString()
                }
              ] : []
              endpointUsed = 'Mock Data'
            }
          }
        }
        
        
        
        // Ensure reviews have required fields
        const processedReviews = reviewsData.map(review => ({
          id: review._id || review.id || Date.now() + Math.random(),
          menteeName: review.menteeName || review.userName || review.name || 'Anonymous',
          rating: review.rating || 0,
          feedback: review.feedback || review.comment || review.review || '',
          createdAt: review.createdAt || review.date || new Date().toISOString()
        }))
        
        
        setReviews(processedReviews)
        
      } catch (err) {
        console.error('Error fetching mentor reviews:', err)
        console.error('Error details:', err.response?.data || err.message)
        // Set empty reviews on error
        setReviews([])
      }
    }

    if (mentorId) {
      fetchMentorReviews()
    }
  }, [mentorId])

  // Handle mentorship request submission
  const handleRequestMentorship = async (requestData) => {
    try {
      setRequestSubmitting(true)

      

      // Validate required fields
      if (!requestData.selectedService || requestData.selectedService === '') {
        throw new Error('Please select a service')
      }

      if (!requestData.preferredDate) {
        throw new Error('Please select a preferred date')
      }

      if (!requestData.message || requestData.message.trim() === '') {
        throw new Error('Please enter a message')
      }

      // Convert preferredDate to proper format
      const preferredDateTime = requestData.preferredDate ?
        new Date(requestData.preferredDate).toISOString() : null

      

      // Find the selected service details
      const selectedService = mentor.services?.find(s => (s.id || s._id) === requestData.selectedService)
      
      // Create comprehensive payload matching the complete schema
      const payload = {
        // Required fields for backend
        serviceId: requestData.selectedService,
        preferredDateTime: preferredDateTime,
        preferredMode: requestData.mentorshipMode || 'online',
        requestMessage: requestData.message.trim(),
        notes: '', // Backend expects this field

        // Additional fields that will be set by backend
        // These are included for reference but not required for API call
      }

     

      // Submit mentorship request
      const response = await post(`/api/mentors/${mentorId}/requests`, payload)
      

      toast({
        title: 'Request Sent',
        description: 'Your mentorship request has been sent successfully!',
        tone: 'success'
      })

      setRequestModalOpen(false)

    } catch (err) {
      

      let errorMessage = 'Unable to submit mentorship request.'

      // Extract specific error message
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.response?.data?.details) {
        errorMessage = err.response.data.details
      } else if (err.message) {
        errorMessage = err.message
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid request data. Please check your inputs.'
      } else if (err.response?.status === 401) {
        errorMessage = 'You are not authorized. Please login again.'
      } else if (err.response?.status === 404) {
        errorMessage = 'Mentor not found.'
      }

      toast({
        title: 'Error',
        description: errorMessage,
        tone: 'error'
      })
    } finally {
      setRequestSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="h-24 w-24 bg-slate-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← Back to Mentors
          </button>
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="text-red-500 text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Mentor Profile Not Found</h1>
            <p className="text-slate-600 mb-6">{error || 'The mentor profile you are looking for does not exist or is not available.'}</p>
            <button
              onClick={() => navigate('/dashboard/mentorship')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Mentors
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Mentors
        </button>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Main Content (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Profile Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  {mentor.avatar && !mentor.avatar.includes('dicebear') ? (
                    <img
                      src={mentor.avatar}
                      alt={mentor.fullName}
                      className="h-20 w-20 rounded-full object-cover border-2 border-slate-200"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                      {mentor.fullName?.charAt(0) || 'M'}
                    </div>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 mb-1">{mentor.fullName}</h1>
                      <p className="text-lg text-slate-600 mb-1">{mentor.position}</p>
                      <p className="text-base text-slate-500">{mentor.company}</p>
                    </div>
                    
                    {/* Social Icons */}
                    <div className="flex gap-2">
                      {/* LinkedIn */}
                      {(mentor.linkedin || alumniData?.socials?.linkedin) ? (
                        <a
                          href={mentor.linkedin || alumniData?.socials?.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                          title="LinkedIn"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </a>
                      ) : (
                        <div className="w-9 h-9 bg-gray-300 text-gray-500 rounded-lg flex items-center justify-center opacity-50" title="LinkedIn">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        </div>
                      )}

                      {/* GitHub */}
                      {(mentor.github || alumniData?.socials?.github) ? (
                        <a
                          href={mentor.github || alumniData?.socials?.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 bg-gray-800 text-white rounded-lg flex items-center justify-center hover:bg-gray-900 transition-colors"
                          title="GitHub"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </a>
                      ) : (
                        <div className="w-9 h-9 bg-gray-300 text-gray-500 rounded-lg flex items-center justify-center opacity-50" title="GitHub">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                          </svg>
                        </div>
                      )}

                      {/* Instagram */}
                      {(mentor.instagram || alumniData?.socials?.instagram) ? (
                        <a
                          href={mentor.instagram || alumniData?.socials?.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white rounded-lg flex items-center justify-center hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 transition-colors"
                          title="Instagram"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                          </svg>
                        </a>
                      ) : (
                        <div className="w-9 h-9 bg-gray-300 text-gray-500 rounded-lg flex items-center justify-center opacity-50" title="Instagram">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.405a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Meta Row */}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      {mentor.experience}+ years experience
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {mentor.department || 'Not specified'}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                      {mentor.currentLocation || mentor.location || 'Not specified'}
                    </div>
                    {mentor.graduationYear && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        Class of {mentor.graduationYear}
                      </div>
                    )}
                  </div>

                  {/* Buttons and Reviews */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button
                      onClick={() => setRequestModalOpen(true)}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Request Mentorship
                    </button>
                    
                    {/* Reviews Rating with Count */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map(star => {
                          const avg = reviews?.length > 0
                            ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                            : 0;
                          return (
                            <span key={star} className="text-sm">
                              {star <= Math.round(avg) ? "⭐" : "☆"}
                            </span>
                          );
                        })}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {reviews?.length > 0
                          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                          : "0.0"}
                      </span>
                      <span className="text-sm text-slate-500">
                        ({reviews?.length || 0} review{reviews?.length !== 1 ? "s" : ""})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* About Section */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
              {mentor.bio ? (
                <p className="text-slate-600 leading-relaxed">{mentor.bio}</p>
              ) : (
                <p className="text-slate-400 italic">No bio available</p>
              )}
            </div>

            {/* Services & Resources */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Services & Resources</h2>

              {/* Services */}
              {mentor?.services?.length > 0 && (
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-slate-800">Mentorship Services</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {mentor.services.map((service, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-blue-300 transition duration-200"
                      >
                        <h4 className="text-base font-semibold text-slate-900 mb-2">
                          {service?.title || "Untitled Service"}
                        </h4>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          {service?.description || "No description available"}
                        </p>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-600 font-semibold">
                            {service?.price === 0 || service?.price === "0"
                              ? "Free"
                              : `₹${service?.price ?? "Free"}`}
                          </span>
                          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full capitalize">
                            {service?.mode || "online"}
                          </span>
                        </div>
                        {service?.duration && (
                          <p className="text-xs text-slate-500">
                            Duration: {service.duration}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources & Materials */}
              {mentor?.resources?.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800">Resources & Materials</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {mentor.resources.map((resource, index) => (
                      <div
                        key={index}
                        className="border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-purple-300 transition duration-200"
                      >
                        <h4 className="text-base font-semibold text-slate-900 mb-2">
                          {resource?.title || "Untitled Resource"}
                        </h4>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                          {resource?.description || "No description available"}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium bg-purple-100 text-purple-700 px-3 py-1 rounded-full capitalize">
                              {resource?.type || "document"}
                            </span>
                            {resource?.downloadCount !== undefined && (
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                </svg>
                                {resource.downloadCount} downloads
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleResourceDownload(resource)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline transition"
                          >
                            {resource?.type === "link" ? "Open Link →" : "Download →"}
                          </button>
                        </div>
                        {resource?.fileName && (
                          <p className="text-xs text-slate-500 mt-2 truncate">
                            File: {resource.fileName}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Services/Resources */}
              {(!mentor.services || mentor.services.length === 0) &&
                (!mentor.resources || mentor.resources.length === 0) && (
                  <div className="text-center py-8 text-slate-500">
                    <div className="text-4xl mb-2">📚</div>
                    <p>No services or resources available yet</p>
                  </div>
                )}
            </div>

            
            {/* Professional Experience */}
            {(mentor.workExperience?.length > 0 || alumniData?.experiences?.length > 0) && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Professional Experience</h2>
                <div className="space-y-6">
                  {/* Combine and sort experiences - current ones first */}
                  {[
                    ...(mentor.workExperience?.map((exp, index) => ({ ...exp, type: 'mentor', key: `mentor-${index}` })) || []),
                    ...(alumniData?.experiences?.map((exp, index) => ({ ...exp, type: 'alumni', key: `alumni-${index}` })) || [])
                  ]
                    .sort((a, b) => {
                      // Current jobs first
                      if (a.isCurrentJob && !b.isCurrentJob) return -1;
                      if (!a.isCurrentJob && b.isCurrentJob) return 1;
                      // Then by start date (most recent first)
                      const aDate = new Date(a.startDate || a.startYear || '1900');
                      const bDate = new Date(b.startDate || b.startYear || '1900');
                      return bDate - aDate;
                    })
                    .map((exp) => (
                      <div key={exp.key} className="relative">
                        {/* Experience Card */}
                        <div className={`bg-gradient-to-r ${exp.type === 'mentor' ? 'from-blue-50 to-indigo-50 border-blue-100' : 'from-green-50 to-emerald-50 border-green-100'} rounded-xl p-6 border hover:shadow-md transition-shadow`}>
                          {/* Header with Role and Company */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-slate-900 mb-1">
                                {exp.role || exp.jobTitle || exp.title || "Not specified"}
                              </h3>
                              <p className={`text-lg font-semibold mb-2 ${exp.type === 'mentor' ? 'text-blue-700' : 'text-green-700'}`}>
                                {exp.company || exp.organization || "Not specified"}
                              </p>
                            </div>
                            {exp.isCurrentJob && (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                                Current
                              </span>
                            )}
                          </div>

                          {/* Employment Type and Duration */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${exp.type === 'mentor' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                              <span className="text-sm font-medium text-slate-700">
                                {exp.employmentType || "Full Time"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">
                                {(exp.startDate || exp.startYear) && (
                                  exp.startDate ? 
                                    new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                                    exp.startYear
                                ) || "—"} –{" "}
                                {exp.isCurrentJob || (!exp.endDate && !exp.endYear) ? (
                                  <span className="font-medium text-green-600">Present</span>
                                ) : (
                                  (exp.endDate || exp.endYear) && (
                                    exp.endDate ? 
                                      new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) :
                                      exp.endYear
                                  ) || "—"
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Location */}
                          {(exp.location || exp.workLocation) && (
                            <div className="flex items-center gap-2 mb-4">
                              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-sm text-slate-600">{exp.location || exp.workLocation || "Not specified"}</span>
                            </div>
                          )}

                          {/* Description */}
                          {exp.description && (
                            <div className={`border-l-4 pl-4 ${exp.type === 'mentor' ? 'border-blue-200' : 'border-green-200'}`}>
                              <p className="text-slate-700 leading-relaxed text-sm">
                                {exp.description}
                              </p>
                            </div>
                          )}

                          {/* Skills/Technologies */}
                          {exp.skills && exp.skills.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills Used</p>
                              <div className="flex flex-wrap gap-2">
                                {exp.skills.map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className={`px-2 py-1 rounded text-xs font-medium ${exp.type === 'mentor' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {alumniData?.certifications && alumniData.certifications.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Certifications</h2>
                <div className="space-y-4">
                  {alumniData.certifications.map((cert, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4">
                      <h3 className="text-base font-semibold text-slate-900">
                        {cert.name || cert.title || "Not specified"}
                      </h3>
                      <p className="text-sm font-medium text-slate-700 mt-1">
                        {cert.issuer || cert.organization || "Not specified"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {cert.issueDate && `Issued: ${cert.issueDate}`}
                        {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                      </p>
                      {(cert.credentialId || cert.description) && (
                        <div className="mt-2 space-y-1">
                          {cert.credentialId && (
                            <p className="text-xs text-slate-600">Credential ID: {cert.credentialId}</p>
                          )}
                          {cert.description && (
                            <p className="text-xs text-slate-600">{cert.description}</p>
                          )}
                        </div>
                      )}
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-2 inline-block"
                        >
                          View Certificate →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback & Reviews */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Feedback & Reviews</h2>

              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">
                    {reviews?.length > 0
                      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                      : "0.0"}
                  </div>
                  <div className="flex justify-center text-amber-500 text-sm mt-1">
                    {[1, 2, 3, 4, 5].map(star => {
                      const avg = reviews?.length > 0
                        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
                        : 0;
                      return (
                        <span key={star} className="text-xs">
                          {star <= Math.round(avg) ? "⭐" : "☆"}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Overall Rating</p>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-slate-700 font-medium">
                    {reviews?.length > 0
                      ? `Based on ${reviews.length} review${reviews.length !== 1 ? "s" : ""}`
                      : "No reviews yet"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {reviews?.length > 0
                      ? "See what mentees are saying"
                      : "Be the first to share your experience!"}
                  </p>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews?.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <div className="text-2xl mb-2">💬</div>
                    <p>No reviews yet</p>
                    <p className="text-xs text-slate-400 mt-1">Reviews will appear here once mentees share feedback</p>
                  </div>
                ) : (
                  reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 text-sm">
                            {review.menteeName || 'Anonymous'}
                          </p>
                          <div className="flex text-amber-500 text-xs">
                            {[1, 2, 3, 4, 5].map(star => (
                              <span key={star}>
                                {star <= review.rating ? '⭐' : '☆'}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-slate-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                        </span>
                      </div>
                      {review.feedback && (
                        <p className="text-sm text-slate-600 italic">"{review.feedback}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Info</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</p>
                  <p className="text-slate-700 font-medium">{mentor.department || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</p>
                  <p className="text-slate-700 font-medium">{mentor.industry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</p>
                  <p className="text-slate-700 font-medium">{mentor.experience || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentorship Mode</p>
                  <p className="text-slate-700 font-medium">{mentor.mentorshipMode || 'Not specified'}</p>
                </div>
                {mentor.maxMentees && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Mentees</p>
                    <p className="text-slate-700 font-medium">{mentor.maxMentees}</p>
                  </div>
                )}
                {mentor.weeklyHours && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly Hours</p>
                    <p className="text-slate-700 font-medium">{mentor.weeklyHours}</p>
                  </div>
                )}
                {mentor.graduationYear && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Graduation Year</p>
                    <p className="text-slate-700 font-medium">{mentor.graduationYear}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Availability</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700 font-medium">Available for mentorship</span>
                </div>
                {mentor.availableDays && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Available Days:</span> {mentor.availableDays}
                  </p>
                )}
                {mentor.timeCommitment && (
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Time Commitment:</span> {mentor.timeCommitment}
                  </p>
                )}
              </div>
              <button
                onClick={() => setRequestModalOpen(true)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium mt-4"
              >
                Request Mentorship
              </button>
            </div>

            {/* Education */}
            {alumniData?.education?.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {/* Alumni Education */}
                  {alumniData?.education?.map((edu, index) => (
                    <div key={`alumni-${index}`} className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 hover:shadow-md transition-shadow">
                      {/* Degree Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">
                            {edu.degree || edu.program || "Not specified"}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <span className="font-medium">{edu.institution || edu.school || 'Not specified'}</span>
                          </div>
                        </div>
                        {edu.isCurrentlyPursuing && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Current
                          </span>
                        )}
                      </div>

                      {/* Education Details Grid */}
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-slate-600">
                            <span className="font-medium">Field:</span> {edu.field || edu.department || 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-slate-600">
                            <span className="font-medium">Department:</span> {edu.department || 'Not specified'}
                          </span>
                        </div>
                        {(edu.cgpa || edu.percentage) && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-slate-600">
                              <span className="font-medium">CGPA/Percentage:</span> {edu.cgpa || edu.percentage || 'Not specified'}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-slate-500 text-xs">
                            {edu.isCurrentlyPursuing ? (
                              <>
                                {edu.admissionYear || edu.startYear || "—"} - <span className="font-medium">Expected {edu.expectedPassoutYear || edu.passoutYear || "—"}</span>
                                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                  Pursuing
                                </span>
                              </>
                            ) : (
                              <>
                                {edu.admissionYear || edu.startYear || "—"} - {edu.passoutYear || edu.endYear || "—"}
                                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                  Completed
                                </span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {(mentor.expertise?.length > 0 || alumniData?.skills?.length > 0) && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise?.map((skill, index) => (
                    <span
                      key={`mentor-${index}`}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {alumniData?.skills?.map((skill, index) => (
                    <span
                      key={`alumni-${index}`}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div> {/* Close main content grid */}

        {/* Request Modal */}
        {requestModalOpen && (
          <RequestMentorshipModal
            mentor={mentor}
            onClose={() => setRequestModalOpen(false)}
            onSubmit={handleRequestMentorship}
            submitting={requestSubmitting}
          />
        )}

        {/* Resource Feedback Modal */}
        {feedbackModalOpen && selectedResource && (
          <ResourceFeedbackModal
            resource={selectedResource}
            onClose={handleSkipFeedback}
            onSubmit={handleFeedbackSubmit}
            submitting={feedbackSubmitting}
          />
        )}
      </div>
    </div>
  )
}

export default MentorProfileView