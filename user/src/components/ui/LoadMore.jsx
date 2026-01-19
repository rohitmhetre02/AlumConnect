import { useEffect, useState } from 'react'

const baseClass =
  'relative mx-auto flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60'

const Spinner = () => (
  <span className="inline-flex items-center gap-2">
    <span
      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
      aria-hidden="true"
    />
    Loading...
  </span>
)

const LoadMore = ({ isLoading = false, disabled = false, onClick, children = 'Load More' }) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <button
      type="button"
      className={`${baseClass} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? <Spinner /> : children}
    </button>
  )
}

export default LoadMore
