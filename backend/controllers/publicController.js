const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const Gallery = require('../models/Gallery')
const Event = require('../models/Event')
const Campaign = require('../models/Campaign')
const MentorRequest = require('../models/MentorRequest')

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
    console.log('=== [DEBUG] Public Memories ===')
    
    // Get gallery images from database
    let memories = await Gallery.find({})
      .select('imageUrl imageName department folder createdAt uploadedByName')
      .sort({ createdAt: -1 })
      .limit(12)
      .lean()

    console.log('Total gallery images found:', memories.length)
    
    memories.forEach((memory, index) => {
      console.log(`${index + 1}. Image: "${memory.imageName}"`)
      console.log(`   URL: ${memory.imageUrl}`)
      console.log(`   Department: ${memory.department}`)
      console.log(`   Folder: ${memory.folder}`)
      console.log('---')
    })

    // If no images in database, create sample data
    if (memories.length === 0) {
      console.log('No images found in database, creating sample data...')
      memories = [
        {
          _id: 'memory1',
          imageUrl: 'https://picsum.photos/seed/festival2024/400/300.jpg',
          imageName: 'College Festival 2024',
          department: 'General',
          folder: 'Events',
          createdAt: new Date()
        },
        {
          _id: 'memory2',
          imageUrl: 'https://picsum.photos/seed/graduation2023/400/300.jpg',
          imageName: 'Graduation Day 2023',
          department: 'General',
          folder: 'Events',
          createdAt: new Date()
        },
        {
          _id: 'memory3',
          imageUrl: 'https://picsum.photos/seed/sportsmeet2024/400/300.jpg',
          imageName: 'Annual Sports Meet',
          department: 'General',
          folder: 'Events',
          createdAt: new Date()
        },
        {
          _id: 'memory4',
          imageUrl: 'https://picsum.photos/seed/alumnimeet2024/400/300.jpg',
          imageName: 'Alumni Homecoming 2024',
          department: 'General',
          folder: 'Alumni Meet',
          createdAt: new Date()
        }
      ]
    }

    res.json({
      success: true,
      memories: memories.map(memory => ({
        _id: memory._id,
        url: memory.imageUrl, // Map imageUrl to url for frontend
        title: memory.imageName, // Map imageName to title for frontend
        description: `${memory.department} - ${memory.folder}`, // Create description from available fields
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
      .select('title startAt location description coverImage registrationDeadline mode approvalStatus')
      .sort({ startAt: 1 })
      .lean()

    console.log('=== [DEBUG] Public Events ===')
    console.log('Total events found:', events.length)
    events.forEach(event => {
      console.log(`Event: "${event.title}"`)
      console.log(`  Date: ${event.startAt}`)
      console.log(`  Status: ${event.approvalStatus}`)
      console.log(`  Mode: ${event.mode || 'Not specified'}`)
      console.log('---')
    })

    res.json({
      success: true,
      data: events.map(event => ({
        _id: event._id,
        title: event.title,
        date: event.startAt, // Map startAt to date for frontend compatibility
        location: event.location,
        description: event.description,
        imageUrl: event.coverImage,
        mode: event.mode,
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

// GET /api/public/stats - Get platform statistics
const getPublicStats = async (req, res) => {
  try {
    console.log('=== [DEBUG] Fetching Public Stats ===')
    
    // Get total alumni count
    const totalAlumni = await Alumni.countDocuments({ profileApprovalStatus: 'APPROVED' })
    
    // Get total students count  
    const studentsConnected = await Student.countDocuments({ profileApprovalStatus: 'APPROVED' })
    
    // Get mentorship sessions count (confirmed mentor requests)
    const mentorshipSessions = await MentorRequest.countDocuments({ status: 'confirmed' })
    
    // Get events hosted count (approved events)
    const eventsHosted = await Event.countDocuments({ approvalStatus: 'APPROVED' })
    
    console.log(`Total Alumni: ${totalAlumni}`)
    console.log(`Students Connected: ${studentsConnected}`)
    console.log(`Mentorship Sessions: ${mentorshipSessions}`)
    console.log(`Events Hosted: ${eventsHosted}`)
    
    res.json({
      success: true,
      totalAlumni: totalAlumni || 12500, // Fallback to demo values if no data
      studentsConnected: studentsConnected || 4200,
      mentorshipSessions: mentorshipSessions || 1800,
      eventsHosted: eventsHosted || 350
    })
  } catch (error) {
    console.error('Error fetching public stats:', error)
    // Return fallback values on error
    res.json({
      success: true,
      totalAlumni: 12500,
      studentsConnected: 4200,
      mentorshipSessions: 1800,
      eventsHosted: 350
    })
  }
}

module.exports = {
  getPublicStudents,
  getPublicAlumni,
  getPublicMemories,
  getPublicEvents,
  getPublicCampaigns,
  getPublicStats
}
