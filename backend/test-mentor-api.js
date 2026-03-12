const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/alumconnect');

async function testMentorAPI() {
  try {
    console.log('=== TESTING MENTOR API DATA ===');
    
    // Import MentorApplication model
    const MentorApplication = require('./models/MentorApplication');
    
    // Find approved mentor applications
    const applications = await MentorApplication.find({ status: 'approved' });
    console.log(`Found ${applications.length} approved mentor applications`);
    
    if (applications.length > 0) {
      console.log('\nFirst mentor application data:');
      const firstApp = applications[0].toObject();
      console.log({
        _id: firstApp._id,
        fullName: firstApp.fullName,
        email: firstApp.email,
        currentJobTitle: firstApp.currentJobTitle,
        company: firstApp.company,
        department: firstApp.department,
        status: firstApp.status,
        expertise: firstApp.expertise,
        profilePhoto: firstApp.profilePhoto,
        currentLocation: firstApp.currentLocation,
        phoneNumber: firstApp.phoneNumber,
        graduationYear: firstApp.graduationYear,
        maxMentees: firstApp.maxMentees,
        timeCommitment: firstApp.timeCommitment,
        availableDays: firstApp.availableDays,
        mentorshipMode: firstApp.mentorshipMode,
        mentorshipPreference: firstApp.mentorshipPreference,
        rating: firstApp.rating
      });
      
      console.log('\n✅ Mentor data exists in database!');
      console.log('The issue is likely in the API endpoint or data formatting.');
      
    } else {
      console.log('❌ No approved mentor applications found in database.');
      console.log('Available mentor applications:');
      const allApps = await MentorApplication.find({}, { status: 1, fullName: 1 });
      allApps.forEach(app => {
        console.log(`- ${app.fullName} (Status: ${app.status})`);
      });
    }
    
  } catch (error) {
    console.error('Error testing mentor API:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testMentorAPI();
