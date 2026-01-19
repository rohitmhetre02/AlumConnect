const mongoose = require('mongoose')

const MentorSession = require('../models/MentorSession')
const MentorRequest = require('../models/MentorRequest')
const MentorService = require('../models/MentorService')
const Event = require('../models/Event')
const EventRegistration = require('../models/EventRegistration')
const Opportunity = require('../models/Opportunity')
const { ROLE_MODEL_MAP } = require('../utils/roleModels')

const DEFAULT_LIMIT = 10

const monthKey = (date) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const buildMonthlySeries = (docs, dateField, months = 6) => {
  const now = new Date()
  const buckets = new Map()

  for (let i = months - 1; i >= 0; i -= 1) {
    const ref = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(ref)
    buckets.set(key, 0)
  }

  docs.forEach((doc) => {
    const raw = doc?.[dateField]
    if (!raw) return
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return

    const key = monthKey(date)
    if (buckets.has(key)) {
      buckets.set(key, buckets.get(key) + 1)
    }
  })

  return Array.from(buckets.entries()).map(([label, value]) => ({ label, value }))
}

const toObjectId = (value) => {
  try {
    if (!value) return null
    return new mongoose.Types.ObjectId(String(value))
  } catch (_err) {
    return null
  }
}

const ensureSupportedRole = (role) => {
  if (!role) return null
  const normalized = String(role).toLowerCase()
  if (['student', 'alumni', 'faculty'].includes(normalized)) {
    return normalized
  }
  return null
}

const fetchUserRecord = async (role, userId) => {
  const Model = ROLE_MODEL_MAP[role]
  if (!Model) return null
  const id = toObjectId(userId)
  if (!id) return null
  return Model.findById(id).lean()
}

const buildStudentOverview = async ({ student, userId }) => {
  const email = String(student.email || '').toLowerCase()
  const now = new Date()

  const [sessions, requests, eventDocs, directRegs] = await Promise.all([
    MentorSession.find({ menteeEmail: email })
      .sort({ sessionDate: -1 })
      .lean(),
    MentorRequest.find({ menteeEmail: email })
      .sort({ createdAt: -1 })
      .lean(),
    Event.find({ 'registrations.userId': String(userId) })
      .sort({ startAt: -1 })
      .lean(),
    EventRegistration.find({ email })
      .sort({ registeredAt: -1 })
      .lean(),
  ])

  const completedSessions = sessions.filter((s) => s.status === 'completed').length
  const upcomingSessions = sessions.filter((s) => {
    if (!s.sessionDate) return false
    const date = new Date(s.sessionDate)
    return s.status === 'scheduled' && date >= now
  }).length

  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  const acceptedRequests = requests.filter((r) => r.status === 'accepted').length

  const mentorsEngaged = new Set(
    sessions
      .map((session) => session.mentor?.toString())
      .filter(Boolean),
  ).size

  const totalEventsRegistered = eventDocs.reduce((acc, event) => {
    const relevant = Array.isArray(event.registrations)
      ? event.registrations.filter((reg) => reg.userId === String(userId)).length
      : 0
    return acc + relevant
  }, 0) + directRegs.length

  const metrics = [
    { id: 'completedSessions', label: 'Sessions Completed', value: completedSessions, detailKey: 'sessions' },
    { id: 'upcomingSessions', label: 'Upcoming Sessions', value: upcomingSessions, detailKey: 'sessions' },
    { id: 'pendingRequests', label: 'Pending Requests', value: pendingRequests, detailKey: 'requests' },
    { id: 'acceptedRequests', label: 'Accepted Requests', value: acceptedRequests, detailKey: 'requests' },
    { id: 'mentorsEngaged', label: 'Mentors Engaged', value: mentorsEngaged, detailKey: 'sessions' },
    { id: 'eventsRegistered', label: 'Events Registered', value: totalEventsRegistered, detailKey: 'events' },
  ]

  const charts = {
    sessionsByMonth: buildMonthlySeries(sessions, 'sessionDate', 6),
    engagementBreakdown: [
      { label: 'Sessions', value: sessions.length },
      { label: 'Mentor Requests', value: requests.length },
      { label: 'Events', value: totalEventsRegistered },
    ],
    conversionFunnel: [
      { stage: 'Requests Sent', value: requests.length },
      { stage: 'Sessions Scheduled', value: sessions.filter((s) => s.status !== 'cancelled').length },
      { stage: 'Sessions Completed', value: completedSessions },
    ],
  }

  const nextSession = sessions
    .filter((s) => {
      if (!s.sessionDate) return false
      const date = new Date(s.sessionDate)
      return date >= now && s.status === 'scheduled'
    })
    .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))[0]

  const nextEvent = eventDocs
    .filter((event) => event.startAt && new Date(event.startAt) >= now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0]

  const spotlights = []

  if (nextSession) {
    const mentorLabel =
      nextSession.mentorName ||
      (nextSession.mentor && typeof nextSession.mentor === 'object' && 'name' in nextSession.mentor
        ? nextSession.mentor.name
        : '') ||
      'mentor'

    spotlights.push({
      id: `session-${nextSession._id}`,
      title: `Upcoming Session: ${nextSession.serviceName}`,
      description: `Scheduled with ${mentorLabel} on ${new Date(nextSession.sessionDate).toLocaleString()}`,
      ctaLabel: 'View sessions',
      href: '/dashboard/insights/sessions',
    })
  }

  if (nextEvent) {
    spotlights.push({
      id: `event-${nextEvent._id}`,
      title: `Event Registered: ${nextEvent.title}`,
      description: `Starts ${new Date(nextEvent.startAt).toLocaleDateString()} • ${nextEvent.organization || 'Community'}`,
      ctaLabel: 'View events',
      href: '/dashboard/insights/events',
    })
  }

  if (!spotlights.length && requests.length) {
    const latestRequest = requests[0]
    spotlights.push({
      id: `request-${latestRequest._id}`,
      title: `Request ${latestRequest.status === 'pending' ? 'awaiting response' : latestRequest.status}`,
      description: `${latestRequest.serviceName} · ${latestRequest.mentorName || latestRequest.mentor?.toString() || 'Mentor'}`,
      ctaLabel: 'View requests',
      href: '/dashboard/insights/requests',
    })
  }

  const recentActivity = []

  sessions.slice(0, 5).forEach((session) => {
    recentActivity.push({
      id: `session-${session._id}`,
      type: 'session',
      title: session.serviceName,
      subtitle: session.mentorName || session.mentor?.toString() || 'Mentor session',
      timestamp: session.sessionDate || session.updatedAt || session.createdAt,
      status: session.status,
    })
  })

  requests.slice(0, 5).forEach((request) => {
    recentActivity.push({
      id: `request-${request._id}`,
      type: 'request',
      title: request.serviceName,
      subtitle: `Status: ${request.status}`,
      timestamp: request.updatedAt || request.createdAt,
      status: request.status,
    })
  })

  eventDocs.slice(0, 5).forEach((event) => {
    recentActivity.push({
      id: `event-${event._id}`,
      type: 'event',
      title: event.title,
      subtitle: event.organization || event.department || 'Community event',
      timestamp: event.startAt,
      status: 'registered',
    })
  })

  directRegs.slice(0, 5).forEach((reg) => {
    recentActivity.push({
      id: `registration-${reg._id}`,
      type: 'event',
      title: reg.eventId?.toString() || 'Event registration',
      subtitle: reg.registrationType === 'popup' ? 'Popup registration' : 'Link registration',
      timestamp: reg.registeredAt,
      status: 'registered',
    })
  })

  return {
    role: 'student',
    metrics,
    charts,
    spotlight: spotlights,
    recentActivity: recentActivity.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)).slice(0, 10),
    detailLinks: {
      sessions: '/dashboard/insights/sessions',
      requests: '/dashboard/insights/requests',
      events: '/dashboard/insights/events',
    },
  }
}

const buildMentorOverview = async ({ userId }) => {
  const now = new Date()

  const [sessions, requests, services] = await Promise.all([
    MentorSession.find({ mentor: userId })
      .sort({ sessionDate: -1 })
      .lean(),
    MentorRequest.find({ mentor: userId })
      .sort({ createdAt: -1 })
      .lean(),
    MentorService.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean(),
  ])

  const completedSessions = sessions.filter((s) => s.status === 'completed').length
  const upcomingSessions = sessions.filter((s) => {
    if (!s.sessionDate) return false
    const date = new Date(s.sessionDate)
    return s.status === 'scheduled' && date >= now
  }).length

  const pendingRequests = requests.filter((r) => r.status === 'pending').length
  const totalMentees = new Set(
    sessions
      .map((session) => session.menteeEmail || session.menteeName)
      .filter(Boolean)
      .map((value) => String(value).toLowerCase()),
  ).size

  const activeServices = services.filter((service) => service.status === 'active').length

  const metrics = [
    { id: 'totalSessions', label: 'Total Sessions', value: sessions.length, detailKey: 'sessions' },
    { id: 'completedSessions', label: 'Sessions Completed', value: completedSessions, detailKey: 'sessions' },
    { id: 'upcomingSessions', label: 'Upcoming Sessions', value: upcomingSessions, detailKey: 'sessions' },
    { id: 'pendingRequests', label: 'Pending Requests', value: pendingRequests, detailKey: 'requests' },
    { id: 'activeServices', label: 'Active Services', value: activeServices, detailKey: 'services' },
    { id: 'uniqueMentees', label: 'Unique Mentees', value: totalMentees, detailKey: 'sessions' },
  ]

  const charts = {
    sessionsByMonth: buildMonthlySeries(sessions, 'sessionDate', 6),
    engagementBreakdown: [
      { label: 'Completed', value: completedSessions },
      { label: 'Scheduled', value: sessions.filter((s) => s.status === 'scheduled').length },
      { label: 'Cancelled', value: sessions.filter((s) => s.status === 'cancelled').length },
    ],
    conversionFunnel: [
      { stage: 'Requests Received', value: requests.length },
      { stage: 'Requests Accepted', value: requests.filter((r) => r.status === 'accepted').length },
      { stage: 'Sessions Completed', value: completedSessions },
    ],
  }

  const spotlights = []

  const nextSession = sessions
    .filter((s) => s.sessionDate && new Date(s.sessionDate) >= now && s.status === 'scheduled')
    .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))[0]

  if (nextSession) {
    spotlights.push({
      id: `session-${nextSession._id}`,
      title: `Upcoming Session with ${nextSession.menteeName}`,
      description: `${nextSession.serviceName} on ${new Date(nextSession.sessionDate).toLocaleString()}`,
      ctaLabel: 'Manage sessions',
      href: '/dashboard/insights/sessions',
    })
  }

  const latestFeedback = sessions.find((session) => session.feedback && (session.feedback.rating || session.feedback.comment))
  if (latestFeedback) {
    spotlights.push({
      id: `feedback-${latestFeedback._id}`,
      title: `Feedback from ${latestFeedback.menteeName}`,
      description: `Rated ${latestFeedback.feedback.rating ?? 'N/A'} • ${latestFeedback.feedback.comment || 'New feedback received'}`,
      ctaLabel: 'View feedback',
      href: '/dashboard/insights/feedback',
    })
  }

  if (!spotlights.length && requests.length) {
    const request = requests[0]
    spotlights.push({
      id: `request-${request._id}`,
      title: `New request from ${request.menteeName}`,
      description: `${request.serviceName} • Status: ${request.status}`,
      ctaLabel: 'Review requests',
      href: '/dashboard/insights/requests',
    })
  }

  const recentActivity = []

  sessions.slice(0, 5).forEach((session) => {
    recentActivity.push({
      id: `session-${session._id}`,
      type: 'session',
      title: session.serviceName,
      subtitle: session.menteeName,
      timestamp: session.sessionDate || session.updatedAt || session.createdAt,
      status: session.status,
    })
  })

  requests.slice(0, 5).forEach((request) => {
    recentActivity.push({
      id: `request-${request._id}`,
      type: 'request',
      title: request.serviceName,
      subtitle: request.menteeName,
      timestamp: request.updatedAt || request.createdAt,
      status: request.status,
    })
  })

  services.slice(0, 5).forEach((service) => {
    recentActivity.push({
      id: `service-${service._id}`,
      type: 'service',
      title: service.title,
      subtitle: `Status: ${service.status}`,
      timestamp: service.updatedAt || service.createdAt,
      status: service.status,
    })
  })

  return {
    role: 'alumni',
    metrics,
    charts,
    spotlight: spotlights,
    recentActivity: recentActivity.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)).slice(0, 10),
    detailLinks: {
      sessions: '/dashboard/insights/sessions',
      requests: '/dashboard/insights/requests',
      feedback: '/dashboard/insights/feedback',
      services: '/dashboard/insights/services',
    },
  }
}

const buildFacultyOverview = async ({ userId, faculty }) => {
  const now = new Date()
  const creatorId = toObjectId(userId)

  const [events, opportunities] = await Promise.all([
    Event.find({ createdBy: creatorId })
      .sort({ startAt: -1 })
      .lean(),
    Opportunity.find({ createdBy: creatorId })
      .sort({ deadline: -1 })
      .lean(),
  ])

  const eventsHosted = events.length
  const upcomingEvents = events.filter((event) => event.startAt && new Date(event.startAt) >= now).length
  const totalAttendees = events.reduce((acc, event) => acc + (Array.isArray(event.registrations) ? event.registrations.length : 0), 0)

  const opportunitiesPosted = opportunities.length
  const activeOpportunities = opportunities.filter((opp) => opp.status === 'active').length

  const metrics = [
    { id: 'eventsHosted', label: 'Events Hosted', value: eventsHosted, detailKey: 'events' },
    { id: 'upcomingEvents', label: 'Upcoming Events', value: upcomingEvents, detailKey: 'events' },
    { id: 'totalAttendees', label: 'Total Attendees', value: totalAttendees, detailKey: 'events' },
    { id: 'opportunitiesPosted', label: 'Opportunities Posted', value: opportunitiesPosted, detailKey: 'opportunities' },
    { id: 'activeOpportunities', label: 'Active Opportunities', value: activeOpportunities, detailKey: 'opportunities' },
  ]

  const charts = {
    sessionsByMonth: buildMonthlySeries(events, 'startAt', 6),
    engagementBreakdown: [
      { label: 'Events', value: eventsHosted },
      { label: 'Opportunities', value: opportunitiesPosted },
      { label: 'Upcoming', value: upcomingEvents },
    ],
    conversionFunnel: [
      { stage: 'Events Created', value: eventsHosted },
      { stage: 'Registrations', value: totalAttendees },
      { stage: 'Opportunities Active', value: activeOpportunities },
    ],
  }

  const spotlights = []

  const nextEvent = events
    .filter((event) => event.startAt && new Date(event.startAt) >= now)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))[0]

  if (nextEvent) {
    spotlights.push({
      id: `event-${nextEvent._id}`,
      title: `Upcoming Event: ${nextEvent.title}`,
      description: `${new Date(nextEvent.startAt).toLocaleString()} • ${nextEvent.location || 'Campus'}`,
      ctaLabel: 'Manage events',
      href: '/dashboard/insights/events',
    })
  }

  const activeOpportunity = opportunities.find((opp) => opp.status === 'active')
  if (activeOpportunity) {
    spotlights.push({
      id: `opportunity-${activeOpportunity._id}`,
      title: `Opportunity Live: ${activeOpportunity.title}`,
      description: `${activeOpportunity.company} • Closes ${activeOpportunity.deadline ? new Date(activeOpportunity.deadline).toLocaleDateString() : 'soon'}`,
      ctaLabel: 'View opportunities',
      href: '/dashboard/insights/opportunities',
    })
  }

  const recentActivity = []

  events.slice(0, 5).forEach((event) => {
    recentActivity.push({
      id: `event-${event._id}`,
      type: 'event',
      title: event.title,
      subtitle: `${event.location || 'Event'}`,
      timestamp: event.startAt || event.createdAt,
      status: new Date(event.startAt || event.createdAt) >= now ? 'upcoming' : 'completed',
    })
  })

  opportunities.slice(0, 5).forEach((opp) => {
    recentActivity.push({
      id: `opportunity-${opp._id}`,
      type: 'opportunity',
      title: opp.title,
      subtitle: opp.company,
      timestamp: opp.updatedAt || opp.createdAt,
      status: opp.status,
    })
  })

  return {
    role: 'faculty',
    metrics,
    charts,
    spotlight: spotlights,
    recentActivity: recentActivity.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)).slice(0, 10),
    detailLinks: {
      events: '/dashboard/insights/events',
      opportunities: '/dashboard/insights/opportunities',
    },
  }
}

const getOverview = async (req, res) => {
  try {
    const normalizedRole = ensureSupportedRole(req.user?.role)
    if (!normalizedRole) {
      return res.status(403).json({ message: 'Insights are not available for this role.' })
    }

    const userRecord = await fetchUserRecord(normalizedRole, req.user?.id)
    if (!userRecord) {
      return res.status(404).json({ message: 'User profile not found for insights.' })
    }

    let payload

    if (normalizedRole === 'student') {
      payload = await buildStudentOverview({ student: userRecord, userId: req.user.id })
    } else if (normalizedRole === 'alumni') {
      payload = await buildMentorOverview({ userId: req.user.id })
    } else {
      payload = await buildFacultyOverview({ userId: req.user.id, faculty: userRecord })
    }

    return res.status(200).json({ success: true, data: payload })
  } catch (error) {
    console.error('getOverview error:', error)
    return res.status(500).json({ message: 'Unable to load insights overview.' })
  }
}

const paginate = (page = 1, limit = DEFAULT_LIMIT) => {
  const safePage = Math.max(Number(page) || 1, 1)
  const safeLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), 50)
  const skip = (safePage - 1) * safeLimit
  return { page: safePage, limit: safeLimit, skip }
}

const mapSessionDetail = (session, role) => ({
  id: session._id?.toString(),
  serviceName: session.serviceName,
  sessionDate: session.sessionDate,
  status: session.status,
  mode: session.mode,
  durationMinutes: session.durationMinutes,
  feedback: session.feedback,
  counterpart:
    role === 'student'
      ? {
          name: session.mentorName || session.mentor?.toString() || '',
          email: session.mentorEmail || '',
        }
      : {
          name: session.menteeName || '',
          email: session.menteeEmail || '',
        },
})

const handleStudentDetail = async ({ type, page, limit, student, userId }) => {
  const email = String(student.email || '').toLowerCase()

  if (type === 'sessions') {
    const [total, docs] = await Promise.all([
      MentorSession.countDocuments({ menteeEmail: email }),
      MentorSession.find({ menteeEmail: email })
        .sort({ sessionDate: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .lean(),
    ])

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: docs.map((doc) => mapSessionDetail(doc, 'student')),
    }
  }

  if (type === 'requests') {
    const [total, docs] = await Promise.all([
      MentorRequest.countDocuments({ menteeEmail: email }),
      MentorRequest.find({ menteeEmail: email })
        .sort({ createdAt: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .lean(),
    ])

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: docs.map((doc) => ({
        id: doc._id?.toString(),
        serviceName: doc.serviceName,
        status: doc.status,
        createdAt: doc.createdAt,
        preferredDateTime: doc.preferredDateTime,
        preferredMode: doc.preferredMode,
        mentor: {
          name: doc.mentorName || doc.mentor?.toString() || '',
          id: doc.mentor?.toString() || '',
        },
        notes: doc.notes,
      })),
    }
  }

  if (type === 'events') {
    const [events, registrations] = await Promise.all([
      Event.find({ 'registrations.userId': String(userId) })
        .sort({ startAt: -1 })
        .lean(),
      EventRegistration.find({ email })
        .sort({ registeredAt: -1 })
        .lean(),
    ])

    const flattened = []

    events.forEach((event) => {
      const matches = Array.isArray(event.registrations)
        ? event.registrations.filter((reg) => reg.userId === String(userId))
        : []

      matches.forEach((reg) => {
        flattened.push({
          id: `${event._id}-${reg.userId}`,
          title: event.title,
          startAt: event.startAt,
          registeredAt: reg.registeredAt,
          location: event.location,
          status: new Date(event.startAt) >= new Date() ? 'upcoming' : 'completed',
          organization: event.organization,
        })
      })
    })

    registrations.forEach((reg) => {
      flattened.push({
        id: reg._id?.toString(),
        title: reg.eventId?.toString() || 'Event registration',
        startAt: null,
        registeredAt: reg.registeredAt,
        location: null,
        status: 'registered',
        organization: reg.registrationType,
      })
    })

    const total = flattened.length
    const start = page.skip
    const end = start + page.limit
    const items = flattened.slice(start, end)

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items,
    }
  }

  throw new Error('Unsupported detail type for student insights')
}

const handleMentorDetail = async ({ type, page, userId }) => {
  if (type === 'sessions') {
    const [total, docs] = await Promise.all([
      MentorSession.countDocuments({ mentor: userId }),
      MentorSession.find({ mentor: userId })
        .sort({ sessionDate: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .lean(),
    ])

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: docs.map((doc) => mapSessionDetail(doc, 'alumni')),
    }
  }

  if (type === 'requests') {
    const [total, docs] = await Promise.all([
      MentorRequest.countDocuments({ mentor: userId }),
      MentorRequest.find({ mentor: userId })
        .sort({ createdAt: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .lean(),
    ])

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: docs.map((doc) => ({
        id: doc._id?.toString(),
        menteeName: doc.menteeName,
        menteeEmail: doc.menteeEmail,
        serviceName: doc.serviceName,
        status: doc.status,
        createdAt: doc.createdAt,
        preferredDateTime: doc.preferredDateTime,
        preferredMode: doc.preferredMode,
        notes: doc.notes,
      })),
    }
  }

  if (type === 'feedback') {
    const feedbackSessions = await MentorSession.find({
      mentor: userId,
      'feedback.comment': { $exists: true },
    })
      .sort({ 'feedback.submittedAt': -1, updatedAt: -1 })
      .lean()

    const items = feedbackSessions
      .filter((session) => session.feedback && (session.feedback.rating || session.feedback.comment))
      .map((session) => ({
        id: session._id?.toString(),
        menteeName: session.menteeName,
        serviceName: session.serviceName,
        rating: session.feedback?.rating ?? null,
        comment: session.feedback?.comment ?? '',
        submittedAt: session.feedback?.submittedAt || session.updatedAt || session.sessionDate,
      }))

    const total = items.length
    const start = page.skip
    const end = start + page.limit

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: items.slice(start, end),
    }
  }

  if (type === 'services') {
    const [total, docs] = await Promise.all([
      MentorService.countDocuments({ user: userId }),
      MentorService.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .lean(),
    ])

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: docs.map((doc) => ({
        id: doc._id?.toString(),
        title: doc.title,
        status: doc.status,
        createdAt: doc.createdAt,
        bookings: doc.bookings || 0,
        price: doc.price || null,
        mode: doc.mode,
      })),
    }
  }

  throw new Error('Unsupported detail type for mentor insights')
}

const handleFacultyDetail = async ({ type, page, userId }) => {
  const creatorId = toObjectId(userId)

  if (type === 'events') {
    const [total, docs] = await Promise.all([
      Event.countDocuments({ createdBy: creatorId }),
      Event.find({ createdBy: creatorId })
        .sort({ startAt: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .lean(),
    ])

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: docs.map((event) => ({
        id: event._id?.toString(),
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        location: event.location,
        registrations: Array.isArray(event.registrations) ? event.registrations.length : 0,
        mode: event.mode,
        status: new Date(event.startAt || Date.now()) >= new Date() ? 'upcoming' : 'completed',
      })),
    }
  }

  if (type === 'opportunities') {
    const [total, docs] = await Promise.all([
      Opportunity.countDocuments({ createdBy: creatorId }),
      Opportunity.find({ createdBy: creatorId })
        .sort({ deadline: -1 })
        .skip(page.skip)
        .limit(page.limit)
        .lean(),
    ])

    return {
      type,
      page: page.page,
      pageSize: page.limit,
      total,
      items: docs.map((opp) => ({
        id: opp._id?.toString(),
        title: opp.title,
        company: opp.company,
        type: opp.type,
        deadline: opp.deadline,
        status: opp.status,
        location: opp.location,
      })),
    }
  }

  throw new Error('Unsupported detail type for faculty insights')
}

const getDetail = async (req, res) => {
  try {
    const normalizedRole = ensureSupportedRole(req.user?.role)
    if (!normalizedRole) {
      return res.status(403).json({ message: 'Insights are not available for this role.' })
    }

    const type = String(req.params.type || '').toLowerCase()
    const { page, limit } = req.query
    const pagination = paginate(page, limit)

    const userRecord = await fetchUserRecord(normalizedRole, req.user?.id)
    if (!userRecord) {
      return res.status(404).json({ message: 'User profile not found for insights.' })
    }

    let payload

    if (normalizedRole === 'student') {
      payload = await handleStudentDetail({ type, page: pagination, student: userRecord, userId: req.user.id })
    } else if (normalizedRole === 'alumni') {
      payload = await handleMentorDetail({ type, page: pagination, userId: req.user.id })
    } else {
      payload = await handleFacultyDetail({ type, page: pagination, userId: req.user.id, faculty: userRecord })
    }

    return res.status(200).json({ success: true, data: payload })
  } catch (error) {
    console.error('getDetail error:', error)
    return res.status(400).json({ message: error.message || 'Unable to load insights detail.' })
  }
}

module.exports = {
  getOverview,
  getDetail,
}
