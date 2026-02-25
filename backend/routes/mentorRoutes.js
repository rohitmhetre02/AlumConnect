const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const authMiddleware = require('../middleware/authMiddleware')
const {
  submitMentorApplication,
  listMentors,
  listApplications,
  getMyProfile,
  updateMyProfile,
  getMentorProfile,
} = require('../controllers/mentorController')
const { aiMatchMentors } = require('../controllers/mentorMatchController')

const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads/mentors')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'mentor-photo-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit as per requirements
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

router.get('/', listMentors)
router.post('/applications', authMiddleware, upload.single('profilePhoto'), submitMentorApplication)
router.get('/applications', authMiddleware, listApplications)
router.get('/me', authMiddleware, getMyProfile)
router.put('/me', authMiddleware, updateMyProfile)
router.post('/ai-match', authMiddleware, aiMatchMentors)
router.get('/:mentorId', getMentorProfile)

module.exports = router
