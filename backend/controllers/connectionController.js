// Simple in-memory storage for development
let connectionRequests = []
let connections = []
let nextId = 1

const sendConnectionRequest = async (req, res) => {
  try {
    const { targetUserId, targetRole } = req.body
    
    // Get user ID from auth middleware (no fallback to mock)
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('🔗 [Backend] Sending connection request from:', currentUserId, 'to:', targetUserId)
    
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    if (!targetUserId || !targetRole) {
      return res.status(400).json({ success: false, message: 'Target user ID and role are required' })
    }

    // Check if request already exists
    const existingRequest = connectionRequests.find(
      req => req.fromUserId === currentUserId && req.toUserId === targetUserId
    )
    
    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Connection request already sent' 
      })
    }

    // Create connection request
    const request = {
      _id: nextId.toString(),
      id: nextId.toString(),
      fromUserId: currentUserId,
      toUserId: targetUserId,
      toRole: targetRole,
      status: 'pending',
      createdAt: new Date().toISOString(),
      fromUserName: 'Current User', // Mock data
      toUserName: 'Target User', // Mock data
      fromUserAvatar: 'https://i.pravatar.cc/150?img=1',
      toUserAvatar: 'https://i.pravatar.cc/150?img=2'
    }

    connectionRequests.push(request)
    nextId++

    console.log('✅ [Backend] Connection request created:', request)

    res.status(201).json({ 
      success: true, 
      message: 'Connection request sent successfully',
      data: request
    })

  } catch (error) {
    console.error('❌ [Backend] Send connection request error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send connection request' 
    })
  }
}

const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.body
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('🤝 [Backend] Accepting connection request:', requestId, 'by user:', currentUserId)

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' })
    }

    // Find connection request
    const requestIndex = connectionRequests.findIndex(req => req.id === requestId)
    
    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Connection request not found' })
    }

    const request = connectionRequests[requestIndex]
    
    if (request.toUserId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'You can only accept requests sent to you' })
    }

    // Update request status to accepted
    request.status = 'accepted'
    request.acceptedAt = new Date().toISOString()

    // Move to connections
    connections.push(request)

    // Remove from pending requests
    connectionRequests.splice(requestIndex, 1)

    console.log('✅ [Backend] Connection request accepted:', request)

    res.status(200).json({ 
      success: true, 
      message: 'Connection request accepted',
      data: request
    })

  } catch (error) {
    console.error('❌ [Backend] Accept connection request error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to accept connection request' 
    })
  }
}

const getConnectionRequests = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('📋 [Backend] Getting connection requests for user:', currentUserId)

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    // Get all requests for current user (both sent and received)
    const requests = connectionRequests.filter(req => 
      (req.toUserId === currentUserId || req.fromUserId === currentUserId) && req.status === 'pending'
    )

    console.log('📋 [Backend] Connection requests for user:', requests)

    res.status(200).json({ 
      success: true, 
      data: requests
    })

  } catch (error) {
    console.error('❌ [Backend] Get connection requests error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get connection requests' 
    })
  }
}

const getConnections = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('🤝 [Backend] Getting connections for user:', currentUserId)

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    // Get all accepted connections for current user
    const userConnections = connections.filter(conn => 
      (conn.fromUserId === currentUserId || conn.toUserId === currentUserId) && conn.status === 'accepted'
    )

    console.log('🤝 [Backend] Connections for user:', userConnections)

    res.status(200).json({ 
      success: true, 
      data: userConnections
    })

  } catch (error) {
    console.error('❌ [Backend] Get connections error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get connections' 
    })
  }
}

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  getConnectionRequests,
  getConnections
}
