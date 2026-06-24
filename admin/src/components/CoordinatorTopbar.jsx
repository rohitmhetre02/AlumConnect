const CoordinatorTopbar = ({ onToggleSidebar }) => {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-primary/40 hover:text-primary lg:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <label className="relative hidden w-full max-w-lg sm:block">
          <span className="sr-only">Search</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search students, mentors, events..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-12 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
          />
        </label>
        <label className="relative flex-1 sm:hidden">
          <span className="sr-only">Search</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
          />
        </label>
      </div>
    </header>
  )
}

const IconBase = ({ children, className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
)

const SearchIcon = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </IconBase>
)

const MenuIcon = (props) => (
  <IconBase {...props}>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </IconBase>
)

export default CoordinatorTopbar
