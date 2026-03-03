import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import useGallery from '../hooks/useGallery'
import Lightbox from '../components/gallery/Lightbox'
import UploadModal from '../components/gallery/UploadModal'

const Gallery = () => {
  const { user } = useAuth()
  const { 
    images, 
    loading, 
    error, 
    fetchAllImages,
    refetchImages
  } = useGallery()
  
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isLightboxOpen, setLightboxOpen] = useState(false)
  const [isUploadModalOpen, setUploadModalOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  const handleOpen = (image) => {
    const index = images.findIndex((img) => img._id === image._id)
    setLightboxIndex(index === -1 ? 0 : index)
    setLightboxOpen(true)
  }

  const handleUploadSuccess = () => {
    refetchImages()
  }

  // Load all images on component mount
  useEffect(() => {
    fetchAllImages()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery</h1>
            <p className="text-gray-600 mt-1">Explore moments from our campus life</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upload Images
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-600">Error loading images: {error}</p>
          </div>
        )}

        {/* Images Grid */}
        {!loading && !error && (
          <>
            {images.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No images found</h3>
                <p className="text-gray-500">No images available in the gallery</p>
                {isAdmin && (
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upload First Images
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {images.map((image) => (
                  <div
                    key={image._id}
                    onClick={() => handleOpen(image)}
                    className="group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={image.imageUrl}
                        alt={image.imageName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lightbox */}
      <Lightbox
        images={images.map(img => ({ url: img.imageUrl, alt: img.imageName }))}
        startIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Upload Modal */}
      {isAdmin && (
        <UploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  )
}

export default Gallery
