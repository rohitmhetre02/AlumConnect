const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const { listConversations, getConversationMessages, getConversationWith, sendMessage } = require('../controllers/messageController')

const router = express.Router()

router.use(authMiddleware)

router.get('/', listConversations)
router.get('/with/:role/:userId', getConversationWith)
router.get('/:conversationId/messages', getConversationMessages)
router.post('/send', sendMessage)

module.exports = router
