const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  listOpportunities,
  getOpportunityById,
  createOpportunity,
  submitOpportunityReferral,
  getMyOpportunityReferral,
  listMyOpportunityReferrals,
  updateReferralStatus,
} = require('../controllers/opportunityController')
const { upload } = require('../utils/cloudinaryUpload')

const router = express.Router()

router.get('/', listOpportunities)
router.get('/referrals/me', authMiddleware, listMyOpportunityReferrals)
router.get('/:opportunityId/referrals/me', authMiddleware, getMyOpportunityReferral)
router.get('/:id', getOpportunityById)
router.post('/', authMiddleware, createOpportunity)
router.post(
  '/:opportunityId/referrals',
  authMiddleware,
  upload.single('resume'),
  submitOpportunityReferral,
)
router.put('/referrals/:referralId/status', authMiddleware, updateReferralStatus)

module.exports = router
