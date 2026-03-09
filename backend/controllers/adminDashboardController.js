const Student = require('../models/Student')
const Alumni = require('../models/Alumni')
const Opportunity = require('../models/Opportunity')
const Event = require('../models/Event')
const Campaign = require('../models/Campaign')

// Helper function to format time ago
const formatTimeAgo = (date) => {
  const now = new Date()
  const pastDate = new Date(date)
  const diffInSeconds = Math.floor((now - pastDate) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    const weeks = Math.floor(diffInSeconds / 604800)
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  }
}

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const { period = '30days', role = 'admin', department = '' } = req.query
    
    // Calculate date range based on period
    let daysBack = 30
    if (period === '7days') daysBack = 7
    else if (period === '90days') daysBack = 90
    else if (period === '1year') daysBack = 365
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)
    
    let stats = {}
    
    if (role === 'coordinator' && department) {
      // Department-level stats for coordinators
      
      // Get alumni in this department
      const totalAlumni = await Alumni.countDocuments({ 
        department: { $regex: department, $options: 'i' }
      })
      
      // Get students in this department
      const totalStudents = await Student.countDocuments({ 
        department: { $regex: department, $options: 'i' }
      })
      
      // Get active jobs in this department
      const activeJobs = await Opportunity.countDocuments({ 
        status: 'active',
        deadline: { $gt: new Date() },
        department: { $regex: department, $options: 'i' }
      })
      
      // Get upcoming events in this department
      const upcomingEvents = await Event.countDocuments({ 
        date: { $gt: new Date() },
        status: 'approved',
        department: { $regex: department, $options: 'i' }
      })
      
      // Get active campaigns in this department
      const activeCampaigns = await Campaign.countDocuments({ 
        status: 'active',
        endDate: { $gt: new Date() },
        department: { $regex: department, $options: 'i' }
      })
      
      // Get pending approvals in this department
      const pendingProfiles = await Alumni.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' }
      })
      const pendingJobs = await Opportunity.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' }
      })
      const pendingEvents = await Event.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' }
      })
      const pendingApprovals = pendingProfiles + pendingJobs + pendingEvents
      
      // Calculate growth percentages for department
      const previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - daysBack)
      
      const previousAlumni = await Alumni.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentAlumni = await Alumni.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      })
      const alumniGrowth = previousAlumni > 0 ? 
        ((currentAlumni - previousAlumni) / previousAlumni * 100).toFixed(1) : 0
      
      const previousStudents = await Student.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentStudents = await Student.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      })
      const studentGrowth = previousStudents > 0 ? 
        ((currentStudents - previousStudents) / previousStudents * 100).toFixed(1) : 0
      
      const previousJobs = await Opportunity.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentJobs = await Opportunity.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      })
      const jobGrowth = previousJobs > 0 ? 
        ((currentJobs - previousJobs) / previousJobs * 100).toFixed(1) : 0
      
      const previousEvents = await Event.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentEvents = await Event.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      })
      const eventGrowth = previousEvents > 0 ? 
        ((currentEvents - previousEvents) / previousEvents * 100).toFixed(1) : 0
      
      const previousCampaigns = await Campaign.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentCampaigns = await Campaign.countDocuments({ 
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      })
      const campaignGrowth = previousCampaigns > 0 ? 
        ((currentCampaigns - previousCampaigns) / previousCampaigns * 100).toFixed(1) : 0
      
      const previousApprovals = await Alumni.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      }) + await Opportunity.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      }) + await Event.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      
      const currentApprovals = await Alumni.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      }) + await Opportunity.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      }) + await Event.countDocuments({ 
        approvalStatus: 'pending',
        department: { $regex: department, $options: 'i' },
        createdAt: { $gte: startDate }
      })
      
      const approvalGrowth = previousApprovals > 0 ? 
        ((currentApprovals - previousApprovals) / previousApprovals * 100).toFixed(1) : 0
      
      stats = {
        totalAlumni,
        totalStudents,
        activeJobs,
        upcomingEvents,
        activeCampaigns,
        pendingApprovals,
        alumniGrowth: parseFloat(alumniGrowth),
        studentGrowth: parseFloat(studentGrowth),
        jobGrowth: parseFloat(jobGrowth),
        eventGrowth: parseFloat(eventGrowth),
        campaignGrowth: parseFloat(campaignGrowth),
        approvalGrowth: parseFloat(approvalGrowth)
      }
      
    } else {
      // Admin/Super Admin - Get total counts (existing logic)
      
      // Get total counts
      const totalAlumni = await Alumni.countDocuments()
      const totalStudents = await Student.countDocuments()
      const activeJobs = await Opportunity.countDocuments({ 
        status: 'active',
        deadline: { $gt: new Date() }
      })
      const upcomingEvents = await Event.countDocuments({ 
        date: { $gt: new Date() },
        status: 'approved'
      })
      const activeCampaigns = await Campaign.countDocuments({ 
        status: 'active',
        endDate: { $gt: new Date() }
      })
      
      // Get pending approvals
      const pendingProfiles = await Alumni.countDocuments({ approvalStatus: 'pending' })
      const pendingJobs = await Opportunity.countDocuments({ approvalStatus: 'pending' })
      const pendingEvents = await Event.countDocuments({ approvalStatus: 'pending' })
      const pendingApprovals = pendingProfiles + pendingJobs + pendingEvents
      
      // Calculate growth percentages
      const previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - daysBack)
      
      const previousAlumni = await Alumni.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentAlumni = await Alumni.countDocuments({ 
        createdAt: { $gte: startDate }
      })
      const alumniGrowth = previousAlumni > 0 ? 
        ((currentAlumni - previousAlumni) / previousAlumni * 100).toFixed(1) : 0
      
      const previousStudents = await Student.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentStudents = await Student.countDocuments({ 
        createdAt: { $gte: startDate }
      })
      const studentGrowth = previousStudents > 0 ? 
        ((currentStudents - previousStudents) / previousStudents * 100).toFixed(1) : 0
      
      const previousJobs = await Opportunity.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentJobs = await Opportunity.countDocuments({ 
        createdAt: { $gte: startDate }
      })
      const jobGrowth = previousJobs > 0 ? 
        ((currentJobs - previousJobs) / previousJobs * 100).toFixed(1) : 0
      
      const previousEvents = await Event.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentEvents = await Event.countDocuments({ 
        createdAt: { $gte: startDate }
      })
      const eventGrowth = previousEvents > 0 ? 
        ((currentEvents - previousEvents) / previousEvents * 100).toFixed(1) : 0
      
      const previousCampaigns = await Campaign.countDocuments({ 
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      const currentCampaigns = await Campaign.countDocuments({ 
        createdAt: { $gte: startDate }
      })
      const campaignGrowth = previousCampaigns > 0 ? 
        ((currentCampaigns - previousCampaigns) / previousCampaigns * 100).toFixed(1) : 0
      
      const previousApprovals = await Alumni.countDocuments({ 
        approvalStatus: 'pending',
        createdAt: { $gte: previousStartDate, $lt: startDate }
      }) + await Opportunity.countDocuments({ 
        approvalStatus: 'pending',
        createdAt: { $gte: previousStartDate, $lt: startDate }
      }) + await Event.countDocuments({ 
        approvalStatus: 'pending',
        createdAt: { $gte: previousStartDate, $lt: startDate }
      })
      
      const currentApprovals = await Alumni.countDocuments({ 
        approvalStatus: 'pending',
        createdAt: { $gte: startDate }
      }) + await Opportunity.countDocuments({ 
        approvalStatus: 'pending',
        createdAt: { $gte: startDate }
      }) + await Event.countDocuments({ 
        approvalStatus: 'pending',
        createdAt: { $gte: startDate }
      })
      
      const approvalGrowth = previousApprovals > 0 ? 
        ((currentApprovals - previousApprovals) / previousApprovals * 100).toFixed(1) : 0

      stats = {
        totalAlumni,
        totalStudents,
        activeJobs,
        upcomingEvents,
        activeCampaigns,
        pendingApprovals,
        alumniGrowth: parseFloat(alumniGrowth),
        studentGrowth: parseFloat(studentGrowth),
        jobGrowth: parseFloat(jobGrowth),
        eventGrowth: parseFloat(eventGrowth),
        campaignGrowth: parseFloat(campaignGrowth),
        approvalGrowth: parseFloat(approvalGrowth)
      }
    }

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to fetch dashboard statistics'
    })
  }
}

// Get pending items for approval
const getPendingItems = async (req, res) => {
  try {
    const pendingItems = []
    const { role = 'admin', department = '' } = req.query

    // Get pending alumni profiles
    try {
      const pendingAlumni = await Alumni.find({ approvalStatus: 'pending' })
        .populate('userId', 'name email')
        .select('userId department createdAt approvalStatus')
        .lean()

      pendingAlumni.forEach(alumni => {
        pendingItems.push({
          id: alumni._id,
          type: 'profile',
          title: `${alumni.userId?.name || 'Unknown'} - Alumni Profile`,
          submittedBy: alumni.userId?.name || 'Unknown',
          department: alumni.department || 'Not specified',
          date: alumni.createdAt,
          status: alumni.approvalStatus
        })
      })
    } catch (error) {
      // Continue silently
    }

    // Get pending jobs
    try {
      const pendingJobs = await Opportunity.find({ approvalStatus: 'pending' })
        .populate('createdBy', 'name email')
        .select('title createdBy department createdAt approvalStatus')
        .lean()

      pendingJobs.forEach(job => {
        pendingItems.push({
          id: job._id,
          type: 'job',
          title: job.title,
          submittedBy: job.createdBy?.name || 'Unknown',
          department: job.department || 'Not specified',
          date: job.createdAt,
          status: job.approvalStatus
        })
      })
    } catch (error) {
      // Continue silently
    }

    // Get pending events
    try {
      const pendingEvents = await Event.find({ status: 'pending' })
        .populate('organizer', 'name email')
        .populate('department', 'name')
        .select('title organizer department date createdAt status')
        .lean()

      pendingEvents.forEach(event => {
        pendingItems.push({
          id: event._id,
          type: 'event',
          title: event.title,
          submittedBy: event.organizer?.name || 'Unknown',
          department: event.department?.name || 'Not specified',
          date: event.createdAt,
          status: event.status
        })
      })
    } catch (error) {
      // Continue silently
    }

    // Get pending campaigns
    try {
      const pendingCampaigns = await Campaign.find({ status: 'pending' })
        .populate('organizer', 'name email')
        .populate('department', 'name')
        .select('title organizer department createdAt status')
        .lean()

      pendingCampaigns.forEach(campaign => {
        pendingItems.push({
          id: campaign._id,
          type: 'campaign',
          title: campaign.title,
          submittedBy: campaign.organizer?.name || 'Unknown',
          department: campaign.department?.name || 'Not specified',
          date: campaign.createdAt,
          status: campaign.status
        })
      })
    } catch (error) {
      // Continue silently
    }

    // Filter by department if coordinator role
    let filteredItems = pendingItems
    if (role === 'coordinator' && department) {
      filteredItems = pendingItems.filter(item => 
        item.department.toLowerCase().includes(department.toLowerCase())
      )
    }

    // Sort by date (newest first)
    filteredItems.sort((a, b) => new Date(b.date) - new Date(a.date))

    res.status(200).json({
      success: true,
      data: filteredItems
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending items'
    })
  }
}

// Get recent activity
const getRecentActivity = async (req, res) => {
  try {
    const activities = []
    const limit = 10

    // Get recent job postings
    try {
      const recentJobs = await Opportunity.find()
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title createdBy createdAt')
        .lean()

      recentJobs.forEach(job => {
        activities.push({
          id: `job-${job._id}`,
          user: job.createdBy?.name || 'Unknown',
          action: 'posted a new job',
          entity: job.title,
          timestamp: formatTimeAgo(job.createdAt),
          type: 'job'
        })
      })
    } catch (jobError) {
      console.error('Error fetching recent jobs:', jobError)
    }

    // Get recent events
    try {
      const recentEvents = await Event.find()
        .populate('organizer', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('title organizer createdAt')
        .lean()

      recentEvents.forEach(event => {
        activities.push({
          id: `event-${event._id}`,
          user: event.organizer?.name || 'Unknown',
          action: 'created an event',
          entity: event.title,
          timestamp: formatTimeAgo(event.createdAt),
          type: 'event'
        })
      })
    } catch (eventError) {
      console.error('Error fetching recent events:', eventError)
    }

    // Get recent donations
    try {
      const recentCampaigns = await Campaign.find()
        .sort({ 'donations.donatedAt': -1 })
        .limit(10)
        .lean()
      
      // Extract recent donations from campaigns
      const recentDonations = []
      recentCampaigns.forEach(campaign => {
        if (campaign.donations && campaign.donations.length > 0) {
          campaign.donations.forEach(donation => {
            recentDonations.push({
              ...donation,
              campaignTitle: campaign.title
            })
          })
        }
      })
      
      // Sort by donation date and take latest
      recentDonations.sort((a, b) => new Date(b.donatedAt) - new Date(a.donatedAt))
      const latestDonations = recentDonations.slice(0, 10)
      
      latestDonations.forEach(donation => {
        dashboardData.recentActivities.push({
          id: `donation-${donation._id || donation.donatedAt}`,
          user: donation.anonymous ? 'Anonymous' : donation.donorName,
          action: 'donated',
          entity: donation.campaignTitle || 'General Fund',
          timestamp: formatTimeAgo(donation.donatedAt),
          type: 'donation',
          amount: `₹${donation.amount.toLocaleString()}`
        })
      })
    } catch (donationError) {
      console.error('Error fetching recent donations:', donationError)
    }

    // Get recent alumni registrations
    try {
      const recentAlumni = await Alumni.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('firstName lastName createdAt')
        .lean()

      recentAlumni.forEach(alumni => {
        activities.push({
          id: `alumni-${alumni._id}`,
          user: `${alumni.firstName} ${alumni.lastName}`,
          action: 'registered as alumni',
          entity: 'Alumni Network',
          timestamp: formatTimeAgo(alumni.createdAt),
          type: 'registration'
        })
      })
    } catch (alumniError) {
      console.error('Error fetching recent alumni:', alumniError)
    }

    // Sort all activities by createdAt (newest first)
    activities.sort((a, b) => {
      // For now, sort by ID to get some ordering
      return b.id.localeCompare(a.id)
    })

    res.status(200).json({
      success: true,
      data: activities.slice(0, 10) // Return only 10 most recent
    })
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity'
    })
  }
}

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query
    
    // Calculate date range based on period
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
        startDate.setDate(now.getDate() - 90)
        break
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const analytics = {}

    // Alumni growth over time (simplified - monthly data)
    analytics.alumniGrowth = await getAlumniGrowthData(startDate, now)
    
    // Jobs posted vs approved
    analytics.jobsVsApproved = await getJobsAnalytics(startDate, now)
    
    // Events conducted
    analytics.eventsConducted = await getEventsAnalytics(startDate, now)
    
    // Donations collected by category
    analytics.donationsCollected = await getDonationsAnalytics(startDate, now)

    res.status(200).json({
      success: true,
      data: analytics
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    })
  }
}

// Helper function to get alumni growth data
const getAlumniGrowthData = async (startDate, endDate) => {
  // This is a simplified version - in production, you'd aggregate by month
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    month,
    count: 12000 + (index * 500) + Math.floor(Math.random() * 1000)
  }))
}

// Helper function to get jobs analytics
const getJobsAnalytics = async (startDate, endDate) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    month,
    posted: 40 + Math.floor(Math.random() * 20),
    approved: 35 + Math.floor(Math.random() * 15)
  }))
}

// Helper function to get events analytics
const getEventsAnalytics = async (startDate, endDate) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    month,
    count: 8 + Math.floor(Math.random() * 10)
  }))
}

// Helper function to get donations analytics
const getDonationsAnalytics = async (startDate, endDate) => {
  return [
    { name: 'Scholarship Fund', value: 45000, color: '#3b82f6' },
    { name: 'Infrastructure', value: 32000, color: '#10b981' },
    { name: 'Research', value: 28000, color: '#f59e0b' },
    { name: 'Sports', value: 15000, color: '#ef4444' }
  ]
}

// Approve a pending item
const approveItem = async (req, res) => {
  try {
    const { type, id } = req.params
    
    let updateResult
    
    switch (type) {
      case 'profile':
        updateResult = await Alumni.findByIdAndUpdate(
          id,
          { approvalStatus: 'approved', approvedAt: new Date() },
          { new: true }
        )
        break
      case 'job':
        updateResult = await Opportunity.findByIdAndUpdate(
          id,
          { approvalStatus: 'approved', approvedAt: new Date() },
          { new: true }
        )
        break
      case 'event':
        updateResult = await Event.findByIdAndUpdate(
          id,
          { approvalStatus: 'approved', approvedAt: new Date() },
          { new: true }
        )
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid item type for approval'
        })
    }
    
    if (!updateResult) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: `${type} approved successfully`,
      data: updateResult
    })
  } catch (error) {
    console.error('Error approving item:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to approve item'
    })
  }
}

// Reject a pending item
const rejectItem = async (req, res) => {
  try {
    const { type, id } = req.params
    
    let updateResult
    
    switch (type) {
      case 'profile':
        updateResult = await Alumni.findByIdAndUpdate(
          id,
          { approvalStatus: 'rejected', rejectedAt: new Date() },
          { new: true }
        )
        break
      case 'job':
        updateResult = await Opportunity.findByIdAndUpdate(
          id,
          { approvalStatus: 'rejected', rejectedAt: new Date() },
          { new: true }
        )
        break
      case 'event':
        updateResult = await Event.findByIdAndUpdate(
          id,
          { approvalStatus: 'rejected', rejectedAt: new Date() },
          { new: true }
        )
        break
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid item type for rejection'
        })
    }
    
    if (!updateResult) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      })
    }
    
    res.status(200).json({
      success: true,
      message: `${type} rejected successfully`,
      data: updateResult
    })
  } catch (error) {
    console.error('Error rejecting item:', error)
    res.status(500).json({
      success: false,
      message: 'Unable to reject item'
    })
  }
}

module.exports = {
  getDashboardStats,
  getPendingItems,
  getRecentActivity,
  getAnalytics,
  approveItem,
  rejectItem
}
