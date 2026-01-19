const mongoose = require('mongoose')

const MentorApplication = require('../models/MentorApplication')
const MentorService = require('../models/MentorService')
const MentorResource = require('../models/MentorResource')
const Alumni = require('../models/Alumni')
const Student = require('../models/Student')
const Faculty = require('../models/Faculty')
const { generateMentorMatches } = require('../services/aiMentorMatchService')
const { formatMentor } = require('./mentorController')

const ensureArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : item))
      .filter((item) => typeof item === 'string' && item.length)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

const uniqueMerge = (primary = [], secondary = []) => {
  const set = new Set()
  const push = (items) => {
    items.forEach((item) => {
      const trimmed = typeof item === 'string' ? item.trim() : ''
      if (trimmed) {
        set.add(trimmed)
      }
    })
  }
  push(primary)
  push(secondary)
  return Array.from(set)
}

const loadUserProfile = async (userId, role, overrides = {}) => {
  if (!userId || !role) {
    throw new Error('User context missing')
  }

  const normalizedRole = role.toLowerCase()
  const allowedRoles = {
    student: Student,
    alumni: Alumni,
    faculty: Faculty,
  }

  const Model = allowedRoles[normalizedRole]
  if (!Model || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Unsupported role for AI match')
  }

  const doc = await Model.findById(userId).select('-password')
  if (!doc) {
    throw new Error('User profile not found')
  }

  const baseSkills = ensureArray(doc.skills)
  const baseInterests = ensureArray(doc.interests)
  const selectedSkills = ensureArray(overrides.skills)
  const selectedInterests = ensureArray(overrides.interests)

  const education = Array.isArray(doc.education)
    ? doc.education.map((entry) => ({
        institution: entry.school || entry.institution || '',
        degree: entry.degree || entry.otherDegree || '',
        field: entry.field || entry.department || '',
        completionYear: entry.passoutYear || entry.expectedPassoutYear || '',
      }))
    : []

  return {
    id: doc._id.toString(),
    role: normalizedRole,
    name: `${doc.firstName ?? ''} ${doc.lastName ?? ''}`.trim() || doc.email,
    email: doc.email,
    interests: uniqueMerge(selectedInterests, baseInterests),
    skills: uniqueMerge(selectedSkills, baseSkills),
    education,
    background: doc.about || doc.bio || '',
    careerGoals: overrides.careerGoals?.trim() || doc.careerGoals || '',
    location: doc.location || '',
    department: doc.department || '',
    currentYear: doc.currentYear || '',
  }
}

const formatMentorForAI = (mentorDoc) => {
  if (!mentorDoc) return null

  const expertise = ensureArray(mentorDoc.expertise)
  const tags = ensureArray(mentorDoc.categories?.length ? mentorDoc.categories : mentorDoc.tags)
  const skills = ensureArray(mentorDoc.skills)
  const availability = ensureArray(mentorDoc.availability)
  const modes = ensureArray(mentorDoc.modes)

  return {
    mentorId: mentorDoc._id?.toString() || mentorDoc.applicationId || mentorDoc.id,
    fullName: mentorDoc.fullName || mentorDoc.name || mentorDoc.email,
    email: mentorDoc.email || '',
    expertiseAreas: expertise,
    skills,
    experienceLabel: mentorDoc.experience || '',
    yearsOfExperience: Number.parseInt((mentorDoc.experience || '').replace(/[^0-9]/g, ''), 10) || null,
    industry: mentorDoc.industry || '',
    mentorshipFocus: tags,
    availability,
    modes,
    companyName: mentorDoc.companyName || '',
    jobRole: mentorDoc.jobRole || mentorDoc.position || '',
    rating: typeof mentorDoc.rating === 'number' ? mentorDoc.rating : null,
  }
}

const buildMentorDictionary = (mentors) => {
  const dict = new Map()
  mentors.forEach((mentor) => {
    if (!mentor) return
    const id = mentor._id?.toString() || mentor.applicationId || mentor.id
    if (id) {
      dict.set(id, mentor)
    }
  })
  return dict
}

const aiMatchMentors = async (req, res) => {
  try {
    const { id: userId, role } = req.user || {}
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    const { interests = [], skills = [], careerGoals = '' } = req.body || {}

    const userProfile = await loadUserProfile(userId, role, { interests, skills, careerGoals })

    const mentorApplications = await MentorApplication.find({ status: 'approved' }).populate('user')

    if (!mentorApplications.length) {
      return res.status(200).json({ matches: [], mentors: [], userProfile })
    }

    const userIds = mentorApplications.map((application) => application.user?._id).filter(Boolean)

    const [services, resources] = await Promise.all([
      MentorService.find({ user: { $in: userIds } }),
      MentorResource.find({ user: { $in: userIds } }),
    ])

    const servicesByUser = services.reduce((acc, service) => {
      const key = service.user?.toString()
      if (!key) return acc
      acc[key] = acc[key] || []
      acc[key].push(service)
      return acc
    }, {})

    const resourcesByUser = resources.reduce((acc, resource) => {
      const key = resource.user?.toString()
      if (!key) return acc
      acc[key] = acc[key] || []
      acc[key].push(resource)
      return acc
    }, {})

    const formattedMentors = mentorApplications
      .map((application) => {
        const ownerId = application.user?._id?.toString()
        return formatMentor(application, application.user, {
          services: ownerId ? servicesByUser[ownerId] : [],
          resources: ownerId ? resourcesByUser[ownerId] : [],
        })
      })
      .filter(Boolean)

    if (!formattedMentors.length) {
      return res.status(200).json({ matches: [], mentors: [], userProfile })
    }

    const mentorsForAI = formattedMentors
      .map(formatMentorForAI)
      .filter((mentor) => mentor && mentor.mentorId)

    if (!mentorsForAI.length) {
      return res.status(200).json({ matches: [], mentors: formattedMentors, userProfile })
    }

    const aiMatches = await generateMentorMatches({ userProfile, mentors: mentorsForAI })

    const mentorDict = buildMentorDictionary(formattedMentors)

    const enrichedMatches = aiMatches.map((match) => ({
      mentorId: match.mentorId,
      matchScore: match.matchScore,
      shortReason: match.shortReason,
      mentor: mentorDict.get(match.mentorId) || null,
    }))

    return res.status(200).json({
      matches: enrichedMatches,
      mentors: formattedMentors,
      userProfile,
    })
  } catch (error) {
    console.error('aiMatchMentors error:', error)
    return res.status(500).json({ message: error.message || 'Unable to generate mentor matches.' })
  }
}

module.exports = {
  aiMatchMentors,
}
