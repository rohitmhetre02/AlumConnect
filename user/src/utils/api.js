const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const normalizePath = (path = '') => {
  if (!path) return ''
  const leading = path.startsWith('/') ? path : `/${path}`
  if (API_BASE_URL.endsWith('/api') && leading.startsWith('/api/')) {
    return leading.slice(4)
  }
  return leading
}

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.message || 'Something went wrong.'
    const error = new Error(message)
    error.status = response.status
    error.details = data
    throw error
  }
  return data
}

const buildOptions = (method, body, includeAuth = true, isFormData = false) => {
  const headers = {}

  // Only set Content-Type for non-FormData requests
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }

  if (includeAuth) {
    const token = getAuthToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const options = {
    method,
    headers,
  }

  if (body !== undefined) {
    options.body = isFormData ? body : JSON.stringify(body)
  }

  return options
}

export const get = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    ...buildOptions('GET', undefined, options.includeAuth !== false),
    ...options.fetchOptions,
  })

  return handleResponse(response)
}

export const post = async (path, body, options = {}) => {
  const isFormData = body instanceof FormData
  const builtOptions = buildOptions('POST', body, options.includeAuth !== false, isFormData)
  
  // Properly merge fetchOptions without overwriting headers
  const mergedOptions = {
    ...builtOptions,
    ...options.fetchOptions,
    headers: {
      ...builtOptions.headers,
      ...options.fetchOptions?.headers
    }
  }
  
  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, mergedOptions)
  return handleResponse(response)
}

export const put = async (path, body, options = {}) => {
  const isFormData = body instanceof FormData
  const builtOptions = buildOptions('PUT', body, options.includeAuth !== false, isFormData)
  
  // Properly merge fetchOptions without overwriting headers
  const mergedOptions = {
    ...builtOptions,
    ...options.fetchOptions,
    headers: {
      ...builtOptions.headers,
      ...options.fetchOptions?.headers
    }
  }

  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, mergedOptions)
  return handleResponse(response)
}

export const del = async (path, options = {}) => {
  const builtOptions = buildOptions('DELETE', undefined, options.includeAuth !== false)
  
  // Properly merge fetchOptions without overwriting headers
  const mergedOptions = {
    ...builtOptions,
    ...options.fetchOptions,
    headers: {
      ...builtOptions.headers,
      ...options.fetchOptions?.headers
    }
  }

  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, mergedOptions)
  return handleResponse(response)
}

export const setAuthToken = (token) => {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem('authToken', token)
  } else {
    window.localStorage.removeItem('authToken')
  }
}

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem('authToken')
}

export { API_BASE_URL }
