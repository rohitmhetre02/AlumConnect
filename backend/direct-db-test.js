// Direct database test for email update
const mongoose = require('mongoose');
const { getModelByRole } = require('./utils/roleModels');

require('dotenv').config();

const testEmailUpdate = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test user ID (replace with actual user ID from your database)
    const testUserId = 'YOUR_USER_ID_HERE';
    const newEmail = 'testupdated@example.com';

    console.log('Testing email update for user:', testUserId);
    console.log('New email:', newEmail);

    // Find user in all collections
    const roles = ['student', 'alumni', 'faculty', 'admin', 'coordinator'];
    let foundUser = null;
    let foundRole = null;

    for (const role of roles) {
      const Model = getModelByRole(role);
      try {
        const user = await Model.findById(testUserId);
        if (user) {
          foundUser = user;
          foundRole = role;
          console.log(`Found user in ${role} collection:`);
          console.log('Current email:', user.email);
          console.log('User ID:', user._id);
          break;
        }
      } catch (error) {
        console.log(`Error searching in ${role}:`, error.message);
      }
    }

    if (!foundUser) {
      console.log('User not found in any collection');
      return;
    }

    // Update email
    const Model = getModelByRole(foundRole);
    const updatedUser = await Model.findByIdAndUpdate(
      testUserId,
      { email: newEmail },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ Email updated successfully!');
      console.log('New email:', updatedUser.email);
      
      // Verify the update
      const verifyUser = await Model.findById(testUserId);
      console.log('Verified email in database:', verifyUser.email);
    } else {
      console.log('❌ Failed to update email');
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Test error:', error);
  }
};

// Run the test
testEmailUpdate();
