const MentorSession = require('../models/MentorSession')
const MentorService = require('../models/MentorService')
const MentorRequest = require('../models/MentorRequest')

const ensureMentor = (req) => {
  const userId = req.user?.id
  const role = req.user?.role

  if (!userId) {
    return { error: { status: 401, message: 'Authentication required.' } }
  }

  if (!role || role.toLowerCase() !== 'alumni') {
    return { error: { status: 403, message: 'Only mentors can access the dashboard.' } }
  }

  return { userId }
}

const getOverview = async (req, res) => {
  try {
    const { error, userId } = ensureMentor(req)
    if (error) {
      return res.status(error.status).json({ message: error.message })
    }

    const now = new Date()

    const [
      totalSessions,
      upcomingSessionsCount,
      completedSessionsCount,
      sessions,
      services,
      pendingRequestsCount,
      requests,
    ] = await Promise.all([
      MentorSession.countDocuments({ mentor: userId }),
      MentorSession.countDocuments({ mentor: userId, status: 'scheduled', sessionDate: { $gte: now } }),
      MentorSession.countDocuments({ mentor: userId, status: 'completed' }),
      MentorSession.find({ mentor: userId })
        .sort({ sessionDate: -1 })
        .select('menteeName menteeEmail serviceName sessionDate status mode feedback durationMinutes'),
      MentorService.find({ user: userId, status: 'active' }).select('_id'),
      MentorRequest.countDocuments({ mentor: userId, status: 'pending' }),
      MentorRequest.find({ mentor: userId })
        .sort({ createdAt: -1 })
        .select('menteeName menteeEmail serviceName status createdAt notes preferredDateTime preferredMode')
        .limit(10),
    ])

    const upcomingSessions = sessions
      .filter((session) => session.sessionDate && session.sessionDate >= now)
      .sort((a, b) => a.sessionDate - b.sessionDate)
      .slice(0, 5)
      .map((session) => ({
        id: session.id,
        menteeName: session.menteeName,
        serviceName: session.serviceName,
        sessionDate: session.sessionDate,
        mode: session.mode,
        status: session.status,
      }))

    const recentRequests = requests.slice(0, 5).map((request) => ({
      id: request.id,
      menteeName: request.menteeName,
      serviceName: request.serviceName,
      status: request.status,
      createdAt: request.createdAt,
    }))

    const recentFeedback = sessions
      .filter((session) => session.feedback && (session.feedback.rating || session.feedback.comment))
      .sort((a, b) => {
        const aDate = sessionDateForFeedback(a)
        const bDate = sessionDateForFeedback(b)
        return bDate - aDate
      })
      .slice(0, 5)
      .map((session) => ({
        id: session.id,
        menteeName: session.menteeName,
        serviceName: session.serviceName,
        rating: session.feedback?.rating ?? null,
        comment: session.feedback?.comment ?? '',
        submittedAt: sessionDateForFeedback(session),
      }))

    const uniqueMentees = new Set()
    sessions.forEach((session) => {
      if (session.menteeEmail) {
        uniqueMentees.add(session.menteeEmail.toLowerCase())
      } else if (session.menteeName) {
        uniqueMentees.add(session.menteeName.toLowerCase())
      }
    })

    const metrics = {
      totalSessions,
      upcomingSessions: upcomingSessionsCount,
      completedSessions: completedSessionsCount,
      totalMentees: uniqueMentees.size,
      activeServices: services.length,
      pendingRequests: pendingRequestsCount,
    }

    return res.status(200).json({
      metrics,
      upcomingSessions,
      recentRequests,
      recentFeedback,
    })
  } catch (error) {
    console.error('getOverview error:', error)
    return res.status(500).json({ message: 'Unable to load mentor dashboard data.' })
  }
}

const sessionDateForFeedback = (session) => {
  if (session.feedback?.submittedAt) {
    return new Date(session.feedback.submittedAt)
  }
  if (session.updatedAt) {
    return new Date(session.updatedAt)
  }
  if (session.sessionDate) {
    return new Date(session.sessionDate)
  }
  return new Date(0)
}

module.exports = {
  getOverview,
}
