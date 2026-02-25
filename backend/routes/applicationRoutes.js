const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Application = require('../models/Application')
const Opportunity = require('../models/Opportunity')
const authMiddleware = require('../middleware/authMiddleware')

// Get all applications for the logged-in user
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user.id })
      .populate('opportunity', 'title company type location deadline')
      .sort({ appliedAt: -1 })
    
    res.json({
      success: true,
      data: applications,
      count: applications.length
    })
  } catch (error) {
    console.error('Error fetching user applications:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    })
  }
})

// Apply to an opportunity
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { opportunityId, resume, coverLetter, notes } = req.body

    // Check if opportunity exists and is active
    const opportunity = await Opportunity.findById(opportunityId)
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      })
    }

    if (opportunity.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This opportunity is no longer accepting applications'
      })
    }

    if (new Date(opportunity.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      })
    }

    // Create application
    const application = new Application({
      opportunity: opportunityId,
      applicant: req.user.id,
      resume,
      coverLetter,
      notes
    })

    await application.save()

    // Update opportunity applicants count
    await Opportunity.findByIdAndUpdate(opportunityId, {
      $inc: { applicants: 1 }
    })

    // Populate opportunity details for response
    await application.populate('opportunity', 'title company type location deadline')

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    
    if (error.code === 'DUPLICATE_APPLICATION') {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this opportunity'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    })
  }
})

// Get applications for a specific opportunity (for opportunity creators)
router.get('/opportunity/:opportunityId', authMiddleware, async (req, res) => {
  try {
    const { opportunityId } = req.params

    // Check if user is the creator of the opportunity or admin/faculty
    const opportunity = await Opportunity.findById(opportunityId)
    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found'
      })
    }

    if (opportunity.createdBy.toString() !== req.user.id && 
        !['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this opportunity'
      })
    }

    const applications = await Application.find({ opportunity: opportunityId })
      .populate('applicant', 'name email profile')
      .sort({ appliedAt: -1 })

    res.json({
      success: true,
      data: applications,
      count: applications.length
    })
  } catch (error) {
    console.error('Error fetching opportunity applications:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    })
  }
})

// Update application status (for opportunity creators/admins)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes, interviewDate, interviewLocation, interviewMode, rejectionReason } = req.body

    const application = await Application.findById(id).populate('opportunity')
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      })
    }

    // Check if user is authorized to update this application
    const opportunity = application.opportunity
    if (opportunity.createdBy.toString() !== req.user.id && 
        !['admin', 'faculty'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      })
    }

    // Update application
    const updateData = { status }
    
    if (status === 'Reviewed') {
      updateData.reviewedAt = new Date()
      updateData.reviewedBy = req.user.id
    }
    
    if (status === 'Interview Scheduled') {
      updateData.interviewDate = interviewDate
      updateData.interviewLocation = interviewLocation
      updateData.interviewMode = interviewMode || 'online'
    }
    
    if (status === 'Selected') {
      updateData.selectedAt = new Date()
    }
    
    if (status === 'Rejected') {
      updateData.rejectedAt = new Date()
      updateData.rejectionReason = rejectionReason
    }
    
    if (notes) {
      updateData.notes = notes
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('opportunity', 'title company type location deadline')
     .populate('applicant', 'name email')

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication
    })
  } catch (error) {
    console.error('Error updating application status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    })
  }
})

// Withdraw application
router.patch('/:id/withdraw', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const application = await Application.findById(id)
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      })
    }

    // Check if user owns this application
    if (application.applicant.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to withdraw this application'
      })
    }

    // Only allow withdrawal if not already selected or rejected
    if (['Selected', 'Rejected'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot withdraw application that has been ' + application.status.toLowerCase()
      })
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      { status: 'Withdrawn' },
      { new: true }
    ).populate('opportunity', 'title company type location deadline')

    // Update opportunity applicants count
    await Application.findByIdAndUpdate(application.opportunity, {
      $inc: { applicants: -1 }
    })

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: updatedApplication
    })
  } catch (error) {
    console.error('Error withdrawing application:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application',
      error: error.message
    })
  }
})

// Get application statistics for dashboard
router.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id

    const stats = await Application.aggregate([
      { $match: { applicant: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const totalApplications = await Application.countDocuments({ applicant: userId })
    const recentApplications = await Application.find({ applicant: userId })
      .populate('opportunity', 'title company')
      .sort({ appliedAt: -1 })
      .limit(5)

    res.json({
      success: true,
      data: {
        totalApplications,
        statusBreakdown: stats,
        recentApplications
      }
    })
  } catch (error) {
    console.error('Error fetching application stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message
    })
  }
})

module.exports = router
