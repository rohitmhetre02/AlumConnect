import { post } from './api'

// Upload single file
export const uploadFile = async (file, type = 'general') => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await post(`/upload/upload?type=${type}`, formData, {
      includeAuth: true,
      // Don't set any fetchOptions to avoid header conflicts
    })

    return response.data
  } catch (error) {
    throw new Error(error.message || 'Upload failed')
  }
}

// Upload multiple files
export const uploadMultipleFiles = async (files) => {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })

  try {
    const response = await post('/upload/upload-multiple', formData, {
      includeAuth: true,
      // Don't set any fetchOptions to avoid header conflicts
    })

    return response.data
  } catch (error) {
    throw new Error(error.message || 'Upload failed')
  }
}

// Upload profile image
export const uploadProfileImage = async (file) => {
  return uploadFile(file, 'profile')
}

// Upload cover image
export const uploadCoverImage = async (file) => {
  return uploadFile(file, 'cover')
}

// Upload certification file
export const uploadCertificationFile = async (file) => {
  return uploadFile(file, 'certification')
}

// Validate file type
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) => {
  return allowedTypes.includes(file.type)
}

// Validate file size (max 5MB)
export const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => {
  return file.size <= maxSize
}

// Get file type category
export const getFileTypeCategory = (file) => {
  if (file.type.startsWith('image/')) {
    return 'image'
  } else if (file.type === 'application/pdf') {
    return 'pdf'
  }
  return 'other'
}

// Format file size for display
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
