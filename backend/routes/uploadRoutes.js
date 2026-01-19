const express = require('express')
const { upload, uploadToCloudinary } = require('../utils/cloudinaryUpload')
const authMiddleware = require('../middleware/authMiddleware')

const router = express.Router()

// Upload single file
router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    // Determine folder based on file type or query parameter
    let folder = 'Alumni'
    if (req.query.type === 'profile') {
      folder = 'profiles'
    } else if (req.query.type === 'cover') {
      folder = 'covers'
    } else if (req.query.type === 'certification') {
      folder = 'certifications'
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file, folder)

    res.status(200).json({
      success: true,
      data: {
        url: result.url,
        public_id: result.public_id,
        format: result.format,
        size: result.size,
        resource_type: result.resource_type,
        file_name: req.file.originalname,
        file_type: req.file.mimetype
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Upload failed'
    })
  }
})

// Upload multiple files (for certifications)
router.post('/upload-multiple', authMiddleware, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      })
    }

    const uploadPromises = req.files.map(file => 
      uploadToCloudinary(file, 'certifications')
    )

    const results = await Promise.all(uploadPromises)

    const uploadedFiles = results.map((result, index) => ({
      url: result.url,
      public_id: result.public_id,
      format: result.format,
      size: result.size,
      resource_type: result.resource_type,
      file_name: req.files[index].originalname,
      file_type: req.files[index].mimetype
    }))

    res.status(200).json({
      success: true,
      data: uploadedFiles
    })
  } catch (error) {
    console.error('Multiple upload error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Upload failed'
    })
  }
})

module.exports = router
