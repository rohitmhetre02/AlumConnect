const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { getOverview, getDetail } = require('../controllers/insightsController')

const router = express.Router()

router.use(authMiddleware)

router.get('/overview', getOverview)
router.get('/details/:type', getDetail)

module.exports = router
