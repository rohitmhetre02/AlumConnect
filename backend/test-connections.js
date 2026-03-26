// Test connection API endpoints
const testConnectionAPI = async () => {
  console.log('🧪 Testing Connection API...')
  
  try {
    // Test 1: Send connection request
    console.log('\n1. Sending connection request...')
    const sendResponse = await fetch('http://localhost:5000/api/user/send-connection-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUserId: 'target-user-123',
        targetRole: 'alumni'
      })
    })
    
    const sendData = await sendResponse.json()
    console.log('Send Response:', sendData)
    
    if (sendData.success) {
      console.log('✅ Connection request sent successfully!')
      
      // Test 2: Get connection requests
      console.log('\n2. Getting connection requests...')
      const requestsResponse = await fetch('http://localhost:5000/api/user/requests')
      const requestsData = await requestsResponse.json()
      console.log('Requests Response:', requestsData)
      
      // Test 3: Accept connection request
      if (requestsData.data && requestsData.data.length > 0) {
        console.log('\n3. Accepting connection request...')
        const acceptResponse = await fetch('http://localhost:5000/api/user/accept-connection', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestId: requestsData.data[0].id
          })
        })
        
        const acceptData = await acceptResponse.json()
        console.log('Accept Response:', acceptData)
      }
      
      // Test 4: Get connections
      console.log('\n4. Getting connections...')
      const connectionsResponse = await fetch('http://localhost:5000/api/user/my-connections')
      const connectionsData = await connectionsResponse.json()
      console.log('Connections Response:', connectionsData)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run test if called directly
if (typeof window === 'undefined') {
  testConnectionAPI()
}

module.exports = testConnectionAPI
