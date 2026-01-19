// Simple auth test - run this in browser console
console.log('=== Authentication Debug ===');
console.log('Current user:', JSON.parse(localStorage.getItem('user') || 'null'));
console.log('Auth token:', localStorage.getItem('authToken') ? 'Exists' : 'Missing');
console.log('Token value:', localStorage.getItem('authToken'));

// Test API call
fetch('http://localhost:5000/auth/profile/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(response => console.log('Auth test response:', response.status))
.catch(error => console.log('Auth test error:', error));
