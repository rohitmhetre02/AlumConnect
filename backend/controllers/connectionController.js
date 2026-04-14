const ConnectionRequest = require('../models/ConnectionRequest');
const Connection = require('../models/Connection');
const mongoose = require('mongoose');

// Import user models
const Student = require('../models/Student');
const Alumni = require('../models/Alumni');
const Faculty = require('../models/Faculty');

// Fallback in-memory storage in case models fail
let memoryRequests = [];
let memoryConnections = [];
let nextId = 1;

// Helper function to fetch user data by ID and role
const fetchUserData = async (userId, userRole) => {
  try {
    console.log(`Fetching user data for ID: ${userId}, Role: ${userRole}`);
    
    let userData = null;
    const normalizedRole = userRole === 'students' ? 'student' : userRole;
    
    switch (normalizedRole) {
      case 'student':
        userData = await Student.findById(userId);
        break;
      case 'alumni':
        userData = await Alumni.findById(userId);
        break;
      case 'faculty':
        userData = await Faculty.findById(userId);
        break;
      default:
        console.log(`Unknown role: ${normalizedRole}, trying all models`);
        // Try all models if role is unknown
        userData = await Student.findById(userId) || 
                  await Alumni.findById(userId) || 
                  await Faculty.findById(userId);
    }
    
    if (userData) {
      console.log(`Found user data: ${userData.firstName} ${userData.lastName}`);
      return {
        name: `${userData.firstName} ${userData.lastName}`.trim() || 'Unknown User',
        role: userData.role || normalizedRole,
        department: userData.department || 'Not specified',
        currentYear: userData.currentYear || userData.admissionYear || null,
        passoutYear: userData.passoutYear || userData.expectedPassoutYear || null,
        avatar: userData.avatar || 'https://i.pravatar.cc/150?img=1'
      };
    } else {
      console.log(`User not found, using fallback data`);
      return {
        name: 'Unknown User',
        role: normalizedRole,
        department: 'Not specified',
        currentYear: null,
        passoutYear: null,
        avatar: 'https://i.pravatar.cc/150?img=1'
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return {
      name: 'Error Loading User',
      role: userRole,
      department: 'Error',
      currentYear: null,
      passoutYear: null,
      avatar: 'https://i.pravatar.cc/150?img=1'
    };
  }
};

const sendConnectionRequest = async (req, res) => {
  try {
    console.log('=== DEBUG: sendConnectionRequest called ===');
    console.log('Request body:', req.body);
    console.log('Request user:', req.user);
    console.log('Request headers:', req.headers);
    
    const { targetUserId, targetRole } = req.body
    
    // Get user ID from auth middleware (no fallback to mock)
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('Current user ID:', currentUserId);
    console.log('Target user ID:', targetUserId);
    console.log('Target role:', targetRole);
    // Normalize role values (convert 'students' to 'student' for consistency)
    const normalizeRole = (role) => {
      if (role === 'students') return 'student';
      return role;
    };
    
    const normalizedTargetRole = normalizeRole(targetRole);
    const normalizedUserRole = normalizeRole(req.user?.role || 'student');
    
    console.log('Normalized target role:', normalizedTargetRole);
    console.log('Normalized user role:', normalizedUserRole);
    
    if (!currentUserId) {
      console.log('ERROR: User not authenticated');
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    if (!targetUserId || !targetRole) {
      console.log('ERROR: Missing required fields');
      console.log('targetUserId missing:', !targetUserId);
      console.log('targetRole missing:', !targetRole);
      return res.status(400).json({ 
        success: false, 
        message: 'Target user ID and role are required',
        debug: {
          targetUserId: targetUserId,
          targetRole: targetRole,
          receivedBody: req.body
        }
      })
    }

    // Try database first, fallback to memory
    try {
      // Convert to ObjectId if needed
      const fromUserId = mongoose.Types.ObjectId.isValid(currentUserId) ? currentUserId : new mongoose.Types.ObjectId();
      const toUserId = mongoose.Types.ObjectId.isValid(targetUserId) ? targetUserId : new mongoose.Types.ObjectId();

      // Check if request already exists
      console.log('Checking existing request in database...');
      const existingRequest = await ConnectionRequest.findOne({
        fromUserId: fromUserId,
        toUserId: toUserId
      })
      
      if (existingRequest) {
        return res.status(400).json({ 
          success: false, 
          message: 'Connection request already sent' 
        })
      }

      // Check if already connected
      console.log('Checking existing connection in database...');
      const existingConnection = await Connection.findOne({
        $or: [
          { fromUserId: fromUserId, toUserId: toUserId },
          { fromUserId: toUserId, toUserId: fromUserId }
        ]
      })

      if (existingConnection) {
        return res.status(400).json({ 
          success: false, 
          message: 'Already connected with this user' 
        })
      }

      // Fetch real user data
      console.log('Fetching real user data...');
      const [currentUserData, targetUserData] = await Promise.all([
        fetchUserData(currentUserId, normalizedUserRole),
        fetchUserData(targetUserId, normalizedTargetRole)
      ]);
      
      console.log('Current user data:', currentUserData);
      console.log('Target user data:', targetUserData);

      // Create connection request
      console.log('Creating connection request in database...');
      const request = new ConnectionRequest({
        fromUserId: fromUserId,
        toUserId: toUserId,
        fromRole: normalizedUserRole,
        toRole: normalizedTargetRole,
        fromUserName: currentUserData.name,
        toUserName: targetUserData.name,
        fromDepartment: currentUserData.department,
        toDepartment: targetUserData.department,
        fromCurrentYear: currentUserData.currentYear,
        toCurrentYear: targetUserData.currentYear,
        fromPassoutYear: currentUserData.passoutYear,
        toPassoutYear: targetUserData.passoutYear,
        fromUserAvatar: currentUserData.avatar,
        toUserAvatar: targetUserData.avatar,
        status: 'pending'
      })

      console.log('Saving request to database...');
      await request.save()
      console.log('Request saved successfully to database:', request);

      console.log('=== DEBUG: Connection request successful (DATABASE) ===');

      res.status(201).json({ 
        success: true, 
        message: 'Connection request sent successfully',
        data: request
      })

    } catch (dbError) {
      console.log('Database failed, using memory fallback:', dbError.message);
      
      // Fetch real user data for memory fallback
      const [currentUserData, targetUserData] = await Promise.all([
        fetchUserData(currentUserId, normalizedUserRole),
        fetchUserData(targetUserId, normalizedTargetRole)
      ]);
      
      // Check for existing memory request
      const existingMemoryRequest = memoryRequests.find(
        req => req.fromUserId === currentUserId && req.toUserId === targetUserId
      );
      
      if (existingMemoryRequest) {
        return res.status(400).json({ 
          success: false, 
          message: 'Connection request already sent' 
        })
      }

      // Create memory request with real data
      const request = {
        _id: nextId.toString(),
        id: nextId.toString(),
        fromUserId: currentUserId,
        toUserId: targetUserId,
        fromRole: normalizedUserRole,
        toRole: normalizedTargetRole,
        fromUserName: currentUserData.name,
        toUserName: targetUserData.name,
        fromDepartment: currentUserData.department,
        toDepartment: targetUserData.department,
        fromCurrentYear: currentUserData.currentYear,
        toCurrentYear: targetUserData.currentYear,
        fromPassoutYear: currentUserData.passoutYear,
        toPassoutYear: targetUserData.passoutYear,
        fromUserAvatar: currentUserData.avatar,
        toUserAvatar: targetUserData.avatar,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      memoryRequests.push(request);
      nextId++;

      console.log('=== DEBUG: Connection request successful (MEMORY) ===');

      res.status(201).json({ 
        success: true, 
        message: 'Connection request sent successfully',
        data: request
      })
    }

  } catch (error) {
    console.error('=== ERROR in sendConnectionRequest ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send connection request',
      error: error.message 
    })
  }
}

const acceptConnectionRequest = async (req, res) => {
  try {
    console.log('=== DEBUG: acceptConnectionRequest called ===');
    console.log('Request params:', req.params);
    console.log('Request user:', req.user);
    const { requestId } = req.params
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('🤝 [Backend] Accepting connection request:', requestId, 'by user:', currentUserId)

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' })
    }

    // Find connection request
    const request = await ConnectionRequest.findById(requestId)
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found' })
    }
    
    // Convert ObjectId to string for comparison
    const requestToUserId = request.toUserId.toString();
    const currentUserIdStr = currentUserId.toString();
    
    console.log('Request toUserId:', requestToUserId);
    console.log('Current userId:', currentUserIdStr);
    console.log('Can accept:', requestToUserId === currentUserIdStr);
    
    if (requestToUserId !== currentUserIdStr) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only accept requests sent to you',
        debug: {
          requestToUserId: requestToUserId,
          currentUserId: currentUserIdStr,
          requestId: requestId
        }
      })
    }

    // Update request status to accepted
    request.status = 'accepted'
    request.acceptedAt = new Date()
    await request.save()

    // Fetch real user data for connection
    const [fromUserData, toUserData] = await Promise.all([
      fetchUserData(request.fromUserId, request.fromRole),
      fetchUserData(request.toUserId, request.toRole)
    ]);

    // Create connection record with real data
    const connection = new Connection({
      fromUserId: request.fromUserId,
      toUserId: request.toUserId,
      fromRole: request.fromRole,
      toRole: request.toRole,
      name: fromUserData.name, // Show the other person's name
      role: fromUserData.role, // Show the other person's role
      department: fromUserData.department,
      currentYear: fromUserData.currentYear,
      passoutYear: fromUserData.passoutYear,
      avatar: fromUserData.avatar,
      status: 'accepted',
      acceptedAt: new Date(),
      originalRequestId: request._id
    })

    await connection.save()

    console.log('✅ [Backend] Connection request accepted and saved to database:', request)

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
    
    console.log('=== DEBUG: getConnectionRequests called ===');
    console.log('Getting connection requests for user:', currentUserId)

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    // Try database first, fallback to memory
    try {
      console.log('Fetching from database...');
      // Get all pending requests for current user (both sent and received)
      const requests = await ConnectionRequest.find({
        $or: [
          { toUserId: currentUserId },
          { fromUserId: currentUserId }
        ],
        status: 'pending'
      }).sort({ createdAt: -1 })

      console.log('=== DEBUG: Connection requests from database ===', requests);

      res.status(200).json({ 
        success: true, 
        data: requests
      })

    } catch (dbError) {
      console.log('Database failed, using memory fallback:', dbError.message);
      
      // Fallback to memory storage
      const requests = memoryRequests.filter(req => 
        (req.toUserId === currentUserId || req.fromUserId === currentUserId) && req.status === 'pending'
      )

      console.log('=== DEBUG: Connection requests from memory ===', requests);

      res.status(200).json({ 
        success: true, 
        data: requests
      })
    }

  } catch (error) {
    console.error('=== ERROR in getConnectionRequests ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get connection requests',
      error: error.message 
    })
  }
}

const getConnections = async (req, res) => {
  try {
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('=== DEBUG: getConnections called ===');
    console.log('Getting connections for user:', currentUserId)

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    // Try database first, fallback to memory
    try {
      console.log('Fetching connections from database...');
      // Get all accepted connections for current user
      const userConnections = await Connection.find({
        $or: [
          { fromUserId: currentUserId },
          { toUserId: currentUserId }
        ],
        status: { $in: ['accepted', 'active'] }
      }).sort({ acceptedAt: -1 })

      // Transform connections to show the other person's data
      const transformedConnections = await Promise.all(
        userConnections.map(async (connection) => {
          // Determine which user is the "other" person (not the current user)
          const isFromCurrentUser = connection.fromUserId.toString() === currentUserId.toString();
          const otherUserId = isFromCurrentUser ? connection.toUserId : connection.fromUserId;
          const otherUserRole = isFromCurrentUser ? connection.toRole : connection.fromRole;
          
          // Fetch the other person's actual data
          const otherUserData = await fetchUserData(otherUserId, otherUserRole);
          
          return {
            ...connection.toObject(),
            name: otherUserData.name,
            role: otherUserData.role,
            department: otherUserData.department,
            currentYear: otherUserData.currentYear,
            passoutYear: otherUserData.passoutYear,
            avatar: otherUserData.avatar,
            // Keep the original connection info for reference
            isFromCurrentUser: isFromCurrentUser
          };
        })
      );

      console.log('=== DEBUG: Connections from database (transformed) ===', transformedConnections);

      res.status(200).json({ 
        success: true, 
        data: transformedConnections
      })

    } catch (dbError) {
      console.log('Database failed, using memory fallback:', dbError.message);
      
      // Fallback to memory storage with transformation
      const userConnections = memoryConnections.filter(conn => 
        (conn.fromUserId === currentUserId || conn.toUserId === currentUserId) && conn.status === 'accepted'
      );

      // Transform memory connections to show the other person's data
      const transformedConnections = await Promise.all(
        userConnections.map(async (connection) => {
          // Determine which user is the "other" person (not the current user)
          const isFromCurrentUser = connection.fromUserId.toString() === currentUserId.toString();
          const otherUserId = isFromCurrentUser ? connection.toUserId : connection.fromUserId;
          const otherUserRole = isFromCurrentUser ? connection.toRole : connection.fromRole;
          
          // Fetch the other person's actual data
          const otherUserData = await fetchUserData(otherUserId, otherUserRole);
          
          return {
            ...connection,
            name: otherUserData.name,
            role: otherUserData.role,
            department: otherUserData.department,
            currentYear: otherUserData.currentYear,
            passoutYear: otherUserData.passoutYear,
            avatar: otherUserData.avatar,
            isFromCurrentUser: isFromCurrentUser
          };
        })
      );

      console.log('=== DEBUG: Connections from memory (transformed) ===', transformedConnections);

      res.status(200).json({ 
        success: true, 
        data: transformedConnections
      })
    }

  } catch (error) {
    console.error('=== ERROR in getConnections ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get connections',
      error: error.message 
    })
  }
}

const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params
    const currentUserId = req.user?.id || req.user?._id
    
    console.log('❌ [Backend] Rejecting connection request:', requestId, 'by user:', currentUserId)

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' })
    }

    if (!requestId) {
      return res.status(400).json({ success: false, message: 'Request ID is required' })
    }

    // Find connection request
    const request = await ConnectionRequest.findById(requestId)
    
    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found' })
    }

    // Convert ObjectId to string for comparison
    const requestToUserId = request.toUserId.toString();
    const currentUserIdStr = currentUserId.toString();
    
    console.log('Request toUserId:', requestToUserId);
    console.log('Current userId:', currentUserIdStr);
    console.log('Can reject:', requestToUserId === currentUserIdStr);

    if (requestToUserId !== currentUserIdStr) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only reject requests sent to you',
        debug: {
          requestToUserId: requestToUserId,
          currentUserId: currentUserIdStr,
          requestId: requestId
        }
      })
    }

    // Update request status to rejected
    request.status = 'rejected'
    await request.save()

    console.log('✅ [Backend] Connection request rejected and saved to database:', requestId)

    res.status(200).json({ 
      success: true, 
      message: 'Connection request rejected'
    })

  } catch (error) {
    console.error('❌ [Backend] Reject connection request error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject connection request' 
    })
  }
}

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getConnections
}
