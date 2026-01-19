const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const { listGallery, getGalleryById, createGallery, deleteGallery } = require('../controllers/galleryController')

const router = express.Router()

router.get('/', listGallery)
router.get('/:id', getGalleryById)
router.post('/', authMiddleware, createGallery)
router.delete('/:id', authMiddleware, deleteGallery)

module.exports = router
