import { useState, useRef } from 'react'

const FileUpload = ({
  onFileSelect,
  onFileRemove,
  accept = 'image/*,application/pdf',
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  className = '',
  children,
  disabled = false,
  showLocation = false,
  onLocationChange,
  location = '',
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
      return false
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim())
    const isAllowed = allowedTypes.some(allowedType => {
      if (allowedType === 'image/*') {
        return file.type.startsWith('image/')
      } else if (allowedType === 'application/pdf') {
        return file.type === 'application/pdf'
      } else {
        return file.type === allowedType
      }
    })

    if (!isAllowed) {
      setError('Invalid file type. Only images and PDFs are allowed.')
      return false
    }

    return true
  }

  const handleFileSelect = async (files) => {
    setError('')
    setIsUploading(true)
    
    try {
      if (multiple) {
        const validFiles = Array.from(files).filter(validateFile)
        if (validFiles.length > 0) {
          await onFileSelect(validFiles)
        }
      } else {
        const file = files[0]
        if (file && validateFile(file)) {
          const result = await onFileSelect(file)
          if (result) {
            setUploadedFile(result)
          }
        }
      }
    } catch (error) {
      setError(error.message || 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (disabled) return
    
    setIsDragging(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleClick = (e) => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleInputChange = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileRemove?.()
  }

  return (
    <div className={className}>
      {!uploadedFile ? (
        <div
          className={`
            border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isUploading ? 'pointer-events-none' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Uploading...</p>
                <p className="text-xs text-slate-500">Please wait</p>
              </div>
            </div>
          ) : (
            children || (
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {multiple ? 'Upload files' : 'Upload file'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {accept.includes('image/*') && accept.includes('application/pdf') 
                      ? 'Images and PDFs up to ' + Math.round(maxSize / 1024 / 1024) + 'MB'
                      : accept.includes('image/*') 
                      ? 'Images up to ' + Math.round(maxSize / 1024 / 1024) + 'MB'
                      : 'Files up to ' + Math.round(maxSize / 1024 / 1024) + 'MB'
                    }
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {uploadedFile.file_name || 'File uploaded'}
                </p>
                <p className="text-xs text-slate-500">
                  {uploadedFile.file_type || 'Upload complete'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FileUpload
