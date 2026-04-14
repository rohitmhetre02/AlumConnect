import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Avatar from '../../ui/Avatar'

import { useAuth } from '../../../context/AuthContext'

import useModal from '../../../hooks/useModal'

import ChatModal from '../directory/ChatModal'

import toast from 'react-hot-toast'

const ProfileHeader = ({ profile = {}, onEditSection, showConnectButtons = false, targetUser = null }) => {

  

  const { user } = useAuth()

  const chatModal = useModal(false)

  const conversationIdRef = useRef(null)

  const [connectionStatus, setConnectionStatus] = useState('not_connected')
  const [loading, setLoading] = useState(false)
  const [connectionCount, setConnectionCount] = useState(0)
  const [showConnectionsPopup, setShowConnectionsPopup] = useState(false)
  const [connectionsList, setConnectionsList] = useState([])

  const navigate = useNavigate()

  // Use target user if provided, otherwise use profile
  const actualTarget = targetUser || profile
  const { name, title, location, avatar, cover, raw } = actualTarget

  // Fix target ID extraction - use targetUser.id if available, then profile.id
  const targetId = targetUser?._id || targetUser?.id || profile?._id || profile?.id || actualTarget?.id
  const targetRole = targetUser?.role || profile?.role || actualTarget?.role || raw?.role

 

  const formattedRole = targetRole ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1) : null

  const displayTitle = title?.trim() || formattedRole || 'Student'

  const department = raw?.department || profile.department || ''

  const role = formattedRole || 'Student'

  const currentYear = raw?.currentYear || profile.currentYear || ''

  const passoutYear = raw?.passoutYear || profile.passoutYear || ''

  const isStudent = role.toLowerCase().includes('student')

  const isAlumni = role.toLowerCase().includes('alumni')

  const isFaculty = role.toLowerCase().includes('faculty')

  const isCoordinator = role.toLowerCase().includes('coordinator')

  const handleConnect = async () => {
    if (!user || !targetId || loading) return
    
    
    
    // Don't allow connection requests to coordinators
    if (isCoordinator) {
      toast.error('Coordinators cannot be sent connection requests.')
      return
    }
    
    // Don't allow self-connection
    if (user.id === targetId) {
      toast.error('You cannot connect to yourself.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/send-connection-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetUserId: targetId,
          targetRole: targetRole
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setConnectionStatus('pending')
        toast.success('Connection request sent successfully!')
        // Refresh connection count
        fetchConnectionCount()
      } else {
        toast.error(data.message || 'Failed to send connection request')
      }
    } catch (error) {
      console.error('Failed to send connection request:', error)
      toast.error('Failed to send connection request')
    } finally {
      setLoading(false)
    }
  }

  // Fetch connection count for the target user
  const fetchConnectionCount = async () => {
    if (!user) return
    
    try {
      // If we have a target user (different from current user), fetch their connections
      if (targetUser && targetId !== user.id) {
        console.log('🔍 Fetching connections for target user:', targetId)
        
        // Get all connections and filter for target user
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/connections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        const data = await response.json()
        
        
        if (data.success && data.data) {
          // Filter connections to show only those involving the target user
          const targetConnections = data.data.filter(conn => 
            conn.fromUserId === targetId || conn.toUserId === targetId
          )
          
          console.log('🎯 Target user connections:', targetConnections)
          setConnectionCount(targetConnections.length)
        }
      } else {
        // Fetch current user's connections (for own profile)
        
        
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/connections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        const data = await response.json()
        if (data.success && data.data) {
          setConnectionCount(data.data.length)
        }
      }
    } catch (error) {
      console.error('Failed to fetch connection count:', error)
    }
  }

  // Fetch connections for the target user
  const fetchPersonConnections = async () => {
    if (!targetId) {
      console.log(' [Header] No targetId provided')
      return
    }
    
    try {
      console.log(' [Header] Fetching connections for target user:', targetId)
      console.log(' [Header] Target user data:', targetUser)
      console.log(' [Header] Profile data:', profile)
      
      // Get all connections for current user
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/connections`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      const data = await response.json()
      
      
      if (data.success && data.data) {
       
        
        // Filter connections to show only those involving target user
        const targetConnections = data.data.filter(conn => {
          const fromMatch = conn.fromUserId === targetId
          const toMatch = conn.toUserId === targetId
          
          return fromMatch || toMatch
        })
        
        console.log(' [Header] Filtered target connections:', targetConnections)
        console.log(' [Header] Number of target connections:', targetConnections.length)
        
        // Enhance connections with user data from the connection object itself
        const enhancedConnections = targetConnections.map(conn => {
          let connectedUser = null
          
          if (conn.fromUserId === targetId) {
            // If target is the sender, connected user is the receiver
            connectedUser = {
              _id: conn.toUserId,
              name: conn.toUserName || 'Unknown User',
              role: conn.toRole || 'User',
              department: conn.toDepartment || 'Not specified'
            }
            console.log(' [Header] Connected user (from target):', connectedUser)
          } else if (conn.toUserId === targetId) {
            // If target is the receiver, connected user is the sender
            connectedUser = {
              _id: conn.fromUserId,
              name: conn.fromUserName || 'Unknown User',
              role: conn.fromRole || 'User',
              department: conn.fromDepartment || 'Not specified'
            }
            console.log(' [Header] Connected user (to target):', connectedUser)
          }
          
          return {
            ...conn,
            connectedUser
          }
        })
        
        console.log(' [Header] Enhanced target user connections:', enhancedConnections)
        setConnectionsList(enhancedConnections)
      } else {
        console.log(' [Header] Failed to get connections:', data)
      }
    } catch (error) {
      console.error(' [Header] Failed to fetch person connections:', error)
    }
  }

  // Handle clicking on connections stat
  const handleConnectionsClick = async () => {
    if (connectionStatus === 'connected') {
      // Only show popup if current user is connected to this person
      await fetchPersonConnections()
      setShowConnectionsPopup(true)
    }
  }

  // Check if already connected when component loads
  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user || !targetId) return
      
      try {
        console.log('🔍 Checking connection status for user:', user.id, 'target:', targetId)
        
        // Check if there's a pending request
        const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/requests`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        const requestsData = await requestsResponse.json()
        console.log('📋 Pending requests data:', requestsData)
        
        if (requestsData.success) {
          // Check if current user sent request to target (should show pending)
          const sentRequest = requestsData.data.some(req => 
            req.fromUserId === user.id && req.toUserId === targetId
          )
          
          // Check if target sent request to current user (should also show pending)
          const receivedRequest = requestsData.data.some(req => 
            req.fromUserId === targetId && req.toUserId === user.id
          )
          
          if (sentRequest || receivedRequest) {
            console.log('✅ Found pending request, setting status to pending')
            setConnectionStatus('pending')
            return
          }
        }
        
        // Check if already connected
        const connectionsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/user/my-connections`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        const connectionsData = await connectionsResponse.json()
        console.log('🤝 Connections data:', connectionsData)
        
        if (connectionsData.success) {
          const isConnected = connectionsData.data.some(conn => 
            (conn.fromUserId === user.id && conn.toUserId === targetId) ||
            (conn.fromUserId === targetId && conn.toUserId === user.id)
          )
          
          if (isConnected) {
            console.log('✅ Found existing connection, setting status to connected')
            setConnectionStatus('connected')
          } else {
            console.log('❌ No existing connection found, setting status to not_connected')
            setConnectionStatus('not_connected')
          }
        }
      } catch (error) {
        console.error('❌ Failed to check connection status:', error)
        setConnectionStatus('not_connected')
      }
    }
    
    checkConnectionStatus()
    fetchConnectionCount()
  }, [user, targetId])

  const handleMessageClick = () => {
    if (!user || !targetId) return

    // Emit event to open MessagesPanel directly with user info
    window.dispatchEvent(
      new CustomEvent('app:openDirectMessage', {
        detail: { 
          userId: targetId,
          userName: name,
          userRole: role,
          userAvatar: avatar,
          userDepartment: department
        }
      })
    )
  }

  const handleViewAllMessages = (conversationId) => {
    chatModal.closeModal()
    
    const targetConversation = conversationId ?? conversationIdRef.current ?? null
    
    window.dispatchEvent(
      new CustomEvent('app:openMessagesPanel', {
        detail: { conversationId: targetConversation },
      })
    )
  }



  return (

    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">

      <div className="relative h-52 bg-slate-200 sm:h-56">

        {cover ? (

          <img src={cover} alt="Profile cover" className="absolute inset-0 h-full w-full object-cover" />

        ) : null}

        <div className="absolute inset-x-0 bottom-0 h-20 /80" />

        {onEditSection ? (

          <button

            type="button"

            onClick={() => onEditSection('cover')}

            className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow ring-1 ring-white/70 backdrop-blur transition-colors hover:text-primary"

          >

            Change Cover

          </button>

        ) : null}

      </div>



      <div className="px-5 pb-6 pt-2 sm:px-8 sm:pb-8">

        <div className="relative -mt-10 flex flex-wrap items-end gap-4 sm:-mt-12 sm:gap-6">

          <div className="rounded-full border-2 border-white ">

            <Avatar src={avatar} name={name} size="xl" />

          </div>

          <div className="flex min-w-[220px]  flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div className="space-y-1">

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl   font-semibold text-slate-900 sm:text-3xl">{name || 'Alumni Name'}</h1>

              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">

                {department && <span>{department}</span>}

                {department && role && <span>•</span>}

                {role && <span>{role}</span>}

                {isStudent && currentYear && (

                  <>

                    {role && <span>•</span>}

                    <span> {currentYear}</span>

                  </>

                )}

                {isAlumni && passoutYear && (

                  <>

                    {role && <span>•</span>}

                    <span>Class of {passoutYear}</span>

                  </>

                )}

              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">

                {/* Connection Count - Clickable */}
                <button
                  onClick={handleConnectionsClick}
                  disabled={connectionStatus !== 'connected'}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                    connectionStatus === 'connected'
                      ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer'
                      : 'text-slate-300 cursor-not-allowed'
                  }`}
                  title={connectionStatus === 'connected' ? 'View connections' : 'Connect to view connections'}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M16 8a6 6 0 016 6v7a6 6 0 01-6 6H6a6 6 0 01-6-6V8a6 6 0 016-6zM12 2v6M9 4h6" />
                  </svg>
                  <span>Connections: {connectionCount}</span>
                  {connectionStatus === 'connected' && (
                    <span className="text-xs text-primary">(click to view)</span>
                  )}
                </button>

                {location ? (
                  <span className="inline-flex items-center gap-1 text-slate-500">

                    <LocationIcon className="h-4 w-4" />

                    {location}

                  </span>

                ) : null}

              </div>

            </div>

          <div className="flex items-center gap-2">

            {showConnectButtons && (
              <>
                {/* Show Connect button for students and alumni only, hide if already connected */}
                {(isStudent || isAlumni) && connectionStatus !== 'connected' && (
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={loading || connectionStatus === 'pending'}
                    className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] shadow transition ${
                      connectionStatus === 'pending' 
                        ? 'border-slate-300 text-slate-400 cursor-not-allowed' 
                        : 'border-primary text-primary hover:bg-primary hover:text-white'
                    }`}
                  >
                    {loading ? 'Sending...' : 
                     connectionStatus === 'pending' ? 'Pending' : 'Connect'}
                  </button>
                )}

                {/* Show "Connected" status for students and alumni when connected */}
                {(isStudent || isAlumni) && connectionStatus === 'connected' && (
                  <div className="inline-flex items-center justify-center rounded-full border border-green-500 bg-green-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-green-600 shadow">
                    Connected
                  </div>
                )}

                {user && targetId && user.id !== targetId && (
                  <button
                    type="button"
                    onClick={handleMessageClick}
                    className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow transition hover:bg-primary-dark"
                  >
                    Message
                  </button>
                )}
              </>
            )}

            {onEditSection && (
              <button
                type="button"
                onClick={() => onEditSection('summary')}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow transition hover:bg-primary-dark"
              >
                Edit Profile Info
              </button>
            )}

          </div>

          </div>

        </div>

      </div>

      <ChatModal
        isOpen={chatModal.isOpen}
        onClose={chatModal.closeModal}
        recipient={{ _id: targetId, role: targetRole, name }}
        onViewAllMessages={handleViewAllMessages}
      />

      {/* Connections Popup Modal */}
      {showConnectionsPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  {name}'s Connections ({connectionsList.length})
                </h3>
                <button
                  onClick={() => setShowConnectionsPopup(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {connectionsList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500">No connections found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {connectionsList.map((connection) => {
                    // Get the connected user from fetched data
                    const connectedUser = connection.connectedUser
                    
                    if (!connectedUser) return null
                    
                    return (
                      <div 
                        key={connection._id} 
                        className="flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {connectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <h4 
                            className="font-semibold text-slate-900 cursor-pointer hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowConnectionsPopup(false)
                              // Navigate to connected user's profile
                              window.location.href = `/directory/profile/${connectedUser._id}`
                            }}
                          >
                            {connectedUser.name}
                          </h4>
                          <p className="text-sm text-slate-600">{connectedUser.role}</p>
                          {connectedUser.department && (
                            <p className="text-xs text-slate-500">{connectedUser.department}</p>
                          )}
                        </div>
                        <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>

  )

}



const LocationIcon = (props) => (

  <svg

    viewBox="0 0 24 24"

    fill="none"

    stroke="currentColor"

    strokeWidth="1.8"

    strokeLinecap="round"

    strokeLinejoin="round"

    {...props}

  >

    <path d="M21 10c0 5.5-9 13-9 13S3 15.5 3 10a9 9 0 1118 0z" />

    <circle cx="12" cy="10" r="3" />

  </svg>

)



export default ProfileHeader

