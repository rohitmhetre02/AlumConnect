const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const {
  listOpportunities,
  listAllOpportunitiesForAdmin,
  listMyOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  submitOpportunityReferral,
  getMyOpportunityReferral,
  listMyOpportunityReferrals,
  updateReferralStatus,
  getOpportunityApplicants,
} = require('../controllers/opportunityController')
const { upload } = require('../utils/cloudinaryUpload')

const router = express.Router()

router.get('/', listOpportunities)
router.get('/admin/all', authMiddleware, listAllOpportunitiesForAdmin)
router.get('/mine', authMiddleware, listMyOpportunities)
router.get('/referrals/me', authMiddleware, listMyOpportunityReferrals)
router.get('/:opportunityId/referrals/me', authMiddleware, getMyOpportunityReferral)
router.get('/:id', authMiddleware, getOpportunityById)
router.get('/:id/applicants', authMiddleware, getOpportunityApplicants)
router.post('/', authMiddleware, createOpportunity)
router.put('/:id', authMiddleware, updateOpportunity)
router.delete('/:id', authMiddleware, deleteOpportunity)
router.post(
  '/:opportunityId/referrals',
  authMiddleware,
  upload.single('resume'),
  submitOpportunityReferral,
)
router.put('/referrals/:referralId/status', authMiddleware, updateReferralStatus)

module.exports = router
