const mongoose = require('mongoose')
const Opportunity = require('../models/Opportunity')
const OpportunityReferral = require('../models/OpportunityReferral')
const { getModelByRole } = require('../utils/roleModels')
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload')
const { CONTENT_APPROVAL_STATUS } = require('../utils/contentApprovalStatus')
const { normalizeDepartment } = require('../utils/departments')

const normalizeSkills = (skills) => {
  if (!skills) return []

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => (typeof skill === 'string' ? skill.trim() : ''))
      .filter(Boolean)
  }

  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  }

  return []
}

const ensureAuthenticatedUser = (req) => {
  const userId = req.user?.id
  const role = req.user?.role?.toLowerCase()

  if (!userId) {
    return { error: { status: 401, message: 'Authentication required.' } }
  }

  return { userId, role }
}

const formatOpportunity = (doc) => {
  if (!doc) return null

  const source = typeof doc.toObject === 'function' ? doc.toObject() : doc
  const id = source._id?.toString?.() ?? source.id ?? null

  if (!id) return null

  return {
    id,
    title: source.title ?? '',
    company: source.company ?? '',
    type: source.type ?? '',
    location: source.location ?? '',
    description: source.description ?? '',
    skills: Array.isArray(source.skills) ? source.skills : [],
    contactEmail: source.contactEmail ?? '',
    deadline: source.deadline ?? null,
    isRemote: Boolean(source.isRemote),
    postedAt: source.createdAt ?? null,
    createdBy: source.createdBy ?? null,
    createdByName: source.createdByName ?? '',
    createdByRole: source.createdByRole ?? '',
    status: source.status ?? 'active',
    department: source.department ?? '',
    approvalStatus: source.approvalStatus ?? CONTENT_APPROVAL_STATUS.PENDING,
    approvalDepartment: source.approvalDepartment ?? '',
    approvalDecisions: Array.isArray(source.approvalDecisions) ? source.approvalDecisions : [],
    approvedAt: source.approvedAt ?? null,
    rejectedAt: source.rejectedAt ?? null,
    applicants: source.applicants ?? 0,
    isPushed: source.isPushed ?? false,
    pushedAt: source.pushedAt ?? null,
  }
}

const mapReferral = (doc, options = {}) => {
  if (!doc) return null

  const payload = {
    id: doc._id.toString(),
    opportunity: doc.opportunity?.toString?.() ?? doc.opportunity,
    student: doc.student?.toString?.() ?? doc.student,
    proposal: doc.proposal,
    resumeUrl: doc.resumeUrl || '',
    resumeFileName: doc.resumeFileName || '',
    status: doc.status,
    submittedAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    reviewedAt: doc.reviewedAt,
    reviewerNote: doc.reviewerNote || '',
  }

  if (options.includeOpportunity && doc.opportunity && typeof doc.opportunity === 'object') {
    payload.opportunity = {
      id: doc.opportunity._id?.toString?.() ?? doc.opportunity.id ?? null,
      title: doc.opportunity.title ?? '',
      company: doc.opportunity.company ?? '',
      type: doc.opportunity.type ?? 'opportunity',
      location: doc.opportunity.location ?? '',
      description: doc.opportunity.description ?? '',
      skills: Array.isArray(doc.opportunity.skills) ? doc.opportunity.skills : [],
      deadline: doc.opportunity.deadline ?? null,
      isRemote: Boolean(doc.opportunity.isRemote),
      postedAt: doc.opportunity.createdAt ?? null,
      postedBy: doc.opportunity.createdByName ?? '',
      createdByRole: doc.opportunity.createdByRole ?? '',
      contactEmail: doc.opportunity.contactEmail ?? '',
    }
  }

  return payload
}

const listOpportunities = async (_req, res) => {
  try {
    const items = await Opportunity.find({
      status: 'active',
      approvalStatus: CONTENT_APPROVAL_STATUS.APPROVED,
    })
      .sort({ createdAt: -1 })
      .lean()

    const data = items.map(formatOpportunity).filter(Boolean)

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('listOpportunities error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch opportunities.' })
  }
}

const listAllOpportunitiesForAdmin = async (req, res) => {
  try {
    const items = await Opportunity.find({})
      .sort({ createdAt: -1 })
      .lean()

    const data = items.map(formatOpportunity).filter(Boolean)

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('listAllOpportunitiesForAdmin error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch opportunities.' })
  }
}

const listMyOpportunities = async (req, res) => {
  try {
    const { error, userId } = ensureAuthenticatedUser(req)

    if (error) {
      return res.status(error.status).json({ success: false, message: error.message })
    }

    const filter = mongoose.Types.ObjectId.isValid(userId)
      ? { createdBy: new mongoose.Types.ObjectId(userId) }
      : { createdBy: userId }

    const items = await Opportunity.find(filter).sort({ createdAt: -1 }).lean()

    return res.status(200).json({ success: true, data: items.map(formatOpportunity).filter(Boolean) })
  } catch (error) {
    console.error('listMyOpportunities error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch your opportunities.' })
  }
}

const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id.' })
    }

    const item = await Opportunity.findById(id).lean()

    if (!item) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' })
    }

    const userRole = req.user?.role?.toLowerCase?.()
    const userId = req.user?.id
    const isOwner = userId && item.createdBy?.toString?.() === userId
    const isAdmin = userRole === 'admin'
    const isCoordinator = userRole === 'coordinator'

    if (
      item.approvalStatus !== CONTENT_APPROVAL_STATUS.APPROVED &&
      !isAdmin &&
      !isCoordinator &&
      !isOwner
    ) {
      return res.status(403).json({ success: false, message: 'This opportunity is pending review.' })
    }

    return res.status(200).json({
      success: true,
      data: formatOpportunity(item),
    })
  } catch (error) {
    console.error('getOpportunityById error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch opportunity.' })
  }
}

const createOpportunity = async (req, res) => {
  try {
    const user = req.user

    if (!user || !['alumni', 'faculty', 'admin', 'coordinator'].includes(user.role?.toLowerCase())) {
      return res.status(403).json({ success: false, message: 'Only alumni, faculty, admin, and department coordinators can post opportunities.' })
    }

    const { title, company, type, location, description, skills, contactEmail, deadline, isRemote } = req.body ?? {}

    if (!title || !company || !type || !description || !contactEmail || !deadline) {
      return res.status(400).json({ success: false, message: 'title, company, type, description, contactEmail, and deadline are required.' })
    }

    const normalizedType = String(type).toLowerCase()
    if (!['full-time', 'internship', 'part-time', 'contract'].includes(normalizedType)) {
      return res.status(400).json({ success: false, message: 'type must be full-time, internship, part-time, or contract.' })
    }

    const normalizedSkills = normalizeSkills(skills)

    const creatorRole = user.role?.toLowerCase()
    const CreatorModel = getModelByRole(creatorRole)

    let creator = null
    if (CreatorModel) {
      creator = await CreatorModel.findById(user.id).select('firstName lastName email department').lean()
    }

    if (!creator && !['admin', 'coordinator'].includes(creatorRole)) {
      return res.status(404).json({ success: false, message: 'Creator record not found.' })
    }

    const createdByName = `${creator?.firstName ?? ''} ${creator?.lastName ?? ''}`.trim() || creator?.email || user.email || ''
    const derivedDepartment = normalizeDepartment(creator?.department || req.body?.department || '')
    const isReviewer = ['admin', 'coordinator'].includes(creatorRole)
    const decisionTimestamp = new Date()
    const approvalStatus = isReviewer ? CONTENT_APPROVAL_STATUS.APPROVED : CONTENT_APPROVAL_STATUS.PENDING
    const approvalDecisions = isReviewer
      ? [
          {
            status: approvalStatus,
            decidedByRole: creatorRole,
            decidedByName: createdByName,
            decidedById: user.id,
            decidedAt: decisionTimestamp,
            reason: '',
          },
        ]
      : []

    const payload = {
      title: title.trim(),
      company: company.trim(),
      type: normalizedType,
      location: isRemote ? 'Remote' : location.trim(),
      description: description.trim(),
      contactEmail: String(contactEmail).toLowerCase().trim(),
      skills: normalizedSkills,
      deadline: new Date(deadline),
      isRemote: Boolean(isRemote),
      createdBy: user.id,
      createdByRole: creatorRole,
      createdByName,
      department: derivedDepartment,
      approvalStatus,
      approvalDepartment: derivedDepartment,
      approvalDecisions,
      approvedAt: isReviewer ? decisionTimestamp : null,
      rejectedAt: null,
    }

    const created = await Opportunity.create(payload)

    if (CreatorModel && ['alumni', 'faculty'].includes(creatorRole)) {
      await CreatorModel.findByIdAndUpdate(user.id, {
        $push: { postedOpportunities: created._id },
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Opportunity posted successfully.',
      data: formatOpportunity(created),
    })
  } catch (error) {
    console.error('createOpportunity error:', error)
    return res.status(500).json({ success: false, message: 'Unable to post opportunity.' })
  }
}

const submitOpportunityReferral = async (req, res) => {
  try {
    const { opportunityId } = req.params
    const { error, userId } = ensureAuthenticatedUser(req)

    if (error) {
      return res.status(error.status).json({ success: false, message: error.message })
    }

    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id.' })
    }

    const opportunity = await Opportunity.findById(opportunityId).select('_id title')
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' })
    }

    const proposal = String(req.body?.proposal || '').trim()
    if (!proposal) {
      return res.status(400).json({ success: false, message: 'Proposal is required to request a referral.' })
    }

    let referral = await OpportunityReferral.findOne({ opportunity: opportunityId, student: userId })

    let uploadedAsset
    if (req.file) {
      uploadedAsset = await uploadToCloudinary(req.file, 'OpportunityReferrals')
    }

    if (!referral) {
      referral = await OpportunityReferral.create({
        opportunity: opportunityId,
        student: userId,
        proposal,
        resumeUrl: uploadedAsset?.url || '',
        resumePublicId: uploadedAsset?.public_id || '',
        resumeFileName: req.file?.originalname || '',
      })
    } else {
      referral.proposal = proposal

      if (uploadedAsset) {
        if (referral.resumePublicId) {
          try {
            await deleteFromCloudinary(referral.resumePublicId)
          } catch (cleanupError) {
            console.warn('Unable to cleanup old referral resume:', cleanupError.message)
          }
        }

        referral.resumeUrl = uploadedAsset.url
        referral.resumePublicId = uploadedAsset.public_id
        referral.resumeFileName = req.file?.originalname || ''
      }

      referral.status = 'submitted'
      referral.reviewedAt = null
      referral.reviewerNote = ''
      await referral.save()
    }

    return res.status(201).json({ success: true, data: mapReferral(referral) })
  } catch (error) {
    console.error('submitOpportunityReferral error:', error)
    return res.status(500).json({ success: false, message: 'Unable to submit referral request.' })
  }
}

const getMyOpportunityReferral = async (req, res) => {
  try {
    const { opportunityId } = req.params
    const { error, userId } = ensureAuthenticatedUser(req)

    if (error) {
      return res.status(error.status).json({ success: false, message: error.message })
    }

    if (!mongoose.Types.ObjectId.isValid(opportunityId)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id.' })
    }

    const referral = await OpportunityReferral.findOne({ opportunity: opportunityId, student: userId })

    if (!referral) {
      return res.status(404).json({ success: false, message: 'No referral request submitted yet.' })
    }

    return res.status(200).json({ success: true, data: mapReferral(referral) })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load referral request.' })
  }
}

const listMyOpportunityReferrals = async (req, res) => {
  try {
    const { error, userId } = ensureAuthenticatedUser(req)

    if (error) {
      return res.status(error.status).json({ success: false, message: error.message })
    }

    const referrals = await OpportunityReferral.find({ student: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'opportunity',
        select: 'title company type location description skills deadline isRemote createdAt createdByName createdByRole contactEmail',
      })

    const data = referrals.map((item) => mapReferral(item, { includeOpportunity: true }))

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('listMyOpportunityReferrals error:', error)
    return res.status(500).json({ success: false, message: 'Unable to load referral requests.' })
  }
}

const updateReferralStatus = async (req, res) => {
  try {
    const { referralId } = req.params
    const { error, userId, role } = ensureAuthenticatedUser(req)
    const { status, reviewerNote } = req.body

    if (error) {
      return res.status(error.status).json({ success: false, message: error.message })
    }

    if (!mongoose.Types.ObjectId.isValid(referralId)) {
      return res.status(400).json({ success: false, message: 'Invalid referral id.' })
    }

    if (!['reviewed', 'accepted', 'declined'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' })
    }

    const referral = await OpportunityReferral.findById(referralId).populate('opportunity student')
    if (!referral) {
      return res.status(404).json({ success: false, message: 'Referral not found.' })
    }

    // Only opportunity poster or admin can update status
    const opportunity = await Opportunity.findById(referral.opportunity._id)
    const isAuthorized = opportunity.createdBy.toString() === userId || role === 'admin'
    
    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: 'Not authorized to update referral status.' })
    }

    const oldStatus = referral.status
    referral.status = status
    referral.reviewedAt = new Date()
    referral.reviewerNote = reviewerNote || ''
    await referral.save()

    // Send email notification for status change
    if (oldStatus !== status && status === 'accepted') {
      await sendReferralAcceptedEmail(referral)
    } else if (oldStatus !== status && ['reviewed', 'declined'].includes(status)) {
      await sendReferralUpdateEmail(referral, status)
    }

    return res.status(200).json({ success: true, data: mapReferral(referral) })
  } catch (error) {
    console.error('updateReferralStatus error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update referral status.' })
  }
}

const sendReferralAcceptedEmail = async (referral) => {
  try {
    // This would integrate with your email service
    // TODO: Implement actual email sending logic
  } catch (error) {
    // Continue silently
  }
}

const sendReferralUpdateEmail = async (referral, status) => {
  try {
    // This would integrate with your email service
    // TODO: Implement actual email sending logic
  } catch (error) {
    // Continue silently
  }
}

const updateOpportunity = async (req, res) => {
  try {
    const { error, userId } = ensureAuthenticatedUser(req)
    const { id } = req.params

    if (error) {
      return res.status(error.status).json({ success: false, message: error.message })
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Opportunity ID is required.' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id.' })
    }

    const opportunity = await Opportunity.findById(id)
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' })
    }

    // Check if user owns this opportunity or is admin/coordinator
    const userRole = req.user?.role?.toLowerCase()
    if (opportunity.createdBy?.toString() !== userId && !['admin', 'coordinator'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'You can only edit your own opportunities.' })
    }

    const { title, company, type, location, description, skills, contactEmail, deadline, isRemote, status, isPushed } = req.body ?? {}

    // For admin actions, status and push status can be updated without all required fields
    if ((status || isPushed !== undefined) && ['admin', 'coordinator'].includes(userRole)) {
      const updatePayload = {}
      if (status) updatePayload.status = status
      if (isPushed !== undefined) {
        updatePayload.isPushed = isPushed
        updatePayload.pushedAt = isPushed ? new Date() : null
      }
      
      const updatedOpportunity = await Opportunity.findByIdAndUpdate(id, updatePayload, { new: true })
      return res.status(200).json({
        success: true,
        message: isPushed ? 'Opportunity pushed successfully.' : 'Opportunity status updated successfully.',
        data: formatOpportunity(updatedOpportunity)
      })
    }

    // Validate required fields for full updates
    if (!title || !company || !type || !description || !contactEmail || !deadline) {
      return res.status(400).json({ success: false, message: 'title, company, type, description, contactEmail, and deadline are required.' })
    }

    const normalizedType = String(type).toLowerCase()
    if (!['full-time', 'internship', 'part-time', 'contract'].includes(normalizedType)) {
      return res.status(400).json({ success: false, message: 'type must be full-time, internship, part-time, or contract.' })
    }

    const normalizedSkills = normalizeSkills(skills)

    const updatePayload = {
      title: title.trim(),
      company: company.trim(),
      type: normalizedType,
      location: isRemote ? 'Remote' : location.trim(),
      description: description.trim(),
      contactEmail: String(contactEmail).toLowerCase().trim(),
      skills: normalizedSkills,
      deadline: new Date(deadline),
      isRemote: Boolean(isRemote),
    }

    const actorRole = req.user?.role?.toLowerCase()
    if (!['admin', 'coordinator'].includes(actorRole)) {
      updatePayload.approvalStatus = CONTENT_APPROVAL_STATUS.PENDING
      updatePayload.approvedAt = null
      updatePayload.rejectedAt = null
      updatePayload.approvalDecisions = []
    }

    const updatedOpportunity = await Opportunity.findByIdAndUpdate(id, updatePayload, { new: true })
    
    return res.status(200).json({ 
      success: true, 
      message: 'Opportunity updated successfully.', 
      data: formatOpportunity(updatedOpportunity) 
    })
  } catch (error) {
    console.error('updateOpportunity error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update opportunity.' })
  }
}

const getOpportunityApplicants = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id.' })
    }

    // Check if opportunity exists
    const opportunity = await Opportunity.findById(id)
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' })
    }

    // Get all referrals for this opportunity with student details
    const referrals = await OpportunityReferral.find({ opportunity: id })
      .populate({
        path: 'student',
        select: 'firstName lastName email department role profilePicture'
      })
      .sort({ createdAt: -1 })

    const data = referrals.map((referral) => ({
      id: referral._id,
      student: {
        id: referral.student._id,
        name: `${referral.student.firstName} ${referral.student.lastName}`,
        email: referral.student.email,
        department: referral.student.department || 'Not specified',
        role: referral.student.role || 'student',
        profilePicture: referral.student.profilePicture || ''
      },
      proposal: referral.proposal,
      resumeUrl: referral.resumeUrl,
      resumeFileName: referral.resumeFileName,
      status: referral.status,
      submittedAt: referral.createdAt,
      reviewedAt: referral.reviewedAt,
      reviewerNote: referral.reviewerNote || ''
    }))

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('getOpportunityApplicants error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch applicants.' })
  }
}

const deleteOpportunity = async (req, res) => {
  try {
    const { error, userId } = ensureAuthenticatedUser(req)
    const { id } = req.params
    const userRole = req.user?.role?.toLowerCase()

    if (error) {
      return res.status(error.status).json({ success: false, message: error.message })
    }

    if (!id) {
      return res.status(400).json({ success: false, message: 'Opportunity ID is required.' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid opportunity id.' })
    }

    const opportunity = await Opportunity.findById(id)
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found.' })
    }

    // Check if user owns this opportunity or is admin/coordinator
    if (opportunity.createdBy?.toString() !== userId && !['admin', 'coordinator'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'You can only delete your own opportunities.' })
    }

    await Opportunity.findByIdAndDelete(id)
    
    return res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully.'
    })
  } catch (error) {
    console.error('deleteOpportunity error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete opportunity.' })
  }
}

module.exports = {
  listOpportunities,
  listAllOpportunitiesForAdmin,
  listMyOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  submitOpportunityReferral,
  getMyOpportunityReferral,
  listMyOpportunityReferrals,
  updateReferralStatus,
  getOpportunityApplicants,
}
