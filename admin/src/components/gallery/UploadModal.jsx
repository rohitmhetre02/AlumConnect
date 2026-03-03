import { useState, useRef } from 'react'
import { post } from '../../utils/api'
import useToast from '../../hooks/useToast'

const UploadModal = ({ isOpen, onClose, onSuccess, isAdmin = false }) => {
  const [selectedImages, setSelectedImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const addToast = useToast()

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== files.length) {
      addToast({
        type: 'warning',
        message: 'Some files were not images and were skipped'
      })
    }
    
    setSelectedImages(prev => [...prev, ...validFiles])
  }

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      addToast({
        type: 'error',
        message: 'Please select at least one image'
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('department', 'General')
      formData.append('folder', 'Gallery')
      
      selectedImages.forEach(image => {
        formData.append('images', image)
      })

      const response = await post('gallery/upload', formData)

      if (response.success) {
        addToast({
          type: 'success',
          message: `${selectedImages.length} images uploaded successfully`
        })
        onClose()
        setSelectedImages([])
        onSuccess()
      } else {
        addToast({
          type: 'error',
          message: response.error || 'Upload failed'
        })
      }
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Upload failed: ' + error.message
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (!uploading) {
      onClose()
      setSelectedImages([])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upload Images</h2>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Max 10 files, 10MB each)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Selected Files Preview */}
          {selectedImages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected Files ({selectedImages.length})
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedImages.map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    <button
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadModal
