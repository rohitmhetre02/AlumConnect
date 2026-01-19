import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Directory', path: '/directory' },
  { label: 'Events', path: '/events' },
  { label: 'Mentorship', path: '/mentorship' },
  { label: 'Gallery', path: '/gallery' },
]

const NavLinks = ({ onNavigate }) => (
  <>
    {navLinks.map((link) => (
      <NavLink
        key={link.path}
        to={link.path}
        onClick={onNavigate}
        className={({ isActive }) =>
          `text-sm font-medium tracking-tight transition duration-150 ${
            isActive
              ? 'text-primary underline decoration-2 underline-offset-8'
              : 'text-slate-500 hover:text-slate-900'
          }`
        }
        aria-label={link.label}
      >
        {link.label}
      </NavLink>
    ))}
  </>
)

const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => setIsOpen((prev) => !prev)
  const closeMenu = () => setIsOpen(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8" role="navigation" aria-label="Primary">
        <Link to="/" className="flex items-center gap-3" aria-label="AlumConnect home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary text-lg font-bold text-white">A</span>
          <span className="text-lg font-semibold text-slate-900">AlumConnect</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLinks />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
        >
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-900">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 bg-white/95 px-6 py-4 shadow-sm md:hidden">
          <nav className="flex flex-col gap-4" role="navigation" aria-label="Mobile primary">
            <NavLinks onNavigate={closeMenu} />
            <div className="mt-4 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={closeMenu}
                className="rounded-full border border-slate-200 px-5 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={closeMenu}
                className="rounded-full bg-primary px-5 py-2 text-center text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default PublicNavbar
