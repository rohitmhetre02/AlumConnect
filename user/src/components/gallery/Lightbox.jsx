import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const Lightbox = ({ images = [], startIndex = 0, isOpen = false, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex)

  useEffect(() => {
    if (!isOpen) return
    setCurrentIndex(startIndex)
  }, [isOpen, startIndex])

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose?.()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPrevious()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, isOpen, onClose])

  if (!isOpen || !images.length || typeof document === 'undefined') {
    return null
  }

  const currentImage = images[currentIndex]

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 px-6 py-8"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropClick}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full bg-white/90 text-slate-700 shadow-lg transition hover:bg-white"
        aria-label="Close image viewer"
      >
        <span className="text-2xl font-semibold">×</span>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white"
            aria-label="View previous image"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white"
            aria-label="View next image"
          >
            ›
          </button>
        </>
      )}

      <div className="max-w-5xl w-full scale-100 opacity-100 transition-all duration-300">
        <img
          src={currentImage.url}
          alt={currentImage.alt}
          className="max-h-[80vh] w-full rounded-3xl object-contain shadow-2xl"
        />
        {currentImage.alt && (
          <p className="mt-4 text-center text-sm text-slate-200">{currentImage.alt}</p>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default Lightbox
