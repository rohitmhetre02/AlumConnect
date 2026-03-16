const mongoose = require('mongoose');
const MentorRequest = require('./models/MentorRequest');
const Student = require('./models/Student');
const Alumni = require('./models/Alumni');

require('dotenv').config();

const updateExistingRequests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumconnect');
    console.log('Connected to MongoDB');

    // Get all requests that don't have menteeDepartment
    const requestsToUpdate = await MentorRequest.find({
      $or: [
        { menteeDepartment: { $exists: false } },
        { menteeDepartment: '' },
        { menteeDepartment: 'N/A' },
        { menteeRole: { $exists: false } },
        { menteeRole: '' },
        { menteeRole: 'N/A' }
      ]
    });

    console.log(`Found ${requestsToUpdate.length} requests to update`);

    for (const request of requestsToUpdate) {
      let userData = null;
      
      // Try to get user data based on mentee role or try both models
      if (request.menteeRole === 'student') {
        userData = await Student.findById(request.mentee);
      } else if (request.menteeRole === 'alumni') {
        userData = await Alumni.findById(request.mentee);
      } else {
        // Try both models if role is not specified
        userData = await Student.findById(request.mentee);
        if (!userData) {
          userData = await Alumni.findById(request.mentee);
        }
      }

      if (userData) {
        const updateData = {
          menteeName: userData.firstName + ' ' + userData.lastName,
          menteeEmail: userData.email,
          menteeAvatar: userData.avatar || '',
          menteeDepartment: userData.department || 'Not specified',
          menteeRole: userData.role || 'Not specified',
          menteeSkills: Array.isArray(userData.skills) ? userData.skills.filter(Boolean) : [],
        };

        // Add year-specific fields
        if (userData.role === 'student' && userData.currentYear) {
          updateData.currentYear = userData.currentYear;
        } else if (userData.role === 'alumni' && userData.passoutYear) {
          updateData.passoutYear = userData.passoutYear;
        }

        await MentorRequest.findByIdAndUpdate(request._id, updateData);
        console.log(`Updated request ${request._id} for ${userData.firstName} ${userData.lastName}`);
      } else {
        console.log(`Could not find user data for request ${request._id}`);
      }
    }

    console.log('Update completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating requests:', error);
    process.exit(1);
  }
};

updateExistingRequests();
