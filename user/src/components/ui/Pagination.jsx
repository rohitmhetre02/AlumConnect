const buttonBase =
  'rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50'

const Pagination = ({ currentPage = 1, totalPages = 1, onPageChange }) => {
  if (!totalPages || totalPages <= 1) {
    return null
  }

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return
    onPageChange?.(page)
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        className={buttonBase}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {pages.map((page) => {
        const isActive = page === currentPage
        return (
          <button
            key={page}
            type="button"
            className={`${buttonBase} ${isActive ? 'border-primary bg-primary/5 text-primary shadow' : ''}`}
            onClick={() => handlePageChange(page)}
            aria-current={isActive ? 'page' : undefined}
          >
            {page}
          </button>
        )
      })}

      <button
        type="button"
        className={buttonBase}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination
