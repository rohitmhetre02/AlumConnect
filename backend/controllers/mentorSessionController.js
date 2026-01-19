const MentorSession = require('../models/MentorSession')

const ensureMentor = (req) => {
  const userId = req.user?.id
  const role = req.user?.role

  if (!userId) {
    return { error: { status: 401, message: 'Authentication required.' } }
  }

  if (!role || role.toLowerCase() !== 'alumni') {
    return { error: { status: 403, message: 'Only mentors can access session history.' } }
  }

  return { userId }
}

const listMySessions = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const { status } = req.query ?? {}
    const filters = { mentor: userId }

    if (status) {
      filters.status = Array.isArray(status)
        ? { $in: status.map((item) => String(item).toLowerCase()) }
        : String(status).toLowerCase()
    }

    const sessions = await MentorSession.find(filters)
      .sort({ sessionDate: -1 })
      .select('-mentor')

    return res.status(200).json(sessions)
  } catch (error) {
    console.error('listMySessions error:', error)
    return res.status(500).json({ message: 'Unable to load session history.' })
  }
}

const getSessionDetails = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const sessionId = req.params?.sessionId
    if (!sessionId) {
      return res.status(400).json({ message: 'Session identifier is required.' })
    }

    const session = await MentorSession.findOne({ _id: sessionId, mentor: userId }).select('-mentor')
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' })
    }

    return res.status(200).json(session)
  } catch (error) {
    console.error('getSessionDetails error:', error)
    return res.status(500).json({ message: 'Unable to load session details.' })
  }
}

const normalizeStatus = (status) => {
  if (!status) return undefined
  const normalized = status.toString().trim().toLowerCase()
  if (['scheduled', 'completed', 'cancelled'].includes(normalized)) {
    return normalized
  }
  return undefined
}

const normalizeMode = (mode) => {
  if (!mode) return undefined
  const normalized = mode.toString().trim().toLowerCase()
  if (['online', 'offline', 'hybrid'].includes(normalized)) {
    return normalized
  }
  return undefined
}

const updateSession = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const sessionId = req.params?.sessionId
    if (!sessionId) {
      return res.status(400).json({ message: 'Session identifier is required.' })
    }

    const session = await MentorSession.findOne({ _id: sessionId, mentor: userId })
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' })
    }

    const {
      sessionDate,
      status,
      mode,
      durationMinutes,
      notes,
    } = req.body ?? {}

    if (sessionDate) {
      const dateValue = new Date(sessionDate)
      if (Number.isNaN(dateValue.getTime())) {
        return res.status(400).json({ message: 'Invalid session date.' })
      }
      session.sessionDate = dateValue
    }

    const normalizedStatus = normalizeStatus(status)
    if (status && !normalizedStatus) {
      return res.status(400).json({ message: 'Invalid session status.' })
    }
    if (normalizedStatus) {
      session.status = normalizedStatus
    }

    const normalizedMode = normalizeMode(mode)
    if (mode && !normalizedMode) {
      return res.status(400).json({ message: 'Invalid session mode.' })
    }
    if (normalizedMode) {
      session.mode = normalizedMode
    }

    if (durationMinutes !== undefined) {
      const parsedDuration = Number(durationMinutes)
      if (Number.isNaN(parsedDuration) || parsedDuration < 0) {
        return res.status(400).json({ message: 'Invalid session duration.' })
      }
      session.durationMinutes = parsedDuration
    }

    if (notes !== undefined) {
      session.notes = notes?.toString()?.trim() || ''
    }

    await session.save()

    const result = await MentorSession.findById(session._id).select('-mentor')
    return res.status(200).json(result)
  } catch (error) {
    console.error('updateSession error:', error)
    return res.status(500).json({ message: 'Unable to update session.' })
  }
}

module.exports = {
  listMySessions,
  getSessionDetails,
  updateSession,
}
