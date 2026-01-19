const mongoose = require('mongoose')
const Gallery = require('../models/Gallery')
const { getModelByRole } = require('../utils/roleModels')

const formatGallery = (doc) => {
  if (!doc) return null
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    image: doc.image,
    category: doc.category,
    uploadedBy: doc.uploadedByName,
    uploadedAt: doc.createdAt,
  }
}

const listGallery = async (_req, res) => {
  try {
    const items = await Gallery.find().sort({ createdAt: -1 }).lean()
    return res.status(200).json({ success: true, data: items.map(formatGallery).filter(Boolean) })
  } catch (error) {
    console.error('listGallery error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch gallery items.' })
  }
}

const getGalleryById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid gallery item id.' })
    }

    const doc = await Gallery.findById(id).lean()

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' })
    }

    return res.status(200).json({ success: true, data: formatGallery(doc) })
  } catch (error) {
    console.error('getGalleryById error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch gallery item.' })
  }
}

const createGallery = async (req, res) => {
  try {
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    const { title, description, image, category } = req.body ?? {}

    if (!title || !description || !image || !category) {
      return res.status(400).json({ success: false, message: 'title, description, image, and category are required.' })
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
      image: image.trim(),
      category: category.trim(),
      uploadedBy: user.id,
      uploadedByRole: role,
      uploadedByName,
    }

    const item = await Gallery.create(payload)

    return res.status(201).json({
      success: true,
      message: 'Gallery item created successfully.',
      data: formatGallery(item),
    })
  } catch (error) {
    console.error('createGallery error:', error)
    return res.status(500).json({ success: false, message: 'Unable to create gallery item.' })
  }
}

const deleteGallery = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid gallery item id.' })
    }

    const item = await Gallery.findById(id)

    if (!item) {
      return res.status(404).json({ success: false, message: 'Gallery item not found.' })
    }

    await item.deleteOne()

    return res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully.',
    })
  } catch (error) {
    console.error('deleteGallery error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete gallery item.' })
  }
}

module.exports = {
  listGallery,
  getGalleryById,
  createGallery,
  deleteGallery,
}
