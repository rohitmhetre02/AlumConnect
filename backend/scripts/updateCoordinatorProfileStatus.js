const mongoose = require('mongoose')
const Coordinator = require('../models/Coordinator')
require('dotenv').config()

const updateCoordinatorProfileStatus = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumconnect')
    console.log('Connected to MongoDB')

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

  } catch (error) {
    console.error('Error updating coordinator profile status:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run the update
updateCoordinatorProfileStatus()
