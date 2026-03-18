import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import Avatar from '../../ui/Avatar'

import { useAuth } from '../../../context/AuthContext'

import useModal from '../../../hooks/useModal'

import ChatModal from '../directory/ChatModal'

import toast from 'react-hot-toast'

const ProfileHeader = ({ profile = {}, onEditSection, showConnectButtons = false }) => {

  const { user } = useAuth()

  const chatModal = useModal(false)

  const conversationIdRef = useRef(null)

  const [connectionStatus, setConnectionStatus] = useState('not_connected')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const { name, title, location, avatar, cover, raw } = profile

  const targetId = raw?._id ?? profile?._id ?? profile?.id

  const targetRole = raw?.role ?? profile?.role

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/send-connection-request`, {
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

  // Check if already connected when component loads
  useEffect(() => {
    const checkConnectionStatus = async () => {
      if (!user || !targetId) return
      
      try {
        console.log('🔍 Checking connection status for user:', user.id, 'target:', targetId)
        
        // Check if there's a pending request
        const requestsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/requests`, {
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
        const connectionsResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/my-connections`, {
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
  }, [user, targetId])

  const handleMessageClick = () => {
    if (!user || !targetId) return

    // Navigate to Connections page with Messages tab active and user info to start chat
    navigate('/dashboard/connections?tab=messages&userId=' + targetId, { 
      state: { 
        userName: name,
        userRole: role,
        userAvatar: avatar,
        userDepartment: department
      }
    })
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

                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{name || 'Alumni Name'}</h1>

              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">

                {department && <span>{department}</span>}

                {department && role && <span>•</span>}

                {role && <span>{role}</span>}

                {isStudent && currentYear && (

                  <>

                    {role && <span>•</span>}

                    <span>Year {currentYear}</span>

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

