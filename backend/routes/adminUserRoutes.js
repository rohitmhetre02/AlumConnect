const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const adminOnly = require('../middleware/adminOnly')
const { upload, createSingleUser, createBulkUsers } = require('../controllers/adminUserController')

const router = express.Router()

router.post('/:role/single', authMiddleware, adminOnly, createSingleUser)
router.post('/:role/bulk', authMiddleware, adminOnly, upload.single('file'), createBulkUsers)

module.exports = router
