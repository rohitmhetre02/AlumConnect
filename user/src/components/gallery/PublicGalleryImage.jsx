const PublicGalleryImage = ({ image, onOpen }) => {
  const { url, alt } = image

  return (
    <button
      type="button"
      onClick={() => onOpen(image)}
      className="group overflow-hidden rounded-3xl"
      aria-label={`Open image: ${alt}`}
    >
      <img
        src={url}
        alt={alt}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    </button>
  )
}

export default PublicGalleryImage
