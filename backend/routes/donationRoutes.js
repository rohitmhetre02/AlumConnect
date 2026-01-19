const express = require('express')

const authMiddleware = require('../middleware/authMiddleware')
const {
  listDonations,
  getDonationById,
  createDonation,
  contributeToDonation,
} = require('../controllers/donationController')

const router = express.Router()

router.get('/', listDonations)
router.get('/:id', getDonationById)
router.post('/', authMiddleware, createDonation)
router.post('/:id/contribute', authMiddleware, contributeToDonation)

console.log('donationRoutes configured:')
console.log('- GET /')
console.log('- GET /:id')
console.log('- POST /')
console.log('- POST /:id/contribute')

module.exports = router
