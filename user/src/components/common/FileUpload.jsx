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
                <p className="text-sm font-medium text-slate-700">Uploading image...</p>
                <p className="text-xs text-slate-500">Please wait</p>
              </div>
            </div>
          ) : (
            children || (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {multiple ? 'Drop files here or click to upload' : 'Drop file here or click to upload'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {accept.includes('image') && accept.includes('pdf') 
                      ? 'Images and PDFs up to 5MB'
                      : accept.includes('image') 
                        ? 'Images up to 5MB'
                        : 'PDFs up to 5MB'
                    }
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                {uploadedFile.fileType?.startsWith('image/') ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{uploadedFile.fileName || uploadedFile.file_name}</p>
                <p className="text-xs text-slate-500">
                  {uploadedFile.fileType || uploadedFile.file_type} • {Math.round((uploadedFile.size || uploadedFile.size_bytes) / 1024)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-slate-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {showLocation && (
            <div className="mt-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                <span>Location (Optional)</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => onLocationChange?.(e.target.value)}
                  placeholder="e.g. New York, NY or Online"
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}

export default FileUpload
