import { useState } from 'react'

const galleryItems = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1502720705749-3c92562f09c8?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
]

const Gallery = () => {
  const [activeIndex, setActiveIndex] = useState(null)
  const activeImage = activeIndex === null ? null : galleryItems[activeIndex]

  const showNext = () => {
    setActiveIndex((prev) => {
      if (prev === null) return prev
      return (prev + 1) % galleryItems.length
    })
  }

  const showPrevious = () => {
    setActiveIndex((prev) => {
      if (prev === null) return prev
      return (prev - 1 + galleryItems.length) % galleryItems.length
    })
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Gallery</h1>
        <p className="text-sm text-slate-500">Highlights from recent alumni and student events.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <div key={item} className="group relative overflow-hidden rounded-3xl">
            <img
              src={item}
              alt={`Gallery item ${index + 1}`}
              className="h-56 w-full cursor-pointer object-cover transition duration-300 group-hover:scale-105"
              onClick={() => setActiveIndex(index)}
            />
            <a
              href={item}
              download
              onClick={(event) => event.stopPropagation()}
              className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-white/90 p-2 text-slate-600 shadow-sm backdrop-blur transition hover:text-primary"
              aria-label="Download image"
            >
              <DownloadIcon className="h-4 w-4" />
            </a>
          </div>
        ))}
      </div>

      {activeImage && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/65 backdrop-blur">
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden
            style={{
              background:
                'radial-gradient(circle at center, rgba(255,255,255,0.18) 0%, rgba(15,23,42,0.78) 60%, rgba(15,23,42,0.92) 100%)',
            }}
          />
          <button
            type="button"
            className="absolute right-8 top-8 rounded-full border border-slate-200 p-2 text-slate-100 transition hover:border-primary hover:text-primary"
            onClick={() => setActiveIndex(null)}
            aria-label="Close preview"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={showPrevious}
            className="absolute left-10 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white hover:text-primary"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <div className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-3xl border border-white/30 bg-white/10 p-3 shadow-2xl backdrop-blur-lg">
            <a
              href={activeImage}
              download
              className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white/90 p-2 text-slate-600 shadow-md transition hover:bg-white hover:text-primary"
              aria-label="Download image"
            >
              <DownloadIcon className="h-4 w-4" />
            </a>
            <img src={activeImage} alt="Selected gallery item" className="max-h-[80vh] w-full rounded-2xl object-cover" />
          </div>
          <button
            type="button"
            onClick={showNext}
            className="absolute right-10 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-3 text-slate-700 shadow-lg transition hover:bg-white hover:text-primary"
            aria-label="Next image"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

const DownloadIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)

const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const ChevronLeftIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const ChevronRightIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

export default Gallery
