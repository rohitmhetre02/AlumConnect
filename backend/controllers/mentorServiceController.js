const MentorService = require('../models/MentorService')

const normalizeMode = (mode = '') => {
  const value = String(mode).trim().toLowerCase()
  if (['online', 'offline', 'hybrid'].includes(value)) {
    return value
  }
  return ''
}

const normalizeStatus = (status = '') => {
  const value = String(status).trim().toLowerCase()
  if (['active', 'inactive'].includes(value)) {
    return value
  }
  return 'active'
}

const validatePayload = ({ title, description, duration, price, mode }) => {
  if (!title || !title.trim()) {
    return 'Service title is required.'
  }
  if (!description || !description.trim()) {
    return 'Service description is required.'
  }
  if (!duration || !duration.trim()) {
    return 'Service duration is required.'
  }
  const parsedPrice = Number(price)
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return 'Service price must be a positive number.'
  }
  if (!mode || !normalizeMode(mode)) {
    return 'Service mode must be online, offline, or hybrid.'
  }
  return ''
}

const listMyServices = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can manage services.' })
    }

    const services = await MentorService.find({ user: userId }).sort({ createdAt: -1 })
    return res.status(200).json(services)
  } catch (error) {
    console.error('listMyServices error:', error)
    return res.status(500).json({ message: 'Unable to load mentorship services.' })
  }
}

const createService = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can create services.' })
    }

    const { title, description, duration, price, mode, status } = req.body ?? {}

    const validationError = validatePayload({ title, description, duration, price, mode })
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const payload = {
      user: userId,
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim(),
      price: Number(price),
      mode: normalizeMode(mode),
      status: normalizeStatus(status),
    }

    const service = await MentorService.create(payload)
    return res.status(201).json(service)
  } catch (error) {
    console.error('createService error:', error)
    return res.status(500).json({ message: 'Unable to create mentorship service.' })
  }
}

const updateService = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can update services.' })
    }

    const serviceId = req.params?.serviceId
    if (!serviceId) {
      return res.status(400).json({ message: 'Service identifier is required.' })
    }

    const { title, description, duration, price, mode, status } = req.body ?? {}

    const validationError = validatePayload({ title, description, duration, price, mode })
    if (validationError) {
      return res.status(400).json({ message: validationError })
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      duration: duration.trim(),
      price: Number(price),
      mode: normalizeMode(mode),
      status: normalizeStatus(status),
    }

    const service = await MentorService.findOneAndUpdate(
      { _id: serviceId, user: userId },
      payload,
      { new: true }
    )

    if (!service) {
      return res.status(404).json({ message: 'Mentorship service not found.' })
    }

    return res.status(200).json(service)
  } catch (error) {
    console.error('updateService error:', error)
    return res.status(500).json({ message: 'Unable to update mentorship service.' })
  }
}

const deleteService = async (req, res) => {
  try {
    const userId = req.user?.id
    const role = req.user?.role

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required.' })
    }

    if (!role || role.toLowerCase() !== 'alumni') {
      return res.status(403).json({ message: 'Only mentors can delete services.' })
    }

    const serviceId = req.params?.serviceId
    if (!serviceId) {
      return res.status(400).json({ message: 'Service identifier is required.' })
    }

    const deleted = await MentorService.findOneAndDelete({ _id: serviceId, user: userId })
    if (!deleted) {
      return res.status(404).json({ message: 'Mentorship service not found.' })
    }

    return res.status(200).json({ message: 'Service deleted successfully.' })
  } catch (error) {
    console.error('deleteService error:', error)
    return res.status(500).json({ message: 'Unable to delete mentorship service.' })
  }
}

module.exports = {
  listMyServices,
  createService,
  updateService,
  deleteService,
}
