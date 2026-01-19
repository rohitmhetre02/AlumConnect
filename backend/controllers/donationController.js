const mongoose = require('mongoose')

const Donation = require('../models/Donation')
const { getModelByRole } = require('../utils/roleModels')

const formatContribution = (entry) => {
  if (!entry) return null

  const payload = typeof entry.toObject === 'function' ? entry.toObject() : entry

  return {
    id: payload._id ? payload._id.toString() : undefined,
    amount: payload.amount,
    message: payload.message ?? '',
    contributorId: payload.contributorId ?? null,
    contributorRole: payload.contributorRole ?? '',
    contributorName: payload.contributorName ?? '',
    contributedAt: payload.contributedAt,
  }
}

const formatDonation = (doc) => {
  if (!doc) return null

  const contributions = Array.isArray(doc.contributions)
    ? doc.contributions.map(formatContribution).filter(Boolean)
    : []

  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    goalAmount: doc.goalAmount,
    raisedAmount: doc.raisedAmount,
    coverImage: doc.coverImage,
    deadline: doc.deadline,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    createdByRole: doc.createdByRole,
    createdByName: doc.createdByName,
    contributions,
    contributionCount: contributions.length,
  }
}

const listDonations = async (_req, res) => {
  try {
    const items = await Donation.find().sort({ createdAt: -1 }).lean()
    return res.status(200).json({ success: true, data: items.map(formatDonation).filter(Boolean) })
  } catch (error) {
    console.error('listDonations error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch donations.' })
  }
}

const getDonationById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid donation id.' })
    }

    const doc = await Donation.findById(id).lean()

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Donation campaign not found.' })
    }

    return res.status(200).json({ success: true, data: formatDonation(doc) })
  } catch (error) {
    console.error('getDonationById error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch donation campaign.' })
  }
}

const createDonation = async (req, res) => {
  try {
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!user || (role !== 'alumni' && role !== 'faculty')) {
      return res.status(403).json({ success: false, message: 'Only alumni and faculty can create donation campaigns.' })
    }

    const { title, description, goalAmount, coverImage, deadline } = req.body ?? {}

    if (!title || !description || goalAmount === undefined) {
      return res.status(400).json({ success: false, message: 'title, description, and goalAmount are required.' })
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
      return res.status(403).json({ success: false, message: 'Unsupported creator role.' })
    }

    const creator = await CreatorModel.findById(user.id).select('firstName lastName email').lean()

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator record not found.' })
    }

    const createdByName = `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() || creator.email || ''

    const payload = {
      title: title.trim(),
      description: description.trim(),
      goalAmount: numericGoal,
      coverImage: coverImage?.trim() ?? '',
      deadline: parsedDeadline,
      createdBy: user.id,
      createdByRole: role,
      createdByName,
    }

    const donation = await Donation.create(payload)

    return res.status(201).json({
      success: true,
      message: 'Donation campaign created successfully.',
      data: formatDonation(donation),
    })
  } catch (error) {
    console.error('createDonation error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create donation campaign.' })
  }
}

const contributeToDonation = async (req, res) => {
  console.log('contributeToDonation called', { method: req.method, url: req.originalUrl, params: req.params, body: req.body })
  try {
    const user = req.user
    const { id } = req.params
    const { amount, message } = req.body ?? {}

    if (!user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required to contribute.' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid donation id.' })
    }

    const numericAmount = Number(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Contribution amount must be a positive number.' })
    }

    const donation = await Donation.findById(id)
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation campaign not found.' })
    }

    let contributorName = user.name ?? ''
    if (!contributorName && user.role) {
      try {
        const Model = getModelByRole(user.role.toLowerCase())
        if (Model) {
          const record = await Model.findById(user.id).select('firstName lastName email').lean()
          if (record) {
            contributorName = `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim() || record.email || ''
          }
        }
      } catch (lookupError) {
        console.warn('Unable to resolve contributor name:', lookupError.message)
      }
    }

    const contributionEntry = {
      amount: numericAmount,
      message: message?.trim() ?? '',
      contributorId: user.id,
      contributorRole: user.role ?? '',
      contributorName,
      contributedAt: new Date(),
    }

    donation.raisedAmount = Number(donation.raisedAmount ?? 0) + numericAmount
    donation.contributions = Array.isArray(donation.contributions)
      ? donation.contributions.concat(contributionEntry)
      : [contributionEntry]

    await donation.save()

    const formatted = formatDonation(donation)

    return res.status(201).json({ success: true, message: 'Contribution recorded successfully.', data: formatted })
  } catch (error) {
    console.error('contributeToDonation error:', error)
    return res.status(500).json({ success: false, message: 'Unable to record contribution.' })
  }
}

module.exports = {
  listDonations,
  getDonationById,
  createDonation,
  contributeToDonation,
}
