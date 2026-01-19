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
    readingTimeMinutes: doc.readingTimeMinutes,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    createdBy: doc.createdBy,
    createdByRole: doc.createdByRole,
    createdByName: doc.createdByName,
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

    if (!user || !['faculty', 'admin', 'coordinator'].includes(role)) {
      return res.status(403).json({ success: false, message: 'Only faculty, admin, and department coordinators can post news.' })
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

    const CreatorModel = getModelByRole(role)
    if (!CreatorModel) {
      // For admin and coordinator users, create a simple creator object
      if (role === 'admin' || role === 'coordinator') {
        const createdByName = user.email || role.charAt(0).toUpperCase() + role.slice(1)
        
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
        }

        const news = await News.create(payload)
        return res.status(201).json({
          success: true,
          message: 'News article published successfully.',
          data: formatNews(news),
        })
      }
      return res.status(403).json({ success: false, message: 'Unsupported creator role.' })
    }

    const creator = await CreatorModel.findById(user.id).select('firstName lastName email').lean()

    if (!creator) {
      return res.status(404).json({ success: false, message: 'Creator record not found.' })
    }

    const createdByName = `${creator.firstName ?? ''} ${creator.lastName ?? ''}`.trim() || creator.email || ''

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

module.exports = {
  listNews,
  listMyNews,
  getNewsById,
  createNews,
}
