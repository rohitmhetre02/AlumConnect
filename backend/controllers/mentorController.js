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
  const doc = applicationDoc.toObject ? applicationDoc.toObject() : applicationDoc
  const owner = alumnusDoc ? (alumnusDoc.toObject ? alumnusDoc.toObject() : alumnusDoc) : doc.user

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
    phoneNumber: doc.phoneNumber || owner?.phone || '', // Updated field name
    graduationYear: doc.graduationYear || '',
    degree: doc.degree || '', // Added degree field
    department: doc.department || '',
    currentLocation: doc.currentLocation || owner?.location || '', // Updated field name
    linkedin: doc.linkedin || getSocialValue(owner?.socials, 'linkedin'),
    portfolio: doc.portfolio || '',
    currentJobTitle: doc.currentJobTitle || owner?.title || '', // Updated field name
    company: doc.company || owner?.companyName || '', // Updated field name
    industry: doc.industry || '',
    experience: doc.experience || '',
    expertise,
    skills: typeof doc.skills === 'string' && doc.skills.length ? doc.skills : expertise.join(', '),
    categories,
    availability: doc.availability || '',
    modes,
    mentorshipMode: doc.mentorshipMode || '', // Added new field
    availableDays: doc.availableDays || '', // Added new field
    timeCommitment: doc.timeCommitment || '', // Added new field
    mentorshipPreference: doc.preferredStudents || '', // Updated field name
    maxMentees: doc.maxMentees || '', // Updated field name
    maxStudents: doc.maxStudents || '', // Keep for backward compatibility
    weeklyHours: doc.weeklyHours || '',
    preferredStudents: doc.preferredStudents || '', // Keep for backward compatibility
    bio: doc.bio || owner?.about || '',
    motivation: doc.motivation || '',
    avatar: owner?.avatar || '',
    profilePhoto: doc.profilePhoto || owner?.avatar || '', // Added profile photo field
    tags: categories,
    position: doc.currentJobTitle || owner?.title || '', // Updated field name
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
    console.log('submitMentorApplication called')
    const userId = req.user?.id
    const role = req.user?.role

    console.log('User ID:', userId, 'Role:', role)

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can apply to be mentors.' })
    }

    // Handle both JSON and multipart form data
    let formData
    console.log('Content-Type:', req.headers['content-type'])
    
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      // For multipart form data (file upload)
      formData = {}
      Object.keys(req.body).forEach(key => {
        if (key === 'mentorshipAreas' || key === 'expertise') {
          try {
            formData[key] = JSON.parse(req.body[key] || '[]')
          } catch (e) {
            console.log('JSON parse error for', key, ':', e.message)
            formData[key] = []
          }
        } else if (key.startsWith('consent')) {
          formData[key] = req.body[key] === 'true'
        } else {
          formData[key] = req.body[key]
        }
      })
    } else {
      formData = req.body || {}
    }

    console.log('Form data:', formData)

    const {
      fullName = '',
      email = '',
      phoneNumber = '',
      graduationYear = '',
      degree = '',
      department = '',
      currentLocation = '',
      currentJobTitle = '',
      company = '',
      industry = '',
      mentorshipAreas = [],
      expertise = [],
      mentorshipMode = '',
      availableDays = '',
      timeCommitment = '',
      mentorshipPreference = '',
      maxMentees = '',
      consent1 = false,
      consent2 = false,
      consent3 = false,
    } = formData

    // Validate all consent checkboxes
    if (!consent1 || !consent2 || !consent3) {
      return res.status(400).json({ message: 'All consent checkboxes must be checked before submitting the application.' })
    }

    // Handle profile photo upload
    let profilePhotoUrl = ''
    if (req.file) {
      profilePhotoUrl = `/uploads/mentors/${req.file.filename}`
    }

    const mentorshipAreasArray = Array.isArray(mentorshipAreas) ? mentorshipAreas : []
    const expertiseArray = Array.isArray(expertise) ? expertise : []

    const payload = {
      user: userId,
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      graduationYear: graduationYear.trim(),
      degree: degree.trim(),
      department: department.trim(),
      currentLocation: currentLocation.trim(),
      currentJobTitle: currentJobTitle.trim(),
      company: company.trim(),
      industry: industry.trim(),
      mentorshipAreas: mentorshipAreasArray,
      expertise: expertiseArray,
      mentorshipMode: mentorshipMode.trim(),
      availableDays: availableDays.trim(),
      timeCommitment: timeCommitment.trim(),
      mentorshipPreference: mentorshipPreference.trim(),
      maxMentees: maxMentees.trim(),
      consent1: true,
      consent2: true,
      consent3: true,
      profilePhoto: profilePhotoUrl,
      status: 'approved',
    }

    const application = await MentorApplication.findOneAndUpdate(
      { user: userId },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    const alumnus = await Alumni.findById(userId)

    if (alumnus) {
      alumnus.about = alumnus.about || `Mentor specializing in ${mentorshipAreasArray.join(', ')}`
      alumnus.skills = alumnus.skills?.length ? alumnus.skills : expertiseArray
      alumnus.title = alumnus.title || payload.currentJobTitle
      alumnus.companyName = alumnus.companyName || payload.company
      alumnus.industry = alumnus.industry || payload.industry
      alumnus.location = alumnus.location || payload.currentLocation
      alumnus.graduationYear = alumnus.graduationYear || payload.graduationYear
      alumnus.department = alumnus.department || payload.department
      if (profilePhotoUrl) {
        alumnus.profilePhoto = profilePhotoUrl
      }
      await alumnus.save()
    }

    const result = {
      id: application._id,
      fullName: application.fullName,
      email: application.email,
      currentJobTitle: application.currentJobTitle,
      company: application.company,
      industry: application.industry,
      mentorshipAreas: application.mentorshipAreas,
      expertise: application.expertise,
      status: application.status,
      createdAt: application.createdAt
    }

    return res.status(201).json({ success: true, message: 'Mentor registration successful.', data: result })
  } catch (error) {
    console.error('submitMentorApplication error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    })
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validationErrors 
      })
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: 'You have already submitted a mentor application.' 
      })
    }
    
    return res.status(500).json({ 
      success: false, 
      message: `Unable to register as mentor: ${error.message}` 
    })
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

    const [services, resources, alumnus] = await Promise.all([
      MentorService.find({ user: userId }),
      MentorResource.find({ user: userId }),
      Alumni.findById(userId)
    ])

    const result = formatMentor(application, alumnus || application.user, { services, resources })
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
      phoneNumber, // Updated field name
      linkedin,
      currentJobTitle, // Updated field name
      company, // Updated field name
      industry,
      expertise,
      skills,
      bio,
      motivation,
      categories,
      mentorshipMode, // Added new field
      availableDays, // Added new field
      timeCommitment, // Added new field
      modes,
      graduationYear,
      degree, // Added degree field
      department,
      currentLocation, // Updated field name
      mentorshipPreference, // Updated field name
      maxMentees, // Updated field name
      maxStudents, // Keep for backward compatibility
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
      phoneNumber: phoneNumber?.trim() || undefined, // Updated field name
      linkedin: linkedin?.trim() || undefined,
      currentJobTitle: currentJobTitle?.trim() || undefined, // Updated field name
      company: company?.trim() || undefined, // Updated field name
      industry: industry?.trim() || undefined,
      expertise: expertiseArray,
      skills: typeof skills === 'string' ? skills.trim() : skills,
      bio: bio?.trim() || undefined,
      motivation: motivation?.trim() || undefined,
      categories: categoriesArray,
      mentorshipMode: mentorshipMode?.trim() || undefined, // Added new field
      availableDays: availableDays?.trim() || undefined, // Added new field
      timeCommitment: timeCommitment?.trim() || undefined, // Added new field
      modes: modesArray,
      graduationYear: graduationYear?.trim() || undefined,
      degree: degree?.trim() || undefined, // Added degree field
      department: department?.trim() || undefined,
      currentLocation: currentLocation?.trim() || undefined, // Updated field name
      mentorshipPreference: mentorshipPreference?.trim() || undefined, // Updated field name
      maxMentees: maxMentees?.trim() || undefined, // Updated field name
      maxStudents: maxStudents?.trim() || undefined, // Keep for backward compatibility
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

    const application = await MentorApplication.findOneAndUpdate(
      { user: userId },
      payload,
      { new: true, runValidators: true }
    ).populate('user')

    if (!application) {
      return res.status(404).json({ message: 'Mentor profile not found.' })
    }

    const alumnus = await Alumni.findById(userId)
    if (alumnus) {
      alumnus.fullName = alumnus.fullName || payload.fullName
      alumnus.companyName = alumnus.companyName || payload.company
      alumnus.industry = alumnus.industry || payload.industry
      alumnus.location = alumnus.location || payload.currentLocation
      alumnus.graduationYear = alumnus.graduationYear || payload.graduationYear
      alumnus.department = alumnus.department || payload.department
      await alumnus.save()
    }

    const [services, resources] = await Promise.all([
      MentorService.find({ user: userId }),
      MentorResource.find({ user: userId }),
    ])

    const result = formatMentor(application, alumnus || application.user, { services, resources })
    return res.status(200).json({ success: true, message: 'Profile updated successfully.', data: result })
  } catch (error) {
    console.error('updateMyProfile error:', error)
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validationErrors 
      })
    }
    
    return res.status(500).json({ 
      success: false, 
      message: `Unable to update mentor profile: ${error.message}` 
    })
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
