const express = require('express')

const {
  listDirectoryMembers,
  listStudents,
  listAlumni,
  listFaculty,
  getDirectoryProfile,
} = require('../controllers/directoryController')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/profile/:id', authMiddleware, getDirectoryProfile)
router.get('/students', authMiddleware, listStudents)
router.get('/alumni', authMiddleware, listAlumni)
router.get('/faculty', authMiddleware, listFaculty)
router.get('/:role', authMiddleware, listDirectoryMembers)

module.exports = router
