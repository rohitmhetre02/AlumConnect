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
  coordinators: 'coordinator',
  coordinator: 'coordinator',
}

const RESPONSE_ROLE_MAP = {
  student: 'students',
  alumni: 'alumni',
  faculty: 'faculty',
  coordinator: 'coordinators',
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
      (normalizedRole === 'faculty' ? 'Faculty' : 
       normalizedRole === 'alumni' ? 'Alumni' : 
       normalizedRole === 'coordinator' ? 'Coordinator' : 'Student'),
    program: member.program ?? member.department ?? '',
    location: member.location ?? '',
    avatar: member.avatar ?? '',
    about: member.about ?? '',
    status: member.status ?? 'Active',
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
    const currentUserId = req.user?.id || req.user?._id
    const currentUserRole = req.user?.role?.toLowerCase()

    if (!normalizedRole) {
      return res.status(400).json({ success: false, message: 'Invalid role parameter.' })
    }

    const Model = getModelByRole(normalizedRole)

    if (!Model) {
      return res.status(400).json({ success: false, message: 'Unsupported role.' })
    }

    // Only show approved profiles in admin management
    // Include profiles without profileApprovalStatus (legacy data) - treat as approved
    const members = await Model.find({
      $or: [
        { profileApprovalStatus: 'APPROVED' },
        { profileApprovalStatus: { $exists: false } }
      ]
    }).select('-password').sort({ firstName: 1, lastName: 1 }).lean()

    // Filter out current user from their own role directory
    const filteredMembers = members.filter(member => {
      const memberId = member._id?.toString() ?? ''
      // Exclude current user if they're viewing their own role directory
      if (currentUserId && currentUserRole === normalizedRole && memberId === currentUserId) {
        return false
      }
      return true
    })

    const data = filteredMembers.map((member) => formatMember(member, normalizedRole))

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
      const record = await Model.findOne({
        _id: id,
        $or: [
          { profileApprovalStatus: 'APPROVED' },
          { profileApprovalStatus: { $exists: false } }
        ]
      }).select('-password').lean()
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

const updateMemberStatus = async (req, res) => {
  try {
    const { role, id } = req.params
    const { status, profileApprovalStatus } = req.body
    
    const normalizedRole = normalizeRoleParam(role)
    if (!normalizedRole) {
      return res.status(400).json({ success: false, message: 'Invalid role parameter.' })
    }
    
    const Model = getModelByRole(normalizedRole)
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Unsupported role.' })
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid member id.' })
    }
    
    const validStatuses = ['Active', 'Inactive', 'Suspended', 'Pending']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' })
    }
    
    const member = await Model.findById(id)
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' })
    }
    
    // Update both status and profileApprovalStatus for real-time sync
    member.status = status
    if (profileApprovalStatus) {
      member.profileApprovalStatus = profileApprovalStatus
    }
    await member.save()
    
    return res.status(200).json({
      success: true,
      message: 'Member status updated successfully.',
      data: formatMember(member.toObject(), normalizedRole)
    })
  } catch (error) {
    console.error('updateMemberStatus error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update member status.' })
  }
}

const deleteMember = async (req, res) => {
  try {
    const { role, id } = req.params
    
    const normalizedRole = normalizeRoleParam(role)
    if (!normalizedRole) {
      return res.status(400).json({ success: false, message: 'Invalid role parameter.' })
    }
    
    const Model = getModelByRole(normalizedRole)
    if (!Model) {
      return res.status(400).json({ success: false, message: 'Unsupported role.' })
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid member id.' })
    }
    
    const member = await Model.findById(id)
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' })
    }
    
    await Model.findByIdAndDelete(id)
    
    return res.status(200).json({
      success: true,
      message: 'Member deleted successfully.'
    })
  } catch (error) {
    console.error('deleteMember error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete member.' })
  }
}

module.exports = {
  listDirectoryMembers: (req, res) => listMembersByRole(req, res, req.params.role),
  listStudents: (req, res) => listMembersByRole(req, res, 'students'),
  listAlumni: (req, res) => listMembersByRole(req, res, 'alumni'),
  listFaculty: (req, res) => listMembersByRole(req, res, 'faculty'),
  getDirectoryProfile,
  updateMemberStatus,
  deleteMember,
}
