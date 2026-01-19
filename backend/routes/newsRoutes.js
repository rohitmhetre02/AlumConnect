const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { listNews, getNewsById, createNews, listMyNews } = require('../controllers/newsController')

const router = express.Router()

router.get('/', listNews)
router.get('/me/list', authMiddleware, listMyNews)
router.get('/:id', getNewsById)
router.post('/', authMiddleware, createNews)
router.post('/create', authMiddleware, createNews)

module.exports = router
