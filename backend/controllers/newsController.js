const listMyNews = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    const query = { createdBy: userId }
    const items = await News.find(query).sort({ publishedAt: -1, createdAt: -1 }).lean()

    return res.status(200).json({ success: true, data: items.map(formatNews).filter(Boolean) })
  } catch (error) {
    console.error('listMyNews error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch your news.' })
  }
}

const mongoose = require('mongoose')

const News = require('../models/News')
const { getModelByRole } = require('../utils/roleModels')

const formatNews = (doc) => {
  if (!doc) return null
  return {
    id: doc._id.toString(),
    title: doc.title,
    subtitle: doc.subtitle,
    category: doc.category,
    excerpt: doc.excerpt,
    content: doc.content,
    coverImage: doc.coverImage,
    imageUrl: doc.coverImage, // For backward compatibility
    readingTimeMinutes: doc.readingTimeMinutes,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    createdByRole: doc.createdByRole,
    createdByName: doc.createdByName,
    status: doc.status,
    department: doc.department,
    approvalStatus: doc.approvalStatus,
    approvalRemarks: doc.approvalRemarks,
    approvedBy: doc.approvedBy,
    approvedAt: doc.approvedAt,
    featured: doc.featured,
    views: doc.views,
  }
}

const listNews = async (_req, res) => {
  try {
    const items = await News.find().sort({ publishedAt: -1, createdAt: -1 }).lean()
    return res.status(200).json({ success: true, data: items.map(formatNews).filter(Boolean) })
  } catch (error) {
    console.error('listNews error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch news.' })
  }
}

const getNewsById = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid news id.' })
    }

    const doc = await News.findById(id).lean()

    if (!doc) {
      return res.status(404).json({ success: false, message: 'News article not found.' })
    }

    return res.status(200).json({ success: true, data: formatNews(doc) })
  } catch (error) {
    console.error('getNewsById error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch news article.' })
  }
}

const createNews = async (req, res) => {
  try {
    const user = req.user
    const role = user?.role?.toLowerCase()

    // Only admin can post news
    if (!user || role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can post news.' })
    }

    const { title, subtitle, category, excerpt, content, coverImage, readingTimeMinutes, publishedAt } = req.body ?? {}

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'title and content are required.' })
    }

    const normalizedReadingTime = readingTimeMinutes ? Number(readingTimeMinutes) : undefined
    if (normalizedReadingTime !== undefined && (!Number.isFinite(normalizedReadingTime) || normalizedReadingTime <= 0)) {
      return res.status(400).json({ success: false, message: 'readingTimeMinutes must be a positive number.' })
    }

    let parsedPublishedAt = null
    if (publishedAt) {
      const date = new Date(publishedAt)
      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ success: false, message: 'publishedAt must be a valid date.' })
      }
      parsedPublishedAt = date
    }

    // Admin posts are directly published
    const createdByName = user.email || 'Admin'
    
    const payload = {
      title: title.trim(),
      subtitle: subtitle?.trim() ?? '',
      category: category?.trim() ?? '',
      excerpt: excerpt?.trim() ?? '',
      content: content.trim(),
      coverImage: coverImage?.trim() ?? '',
      readingTimeMinutes: normalizedReadingTime ?? 4,
      publishedAt: parsedPublishedAt ?? new Date(),
      createdBy: user.id,
      createdByRole: role,
      createdByName,
      // Directly publish admin posts
      status: 'published',
      approvalStatus: 'approved',
      approvedAt: new Date(),
      approvedBy: user.id,
    }

    const news = await News.create(payload)
    return res.status(201).json({
      success: true,
      message: 'News article published successfully.',
      data: formatNews(news),
    })
  } catch (error) {
    console.error('createNews error:', error)
    return res.status(500).json({ success: false, message: 'Unable to publish news article.' })
  }
}

const updateNews = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!user || !['faculty', 'admin', 'coordinator'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Only faculty, admin, and department coordinators can update news.' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid news id.' })
    }

    const existingNews = await News.findById(id)
    if (!existingNews) {
      return res.status(404).json({ success: false, message: 'News article not found.' })
    }

    const { title, subtitle, category, excerpt, content, coverImage, readingTimeMinutes, publishedAt, status, featured } = req.body ?? {}

    // Update fields
    if (title) existingNews.title = title.trim()
    if (subtitle !== undefined) existingNews.subtitle = subtitle.trim()
    if (category !== undefined) existingNews.category = category.trim()
    if (excerpt !== undefined) existingNews.excerpt = excerpt.trim()
    if (content) existingNews.content = content.trim()
    if (coverImage !== undefined) existingNews.coverImage = coverImage.trim()
    if (readingTimeMinutes !== undefined) {
      const normalizedReadingTime = Number(readingTimeMinutes)
      if (Number.isFinite(normalizedReadingTime) && normalizedReadingTime > 0) {
        existingNews.readingTimeMinutes = normalizedReadingTime
      }
    }
    if (publishedAt !== undefined) {
      const date = new Date(publishedAt)
      if (!Number.isNaN(date.getTime())) {
        existingNews.publishedAt = date
      }
    }
    if (status !== undefined) existingNews.status = status
    if (featured !== undefined) existingNews.featured = featured

    existingNews.updatedAt = new Date()
    const updatedNews = await existingNews.save()

    return res.status(200).json({
      success: true,
      message: 'News article updated successfully.',
      data: formatNews(updatedNews),
    })
  } catch (error) {
    console.error('updateNews error:', error)
    return res.status(500).json({ success: false, message: 'Unable to update news article.' })
  }
}

const deleteNews = async (req, res) => {
  try {
    const { id } = req.params
    const user = req.user
    const role = user?.role?.toLowerCase()

    if (!user || !['faculty', 'admin', 'coordinator'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Only faculty, admin, and department coordinators can delete news.' })
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid news id.' })
    }

    const deletedNews = await News.findByIdAndDelete(id)
    if (!deletedNews) {
      return res.status(404).json({ success: false, message: 'News article not found.' })
    }

    return res.status(200).json({
      success: true,
      message: 'News article deleted successfully.',
    })
  } catch (error) {
    console.error('deleteNews error:', error)
    return res.status(500).json({ success: false, message: 'Unable to delete news article.' })
  }
}

const getPendingNewsForCoordinator = async (req, res) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()
    const userDepartment = req.user?.department

    if (!userId || !userDepartment) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (!['coordinator', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only coordinators and admins can review news.' })
    }

    const query = { 
      status: 'pending_review',
      department: userDepartment 
    }
    
    const items = await News.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return res.status(200).json({ success: true, data: items.map(formatNews).filter(Boolean) })
  } catch (error) {
    console.error('getPendingNewsForCoordinator error:', error)
    return res.status(500).json({ success: false, message: 'Unable to fetch pending news.' })
  }
}

const approveNews = async (req, res) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()
    const { id } = req.params
    const { remarks } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (!['coordinator', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only coordinators and admins can approve news.' })
    }

    const newsDoc = await News.findById(id)
    if (!newsDoc) {
      return res.status(404).json({ success: false, message: 'News article not found.' })
    }

    const updatePayload = {
      status: 'published',
      approvalStatus: 'approved',
      approvalRemarks: remarks || '',
      approvedBy: userId,
      approvedAt: new Date(),
      publishedAt: new Date()
    }

    const updatedNews = await News.findByIdAndUpdate(id, updatePayload, { new: true })
    
    return res.status(200).json({ 
      success: true, 
      message: 'News article approved successfully.', 
      data: formatNews(updatedNews) 
    })
  } catch (error) {
    console.error('approveNews error:', error)
    return res.status(500).json({ success: false, message: 'Unable to approve news article.' })
  }
}

const rejectNews = async (req, res) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()
    const { id } = req.params
    const { remarks } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (!['coordinator', 'admin'].includes(userRole)) {
      return res.status(403).json({ success: false, message: 'Only coordinators and admins can reject news.' })
    }

    if (!remarks || remarks.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Remarks are required for rejection.' })
    }

    const newsDoc = await News.findById(id)
    if (!newsDoc) {
      return res.status(404).json({ success: false, message: 'News article not found.' })
    }

    const updatePayload = {
      status: 'draft',
      approvalStatus: 'rejected',
      approvalRemarks: remarks,
      approvedBy: userId,
      approvedAt: new Date()
    }

    const updatedNews = await News.findByIdAndUpdate(id, updatePayload, { new: true })
    
    return res.status(200).json({ 
      success: true, 
      message: 'News article rejected successfully.', 
      data: formatNews(updatedNews) 
    })
  } catch (error) {
    console.error('rejectNews error:', error)
    return res.status(500).json({ success: false, message: 'Unable to reject news article.' })
  }
}

const forwardToAdmin = async (req, res) => {
  try {
    const userId = req.user?.id
    const userRole = req.user?.role?.toLowerCase()
    const { id } = req.params
    const { remarks } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (userRole !== 'coordinator') {
      return res.status(403).json({ success: false, message: 'Only coordinators can forward to admin.' })
    }

    const newsDoc = await News.findById(id)
    if (!newsDoc) {
      return res.status(404).json({ success: false, message: 'News article not found.' })
    }

    const updatePayload = {
      status: 'pending_review',
      approvalStatus: 'pending',
      approvalRemarks: remarks || '',
      approvedBy: userId,
      approvedAt: new Date()
    }

    const updatedNews = await News.findByIdAndUpdate(id, updatePayload, { new: true })
    
    return res.status(200).json({ 
      success: true, 
      message: 'News article forwarded to admin successfully.', 
      data: formatNews(updatedNews) 
    })
  } catch (error) {
    console.error('forwardToAdmin error:', error)
    return res.status(500).json({ success: false, message: 'Unable to forward news article.' })
  }
}

module.exports = {
  listNews,
  listMyNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getPendingNewsForCoordinator,
  approveNews,
  rejectNews,
  forwardToAdmin,
}
