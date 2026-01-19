const cloudinary = require('cloudinary').v2
const multer = require('multer')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure Multer for memory storage
const storage = multer.memoryStorage()

// File filter function
const fileFilter = (_req, file, cb) => {
  try {
    if (
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/') ||
      file.mimetype.startsWith('audio/') ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/vnd.ms-powerpoint' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'text/plain'
    ) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type.'), false)
    }
  } catch (error) {
    cb(error, false)
  }
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: fileFilter,
})

// Upload function for Cloudinary
const uploadToCloudinary = async (file, folder = 'Alumni') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto', // Auto-detect file type
      use_filename: true,
      unique_filename: true,
    }

    // Add upload preset if available
    if (process.env.CLOUDINARY_UPLOAD_PRESET) {
      uploadOptions.upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            size: result.bytes,
            resource_type: result.resource_type,
          })
        }
      }
    ).end(file.buffer)
  })
}

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}

// Get file info from Cloudinary URL
const getFileInfo = (url) => {
  if (!url) return null
  
  try {
    const urlParts = url.split('/')
    const filenameWithExtension = urlParts[urlParts.length - 1]
    const [publicId, format] = filenameWithExtension.split('.')
    
    return {
      publicId: publicId,
      format: format,
      url: url,
    }
  } catch (error) {
    return null
  }
}

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  getFileInfo,
}
