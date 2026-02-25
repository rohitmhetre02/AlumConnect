import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  FolderIcon, 
  PhotoIcon, 
  ArrowLeftIcon,
  CloudArrowUpIcon,
  TrashIcon,
  XMarkIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  AcademicCapIcon,
  UserGroupIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'

const Gallery = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { department: urlDepartment, folder: urlFolder } = useParams()
  const addToast = useToast()

  const [view, setView] = useState('departments') // departments, folders, images
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [departments, setDepartments] = useState([])
  const [folders, setFolders] = useState([])
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [availableDepartments, setAvailableDepartments] = useState([])

  // Department icons mapping
  const getDepartmentIcon = (dept) => {
    const iconMap = {
      'Civil Engineering': BuildingOfficeIcon,
      'Computer Engineering': AcademicCapIcon,
      'Information Technology': AcademicCapIcon,
      'Electronics & Telecommunication Engineering': AcademicCapIcon,
      'Mechanical Engineering': BriefcaseIcon,
      'Artificial Intelligence & Data Science': AcademicCapIcon,
      'Electronics Engineering (VLSI Design & Technology)': AcademicCapIcon,
      'Electronics & Communication (Advanced Communication Technology)': AcademicCapIcon
    }
    return iconMap[dept] || BuildingOfficeIcon
  }

  // Folder icons mapping
  const getFolderIcon = (folder) => {
    const iconMap = {
      'Events': CalendarIcon,
      'Campus': BuildingOfficeIcon,
      'Traditional Day': UserGroupIcon,
      'Alumni Meet': UserGroupIcon,
      'Industrial Visit': BriefcaseIcon
    }
    return iconMap[folder] || FolderIcon
  }

  // Load departments
  const loadDepartments = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/gallery/departments')
      const data = await response.json()
      
      if (data.success) {
        setDepartments(data.departments)
      } else {
        addToast?.({
          title: 'Error',
          description: data.error || 'Failed to load departments',
          tone: 'error'
        })
      }
    } catch (error) {
      addToast?.({
        title: 'Error',
        description: 'Failed to connect to server',
        tone: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Load folders for a department
  const loadFolders = async (department) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/gallery/${encodeURIComponent(department)}/folders`)
      const data = await response.json()
      
      if (data.success) {
        setFolders(data.folders)
        setSelectedDepartment(department)
        setView('folders')
      } else {
        addToast?.({
          title: 'Error',
          description: data.error || 'Failed to load folders',
          tone: 'error'
        })
      }
    } catch (error) {
      addToast?.({
        title: 'Error',
        description: 'Failed to connect to server',
        tone: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Load images for a folder
  const loadImages = async (department, folder) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/gallery/${encodeURIComponent(department)}/${encodeURIComponent(folder)}/images`)
      const data = await response.json()
      
      if (data.success) {
        setImages(data.images)
        setSelectedDepartment(department)
        setSelectedFolder(folder)
        setView('images')
      } else {
        addToast?.({
          title: 'Error',
          description: data.error || 'Failed to load images',
          tone: 'error'
        })
      }
    } catch (error) {
      addToast?.({
        title: 'Error',
        description: 'Failed to connect to server',
        tone: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // Load available departments for upload
  const loadAvailableDepartments = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('http://localhost:5000/api/gallery/upload/departments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setAvailableDepartments(data.departments)
      }
    } catch (error) {
      console.error('Failed to load available departments:', error)
    }
  }

  // Handle image upload
  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      addToast?.({
        title: 'Error',
        description: 'Please select at least one image',
        tone: 'error'
      })
      return
    }

    const department = document.getElementById('upload-department').value
    const folder = document.getElementById('upload-folder').value

    if (!department || !folder) {
      addToast?.({
        title: 'Error',
        description: 'Please select department and folder',
        tone: 'error'
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('department', department)
      formData.append('folder', folder)
      
      selectedImages.forEach(image => {
        formData.append('images', image)
      })

      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/gallery/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        addToast?.({
          title: 'Success',
          description: data.message,
          tone: 'success'
        })
        setUploadModalOpen(false)
        setSelectedImages([])
        
        // Refresh current view
        if (view === 'departments') {
          loadDepartments()
        } else if (view === 'folders') {
          loadFolders(selectedDepartment)
        } else if (view === 'images') {
          loadImages(selectedDepartment, selectedFolder)
        }
      } else {
        addToast?.({
          title: 'Error',
          description: data.error || 'Upload failed',
          tone: 'error'
        })
      }
    } catch (error) {
      addToast?.({
        title: 'Error',
        description: 'Upload failed',
        tone: 'error'
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle image deletion
  const handleDeleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/gallery/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (data.success) {
        addToast?.({
          title: 'Success',
          description: 'Image deleted successfully',
          tone: 'success'
        })
        loadImages(selectedDepartment, selectedFolder)
      } else {
        addToast?.({
          title: 'Error',
          description: data.error || 'Failed to delete image',
          tone: 'error'
        })
      }
    } catch (error) {
      addToast?.({
        title: 'Error',
        description: 'Failed to delete image',
        tone: 'error'
      })
    }
  }

  // Initialize
  useEffect(() => {
    if (urlDepartment && urlFolder) {
      loadImages(urlDepartment, urlFolder)
    } else if (urlDepartment) {
      loadFolders(urlDepartment)
    } else {
      loadDepartments()
    }

    // Load available departments for upload if user has permissions
    if (user?.role === 'admin' || user?.role === 'coordinator') {
      loadAvailableDepartments()
    }
  }, [urlDepartment, urlFolder])

  const canUpload = user?.role === 'admin' || user?.role === 'coordinator'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {view !== 'departments' && (
                <button
                  onClick={() => {
                    if (view === 'images') {
                      loadFolders(selectedDepartment)
                    } else if (view === 'folders') {
                      loadDepartments()
                    }
                  }}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
                <p className="text-gray-600 mt-1">
                  {view === 'departments' && 'Browse departments'}
                  {view === 'folders' && `${selectedDepartment}`}
                  {view === 'images' && `${selectedDepartment} / ${selectedFolder}`}
                </p>
              </div>
            </div>
            
            {canUpload && (
              <button
                onClick={() => setUploadModalOpen(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5" />
                <span>Upload Images</span>
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Departments View */}
        {view === 'departments' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {departments.map((dept) => {
              const Icon = getDepartmentIcon(dept.department)
              return (
                <div
                  key={dept.department}
                  onClick={() => loadFolders(dept.department)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{dept.department}</h3>
                  <p className="text-sm text-gray-600">{dept.imageCount} images</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Folders View */}
        {view === 'folders' && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {folders.map((folder) => {
              const Icon = getFolderIcon(folder.folder)
              return (
                <div
                  key={folder.folder}
                  onClick={() => loadImages(selectedDepartment, folder.folder)}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-green-600" />
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{folder.folder}</h3>
                  <p className="text-sm text-gray-600">{folder.imageCount} images</p>
                </div>
              )
            })}
          </div>
        )}

        {/* Images View */}
        {view === 'images' && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((image) => (
              <div key={image._id} className="relative group">
                <div
                  onClick={() => setPreviewImage(image)}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-95 transition-opacity"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.imageName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {canUpload && (
                  <button
                    onClick={() => handleDeleteImage(image._id)}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-white text-xs truncate">{image.imageName}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && ((view === 'departments' && departments.length === 0) ||
                     (view === 'folders' && folders.length === 0) ||
                     (view === 'images' && images.length === 0)) && (
          <div className="text-center py-12">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No images found</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Upload Images</h2>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  id="upload-department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  {availableDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Folder Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder
                </label>
                <select
                  id="upload-folder"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Folder</option>
                  <option value="Events">Events</option>
                  <option value="Campus">Campus</option>
                  <option value="Traditional Day">Traditional Day</option>
                  <option value="Alumni Meet">Alumni Meet</option>
                  <option value="Industrial Visit">Industrial Visit</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (Max 10 files, 10MB each)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setSelectedImages(Array.from(e.target.files))}
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
                      <div key={index} className="text-sm text-gray-600">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end space-x-3">
              <button
                onClick={() => setUploadModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage.imageUrl}
              alt={previewImage.imageName}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

    export default Gallery
