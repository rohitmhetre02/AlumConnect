const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { getSettings, updateSettings } = require('../controllers/settingsController')

const router = express.Router()

router.get('/', getSettings)
router.put('/', authMiddleware, updateSettings)

module.exports = router
