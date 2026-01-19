import { get as apiGet } from './api'

const readEnv = (key) => {
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    const value = window.__ENV__[key]
    return typeof value === 'string' ? value.trim() : value
  }

  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    const value = import.meta.env[key]
    return typeof value === 'string' ? value.trim() : value
  }

  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    const value = process.env[key]
    return typeof value === 'string' ? value.trim() : value
  }

  return undefined
}

const resolveValue = (keys, fallback) => {
  for (const key of keys) {
    const value = readEnv(key)
    if (value) {
      return value
    }
  }
  return fallback
}

const normalizePresetKey = (presetKey) => {
  if (presetKey === 'avatar') return 'profile'
  return presetKey
}

const requestUploadSignature = async ({ type, folder } = {}) => {
  const params = new URLSearchParams()
  if (type) params.set('type', type)
  if (folder) params.set('folder', folder)

  const query = params.toString()
  const url = `/auth/profile/cloudinary/signature${query ? `?${query}` : ''}`
  const response = await apiGet(url, { fetchOptions: { cache: 'no-store' } })

  if (!response?.success) {
    throw new Error(response?.message || 'Unable to fetch Cloudinary signature.')
  }

  return response.data
}

export const getCloudinaryConfig = () => {
  const cloudName = resolveValue(['VITE_CLOUDINARY_CLOUD_NAME', 'REACT_APP_CLOUDINARY_CLOUD_NAME'])
  const defaultPreset = resolveValue(['VITE_CLOUDINARY_UPLOAD_PRESET', 'REACT_APP_CLOUDINARY_UPLOAD_PRESET'])
  const profilePreset = resolveValue(['VITE_CLOUDINARY_PROFILE_UPLOAD_PRESET', 'REACT_APP_CLOUDINARY_PROFILE_UPLOAD_PRESET'], defaultPreset)
  const coverPreset = resolveValue(['VITE_CLOUDINARY_COVER_UPLOAD_PRESET', 'REACT_APP_CLOUDINARY_COVER_UPLOAD_PRESET'], defaultPreset)

  return { cloudName, defaultPreset, profilePreset, coverPreset }
}

export const isCloudinaryConfigured = () => {
  const { cloudName, defaultPreset, profilePreset, coverPreset } = getCloudinaryConfig()
  return Boolean(cloudName && (defaultPreset || profilePreset || coverPreset))
}

export const uploadImageToCloudinary = async (file, { presetKey, uploadPreset, folder } = {}) => {
  if (!file) {
    throw new Error('No file provided for upload.')
  }

  const { cloudName, defaultPreset, profilePreset, coverPreset } = getCloudinaryConfig()
  const normalizedKey = normalizePresetKey(presetKey)

  let signatureData = null

  try {
    signatureData = await requestUploadSignature({ type: presetKey, folder })
  } catch (error) {
    if (error?.status) {
      throw error
    }

    if (error?.message?.includes('Cloudinary configuration')) {
      throw error
    }
  }

  const finalCloudName = signatureData?.cloudName || cloudName
  const finalFolder = signatureData?.folder || folder
  const resolvedPreset = signatureData?.uploadPreset
    || uploadPreset
    || (normalizedKey === 'profile' ? profilePreset : null)
    || (normalizedKey === 'cover' ? coverPreset : null)
    || defaultPreset

  if (!finalCloudName) {
    throw new Error('Cloudinary configuration is incomplete. Provide cloud name and API credentials.')
  }

  if (!resolvedPreset && !signatureData) {
    throw new Error('Cloudinary configuration is incomplete. Provide an upload preset.')
  }

  const formData = new FormData()
  formData.append('file', file)

  if (finalFolder) {
    formData.append('folder', finalFolder)
  }

  if (signatureData) {
    const { timestamp, signature, apiKey, uploadPreset: signedPreset } = signatureData
    if (!timestamp || !signature || !apiKey) {
      throw new Error('Cloudinary signature payload is incomplete.')
    }

    formData.append('timestamp', timestamp)
    formData.append('signature', signature)
    formData.append('api_key', apiKey)
    if (signedPreset || resolvedPreset) {
      formData.append('upload_preset', signedPreset || resolvedPreset)
    }
  } else if (resolvedPreset) {
    formData.append('upload_preset', resolvedPreset)
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${finalCloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = errorBody.error?.message || 'Failed to upload image to Cloudinary.'
    throw new Error(message)
  }

  return response.json()
}

export const checkCloudinaryAvailability = async (options = {}) => {
  try {
    await requestUploadSignature({ type: options.type ?? 'avatar', folder: options.folder })
    return true
  } catch (error) {
    if (isCloudinaryConfigured()) {
      return true
    }
    return false
  }
}
