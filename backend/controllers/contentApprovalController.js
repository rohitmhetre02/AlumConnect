const mongoose = require('mongoose')

const { CONTENT_APPROVAL_STATUS } = require('../utils/contentApprovalStatus')
const { normalizeDepartment } = require('../utils/departments')
const Event = require('../models/Event')
const Opportunity = require('../models/Opportunity')
const Campaign = require('../models/Campaign')
const News = require('../models/News')
const Coordinator = require('../models/Coordinator')
const Admin = require('../models/Admin')

const ensureObjectId = (value) => {
  return new mongoose.Types.ObjectId(String(value))
}

const SUPPORTED_TYPES = {
  event: Event,
  opportunity: Opportunity,
  campaign: Campaign,
  news: News,
}

const CONTENT_TYPE_MODELS = {
  opportunity: Opportunity,
  event: Event,
  campaign: Campaign,
  news: News,
}

const getAdminContext = async (adminId) => {
  const admin = await Admin.findById(adminId).lean()
  if (!admin) {
    throw Object.assign(new Error('Admin profile not found.'), { status: 404 })
  }

  const displayName = [admin.firstName, admin.lastName].filter(Boolean).join(' ').trim() || admin.email || 'Admin'
  return { admin, displayName }
}

const getCoordinatorContext = async (coordinatorId) => {
  const coordinator = await Coordinator.findById(coordinatorId).lean()
  if (!coordinator) {
    throw Object.assign(new Error('Coordinator profile not found.'), { status: 404 })
  }

  const department = normalizeDepartment(coordinator.department)
  const displayName = [coordinator.firstName, coordinator.lastName].filter(Boolean).join(' ').trim() || coordinator.email || 'Coordinator'

  return { coordinator, department, displayName }
}

const deriveDepartment = (doc) => normalizeDepartment(doc.approvalDepartment || doc.department || '')

const buildSummary = (input = '', maxLength = 220) => {
  if (!input) return ''
  const trimmed = String(input).replace(/\s+/g, ' ').trim()
  if (trimmed.length <= maxLength) return trimmed
  return `${trimmed.slice(0, maxLength - 1)}…`
}

const mapPost = (doc, contentType) => {
  if (!doc) {
    console.log(`mapPost called with null doc for contentType: ${contentType}`)
    return null
  }

  const snapshot = doc.toObject ? doc.toObject() : doc
  const department = deriveDepartment(snapshot)

  console.log(`Mapping ${contentType} post:`, {
    id: snapshot._id?.toString?.() ?? snapshot.id,
    title: snapshot.title ?? '',
    approvalStatus: snapshot.approvalStatus ?? CONTENT_APPROVAL_STATUS.PENDING,
    department
  })

  const base = {
    id: snapshot._id?.toString?.() ?? snapshot.id,
    contentType,
    title: snapshot.title ?? '',
    createdByName: snapshot.createdByName ?? '',
    createdByRole: snapshot.createdByRole ?? '',
    createdBy: snapshot.createdBy ?? null,
    approvalStatus: snapshot.approvalStatus ?? CONTENT_APPROVAL_STATUS.PENDING,
    approvalDepartment: snapshot.approvalDepartment ?? department,
    department,
    createdAt: snapshot.createdAt ?? null,
    updatedAt: snapshot.updatedAt ?? null,
    approvalRejectionReason: snapshot.approvalRejectionReason ?? '',
    summary: buildSummary(snapshot.description || snapshot.details || snapshot.content || ''),
  }

  if (contentType === 'event') {
    base.metadata = {
      startAt: snapshot.startAt ?? null,
      endAt: snapshot.endAt ?? null,
      location: snapshot.location ?? '',
      mode: snapshot.mode ?? '',
      organization: snapshot.organization ?? '',
    }
  } else if (contentType === 'opportunity') {
    base.metadata = {
      company: snapshot.company ?? '',
      type: snapshot.type ?? '',
      deadline: snapshot.deadline ?? null,
      isRemote: Boolean(snapshot.isRemote),
      location: snapshot.location ?? '',
    }
  } else if (contentType === 'campaign') {
    base.metadata = {
      goalAmount: snapshot.goalAmount ?? 0,
      raisedAmount: snapshot.raisedAmount ?? 0,
      deadline: snapshot.deadline ?? null,
      category: snapshot.category ?? '',
    }
  }

  return base
}

const collectPosts = async (queryBuilders = []) => {
  const results = await Promise.all(queryBuilders)
  return results
    .flat()
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime()
      const bTime = new Date(b.createdAt || 0).getTime()
      return bTime - aTime
    })
}

const buildPendingQueries = ({ role, department }) => {
  const baseFilter = { approvalStatus: CONTENT_APPROVAL_STATUS.PENDING }

  if (role === 'coordinator') {
    baseFilter.approvalDepartment = department
  }

  console.log(`Building pending queries for role: ${role}, department: ${department}, filter:`, baseFilter)

  const queries = [
    Event.find(baseFilter)
      .sort({ createdAt: -1 })
      .lean()
      .then((docs) => {
        console.log(`Found ${docs.length} pending events`)
        return docs.map((doc) => mapPost(doc, 'event'))
      }),
    Opportunity.find(baseFilter)
      .sort({ createdAt: -1 })
      .lean()
      .then((docs) => {
        console.log(`Found ${docs.length} pending opportunities`)
        return docs.map((doc) => mapPost(doc, 'opportunity'))
      }),
    Campaign.find(baseFilter)
      .sort({ createdAt: -1 })
      .lean()
      .then((docs) => {
        console.log(`Found ${docs.length} pending campaigns`)
        return docs.map((doc) => mapPost(doc, 'campaign'))
      }),
  ]

  return queries
}

const buildApprovedQueries = ({ role, department }) => {
  const baseFilter = { approvalStatus: CONTENT_APPROVAL_STATUS.APPROVED }

  if (role === 'coordinator') {
    baseFilter.approvalDepartment = department
  }

  return [
    Event.find(baseFilter)
      .sort({ createdAt: -1 })
      .lean()
      .then((docs) => docs.map((doc) => mapPost(doc, 'event'))),
    Opportunity.find(baseFilter)
      .sort({ createdAt: -1 })
      .lean()
      .then((docs) => docs.map((doc) => mapPost(doc, 'opportunity'))),
    Campaign.find(baseFilter)
      .sort({ createdAt: -1 })
      .lean()
      .then((docs) => docs.map((doc) => mapPost(doc, 'campaign'))),
  ]
}

const getApprovedPosts = async (req, res) => {
  try {
    const actorRole = String(req.user?.role || '').toLowerCase()

    if (!['admin', 'coordinator'].includes(actorRole)) {
      return res
        .status(403)
        .json({ success: false, message: 'You do not have permission to view approved posts.' })
    }

    let department
    if (actorRole === 'admin') {
      await getAdminContext(req.user.id)
    } else {
      ;({ department } = await getCoordinatorContext(req.user.id))
    }

    const posts = await collectPosts(buildApprovedQueries({ role: actorRole, department }))

    return res.json({
      success: true,
      data: posts,
      meta: {
        reviewerRole: actorRole,
        department: department || '',
        totals: posts.reduce(
          (acc, post) => {
            acc.total += 1
            acc.byType[post.contentType] = (acc.byType[post.contentType] || 0) + 1
            return acc
          },
          { total: 0, byType: {} },
        ),
      },
    })
  } catch (error) {
    console.error('Error fetching approved posts:', error)
    const status = error.status ?? 500
    res.status(status).json({
      success: false,
      message: error.message || 'Unable to fetch approved posts.',
    })
  }
}

const getPendingPosts = async (req, res) => {
  try {
    const actorRole = String(req.user?.role || '').toLowerCase()

    if (!['admin', 'coordinator'].includes(actorRole)) {
      return res
        .status(403)
        .json({ success: false, message: 'You do not have permission to review posts.' })
    }

    let department
    if (actorRole === 'admin') {
      await getAdminContext(req.user.id)
    } else {
      ;({ department } = await getCoordinatorContext(req.user.id))
    }

    console.log(`Fetching pending posts for ${actorRole}, department: ${department || 'all'}`)
    
    const posts = await collectPosts(buildPendingQueries({ role: actorRole, department }))
    
    console.log(`Found ${posts.length} pending posts:`, posts.map(p => ({ id: p.id, type: p.contentType, title: p.title, status: p.approvalStatus })))

    return res.json({
      success: true,
      data: posts,
      meta: {
        reviewerRole: actorRole,
        department: department || '',
        totals: posts.reduce(
          (acc, post) => {
            acc.total += 1
            acc.byType[post.contentType] = (acc.byType[post.contentType] || 0) + 1
            return acc
          },
          { total: 0, byType: {} },
        ),
      },
    })
  } catch (error) {
    console.error('Error fetching pending posts:', error)
    const status = error.status ?? 500
    res.status(status).json({
      success: false,
      message: error.message || 'Unable to fetch pending posts.',
    })
  }
}

const decideOnPost = async (req, res) => {
  try {
    const { id, contentType, action, reason } = req.body ?? {}
    const actorRole = String(req.user?.role || '').toLowerCase()

    if (!['admin', 'coordinator'].includes(actorRole)) {
      return res
        .status(403)
        .json({ success: false, message: 'You do not have permission to review posts.' })
    }

    if (!id || !contentType || !action) {
      return res
        .status(400)
        .json({ success: false, message: 'Post id, content type, and action are required.' })
    }

    const normalizedType = String(contentType).toLowerCase()
    const Model = SUPPORTED_TYPES[normalizedType]

    if (!Model) {
      return res.status(400).json({ success: false, message: 'Unsupported content type.' })
    }

    const normalizedAction = String(action).toLowerCase()
    if (!['approve', 'reject'].includes(normalizedAction)) {
      return res.status(400).json({ success: false, message: 'Action must be either approve or reject.' })
    }

    const objectId = ensureObjectId(id)

    const context =
      actorRole === 'admin'
        ? await getAdminContext(req.user.id)
        : await getCoordinatorContext(req.user.id)

    const doc = await Model.findById(objectId)

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Post not found.' })
    }

    const docDepartment = deriveDepartment(doc)

    if (actorRole === 'coordinator' && docDepartment !== context.department) {
      return res
        .status(403)
        .json({ success: false, message: 'You can only review posts for your department.' })
    }

    const now = new Date()
    const nextStatus =
      normalizedAction === 'approve' ? CONTENT_APPROVAL_STATUS.APPROVED : CONTENT_APPROVAL_STATUS.REJECTED

    doc.approvalStatus = nextStatus
    doc.approvalDepartment = docDepartment

    if (nextStatus === CONTENT_APPROVAL_STATUS.APPROVED) {
      doc.approvedAt = now
      doc.rejectedAt = null
      doc.approvalRejectionReason = ''
    } else {
      const trimmedReason = String(reason || '').trim()
      if (!trimmedReason) {
        return res.status(400).json({ success: false, message: 'Rejection reason is required.' })
      }
      doc.rejectedAt = now
      doc.approvedAt = null
      doc.approvalRejectionReason = trimmedReason
    }

    const decisionEntry = {
      status: nextStatus,
      decidedByRole: actorRole,
      decidedByName: context.displayName,
      decidedById: req.user.id,
      decidedAt: now,
      reason: nextStatus === CONTENT_APPROVAL_STATUS.REJECTED ? doc.approvalRejectionReason : '',
    }

    doc.approvalDecisions = Array.isArray(doc.approvalDecisions)
      ? doc.approvalDecisions.concat(decisionEntry)
      : [decisionEntry]

    await doc.save()

    const mapped = mapPost(doc, normalizedType)

    return res.json({
      success: true,
      message: `Post ${normalizedAction === 'approve' ? 'approved' : 'rejected'} successfully.`,
      data: mapped,
    })
  } catch (error) {
    console.error('Error processing post decision:', error)
    const status = error.status ?? 500
    res.status(status).json({
      success: false,
      message: error.message || 'Unable to process decision.',
    })
  }
}

const debugCampaigns = async (req, res) => {
  try {
    console.log('Debug: Checking all campaigns in database...')
    
    const allCampaigns = await Campaign.find({}).lean()
    console.log(`Total campaigns in database: ${allCampaigns.length}`)
    
    allCampaigns.forEach((campaign, index) => {
      console.log(`Campaign ${index + 1}:`, {
        id: campaign._id,
        title: campaign.title,
        approvalStatus: campaign.approvalStatus,
        approvalDepartment: campaign.approvalDepartment,
        createdBy: campaign.createdBy,
        createdByRole: campaign.createdByRole,
        createdAt: campaign.createdAt
      })
    })
    
    const pendingCampaigns = await Campaign.find({ approvalStatus: CONTENT_APPROVAL_STATUS.PENDING }).lean()
    console.log(`Pending campaigns: ${pendingCampaigns.length}`)
    
    return res.json({
      success: true,
      data: {
        total: allCampaigns.length,
        pending: pendingCampaigns.length,
        allCampaigns: allCampaigns.map(c => ({
          id: c._id,
          title: c.title,
          approvalStatus: c.approvalStatus,
          approvalDepartment: c.approvalDepartment,
          createdBy: c.createdBy,
          createdByRole: c.createdByRole,
          createdAt: c.createdAt
        })),
        pendingCampaigns: pendingCampaigns.map(c => ({
          id: c._id,
          title: c.title,
          approvalStatus: c.approvalStatus,
          approvalDepartment: c.approvalDepartment
        }))
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  getPendingPosts,
  getApprovedPosts,
  decideOnPost,
  debugCampaigns,
}
