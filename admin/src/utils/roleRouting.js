// Utility functions for role-based routing

export const getBasePath = (role) => {
  return role === 'admin' ? '/admin' : '/coordinator'
}

export const getRoleFromStorage = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('userRole') || 'admin'
  }
  return 'admin'
}

export const generateRoutePath = (path, role) => {
  const basePath = getBasePath(role)
  return `${basePath}${path}`
}

export const getCurrentBasePath = () => {
  const role = getRoleFromStorage()
  return getBasePath(role)
}

export const isCoordinator = () => {
  return getRoleFromStorage() === 'coordinator'
}

export const isAdmin = () => {
  return getRoleFromStorage() === 'admin'
}
