const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { upload } = require('../utils/cloudinaryUpload')
const {
  listMyResources,
  createResource,
  updateResource,
  deleteResource,
} = require('../controllers/mentorResourceController')

const router = express.Router()

router.use(authMiddleware)

router.get('/me/resources', listMyResources)
router.post('/me/resources', upload.single('file'), createResource)
router.put('/me/resources/:resourceId', upload.single('file'), updateResource)
router.delete('/me/resources/:resourceId', deleteResource)

module.exports = router
