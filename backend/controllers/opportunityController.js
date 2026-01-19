const mongoose = require('mongoose')
const Opportunity = require('../models/Opportunity')
const OpportunityReferral = require('../models/OpportunityReferral')
const { getModelByRole } = require('../utils/roleModels')
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload')

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
    const items = await Opportunity.find({ status: 'active' }).sort({ createdAt: -1 }).lean()

    const data = items.map((item) => ({
      id: item._id.toString(),
      title: item.title,
      company: item.company,
      type: item.type,
      location: item.location,
      description: item.description,
      skills: Array.isArray(item.skills) ? item.skills : [],
      contactEmail: item.contactEmail,
      deadline: item.deadline,
      isRemote: item.isRemote,
      postedAt: item.createdAt,
      postedBy: item.createdByName,
      createdBy: item.createdBy,
      createdByName: item.createdByName,
      createdByRole: item.createdByRole,
    }))

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('listOpportunities error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch opportunities.' })
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

    return res.status(200).json({
      success: true,
      data: {
        id: item._id.toString(),
        title: item.title,
        company: item.company,
        type: item.type,
        location: item.location,
        description: item.description,
        skills: Array.isArray(item.skills) ? item.skills : [],
        contactEmail: item.contactEmail,
        deadline: item.deadline,
        isRemote: item.isRemote,
        postedAt: item.createdAt,
        postedBy: item.createdByName,
        createdBy: item.createdBy,
        createdByName: item.createdByName,
        createdByRole: item.createdByRole,
      },
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

    if (!CreatorModel) {
      // For admin and coordinator users, create a simple creator object
      if (creatorRole === 'admin' || creatorRole === 'coordinator') {
        const createdByName = user.email || creatorRole.charAt(0).toUpperCase() + creatorRole.slice(1)
        
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
        }

        const created = await Opportunity.create(payload)
        return res.status(201).json({
          success: true,
          message: 'Opportunity posted successfully.',
          data: {
            id: created._id.toString(),
            title: created.title,
            company: created.company,
            type: created.type,
            location: created.location,
            description: created.description,
            skills: created.skills,
            contactEmail: created.contactEmail,
            deadline: created.deadline,
            isRemote: created.isRemote,
            postedAt: created.createdAt,
            postedBy: created.createdByName,
            createdBy: created.createdBy,
            createdByName: created.createdByName,
            createdByRole: created.createdByRole,
          },
        })
      }
      return res.status(403).json({ success: false, message: 'Unsupported creator role.' })
    }

    const creator = await CreatorModel.findById(user.id).select('firstName lastName email').lean()

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator record not found.' })
    }

    const createdByName = `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() || creator.email || ''

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
    }

    const created = await Opportunity.create(payload)

    // Update user's posted opportunities array
    await CreatorModel.findByIdAndUpdate(user.id, {
      $push: { postedOpportunities: created._id }
    })

    return res.status(201).json({
      success: true,
      message: 'Opportunity posted successfully.',
      data: {
        id: created._id.toString(),
        title: created.title,
        company: created.company,
        type: created.type,
        location: created.location,
        description: created.description,
        skills: created.skills,
        contactEmail: created.contactEmail,
        deadline: created.deadline,
        isRemote: created.isRemote,
        postedAt: created.createdAt,
        postedBy: created.createdByName,
        createdBy: created.createdBy,
        createdByName: created.createdByName,
        createdByRole: created.createdByRole,
      },
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

    console.log('Fetching referral for:', { opportunityId, userId })
    
    const referral = await OpportunityReferral.findOne({ opportunity: opportunityId, student: userId })
    
    console.log('Found referral:', referral)

    if (!referral) {
      return res.status(404).json({ success: false, message: 'No referral request submitted yet.' })
    }

    return res.status(200).json({ success: true, data: mapReferral(referral) })
  } catch (error) {
    console.error('getMyOpportunityReferral error:', error)
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
    console.log('Sending referral accepted email for:', {
      referralId: referral._id,
      studentEmail: referral.student?.email,
      opportunity: referral.opportunity?.title,
      status: 'accepted'
    })
    // TODO: Implement actual email sending logic
  } catch (error) {
    console.error('Failed to send referral accepted email:', error)
  }
}

const sendReferralUpdateEmail = async (referral, status) => {
  try {
    // This would integrate with your email service
    console.log('Sending referral update email for:', {
      referralId: referral._id,
      studentEmail: referral.student?.email,
      opportunity: referral.opportunity?.title,
      status
    })
    // TODO: Implement actual email sending logic
  } catch (error) {
    console.error('Failed to send referral update email:', error)
  }
}

module.exports = {
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  submitOpportunityReferral,
  getMyOpportunityReferral,
  listMyOpportunityReferrals,
  updateReferralStatus,
}
