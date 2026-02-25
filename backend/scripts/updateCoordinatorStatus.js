// This script should be run when server is running
// Use: curl -X POST http://localhost:5000/api/admin/update-coordinator-status -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

const Coordinator = require('../models/Coordinator')

const updateCoordinatorStatus = async (req, res) => {
  try {
    console.log('Updating coordinator profile approval status...')

    // Find all coordinators without profileApprovalStatus field
    const coordinatorsWithoutStatus = await Coordinator.find({ 
      profileApprovalStatus: { $exists: false } 
    })

    console.log(`Found ${coordinatorsWithoutStatus.length} coordinators without profileApprovalStatus`)

    if (coordinatorsWithoutStatus.length > 0) {
      // Update all coordinators to have default profileApprovalStatus
      const updateResult = await Coordinator.updateMany(
        { profileApprovalStatus: { $exists: false } },
        { 
          $set: { 
            profileApprovalStatus: 'IN_REVIEW',
            isProfileApproved: false
          } 
        }
      )

      console.log(`Updated ${updateResult.modifiedCount} coordinators with default profileApprovalStatus`)
    }

    // Verify the update
    const pendingCoordinators = await Coordinator.find({ 
      profileApprovalStatus: 'IN_REVIEW' 
    })

    console.log(`Total coordinators with IN_REVIEW status: ${pendingCoordinators.length}`)

    if (pendingCoordinators.length > 0) {
      console.log('Pending coordinators:')
      pendingCoordinators.forEach(coordinator => {
        console.log(`- ${coordinator.firstName} ${coordinator.lastName} (${coordinator.email})`)
      })
    }

    res.json({
      success: true,
      message: `Updated ${coordinatorsWithoutStatus.length} coordinators`,
      pendingCount: pendingCoordinators.length,
      coordinators: pendingCoordinators.map(c => ({
        id: c._id,
        name: `${c.firstName} ${c.lastName}`,
        email: c.email,
        profileApprovalStatus: c.profileApprovalStatus
      }))
    })

  } catch (error) {
    console.error('Error updating coordinator profile status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update coordinator status',
      error: error.message
    })
  }
}

module.exports = { updateCoordinatorStatus }
