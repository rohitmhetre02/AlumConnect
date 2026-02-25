const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { listNews, getNewsById, createNews, listMyNews, updateNews, deleteNews, getPendingNewsForCoordinator, approveNews, rejectNews, forwardToAdmin } = require('../controllers/newsController')

const router = express.Router()

router.get('/', listNews)
router.get('/me/list', authMiddleware, listMyNews)
router.get('/pending-review', authMiddleware, getPendingNewsForCoordinator)
router.get('/:id', getNewsById)
router.post('/', authMiddleware, createNews)
router.post('/create', authMiddleware, createNews)
router.put('/:id', authMiddleware, updateNews)
router.put('/:id/approve', authMiddleware, approveNews)
router.put('/:id/reject', authMiddleware, rejectNews)
router.put('/:id/forward', authMiddleware, forwardToAdmin)
router.delete('/:id', authMiddleware, deleteNews)

module.exports = router
