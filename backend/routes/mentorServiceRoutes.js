const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  listMyServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/mentorServiceController')

const router = express.Router()

router.use(authMiddleware)

router.get('/me/services', listMyServices)
router.post('/me/services', createService)
router.put('/me/services/:serviceId', updateService)
router.delete('/me/services/:serviceId', deleteService)

module.exports = router
