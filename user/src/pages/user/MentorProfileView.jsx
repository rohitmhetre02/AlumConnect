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
                  onClick={() => setFeedback({...feedback, rating: star})}
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
              onChange={(e) => setFeedback({...feedback, usefulness: e.target.value})}
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
              onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
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
              onChange={(e) => setFeedback({...feedback, wouldRecommend: e.target.checked})}
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
    
    console.log('=== FORM SUBMISSION DEBUG ===')
    console.log('Current formData:', formData)
    console.log('Mentor services:', mentor.services)
    
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
    
    console.log('Form validation passed')
    console.log('Complete submission data:', submissionData)
    
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
              onChange={(e) => setFormData({...formData, message: e.target.value})}
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
                          setFormData({...formData, selectedService: e.target.value})
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
                setFormData({...formData, preferredDate: e.target.value})
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
  const handleResourceDownload = (resource) => {
    setSelectedResource(resource)
    setFeedbackModalOpen(true)
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

  // Fetch mentor details
  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        setLoading(true)
        const response = await get(`/api/mentors/${mentorId}`)
        setMentor(response)
      } catch (err) {
        console.error('Error fetching mentor details:', err)
        setError(err.message || 'Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    }

    if (mentorId) {
      fetchMentorDetails()
    }
  }, [mentorId])

  // Fetch mentor reviews
  useEffect(() => {
    const fetchMentorReviews = async () => {
      try {
        console.log('=== FETCHING MENTOR REVIEWS ===')
        console.log('Mentor ID:', mentorId)
        const response = await get(`/api/mentors/${mentorId}/reviews`)
        console.log('Mentor reviews response:', response)
        console.log('Response data:', response.data)
        console.log('Response type:', typeof response)
        
        // Handle both direct array and object with data property
        const reviewsData = Array.isArray(response) ? response : (response.data || response || [])
        console.log('Setting reviews:', reviewsData)
        console.log('Reviews length:', reviewsData.length)
        
        setReviews(reviewsData)
      } catch (err) {
        console.error('Error fetching mentor reviews:', err)
        console.error('Error details:', err.response?.data || err.message)
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
      
      console.log('=== MENTORSHIP REQUEST SUBMISSION ===')
      console.log('Received request data:', requestData)
      console.log('Mentor ID:', mentorId)
      console.log('User:', user)
      console.log('Mentor:', mentor)
      
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
      
      console.log('Processed preferredDateTime:', preferredDateTime)
      
      // Find the selected service details
      const selectedService = mentor.services?.find(s => (s.id || s._id) === requestData.selectedService)
      console.log('Selected service details:', selectedService)
      
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
      
      console.log('=== FINAL COMPREHENSIVE PAYLOAD ===')
      console.log('Payload:', JSON.stringify(payload, null, 2))
      
      // Submit mentorship request
      const response = await post(`/api/mentors/${mentorId}/requests`, payload)
      console.log('Request submission SUCCESS:', response)
      
      toast({
        title: 'Request Sent',
        description: 'Your mentorship request has been sent successfully!',
        tone: 'success'
      })
      
      setRequestModalOpen(false)
      
    } catch (err) {
      console.error('=== SUBMISSION ERROR ===')
      console.error('Error:', err)
      console.error('Error response:', err.response?.data)
      console.error('Error status:', err.response?.status)
      console.error('Error details:', err.response?.data?.details || err.response?.data?.message)
      
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
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← Back to Mentors
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Photo */}
            <div className="relative">
              {mentor.avatar && !mentor.avatar.includes('dicebear') ? (
                <img
                  src={mentor.avatar}
                  alt={mentor.fullName}
                  className="h-32 w-32 rounded-full object-cover border-4 border-slate-200"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                  {mentor.fullName?.charAt(0) || 'M'}
                </div>
              )}
              {mentor.rating && (
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1">
                  ⭐ {mentor.rating.toFixed(1)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{mentor.fullName}</h1>
              <p className="text-xl text-slate-600 mb-1">{mentor.position}</p>
              <p className="text-lg text-slate-500 mb-4">{mentor.company} • {mentor.industry}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  {mentor.experience} years experience
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  {mentor.department}
                </div>
                {mentor.mentorshipMode && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    {mentor.mentorshipMode}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setRequestModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Request Mentorship
                </button>
                <button
                  className="border border-slate-300 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About</h2>
              {mentor.bio ? (
                <p className="text-slate-600 leading-relaxed">{mentor.bio}</p>
              ) : (
                <p className="text-slate-400 italic">No bio available</p>
              )}
            </div>

            {/* Expertise & Skills */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Expertise & Skills</h2>
              <div className="space-y-4">
                {mentor.expertise && mentor.expertise.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.expertise.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {mentor.categories && mentor.categories.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {mentor.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Work Experience */}
            {mentor.workExperience && mentor.workExperience.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Work Experience</h2>
                <div className="space-y-4">
                  {mentor.workExperience.map((exp, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <h3 className="font-semibold text-slate-900">{exp.role}</h3>
                      <p className="text-slate-700 font-medium">{exp.company}</p>
                      <p className="text-sm text-slate-500">
                        {exp.startDate} - {exp.isCurrentJob ? 'Present' : exp.endDate}
                      </p>
                      {exp.description && (
                        <p className="text-slate-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {mentor.education && mentor.education.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Education</h2>
                <div className="space-y-4">
                  {mentor.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-4">
                      <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                      <p className="text-slate-700 font-medium">{edu.institution}</p>
                      <p className="text-sm text-slate-500">
                        {edu.admissionYear} - {edu.isCurrentlyPursuing ? 'Present' : edu.passoutYear}
                      </p>
                      {edu.field && (
                        <p className="text-slate-600">Field: {edu.field}</p>
                      )}
                      {edu.cgpa && (
                        <p className="text-slate-600">CGPA: {edu.cgpa}</p>
                      )}
                      {edu.description && (
                        <p className="text-slate-600 mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentor.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      📧
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="text-slate-700">{mentor.email}</p>
                    </div>
                  </div>
                )}
                {mentor.contactNumber && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      📱
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="text-slate-700">{mentor.contactNumber}</p>
                    </div>
                  </div>
                )}
                {mentor.linkedin && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      💼
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">LinkedIn</p>
                      <a
                        href={mentor.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </a>
                    </div>
                  </div>
                )}
                {mentor.location && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      📍
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="text-slate-700">{mentor.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services & Resources */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Services & Resources</h2>
              
              {/* Services */}
              {mentor.services && mentor.services.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Mentorship Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentor.services.map((service, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-2">{service.title}</h4>
                        <p className="text-slate-600 text-sm mb-2">{service.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-600 font-semibold">₹{service.price || 'Free'}</span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {service.mode || 'Online'}
                          </span>
                        </div>
                        {service.duration && (
                          <p className="text-xs text-slate-500 mt-2">Duration: {service.duration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {mentor.resources && mentor.resources.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Resources & Materials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mentor.resources.map((resource, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-semibold text-slate-900 mb-2">{resource.title}</h4>
                        <p className="text-slate-600 text-sm mb-3">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {resource.type || 'Document'}
                          </span>
                          <button
                            onClick={() => handleResourceDownload(resource)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {resource.type === 'link' ? 'Open Link →' : 'Download →'}
                          </button>
                        </div>
                        {resource.fileName && (
                          <p className="text-xs text-slate-500 mt-2">File: {resource.fileName}</p>
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

            {/* Feedback & Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Feedback & Reviews</h2>
              
              {/* Rating Summary */}
              <div className="flex items-center gap-6 mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900">
                    {reviews.length > 0 ? 
                      (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 
                      '0.0'
                    }
                  </div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map(star => {
                      const averageRating = reviews.length > 0 ? 
                        reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0
                      return (
                        <span key={star}>
                          {star <= Math.round(averageRating) ? '⭐' : '☆'}
                        </span>
                      )
                    })}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Overall Rating</p>
                </div>
                <div className="flex-1">
                  <p className="text-slate-600">
                    {reviews.length > 0 ? 
                      `Based on ${reviews.length} review${reviews.length !== 1 ? 's' : ''}` : 
                      'This mentor hasn\'t received any reviews yet.'
                    }
                  </p>
                  <p className="text-sm text-slate-500 mt-1">Be the first to share your experience!</p>
                </div>
              </div>

              {/* Resource Feedbacks */}
              {resourceFeedbacks.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Recent Resource Feedback</h3>
                  <div className="space-y-3">
                    {resourceFeedbacks.map((feedback, index) => (
                      <div key={index} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{feedback.userName}</span>
                            <div className="flex text-amber-500 text-sm">
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star}>
                                  {star <= feedback.rating ? '⭐' : '☆'}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          Usefulness: <span className="font-medium capitalize">{feedback.usefulness.replace('-', ' ')}</span>
                        </p>
                        {feedback.comment && (
                          <p className="text-sm text-slate-600 italic">"{feedback.comment}"</p>
                        )}
                        {feedback.wouldRecommend && (
                          <p className="text-xs text-green-600 mt-1">✓ Would recommend</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800">Recent Reviews</h3>
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-lg">
                    <div className="text-3xl mb-2">💬</div>
                    <p>No reviews yet</p>
                    <p className="text-sm text-slate-400 mt-1">Reviews will appear here once mentees share their feedback</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="bg-white border border-slate-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex items-center">
                                <div className="text-lg font-semibold text-slate-900">
                                  {review.menteeName || 'Anonymous'}
                                </div>
                                <div className="flex text-amber-500">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star}>
                                      {star <= review.rating ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-sm text-slate-500 ml-2">({review.rating}/5)</span>
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="text-sm text-slate-600">
                              {review.feedback && (
                                <p className="italic">"{review.feedback}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Info</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</p>
                  <p className="text-slate-700">{mentor.department || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Industry</p>
                  <p className="text-slate-700">{mentor.industry || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</p>
                  <p className="text-slate-700">{mentor.experience || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Mentorship Mode</p>
                  <p className="text-slate-700">{mentor.mentorshipMode || 'Not specified'}</p>
                </div>
                {mentor.maxMentees && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Mentees</p>
                    <p className="text-slate-700">{mentor.maxMentees}</p>
                  </div>
                )}
                {mentor.weeklyHours && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly Hours</p>
                    <p className="text-slate-700">{mentor.weeklyHours}</p>
                  </div>
                )}
                {mentor.graduationYear && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Graduation Year</p>
                    <p className="text-slate-700">{mentor.graduationYear}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-lg font-bold text-slate-900 mb-2">Availability</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-700">Available for mentorship</span>
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

            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Mentor Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Total Mentees</span>
                  <span className="font-semibold text-slate-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Sessions Completed</span>
                  <span className="font-semibold text-slate-900">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Response Rate</span>
                  <span className="font-semibold text-slate-900">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Avg Response Time</span>
                  <span className="font-semibold text-slate-900">24 hours</span>
                </div>
              </div>
            </div>
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
