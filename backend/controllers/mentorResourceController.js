const MentorResource = require('../models/MentorResource')
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload')

const VALID_TYPES = ['pdf', 'video', 'link', 'file', 'image', 'audio', 'document', 'other']
const VALID_STATUS = ['active', 'inactive']

const normalizeType = (value = '') => {
  const normalized = String(value).trim().toLowerCase()
  if (VALID_TYPES.includes(normalized)) {
    return normalized
  }
  return 'other'
}

const normalizeStatus = (value = '') => {
  const normalized = String(value).trim().toLowerCase()
  if (VALID_STATUS.includes(normalized)) {
    return normalized
  }
  return 'active'
}

const validateFields = ({ title, type, status }) => {
  if (!title || !title.trim()) {
    return 'Resource title is required.'
  }
  if (type && !VALID_TYPES.includes(type.toLowerCase())) {
    return 'Invalid resource type.'
  }
  if (status && !VALID_STATUS.includes(status.toLowerCase())) {
    return 'Invalid resource status.'
  }
  return ''
}

const listMyResources = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can view resources.' })
    }

    const resources = await MentorResource.find({ user: userId }).sort({ createdAt: -1 })
    return res.status(200).json(resources)
  } catch (error) {
    console.error('listMyResources error:', error)
    return res.status(500).json({ message: 'Unable to load resources.' })
  }
}

const createResource = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can upload resources.' })
    }

    const { title = '', description = '', type = 'other', status = 'active', url = '' } = req.body ?? {}
    const normalizedType = normalizeType(type)
    const normalizedStatus = normalizeStatus(status)

    const validationError = validateFields({ title, type: normalizedType, status: normalizedStatus })
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    let resourceUrl = url?.trim() || ''
    let filePublicId = ''
    let fileName = ''
    let fileType = ''
    let fileSize = 0

    if (req.file) {
      const folder = 'mentor-resources'
      const uploadResult = await uploadToCloudinary(req.file, folder)
      resourceUrl = uploadResult.url
      filePublicId = uploadResult.public_id
      fileType = uploadResult.resource_type
      fileSize = uploadResult.size
      fileName = req.file.originalname
    } else if (!resourceUrl) {
      return res.status(400).json({ message: 'Provide either a file upload or a resource URL.' })
    }

    const resource = await MentorResource.create({
      user: userId,
      title: title.trim(),
      description: description.trim(),
      type: normalizedType,
      status: normalizedStatus,
      url: resourceUrl,
      filePublicId,
      fileName,
      fileType,
      fileSize,
    })

    return res.status(201).json(resource)
  } catch (error) {
    console.error('createResource error:', error)
    return res.status(500).json({ message: 'Unable to upload resource.' })
  }
}

const updateResource = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can update resources.' })
    }

    const resourceId = req.params?.resourceId
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource identifier is required.' })
    }

    const existing = await MentorResource.findOne({ _id: resourceId, user: userId })
    if (!existing) {
      return res.status(404).json({ message: 'Resource not found.' })
    }

    const { title = existing.title, description = existing.description, type = existing.type, status = existing.status, url = '' } = req.body ?? {}
    const normalizedType = normalizeType(type)
    const normalizedStatus = normalizeStatus(status)

    const validationError = validateFields({ title, type: normalizedType, status: normalizedStatus })
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    let resourceUrl = url?.trim() || existing.url
    let filePublicId = existing.filePublicId
    let fileName = existing.fileName
    let fileType = existing.fileType
    let fileSize = existing.fileSize

    if (req.file) {
      if (existing.filePublicId) {
        try {
          await deleteFromCloudinary(existing.filePublicId)
        } catch (deleteError) {
          console.warn('Unable to delete existing Cloudinary file:', deleteError.message)
        }
      }

      const uploadResult = await uploadToCloudinary(req.file, 'mentor-resources')
      resourceUrl = uploadResult.url
      filePublicId = uploadResult.public_id
      fileType = uploadResult.resource_type
      fileSize = uploadResult.size
      fileName = req.file.originalname
    } else if (!resourceUrl) {
      return res.status(400).json({ message: 'Provide either a file upload or a resource URL.' })
    }

    existing.title = title.trim()
    existing.description = description.trim()
    existing.type = normalizedType
    existing.status = normalizedStatus
    existing.url = resourceUrl
    existing.filePublicId = filePublicId
    existing.fileName = fileName
    existing.fileType = fileType
    existing.fileSize = fileSize

    await existing.save()

    return res.status(200).json(existing)
  } catch (error) {
    console.error('updateResource error:', error)
    return res.status(500).json({ message: 'Unable to update resource.' })
  }
}

const deleteResource = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can delete resources.' })
    }

    const resourceId = req.params?.resourceId
    if (!resourceId) {
      return res.status(400).json({ message: 'Resource identifier is required.' })
    }

    const existing = await MentorResource.findOneAndDelete({ _id: resourceId, user: userId })
    if (!existing) {
      return res.status(404).json({ message: 'Resource not found.' })
    }

    if (existing.filePublicId) {
      try {
        await deleteFromCloudinary(existing.filePublicId)
      } catch (deleteError) {
        console.warn('Unable to delete Cloudinary file:', deleteError.message)
      }
    }

    return res.status(200).json({ message: 'Resource deleted successfully.' })
  } catch (error) {
    console.error('deleteResource error:', error)
    return res.status(500).json({ message: 'Unable to delete resource.' })
  }
}

module.exports = {
  listMyResources,
  createResource,
  updateResource,
  deleteResource,
}
