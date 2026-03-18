// Simple auth test - run this in browser console
console.log('=== Authentication Debug ===');
console.log('Current user:', JSON.parse(localStorage.getItem('user') || 'null'));
console.log('Auth token:', localStorage.getItem('authToken') ? 'Exists' : 'Missing');
console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000');

// Test API call
fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/auth/profile/me`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
})
.then(response => console.log('Auth test response:', response.status))
.catch(error => console.log('Auth test error:', error));
