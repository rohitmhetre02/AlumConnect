export const loadUserFromStorage = () => {
  if (typeof window === 'undefined') return null
  try {
    const saved = window.localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to load user from storage', error)
    return null
  }
}
