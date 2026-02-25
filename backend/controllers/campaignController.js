const mongoose = require('mongoose')

const Campaign = require('../models/Campaign')
const { getModelByRole } = require('../utils/roleModels')
const { CONTENT_APPROVAL_STATUS } = require('../utils/contentApprovalStatus')
const { normalizeDepartment } = require('../utils/departments')

const formatCampaign = (doc) => {
  if (!doc) return null
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    goalAmount: doc.goalAmount,
    raisedAmount: doc.raisedAmount,
    coverImage: doc.coverImage,
    deadline: doc.deadline,
    category: doc.category,
    status: doc.status,
    tags: doc.tags,
    donations: doc.donations,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    createdByRole: doc.createdByRole,
    createdByName: doc.createdByName,
    featured: doc.featured,
    priority: doc.priority,
    approvalStatus: doc.approvalStatus ?? CONTENT_APPROVAL_STATUS.PENDING,
    approvalDepartment: doc.approvalDepartment ?? '',
    approvalDecisions: Array.isArray(doc.approvalDecisions) ? doc.approvalDecisions : [],
    approvedAt: doc.approvedAt ?? null,
    rejectedAt: doc.rejectedAt ?? null,
    donorCount: doc.donations?.length || 0,
    recentDonations: doc.donations?.slice(-5).reverse().map(donation => ({
      id: donation._id || `${doc._id}-${donation.donatedAt.getTime()}`,
      donorName: donation.anonymous ? 'Anonymous' : donation.donorName,
      amount: donation.amount,
      message: donation.message,
      donatedAt: donation.donatedAt,
      paymentStatus: donation.paymentStatus,
      paymentMethod: donation.paymentMethod,
      paymentTransactionId: donation.paymentTransactionId,
    })) || [],
  }
}

// Get all campaigns (public)
const listCampaigns = async (_req, res) => {
  try {
    const items = await Campaign.find({ 
      approvalStatus: CONTENT_APPROVAL_STATUS.APPROVED,
      status: 'active'
    })
      .sort({ featured: -1, priority: -1, createdAt: -1 })
      .lean()
    return res.status(200).json({ success: true, data: items.map(formatCampaign).filter(Boolean) })
  } catch (error) {
    console.error('listCampaigns error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch campaigns.' })
  }
}

// Get campaign by ID
const getCampaignById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign id.' })
    }

    const doc = await Campaign.findById(id).lean()

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' })
    }

    return res.status(200).json({ success: true, data: formatCampaign(doc) })
  } catch (error) {
    console.error('getCampaignById error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch campaign.' })
  }
}

// Get campaigns for logged-in user (their own + approved campaigns)
const listUserCampaigns = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    const userRole = user?.role?.toLowerCase() ?? ''
    const isAdmin = userRole === 'admin' || userRole === 'coordinator'

    let filter = { status: 'active' }
    if (!isAdmin) {
      filter = {
        ...filter,
        '$or': [
          { approvalStatus: CONTENT_APPROVAL_STATUS.APPROVED },
          { createdBy: user.id }
        ]
      }
    }

    const items = await Campaign.find(filter)
      .sort({ featured: -1, priority: -1, createdAt: -1 })
      .lean()
    
    return res.status(200).json({ success: true, data: items.map(formatCampaign).filter(Boolean) })
  } catch (error) {
    console.error('listUserCampaigns error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch campaigns.' })
  }
}

// Get user's own campaigns
const listMyCampaigns = async (req, res) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    const campaigns = await Campaign.find({ createdBy: user.id })
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, data: campaigns.map(formatCampaign).filter(Boolean) })
  } catch (error) {
    console.error('listMyCampaigns error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch your campaigns.' })
  }
}

// Create new campaign
const createCampaign = async (req, res) => {
  try {
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!user || !['alumni', 'faculty', 'admin', 'coordinator'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Only alumni, faculty, admin, and department coordinators can create campaigns.' })
    }

    const { title, description, goalAmount, coverImage, deadline, category, tags, featured, priority } = req.body ?? {}

    if (!title || !description || goalAmount === undefined || !category) {
      return res.status(400).json({ success: false, message: 'title, description, goalAmount, and category are required.' })
    }

    const numericGoal = Number(goalAmount)
    if (!Number.isFinite(numericGoal) || numericGoal <= 0) {
      return res.status(400).json({ success: false, message: 'goalAmount must be a positive number.' })
    }

    let parsedDeadline = null
    if (deadline) {
      const deadlineDate = new Date(deadline)
      if (Number.isNaN(deadlineDate.getTime())) {
        return res.status(400).json({ success: false, message: 'deadline must be a valid date when provided.' })
      }
      parsedDeadline = deadlineDate
    }

    const CreatorModel = getModelByRole(role)
    if (!CreatorModel) {
      if (role === 'admin' || role === 'coordinator') {
        const createdByName = user.email || role.charAt(0).toUpperCase() + role.slice(1)
        
        const isReviewer = role === 'admin' || role === 'coordinator'
        const decisionTimestamp = new Date()
        const approvalStatus = isReviewer ? CONTENT_APPROVAL_STATUS.APPROVED : CONTENT_APPROVAL_STATUS.PENDING
        const approvalDecisions = isReviewer
          ? [
              {
                status: approvalStatus,
                decidedByRole: role,
                decidedByName: createdByName,
                decidedById: user.id,
                decidedAt: decisionTimestamp,
                reason: '',
              },
            ]
          : []

        const campaignData = {
          title: title.trim(),
          description: description.trim(),
          goalAmount: numericGoal,
          coverImage: coverImage?.trim() || '',
          deadline: parsedDeadline,
          category,
          tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()).map(tag => tag.trim()) : [],
          featured: Boolean(featured),
          priority: Number(priority) || 0,
          createdBy: user.id,
          createdByRole: role,
          createdByName,
          approvalStatus,
          approvalDepartment: '',
          approvalDecisions,
          approvedAt: isReviewer ? decisionTimestamp : null,
          rejectedAt: null,
          approvalRejectionReason: '',
        }

        const campaign = await Campaign.create(campaignData)
        return res.status(201).json({ success: true, data: formatCampaign(campaign) })
      }
      return res.status(403).json({ success: false, message: 'Unsupported creator role.' })
    }

    const creator = await CreatorModel.findById(user.id).select('firstName lastName email department').lean()
    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator profile not found.' })
    }

    const createdByName = `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() || creator.email || ''
    const derivedDepartment = normalizeDepartment(creator.department || '')

    const isReviewer = role === 'admin' || role === 'coordinator'
    const decisionTimestamp = new Date()
    const approvalStatus = isReviewer ? CONTENT_APPROVAL_STATUS.APPROVED : CONTENT_APPROVAL_STATUS.PENDING
    const approvalDecisions = isReviewer
      ? [
          {
            status: approvalStatus,
            decidedByRole: role,
            decidedByName: createdByName,
            decidedById: user.id,
            decidedAt: decisionTimestamp,
            reason: '',
          },
        ]
      : []

    const campaignData = {
      title: title.trim(),
      description: description.trim(),
      goalAmount: numericGoal,
      coverImage: coverImage?.trim() || '',
      deadline: parsedDeadline,
      category,
      tags: Array.isArray(tags) ? tags.filter(tag => tag && tag.trim()).map(tag => tag.trim()) : [],
      featured: Boolean(featured),
      priority: Number(priority) || 0,
      createdBy: user.id,
      createdByRole: role,
      createdByName,
      approvalStatus,
      approvalDepartment: derivedDepartment,
      approvalDecisions,
      approvedAt: isReviewer ? decisionTimestamp : null,
      rejectedAt: null,
      approvalRejectionReason: '',
    }

    const campaign = await Campaign.create(campaignData)
    return res.status(201).json({ success: true, data: formatCampaign(campaign) })
  } catch (error) {
    console.error('createCampaign error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create campaign.' })
  }
}

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign id.' })
    }

    const campaign = await Campaign.findById(id)
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' })
    }

    if (campaign.createdBy.toString() !== user.id && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only campaign creator can update this campaign.' })
    }

    const updates = req.body ?? {}
    const allowedUpdates = ['title', 'description', 'coverImage', 'deadline', 'category', 'tags', 'status', 'featured', 'priority']
    
    const updateData = {}
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'deadline' && updates[field]) {
          const deadlineDate = new Date(updates[field])
          if (!Number.isNaN(deadlineDate.getTime())) {
            updateData[field] = deadlineDate
          }
        } else if (field === 'tags') {
          updateData[field] = Array.isArray(updates[field]) ? updates[field].filter(tag => tag && tag.trim()).map(tag => tag.trim()) : []
        } else {
          updateData[field] = updates[field]
        }
      }
    })

    const updatedCampaign = await Campaign.findByIdAndUpdate(id, updateData, { new: true }).lean()
    return res.status(200).json({ success: true, data: formatCampaign(updatedCampaign) })
  } catch (error) {
    console.error('updateCampaign error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update campaign.' })
  }
}

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign id.' })
    }

    const campaign = await Campaign.findById(id)
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' })
    }

    if (campaign.createdBy.toString() !== user.id && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only campaign creator can delete this campaign.' })
    }

    await Campaign.findByIdAndDelete(id)
    return res.status(200).json({ success: true, message: 'Campaign deleted successfully.' })
  } catch (error) {
    console.error('deleteCampaign error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete campaign.' })
  }
}

// Donate to campaign (add donation to campaign)
const donateToCampaign = async (req, res) => {
  try {
    const { id } = req.params
    const { donorName, donorEmail, amount, message, anonymous } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign id.' })
    }

    if (!donorName || !donorEmail || !amount) {
      return res.status(400).json({ success: false, message: 'donorName, donorEmail, and amount are required.' })
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'amount must be a positive number.' })
    }

    const campaign = await Campaign.findById(id)
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found.' })
    }

    // Add donation to campaign
    const donation = {
      donorName: donorName.trim(),
      donorEmail: donorEmail.trim().toLowerCase(),
      amount: numericAmount,
      message: message?.trim() || '',
      anonymous: Boolean(anonymous),
      donatedAt: new Date(),
      paymentMethod: 'offline',
      paymentStatus: 'completed',
    }

    campaign.donations.push(donation)
    campaign.raisedAmount += numericAmount

    await campaign.save()

    return res.status(200).json({ success: true, data: formatCampaign(campaign) })
  } catch (error) {
    console.error('donateToCampaign error:', error)
    return res.status(500).json({ success: false, message: 'Unable to process donation.' })
  }
}

// Get campaign statistics
const getCampaignStats = async (_req, res) => {
  try {
    const stats = await Campaign.aggregate([
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          activeCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalRaised: { $sum: '$raisedAmount' },
          totalGoal: { $sum: '$goalAmount' },
          totalDonors: { $sum: { $size: '$donations' } },
          approvedCampaigns: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'APPROVED'] }, 1, 0] }
          },
          pendingCampaigns: {
            $sum: { $cond: [{ $eq: ['$approvalStatus', 'PENDING'] }, 1, 0] }
          },
        }
      }
    ])

    const result = stats[0] || {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalRaised: 0,
      totalGoal: 0,
      totalDonors: 0,
      approvedCampaigns: 0,
      pendingCampaigns: 0,
    }

    return res.status(200).json({ success: true, data: result })
  } catch (error) {
    console.error('getCampaignStats error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch campaign statistics.' })
  }
}

module.exports = {
  listCampaigns,
  getCampaignById,
  listUserCampaigns,
  listMyCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  donateToCampaign,
  getCampaignStats,
}
