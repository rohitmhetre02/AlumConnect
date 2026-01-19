import React from 'react'
import { useAuth } from '../context/AuthContext'

const AuthDebug = () => {
  const { user } = useAuth()
  
  React.useEffect(() => {
    console.log('=== Auth Debug Info ===')
    console.log('User from context:', user)
    console.log('Token in localStorage:', localStorage.getItem('authToken'))
    console.log('User in localStorage:', JSON.parse(localStorage.getItem('user') || 'null'))
  }, [user])

  if (!user) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: '#ff6b6b', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px',
        zIndex: 9999
      }}>
        Not logged in! Please login first.
      </div>
    )
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#51cf66', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999
    }}>
      Logged in as: {user.email}
    </div>
  )
}

export default AuthDebug
