import { useState } from 'react'
import { post } from '../../utils/api'
import useToast from '../../hooks/useToast'

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const addToast = useToast()
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFiles(selectedFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      addToast({
        title: 'Missing Files',
        description: 'Please choose files to upload.',
        tone: 'error'
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('department', 'General')
      formData.append('folder', 'Gallery')
      
      files.forEach((file) => {
        formData.append('images', file)
      })

      const response = await post('gallery/upload', formData)

      if (response.success) {
        addToast({
          title: 'Upload Successful',
          description: `${files.length} images uploaded successfully!`,
          tone: 'success'
        })
        onSuccess()
        onClose()
        // Reset form
        setFiles([])
      } else {
        throw new Error(response.error || 'Upload failed')
      }
    } catch (error) {
      addToast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload images. Please try again.',
        tone: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      setFiles([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Upload Images</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Images
            </label>
            <div className="relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-primary-dark focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {files.length > 0 && (
              <p className="mt-2 text-xs text-slate-500">
                {files.length} file{files.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload Images'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadModal
