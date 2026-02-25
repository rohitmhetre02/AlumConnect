const http = require('http');

// Test the routes
async function testRoutes() {
  console.log('Testing routes...');
  
  try {
    // Test content approval test route
    const contentTestResponse = await fetch('http://localhost:5000/api/admin/content-approval/test', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    const contentTestData = await contentTestResponse.json();
    console.log('Content Approval Test Route:', contentTestData);
    
    // Test profile approval test route
    const profileTestResponse = await fetch('http://localhost:5000/api/admin/profile-approval/test', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    const profileTestData = await profileTestResponse.json();
    console.log('Profile Approval Test Route:', profileTestData);
    
    // Test approved posts route
    const approvedPostsResponse = await fetch('http://localhost:5000/api/admin/content-approval/approved', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    const approvedPostsData = await approvedPostsResponse.json();
    console.log('Approved Posts Route:', approvedPostsData);
    
  } catch (error) {
    console.error('Error testing routes:', error.message);
  }
}

testRoutes();
