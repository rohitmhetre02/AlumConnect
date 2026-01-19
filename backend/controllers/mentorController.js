const mongoose = require('mongoose')

const MentorApplication = require('../models/MentorApplication')
const Alumni = require('../models/Alumni')
const MentorService = require('../models/MentorService')
const MentorResource = require('../models/MentorResource')

const ensureArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const getSocialValue = (socials, key) => {
  if (!socials) return ''
  if (typeof socials.get === 'function') {
    return socials.get(key) ?? ''
  }
  return socials[key] ?? ''
}

const buildSlug = (source) => {
  const value = (source || '').trim().toLowerCase()
  if (!value) return ''
  return value
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

const mapService = (serviceDoc = {}) => {
  if (!serviceDoc) return null
  const service = serviceDoc.toObject ? serviceDoc.toObject() : serviceDoc
  return {
    id: service.id || service._id?.toString() || '',
    title: service.title || '',
    description: service.description || '',
    duration: service.duration || '',
    price: typeof service.price === 'number' ? service.price : Number(service.price ?? 0),
    mode: service.mode || '',
    status: service.status || 'inactive',
    createdAt: service.createdAt || null,
    updatedAt: service.updatedAt || null,
  }
}

const mapResource = (resourceDoc = {}) => {
  if (!resourceDoc) return null
  const resource = resourceDoc.toObject ? resourceDoc.toObject() : resourceDoc
  return {
    id: resource.id || resource._id?.toString() || '',
    title: resource.title || '',
    description: resource.description || '',
    type: resource.type || 'other',
    status: resource.status || 'inactive',
    url: resource.url || '',
    fileName: resource.fileName || '',
    fileType: resource.fileType || '',
    fileSize: resource.fileSize ?? 0,
    createdAt: resource.createdAt || null,
    updatedAt: resource.updatedAt || null,
  }
}

const formatMentor = (applicationDoc, alumnusDoc, extras = {}) => {
  if (!applicationDoc) return null
  const doc = applicationDoc.toObject()
  const owner = alumnusDoc ? alumnusDoc.toObject() : doc.user

  const fullName = doc.fullName || owner?.fullName || `${owner?.firstName ?? ''} ${owner?.lastName ?? ''}`.trim()
  const slug = buildSlug(fullName) || buildSlug(owner?.email) || doc._id?.toString() || ''
  const expertise = ensureArray(doc.expertise).length ? ensureArray(doc.expertise) : ensureArray(owner?.skills)
  const categories = ensureArray(doc.categories)
  const modes = ensureArray(doc.modes)
  const services = Array.isArray(extras.services)
    ? extras.services.map(mapService).filter(Boolean)
    : Array.isArray(doc.services)
    ? doc.services.map(mapService).filter(Boolean)
    : []
  const resources = Array.isArray(extras.resources)
    ? extras.resources.map(mapResource).filter(Boolean)
    : Array.isArray(doc.resources)
    ? doc.resources.map(mapResource).filter(Boolean)
    : []
  const workExperience = Array.isArray(doc.workExperience) ? doc.workExperience : []
  const education = Array.isArray(doc.education) ? doc.education : []

  return {
    id: doc._id?.toString() ?? slug,
    applicationId: doc._id?.toString() ?? '',
    profileId: owner?._id?.toString() ?? '',
    slug,
    status: doc.status,
    fullName,
    email: doc.email || owner?.email || '',
    contactNumber: doc.contactNumber || owner?.phone || '',
    graduationYear: doc.graduationYear || '',
    department: doc.department || '',
    location: doc.location || owner?.location || '',
    linkedin: doc.linkedin || getSocialValue(owner?.socials, 'linkedin'),
    portfolio: doc.portfolio || '',
    jobRole: doc.jobRole || owner?.title || '',
    companyName: doc.companyName || owner?.companyName || '',
    industry: doc.industry || '',
    experience: doc.experience || '',
    expertise,
    skills: typeof doc.skills === 'string' && doc.skills.length ? doc.skills : expertise.join(', '),
    categories,
    availability: doc.availability || '',
    modes,
    preferredStudents: doc.preferredStudents || '',
    maxStudents: doc.maxStudents || '',
    weeklyHours: doc.weeklyHours || '',
    bio: doc.bio || owner?.about || '',
    motivation: doc.motivation || '',
    avatar: owner?.avatar || '',
    tags: categories,
    position: doc.jobRole || owner?.title || '',
    rating: doc.rating ?? null,
    createdAt: doc.createdAt ?? null,
    updatedAt: doc.updatedAt ?? null,
    workExperience,
    education,
    services,
    resources,
  }
}

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const submitMentorApplication = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can apply to be mentors.' })
    }

    const {
      fullName = '',
      email = '',
      contactNumber = '',
      linkedin = '',
      jobRole = '',
      experience = '',
      expertise = [],
      skills = '',
      bio = '',
      motivation = '',
      categories = [],
      availability = '',
      modes = [],
      graduationYear = '',
      department = '',
      location = '',
      companyName = '',
      industry = '',
      preferredStudents = '',
      maxStudents = '',
      weeklyHours = '',
      workExperience = [],
      education = [],
      termsAccepted = false,
    } = req.body ?? {}

    if (!termsAccepted) {
      return res.status(400).json({ message: 'Terms must be accepted before submitting the application.' })
    }

    const expertiseArray = ensureArray(expertise)
    const categoriesArray = ensureArray(categories)
    const modesArray = ensureArray(modes)
    const workExperienceArray = Array.isArray(workExperience)
      ? workExperience.map((exp) => ({
          company: exp?.company?.trim() || '',
          role: exp?.role?.trim() || '',
          startDate: exp?.startDate?.trim() || '',
          endDate: exp?.endDate?.trim() || '',
          isCurrentJob: Boolean(exp?.isCurrentJob),
          description: exp?.description?.trim() || '',
        }))
      : []
    const educationArray = Array.isArray(education)
      ? education.map((edu) => ({
          institution: edu?.institution?.trim() || '',
          degree: edu?.degree?.trim() || '',
          field: edu?.field?.trim() || '',
          department: edu?.department?.trim() || '',
          admissionYear: edu?.admissionYear?.trim() || '',
          passoutYear: edu?.passoutYear?.trim() || '',
          cgpa: edu?.cgpa?.trim() || '',
          isCurrentlyPursuing: Boolean(edu?.isCurrentlyPursuing),
          description: edu?.description?.trim() || '',
        }))
      : []

    const payload = {
      user: userId,
      fullName: fullName.trim(),
      email: email.trim(),
      contactNumber: contactNumber.trim(),
      linkedin: linkedin.trim(),
      jobRole: jobRole.trim(),
      experience: experience.trim(),
      expertise: expertiseArray,
      skills: typeof skills === 'string' ? skills.trim() : skills,
      bio: bio.trim(),
      motivation: motivation.trim(),
      categories: categoriesArray,
      availability: availability.trim(),
      modes: modesArray,
      graduationYear: graduationYear.trim(),
      department: department.trim(),
      location: location.trim(),
      companyName: companyName.trim(),
      industry: industry.trim(),
      preferredStudents: preferredStudents.trim(),
      maxStudents: maxStudents.trim(),
      weeklyHours: weeklyHours.trim(),
      workExperience: workExperienceArray,
      education: educationArray,
      termsAccepted: true,
      status: 'approved',
    }

    const application = await MentorApplication.findOneAndUpdate(
      { user: userId },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    const alumnus = await Alumni.findById(userId)

    if (alumnus) {
      alumnus.about = alumnus.about || payload.bio
      alumnus.skills = alumnus.skills?.length ? alumnus.skills : expertiseArray
      alumnus.title = alumnus.title || payload.jobRole
      if (payload.linkedin) {
        if (alumnus.socials?.set) {
          alumnus.socials.set('linkedin', payload.linkedin)
        } else if (alumnus.socials) {
          alumnus.socials.linkedin = payload.linkedin
        } else {
          alumnus.socials = { linkedin: payload.linkedin }
        }
      }
      await alumnus.save()
    }

    const result = formatMentor(application, alumnus)

    return res.status(201).json({ message: 'Mentor application submitted successfully.', data: result })
  } catch (error) {
    console.error('submitMentorApplication error:', error)
    return res.status(500).json({ message: 'Unable to submit mentor application.' })
  }
}

const listMentors = async (_req, res) => {
  try {
    const applications = await MentorApplication.find({ status: 'approved' }).populate('user')
    const userIds = applications.map((application) => application.user?._id).filter(Boolean)

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

    const mentors = applications
      .map((application) => {
        const ownerId = application.user?._id?.toString()
        return formatMentor(application, application.user, {
          services: ownerId ? servicesByUser[ownerId] : [],
          resources: ownerId ? resourcesByUser[ownerId] : [],
        })
      })
      .filter(Boolean)

    return res.status(200).json(mentors)
  } catch (error) {
    console.error('listMentors error:', error)
    return res.status(500).json({ message: 'Unable to fetch mentors.' })
  }
}

const listApplications = async (req, res) => {
  try {
    if (req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' })
    }

    const applications = await MentorApplication.find({}).populate('user')
    const results = applications.map((application) => formatMentor(application, application.user))

    return res.status(200).json(results)
  } catch (error) {
    console.error('listApplications error:', error)
    return res.status(500).json({ message: 'Unable to fetch mentor applications.' })
  }
}

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can view their mentor profile.' })
    }

    const application = await MentorApplication.findOne({ user: userId }).populate('user')
    if (!application) {
      return res.status(404).json({ message: 'Mentor profile not found.' })
    }

    const [services, resources] = await Promise.all([
      MentorService.find({ user: userId }),
      MentorResource.find({ user: userId }),
    ])

    const result = formatMentor(application, application.user, { services, resources })
    return res.status(200).json(result)
  } catch (error) {
    console.error('getMyProfile error:', error)
    return res.status(500).json({ message: 'Unable to fetch mentor profile.' })
  }
}

const getMentorProfile = async (req, res) => {
  try {
    const { mentorId } = req.params ?? {}

    if (!mentorId) {
      return res.status(400).json({ message: 'Mentor identifier is required.' })
    }

    const query = mongoose.isValidObjectId(mentorId)
      ? { _id: mentorId, status: 'approved' }
      : {
          status: 'approved',
          $or: [
            { fullName: new RegExp(`^${escapeRegex(mentorId)}$`, 'i') },
            { slug: mentorId.toLowerCase() },
          ],
        }

    const application = await MentorApplication.findOne(query).populate('user')
    if (!application) {
      return res.status(404).json({ message: 'Mentor profile not found.' })
    }

    const ownerId = application.user?._id?.toString()

    const [services, resources] = await Promise.all([
      ownerId ? MentorService.find({ user: ownerId, status: 'active' }) : [],
      ownerId ? MentorResource.find({ user: ownerId, status: 'active' }) : [],
    ])

    const result = formatMentor(application, application.user, { services, resources })
    return res.status(200).json(result)
  } catch (error) {
    console.error('getMentorProfile error:', error)
    return res.status(500).json({ message: 'Unable to load mentor profile.' })
  }
}

const updateMyProfile = async (req, res) => {
  try {
    console.log('Incoming updateMyProfile request body:', req.body)
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can update their mentor profile.' })
    }

    const {
      fullName,
      email,
      contactNumber,
      linkedin,
      jobRole,
      experience,
      expertise,
      skills,
      bio,
      motivation,
      categories,
      availability,
      modes,
      graduationYear,
      department,
      location,
      companyName,
      industry,
      preferredStudents,
      maxStudents,
      weeklyHours,
      workExperience,
      education,
    } = req.body ?? {}

    const expertiseArray = ensureArray(expertise)
    const categoriesArray = ensureArray(categories)
    const modesArray = ensureArray(modes)

    const payload = {
      fullName: fullName?.trim() || undefined,
      email: email?.trim() || undefined,
      contactNumber: contactNumber?.trim() || undefined,
      linkedin: linkedin?.trim() || undefined,
      jobRole: jobRole?.trim() || undefined,
      experience: experience?.trim() || undefined,
      expertise: expertiseArray,
      skills: typeof skills === 'string' ? skills.trim() : skills,
      bio: bio?.trim() || undefined,
      motivation: motivation?.trim() || undefined,
      categories: categoriesArray,
      availability: availability?.trim() || undefined,
      modes: modesArray,
      graduationYear: graduationYear?.trim() || undefined,
      department: department?.trim() || undefined,
      location: location?.trim() || undefined,
      companyName: companyName?.trim() || undefined,
      industry: industry?.trim() || undefined,
      preferredStudents: preferredStudents?.trim() || undefined,
      maxStudents: maxStudents?.trim() || undefined,
      weeklyHours: weeklyHours?.trim() || undefined,
      workExperience: Array.isArray(workExperience) ? workExperience.map(exp => ({
        company: exp.company?.trim() || '',
        role: exp.role?.trim() || '',
        startDate: exp.startDate?.trim() || '',
        endDate: exp.endDate?.trim() || '',
        isCurrentJob: Boolean(exp.isCurrentJob),
        description: exp.description?.trim() || '',
      })) : undefined,
      education: Array.isArray(education) ? education.map(edu => ({
        institution: edu.institution?.trim() || '',
        degree: edu.degree?.trim() || '',
        field: edu.field?.trim() || '',
        department: edu.department?.trim() || '',
        admissionYear: edu.admissionYear?.trim() || '',
        passoutYear: edu.passoutYear?.trim() || '',
        cgpa: edu.cgpa?.trim() || '',
        isCurrentlyPursuing: Boolean(edu.isCurrentlyPursuing),
        description: edu.description?.trim() || '',
      })) : undefined,
    }

    console.log('Constructed payload:', payload)

    const application = await MentorApplication.findOneAndUpdate(
      { user: userId },
      payload,
      { new: true, runValidators: true }
    )

    if (!application) {
      return res.status(404).json({ message: 'Mentor profile not found.' })
    }

    const alumnus = await Alumni.findById(userId)
    if (alumnus) {
      if (payload.bio) alumnus.about = payload.bio
      if (payload.expertise?.length) alumnus.skills = payload.expertise
      if (payload.jobRole) alumnus.title = payload.jobRole
      if (payload.linkedin) {
        if (alumnus.socials?.set) {
          alumnus.socials.set('linkedin', payload.linkedin)
        } else if (alumnus.socials) {
          alumnus.socials.linkedin = payload.linkedin
        } else {
          alumnus.socials = { linkedin: payload.linkedin }
        }
      }
      await alumnus.save()
    }

    const result = formatMentor(application, alumnus)
    console.log('Sending response:', result)
    return res.status(200).json({ message: 'Mentor profile updated successfully.', data: result })
  } catch (error) {
    console.error('updateMyProfile error:', error)
    return res.status(500).json({ message: 'Unable to update mentor profile.' })
  }
}

module.exports = {
  submitMentorApplication,
  listMentors,
  listApplications,
  getMyProfile,
  getMentorProfile,
  updateMyProfile,
  formatMentor,
}
