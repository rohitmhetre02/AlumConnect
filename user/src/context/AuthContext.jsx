import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadUserFromStorage } from '../utils/auth'
import { get, setAuthToken } from '../utils/api'
import {
  PROFILE_STATUS,
  normalizeProfileStatus,
  isProfileApproved,
} from '../utils/profileStatus'

const AuthContext = createContext(null)

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

export const buildDisplayName = (profile = {}, fallbackEmail = '') => {
  const firstName = profile.firstName?.trim() ?? ''
  const lastName = profile.lastName?.trim() ?? ''
  const combined = `${firstName} ${lastName}`.trim()
  if (combined) return combined
  if (profile.fullName?.trim()) return profile.fullName.trim()
  if (fallbackEmail) return fallbackEmail.split('@')[0]
  return ''
}

const enhanceUserWithProfile = async (userData) => {
  if (!userData?.token || !userData?.role) return userData

  try {
    const response = await get('/auth/profile/me')
    const profile = response?.data

    if (!profile) {
      return userData
    }

    const displayName = buildDisplayName(profile, profile.email ?? userData.email)

    const normalizedStatus = normalizeProfileStatus(profile.profileApprovalStatus)

    return {
      ...userData,
      email: profile.email ?? userData.email,
      firstName: profile.firstName?.trim() ?? userData.firstName,
      lastName: profile.lastName?.trim() ?? userData.lastName,
      name: displayName || userData.name,
      avatar: profile.avatar ?? userData.avatar,
      role: profile.role ?? userData.role,
      isProfileApproved: isProfileApproved(normalizedStatus),
      profileApprovalStatus: normalizedStatus,
      profile,
    }
  } catch (error) {
    console.error('Failed to enrich user with profile data:', error)
    return userData
  }
}

const persistUser = (userData) => {
  if (typeof window === 'undefined') return
  if (userData) {
    window.localStorage.setItem('user', JSON.stringify(userData))
  } else {
    window.localStorage.removeItem('user')
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => loadUserFromStorage())

  useEffect(() => {
    if (typeof window === 'undefined') return
    persistUser(user)
    setAuthToken(user?.token ?? null)
  }, [user])

  useEffect(() => {
    if (!user?.token) return
    if (user.profile || (user.firstName?.trim() && user.lastName?.trim()) || user.name) return

    let isMounted = true

    const hydrateUser = async () => {
      const enriched = await enhanceUserWithProfile(user)
      if (isMounted) {
        setUser(enriched)
        persistUser(enriched)
      }
    }

    hydrateUser()

    return () => {
      isMounted = false
    }
  }, [user])

  const login = useCallback(
    async (userData) => {
      const token = userData?.token ?? null
      setAuthToken(token)

      const enrichedUser = await enhanceUserWithProfile(userData)

      setUser(enrichedUser)
      persistUser(enrichedUser)
      navigate('/dashboard', { replace: true })
      return enrichedUser
    },
    [navigate]
  )

  const logout = useCallback(() => {
    setUser(null)
    persistUser(null)
    setAuthToken(null)
    navigate('/')
  }, [navigate])

  const updateUser = useCallback((updates) => {
    if (!updates) return
    setUser((prev) => {
      if (!prev) return prev
      const mergedProfile = {
        ...(prev.profile ?? {}),
        ...(updates.profile ?? {}),
      }
      const profileApprovalStatus = updates.profileApprovalStatus
        ? normalizeProfileStatus(updates.profileApprovalStatus)
        : normalizeProfileStatus(prev.profileApprovalStatus ?? prev.profile?.profileApprovalStatus)
      const mergedUser = {
        ...prev,
        ...updates,
        profileApprovalStatus,
        isProfileApproved: isProfileApproved(profileApprovalStatus),
        profile: Object.keys(mergedProfile).length ? mergedProfile : prev.profile,
      }
      persistUser(mergedUser)
      return mergedUser
    })
  }, [])

  const demoLogin = (role) => {
    const normalizedRole = role.toLowerCase()
    const mockUser = {
      name: `Demo ${capitalize(normalizedRole)}`,
      email: `${normalizedRole}@demo.com`,
      role: normalizedRole,
    }
    setUser(mockUser)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('user', JSON.stringify(mockUser))
    }
    setAuthToken(null)
    navigate('/dashboard', { replace: true })
  }

  const value = useMemo(
    () => ({
      user,
      role: user?.role ?? null,
      login,
      logout,
      demoLogin,
      updateUser,
      profileStatus: normalizeProfileStatus(user?.profileApprovalStatus),
      isProfileApproved: isProfileApproved(user?.profileApprovalStatus),
    }),
    [user, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
