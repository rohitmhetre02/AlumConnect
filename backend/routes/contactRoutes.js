const express = require('express')
const { sendContactMessage } = require('../controllers/contactController')

const router = express.Router()

// Send contact form message
router.post('/send-message', sendContactMessage)

module.exports = router
