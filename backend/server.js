require('dotenv').config()

const http = require('http')
const express = require('express')
const cors = require('cors')
const session = require('cookie-session')
const passport = require('passport')

const connectDB = require('./config/db')
const { initSocket } = require('./socket')
require('./config/passport')
const authRoutes = require('./routes/authRoutes')
const profileRoutes = require('./routes/profileRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const authMiddleware = require('./middleware/authMiddleware')
const { getOverview: getMentorDashboardOverview } = require('./controllers/mentorDashboardController')
const directoryRoutes = require('./routes/directoryRoutes')
const opportunityRoutes = require('./routes/opportunityRoutes')
const eventRoutes = require('./routes/eventRoutes')
const campaignRoutes = require('./routes/campaignRoutes')
const donationRoutes = require('./routes/donationRoutes')
const newsRoutes = require('./routes/newsRoutes')
const mentorRoutes = require('./routes/mentorRoutes')
const mentorServiceRoutes = require('./routes/mentorServiceRoutes')
const mentorResourceRoutes = require('./routes/mentorResourceRoutes')
const mentorSessionRoutes = require('./routes/mentorSessionRoutes')
const mentorRequestRoutes = require('./routes/mentorRequestRoutes')
const mentorDashboardRoutes = require('./routes/mentorDashboardRoutes')
const insightsRoutes = require('./routes/insightsRoutes')
const messageRoutes = require('./routes/messageRoutes')
const galleryRoutes = require('./routes/galleryRoutes')
const settingsRoutes = require('./routes/settingsRoutes')
const adminUserRoutes = require('./routes/adminUserRoutes')
const profileApprovalRoutes = require('./routes/profileApprovalRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(
  session({
    name: 'alumconnect:sess',
    keys: [process.env.SESSION_SECRET || 'alumconnect-session-secret'],
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
  }),
)
app.use(passport.initialize())

const startServer = async () => {
  try {
    await connectDB()

    // Mentor dashboard overview (direct mount to avoid route conflicts)
    app.get('/api/mentors/dashboard/overview', authMiddleware, getMentorDashboardOverview)

    // API routes with /api prefix
    app.use('/api/auth', authRoutes)
    app.use('/api/auth/profile', profileRoutes)
    app.use('/api/upload', uploadRoutes)
    app.use('/api/directory', directoryRoutes)
    app.use('/api/opportunities', opportunityRoutes)
    app.use('/api/events', eventRoutes)
    app.use('/api/campaigns', campaignRoutes)
    app.use('/api/donations', donationRoutes)
    app.use('/api/news', newsRoutes)
    app.use('/api/mentors/dashboard', mentorDashboardRoutes)
    app.use('/api/mentors', mentorRequestRoutes)
    app.use('/api/mentors', mentorRoutes)
    app.use('/api/mentors', mentorServiceRoutes)
    app.use('/api/mentors', mentorResourceRoutes)
    app.use('/api/mentors', mentorSessionRoutes)
    app.use('/api/insights', insightsRoutes)
    app.use('/api/messages', messageRoutes)
    app.use('/api/gallery', galleryRoutes)
    app.use('/api/settings', settingsRoutes)
    app.use('/api/admin/users', adminUserRoutes)
    app.use('/api/admin/profile-approval', profileApprovalRoutes)

    // Debug: log mounted routes
    console.log('Routes mounted:')
    console.log('- /api/donations -> donationRoutes')
    console.log('donationRoutes methods:', Object.keys(donationRoutes))
    console.log('- /api/mentors -> mentorRoutes, mentorServiceRoutes, mentorResourceRoutes, mentorSessionRoutes, mentorRequestRoutes, mentorDashboardRoutes')

    app.get('/health', (_req, res) => {
      res.json({ status: 'ok' })
    })

    // Debug: log unmatched requests
    app.use((req, res, next) => {
      console.log('Request received:', { method: req.method, url: req.originalUrl, path: req.path })
      next()
    })

    // 404 handler
    app.use((req, res) => {
      console.log('404 for request:', { method: req.method, url: req.originalUrl, path: req.path })
      res.status(404).json({ success: false, message: 'Route not found.' })
    })

    const PORT = process.env.PORT || 8080
    const httpServer = http.createServer(app)
    initSocket(httpServer)

    httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`))
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
