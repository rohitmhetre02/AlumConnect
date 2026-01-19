const mongoose = require('mongoose')

const { ROLE_MODEL_MAP, getModelByRole } = require('../utils/roleModels')

const ROLE_ALIAS_MAP = {
  students: 'student',
  student: 'student',
  alumni: 'alumni',
  alumnus: 'alumni',
  alumna: 'alumni',
  faculty: 'faculty',
  faculties: 'faculty',
}

const RESPONSE_ROLE_MAP = {
  student: 'students',
  alumni: 'alumni',
  faculty: 'faculty',
}

const ensureArray = (value) => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

const buildDisplayName = (member) => {
  const parts = []
  if (member.firstName) parts.push(member.firstName)
  if (member.lastName) parts.push(member.lastName)
  const name = parts.join(' ').trim()
  return name || member.email || ''
}

const normalizeRoleParam = (role = '') => {
  if (typeof role !== 'string' || role.trim() === '') return null
  const normalized = role.trim().toLowerCase()
  return ROLE_ALIAS_MAP[normalized] ?? null
}

const formatMember = (memberDoc, normalizedRole) => {
  if (!memberDoc) return null

  const roleKey = RESPONSE_ROLE_MAP[normalizedRole] ?? normalizedRole
  const member = {
    ...memberDoc,
  }

  const stats = member.stats ?? {}

  const base = {
    id: member._id?.toString() ?? '',
    role: roleKey,
    firstName: member.firstName ?? '',
    lastName: member.lastName ?? '',
    name: buildDisplayName(member),
    email: member.email ?? '',
    phone: member.phone ?? '',
    department: member.department ?? '',
    title:
      member.title ??
      (normalizedRole === 'faculty' ? 'Faculty' : normalizedRole === 'alumni' ? 'Alumni' : 'Student'),
    program: member.program ?? member.department ?? '',
    location: member.location ?? '',
    avatar: member.avatar ?? '',
    about: member.about ?? '',
    stats: {
      connections: Number(stats.connections ?? 0),
      mentorships: Number(stats.mentorships ?? 0),
      views: Number(stats.views ?? 0),
    },
    experiences: ensureArray(member.experiences),
    education: ensureArray(member.education),
    skills: ensureArray(member.skills),
    badges: ensureArray(member.badges),
    socials: member.socials ?? {},
    createdAt: member.createdAt ?? null,
    updatedAt: member.updatedAt ?? null,
  }

  if (!base.program && base.department) {
    base.program = base.department
  }

  if (normalizedRole === 'student') {
    const classYear = member.classYear ?? (member.expectedPassoutYear ? String(member.expectedPassoutYear) : '')
    base.admissionYear = member.admissionYear ?? null
    base.expectedPassoutYear = member.expectedPassoutYear ?? null
    base.prnNumber = member.prnNumber ?? ''
    base.classYear = classYear
    base.year = classYear
    base.program = base.program || base.department
    base.interests = ensureArray(member.interests ?? base.skills)
  } else if (normalizedRole === 'alumni') {
    const graduationYear = member.graduationYear ?? (member.passoutYear ? String(member.passoutYear) : '')
    base.passoutYear = member.passoutYear ?? null
    base.prnNumber = member.prnNumber ?? ''
    base.graduationYear = graduationYear
    base.year = graduationYear
    base.program = base.program || base.department
    base.industry = member.industry ?? ''
    base.involvement = ensureArray(member.involvement)
  } else if (normalizedRole === 'faculty') {
    base.program = base.program || base.department
    base.researchAreas = ensureArray(member.researchAreas)
    base.availability = ensureArray(member.availability)
  }

  if (!base.interests) base.interests = []
  if (!base.involvement) base.involvement = []
  if (!base.researchAreas) base.researchAreas = []
  if (!base.availability) base.availability = []
  if (!base.year) base.year = ''

  return base
}

const listMembersByRole = async (req, res, roleOverride) => {
  try {
    const roleParam = roleOverride ?? req.params.role
    const normalizedRole = normalizeRoleParam(roleParam)

    if (!normalizedRole) {
      return res.status(400).json({ success: false, message: 'Invalid role parameter.' })
    }

    const Model = getModelByRole(normalizedRole)

    if (!Model) {
      return res.status(400).json({ success: false, message: 'Unsupported role.' })
    }

    const members = await Model.find().select('-password').sort({ firstName: 1, lastName: 1 }).lean()

    const data = members.map((member) => formatMember(member, normalizedRole))

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error('listMembersByRole error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch directory members.' })
  }
}

const getDirectoryProfile = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid profile id.' })
    }

    for (const [roleKey, Model] of Object.entries(ROLE_MODEL_MAP)) {
      const record = await Model.findById(id).select('-password').lean()
      if (record) {
        const data = formatMember(record, roleKey)
        return res.status(200).json({ success: true, data })
      }
    }

    return res.status(404).json({ success: false, message: 'Profile not found.' })
  } catch (error) {
    console.error('getDirectoryProfile error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch profile.' })
  }
}

module.exports = {
  listDirectoryMembers: (req, res) => listMembersByRole(req, res, req.params.role),
  listStudents: (req, res) => listMembersByRole(req, res, 'students'),
  listAlumni: (req, res) => listMembersByRole(req, res, 'alumni'),
  listFaculty: (req, res) => listMembersByRole(req, res, 'faculty'),
  getDirectoryProfile,
}
