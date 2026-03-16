const MentorRequest = require('../models/MentorRequest')
const Alumni = require('../models/Alumni')

// Get all mentors
const getAllMentors = async (req, res) => {
  try {
    console.log('Fetching all mentors...')
    
    // Primary approach: Get all active alumni as potential mentors
    console.log('Fetching from Alumni collection...')
    
    const alumni = await Alumni.find({ 
      role: 'alumni',
      status: { $in: ['Active', 'Suspended'] }
    }).select('firstName lastName email department status avatar experiences skills interests passoutYear createdAt')

    console.log('Found alumni:', alumni.length)

    const uniqueMentors = alumni.map(alumni => {
      const currentExperience = alumni.experiences?.find(exp => exp.isCurrent) || alumni.experiences?.[0]
      
      return {
        id: alumni._id,
        name: `${alumni.firstName || ''} ${alumni.lastName || ''}`.trim() || '—',
        email: alumni.email,
        company: currentExperience?.company || '—',
        jobTitle: currentExperience?.title || '—',
        industry: currentExperience?.type || '—',
        department: alumni.department || '—',
        graduationYear: alumni.passoutYear || '—',
        mentorshipAreas: alumni.interests || [],
        expertise: alumni.skills || [],
        mentorshipMode: 'online', // Default value
        maxMentees: 5, // Default value
        rating: 0, // Default value - would need to calculate from reviews
        status: alumni.status === 'Active' ? 'approved' : alumni.status.toLowerCase(),
        avatar: alumni.avatar,
        createdAt: alumni.createdAt
      }
    })

    console.log('Unique mentors extracted:', uniqueMentors.length)

    res.json({ data: uniqueMentors })
  } catch (error) {
    console.error('Error fetching mentors:', error)
    res.status(500).json({ message: 'Failed to fetch mentors', error: error.message })
  }
}

// Get mentorship requests for a specific mentor
const getMentorRequests = async (req, res) => {
  try {
    const { mentorId } = req.params
    
    const requests = await MentorRequest.find({ mentor: mentorId })
      .populate('mentee', 'name email department role currentYear passoutYear')
      .sort({ createdAt: -1 })

    const normalizedRequests = requests.map(request => ({
      id: request._id,
      menteeName: request.mentee?.name || '—',
      menteeEmail: request.mentee?.email || '—',
      menteeDepartment: request.mentee?.department || '—',
      menteeRole: request.mentee?.role || '—',
      currentYear: request.mentee?.currentYear || request.mentee?.passoutYear || '—',
      serviceName: request.serviceName || 'General Mentorship',
      serviceMode: request.serviceMode || '—',
      preferredDateTime: request.preferredDateTime,
      sessionDetails: request.sessionDetails,
      status: request.status,
      sessionOutcome: request.sessionOutcome,
      remark: request.remark,
      reviewSubmitted: request.reviewSubmitted,
      rating: request.rating,
      feedback: request.feedback,
      createdAt: request.createdAt
    }))

    res.json({ data: normalizedRequests })
  } catch (error) {
    console.error('Error fetching mentor requests:', error)
    res.status(500).json({ message: 'Failed to fetch mentor requests' })
  }
}

// Get reviews for a specific mentor
const getMentorReviews = async (req, res) => {
  try {
    const { mentorId } = req.params
    
    const reviews = await MentorRequest.find({ 
      mentor: mentorId, 
      reviewSubmitted: true 
    })
      .populate('mentee', 'name email')
      .sort({ createdAt: -1 })

    const normalizedReviews = reviews.map(review => ({
      id: review._id,
      menteeName: review.mentee?.name || '—',
      serviceName: review.serviceName || 'General Mentorship',
      rating: review.rating,
      feedback: review.feedback,
      sessionOutcome: review.sessionOutcome,
      createdAt: review.createdAt
    }))

    res.json({ data: normalizedReviews })
  } catch (error) {
    console.error('Error fetching mentor reviews:', error)
    res.status(500).json({ message: 'Failed to fetch mentor reviews' })
  }
}

// Suspend a mentor
const suspendMentor = async (req, res) => {
  try {
    const { mentorId } = req.params
    
    console.log('Suspending mentor:', mentorId)
    
    // Update mentor status in Alumni collection
    const result = await Alumni.updateOne(
      { _id: mentorId },
      { $set: { status: 'Suspended' } }
    )

    console.log('Update result:', result)

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Mentor not found' })
    }

    res.json({ message: 'Mentor suspended successfully' })
  } catch (error) {
    console.error('Error suspending mentor:', error)
    res.status(500).json({ message: 'Failed to suspend mentor', error: error.message })
  }
}

// Delete a mentor
const deleteMentor = async (req, res) => {
  try {
    const { mentorId } = req.params
    
    // Delete all mentorship requests for this mentor
    await MentorRequest.deleteMany({ mentor: mentorId })
    
    // Optionally, you might want to update the Alumni status instead of deleting
    // For now, we'll just delete the requests and keep the Alumni record
    
    res.json({ message: 'Mentor requests deleted successfully' })
  } catch (error) {
    console.error('Error deleting mentor:', error)
    res.status(500).json({ message: 'Failed to delete mentor' })
  }
}

// Reactivate a mentor
const reactivateMentor = async (req, res) => {
  try {
    const { mentorId } = req.params
    
    console.log('Reactivating mentor:', mentorId)
    
    // Update mentor status in Alumni collection
    const result = await Alumni.updateOne(
      { _id: mentorId },
      { $set: { status: 'Active' } }
    )

    console.log('Update result:', result)

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Mentor not found' })
    }

    res.json({ message: 'Mentor reactivated successfully' })
  } catch (error) {
    console.error('Error reactivating mentor:', error)
    res.status(500).json({ message: 'Failed to reactivate mentor', error: error.message })
  }
}

// Approve a mentor
const approveMentor = async (req, res) => {
  try {
    const { mentorId } = req.params
    
    console.log('Approving mentor:', mentorId)
    
    // Update mentor status in Alumni collection
    const result = await Alumni.updateOne(
      { _id: mentorId },
      { $set: { status: 'Active' } }
    )

    console.log('Update result:', result)

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Mentor not found' })
    }

    res.json({ message: 'Mentor approved successfully' })
  } catch (error) {
    console.error('Error approving mentor:', error)
    res.status(500).json({ message: 'Failed to approve mentor', error: error.message })
  }
}

module.exports = {
  getAllMentors,
  getMentorRequests,
  getMentorReviews,
  suspendMentor,
  reactivateMentor,
  approveMentor,
  deleteMentor
}
