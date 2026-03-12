const mongoose = require('mongoose');
const MentorApplication = require('./models/MentorApplication');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/alumconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testMentors() {
  try {
    console.log('=== TESTING MENTOR APPLICATIONS ===');
    
    // Count all applications
    const allApplications = await MentorApplication.countDocuments();
    console.log('Total applications:', allApplications);
    
    // Count approved applications
    const approvedApplications = await MentorApplication.countDocuments({ status: 'approved' });
    console.log('Approved applications:', approvedApplications);
    
    // Get all applications with their status
    const applications = await MentorApplication.find({}, { status: 1, fullName: 1, createdAt: 1 });
    console.log('All applications:');
    applications.forEach(app => {
      console.log(`- ${app.fullName} (Status: ${app.status})`);
    });
    
    // Get approved applications
    const approved = await MentorApplication.find({ status: 'approved' }, { status: 1, fullName: 1, createdAt: 1 }).populate('user');
    console.log('\nApproved applications:');
    approved.forEach(app => {
      console.log(`- ${app.fullName} (User: ${app.user?.fullName || app.user?.email || 'N/A'})`);
    });
    
    console.log('\n=== TEST COMPLETE ===');
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.disconnect();
  }
}

testMentors();
