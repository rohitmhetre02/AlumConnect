const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const Gallery = require('../models/Gallery')
const Event = require('../models/Event')
const Campaign = require('../models/Campaign')

// GET /api/public/students - Show all approved students
const getPublicStudents = async (req, res) => {
  try {
    const students = await Student.find({ profileApprovalStatus: 'APPROVED' })
      .select('firstName lastName email department graduationYear profileImage currentYear program course year batch')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      students: students.map(student => ({
        _id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        department: student.department,
        graduationYear: student.graduationYear,
        profileImage: student.profileImage,
        program: student.program || student.course || 'Student',
        course: student.course || student.program || 'Student',
        year: student.year || student.batch || student.currentYear || 'Student'
      }))
    })
  } catch (error) {
    console.error('Error fetching public students:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch students'
    })
  }
}

// GET /api/public/alumni - Show all approved alumni
const getPublicAlumni = async (req, res) => {
  try {
    const alumni = await Alumni.find({ profileApprovalStatus: 'APPROVED' })
      .select('firstName lastName email department graduationYear position currentCompany profileImage')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      alumni: alumni.map(alumnus => ({
        _id: alumnus._id,
        firstName: alumnus.firstName,
        lastName: alumnus.lastName,
        email: alumnus.email,
        department: alumnus.department,
        graduationYear: alumnus.graduationYear,
        position: alumnus.position,
        currentCompany: alumnus.currentCompany,
        profileImage: alumnus.profileImage
      }))
    })
  } catch (error) {
    console.error('Error fetching public alumni:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch alumni'
    })
  }
}

// GET /api/public/memories - Show latest 12 images
const getPublicMemories = async (req, res) => {
  try {
    // First try to get approved gallery images
    let memories = await Gallery.find({ 
      type: 'image',
      approvalStatus: 'APPROVED' 
    })
      .select('url title description createdAt')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()

    // If no approved images, get any images for development
    if (memories.length === 0) {
      memories = await Gallery.find({ 
        type: 'image'
      })
        .select('url title description createdAt')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean()
    }

    // If still no memories, create sample data with working image URLs
    if (memories.length === 0) {
      memories = [
        {
          _id: 'memory1',
          url: 'https://picsum.photos/seed/festival2024/400/300.jpg',
          title: 'College Festival 2024',
          description: 'Annual cultural festival celebrations with students showcasing their talents in various cultural events'
        },
        {
          _id: 'memory2',
          url: 'https://picsum.photos/seed/graduation2023/400/300.jpg',
          title: 'Graduation Day 2023',
          description: 'Convocation ceremony celebrating the achievements of our graduating students'
        },
        {
          _id: 'memory3',
          url: 'https://picsum.photos/seed/sportsmeet2024/400/300.jpg',
          title: 'Annual Sports Meet',
          description: 'Inter-college sports competition promoting teamwork and healthy competition'
        },
        {
          _id: 'memory4',
          url: 'https://picsum.photos/seed/alumnimeet2024/400/300.jpg',
          title: 'Alumni Homecoming 2024',
          description: 'Alumni reunion event connecting graduates across different batches'
        },
        {
          _id: 'memory5',
          url: 'https://picsum.photos/seed/workshop2024/400/300.jpg',
          title: 'Technical Workshop',
          description: 'Hands-on technical workshop on emerging technologies and industry practices'
        },
        {
          _id: 'memory6',
          url: 'https://picsum.photos/seed/seminar2024/400/300.jpg',
          title: 'Guest Lecture Series',
          description: 'Industry experts sharing insights and experiences with students'
        },
        {
          _id: 'memory7',
          url: 'https://picsum.photos/seed/projectexpo2024/400/300.jpg',
          title: 'Project Exhibition',
          description: 'Students showcasing their innovative projects and research work'
        },
        {
          _id: 'memory8',
          url: 'https://picsum.photos/seed/culturalnight2024/400/300.jpg',
          title: 'Cultural Night',
          description: 'Evening filled with music, dance, and cultural performances'
        }
      ]
    }

    res.json({
      success: true,
      memories: memories.map(memory => ({
        _id: memory._id,
        url: memory.url,
        title: memory.title || 'Memory',
        description: memory.description,
        createdAt: memory.createdAt
      }))
    })
  } catch (error) {
    console.error('Error fetching public memories:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch memories'
    })
  }
}

// GET /api/public/events - Show all approved events
const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ 
      approvalStatus: 'APPROVED' 
    })
      .select('title date location description imageUrl registrationDeadline')
      .sort({ date: 1 })
      .lean()

    console.log('🔍 [DEBUG] Found approved events:', events.length)
    events.forEach(event => {
      console.log('🔍 [DEBUG] Event:', event.title, 'Date:', event.date, 'Status:', event.approvalStatus)
    })

    res.json({
      success: true,
      data: events.map(event => ({
        _id: event._id,
        title: event.title,
        date: event.date,
        location: event.location,
        description: event.description,
        imageUrl: event.imageUrl,
        registrationDeadline: event.registrationDeadline
      }))
    })
  } catch (error) {
    console.error('Error fetching public events:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events'
    })
  }
}

// GET /api/public/campaigns - Show 6 active campaigns
const getPublicCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ 
      approvalStatus: 'APPROVED',
      deadline: { $gte: new Date() }
    })
      .select('title description goalAmount raisedAmount deadline imageUrl category')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()

    res.json({
      success: true,
      campaigns: campaigns.map(campaign => ({
        _id: campaign._id,
        title: campaign.title,
        description: campaign.description,
        goalAmount: campaign.goalAmount,
        raisedAmount: campaign.raisedAmount || 0,
        deadline: campaign.deadline,
        imageUrl: campaign.imageUrl,
        category: campaign.category
      }))
    })
  } catch (error) {
    console.error('Error fetching public campaigns:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns'
    })
  }
}

module.exports = {
  getPublicStudents,
  getPublicAlumni,
  getPublicMemories,
  getPublicEvents,
  getPublicCampaigns
}
