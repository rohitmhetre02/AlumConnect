// Test script to create sample notifications
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumConnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const createTestNotifications = async () => {
  try {
    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Create test notifications for user ID (replace with actual user ID)
    const userId = '69d24a0a8a195675901bb26e'; // From server logs
    
    const notifications = [
      {
        recipient: userId,
        message: 'Your event "Tech Conference 2024" has been approved!',
        type: 'content_approval',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        redirectUrl: '/dashboard/activity/content'
      },
      {
        recipient: userId,
        message: 'New mentorship request from John Doe',
        type: 'mentorship',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        redirectUrl: '/dashboard/mentorship-requests'
      },
      {
        recipient: userId,
        message: 'Your application for Software Developer role has been received',
        type: 'application',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        redirectUrl: '/dashboard/applications'
      },
      {
        recipient: userId,
        message: 'Alumni Sarah Johnson wants to connect with you',
        type: 'connection',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
        redirectUrl: '/dashboard/connections'
      },
      {
        recipient: userId,
        message: 'Your opportunity "Internship Program" has been approved!',
        type: 'content_approval',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        redirectUrl: '/dashboard/activity/content'
      }
    ];

    await Notification.insertMany(notifications);
    console.log(`Created ${notifications.length} test notifications`);
    
    console.log('Notifications created successfully!');
    console.log('You can now test the notification system in the frontend.');
    
  } catch (error) {
    console.error('Error creating test notifications:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestNotifications();
