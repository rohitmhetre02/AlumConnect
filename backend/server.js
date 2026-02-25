require('dotenv').config()



const http = require('http')

const express = require('express')

const cors = require('cors')

const session = require('cookie-session')

const passport = require('passport')



const connectDB = require('./config/db')

const { initSocket } = require('./socket')

require('./config/passport')

const { apiLimiter, authLimiter, profileLimiter } = require('./middleware/rateLimiter')

const authRoutes = require('./routes/authRoutes')

const profileRoutes = require('./routes/profileRoutes')

const uploadRoutes = require('./routes/uploadRoutes')

const authMiddleware = require('./middleware/authMiddleware')

const { getOverview: getMentorDashboardOverview } = require('./controllers/mentorDashboardController')

const directoryRoutes = require('./routes/directoryRoutes')

const opportunityRoutes = require('./routes/opportunityRoutes')

const applicationRoutes = require('./routes/applicationRoutes')

const eventRoutes = require('./routes/eventRoutes')

const eventRegistrationRoutes = require('./routes/eventRegistrationRoutes')

const campaignRoutes = require('./routes/campaignRoutes')
const stripeRoutes = require('./routes/stripeRoutes')

const newsRoutes = require('./routes/newsRoutes')

const mentorRoutes = require('./routes/mentorRoutes')

const mentorServiceRoutes = require('./routes/mentorServiceRoutes')

const mentorResourceRoutes = require('./routes/mentorResourceRoutes')

const mentorSessionRoutes = require('./routes/mentorSessionRoutes')

const mentorRequestRoutes = require('./routes/mentorRequestRoutes')

const mentorDashboardRoutes = require('./routes/mentorDashboardRoutes')

const mentorshipRoutes = require('./routes/mentorshipRoutes')

const alumniRoutes = require('./routes/alumniRoutes')

const facultyRoutes = require('./routes/facultyRoutes')

const insightsRoutes = require('./routes/insightsRoutes')

const messageRoutes = require('./routes/messageRoutes')

const galleryRoutes = require('./routes/galleryRoutes')

const settingsRoutes = require('./routes/settingsRoutes')

const adminUserRoutes = require('./routes/adminUserRoutes')

const adminDashboardRoutes = require('./routes/adminDashboardRoutes')

const profileApprovalRoutes = require('./routes/profileApprovalRoutes')

const registrationApprovalRoutes = require('./routes/registrationApprovalRoutes')

const contentApprovalRoutes = require('./routes/contentApprovalRoutes')

const calendarRoutes = require('./routes/calendarRoutes')



const app = express()



app.use(cors())

app.use(express.json())

// Apply general API rate limiting

app.use('/api/', apiLimiter)

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



    // API routes with /api prefix and specific rate limiting

    app.use('/api/auth', authLimiter, authRoutes)

    app.use('/api/auth/profile', profileLimiter, profileRoutes)

    app.use('/api/upload', uploadRoutes)

    app.use('/api/directory', directoryRoutes)

    app.use('/api/opportunities', opportunityRoutes)

    app.use('/api/applications', applicationRoutes)

    app.use('/api/events', eventRoutes)

    app.use('/api/event-registrations', eventRegistrationRoutes)

    app.use('/api/campaigns', campaignRoutes)
app.use('/api', stripeRoutes)

    app.use('/api/news', newsRoutes)

    app.use('/api/mentors/dashboard', mentorDashboardRoutes)

    app.use('/api/mentors', mentorRequestRoutes)

    app.use('/api/mentors', mentorRoutes)

    app.use('/api/mentors', mentorServiceRoutes)

    app.use('/api/mentors', mentorResourceRoutes)

    app.use('/api/mentors', mentorSessionRoutes)

    app.use('/api/mentorship', mentorshipRoutes)

    app.use('/api/alumni', alumniRoutes)

    app.use('/api/faculty', facultyRoutes)

    app.use('/api/insights', insightsRoutes)

    app.use('/api/messages', messageRoutes)

    app.use('/api/gallery', galleryRoutes)

    app.use('/api/settings', settingsRoutes)

    app.use('/api/admin/users', adminUserRoutes)

    app.use('/api/admin/dashboard', adminDashboardRoutes)

    app.use('/api/admin/profile-approval', profileApprovalRoutes)

    app.use('/api/admin/registration-approval', registrationApprovalRoutes)

    app.use('/api/admin/content-approval', contentApprovalRoutes)

app.use('/api/calendar', calendarRoutes)



    app.get('/health', (_req, res) => {

      res.json({ status: 'ok' })

    })



    // Only log requests in development

    if (process.env.NODE_ENV !== 'production') {

      app.use((req, res, next) => {

        // Only log non-static requests and reduce verbosity

        if (!req.path.startsWith('/static') && !req.path.includes('.')) {

          console.log(`${req.method} ${req.path}`)

        }

        next()

      })

    }



    // 404 handler

    app.use((req, res) => {

      if (process.env.NODE_ENV !== 'production') {

        console.log('404 for:', req.method, req.path)

      }

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

