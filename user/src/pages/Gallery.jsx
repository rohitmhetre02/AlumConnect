import { useState } from 'react'
import PublicGalleryImage from '../components/gallery/PublicGalleryImage'
import Lightbox from '../components/gallery/Lightbox'

const galleryImages = [
  {
    url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop&q=80',
    alt: 'Students collaborating during a hackathon',
  },
  {
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80',
    alt: 'Panel discussion at alumni event',
  },
  {
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    alt: 'Networking session at university hall',
  },
  {
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    alt: 'Coding workshop with mentors',
  },
  {
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80&sat=-50',
    alt: 'Student presenting project on stage',
  },
  {
    url: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=1200&auto=format&fit=crop&q=80',
    alt: 'Outdoor alumni meetup',
  },
]

const Gallery = () => {
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [isLightboxOpen, setLightboxOpen] = useState(false)

  const handleOpen = (image) => {
    const index = galleryImages.findIndex((item) => item.url === image.url)
    setLightboxIndex(index === -1 ? 0 : index)
    setLightboxOpen(true)
  }

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Highlights</p>
          <h1 className="text-4xl font-bold text-slate-900">Gallery</h1>
          <p className="text-slate-500">Moments from our community of students, alumni, and faculty.</p>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {galleryImages.map((image) => (
          <PublicGalleryImage key={image.url} image={image} onOpen={handleOpen} />
        ))}
      </section>

      <Lightbox
        images={galleryImages}
        startIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}

export default Gallery
