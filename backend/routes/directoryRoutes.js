const express = require('express')

const {
  listDirectoryMembers,
  listStudents,
  listAlumni,
  listFaculty,
  getDirectoryProfile,
  updateMemberStatus,
  deleteMember,
} = require('../controllers/directoryController')
const authMiddleware = require('../middleware/authMiddleware')
const { upload, createSingleUser, createBulkUsers } = require('../controllers/adminUserController')

const router = express.Router()

router.get('/profile/:id', authMiddleware, getDirectoryProfile)
router.get('/students', authMiddleware, listStudents)
router.get('/alumni', authMiddleware, listAlumni)
router.get('/faculty', authMiddleware, listFaculty)
router.get('/:role', authMiddleware, listDirectoryMembers)
router.put('/:role/:id/status', authMiddleware, updateMemberStatus)
router.delete('/:role/:id', authMiddleware, deleteMember)

// Bulk upload routes for admin
router.post('/students/bulk-upload', authMiddleware, upload.single('file'), createBulkUsers)
router.post('/alumni/bulk-upload', authMiddleware, upload.single('file'), createBulkUsers)
router.post('/coordinators/bulk-upload', authMiddleware, upload.single('file'), createBulkUsers)
router.post('/faculty/bulk-upload', authMiddleware, upload.single('file'), createBulkUsers)
router.post('/students/add', authMiddleware, createSingleUser)
router.post('/alumni/add', authMiddleware, createSingleUser)
router.post('/coordinators/add', authMiddleware, createSingleUser)
router.post('/faculty/add', authMiddleware, createSingleUser)

module.exports = router
