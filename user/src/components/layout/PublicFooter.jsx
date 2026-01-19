import { Link } from 'react-router-dom'

const quickLinks = [
  { label: 'About Us', path: '/about' },
  { label: 'Directory', path: '/directory' },
  { label: 'Careers', path: '/careers' },
]

const PublicFooter = () => {
  return (
    <footer className="mt-16 bg-[#0B1220] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3 text-xl font-semibold">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">A</span>
              AlumConnect
            </div>
            <p className="mt-4 text-sm text-white/70">
              Connecting generations of learners and leaders. Join our community to mentor, learn, and grow together.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Quick Links</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">Contact</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>unihub@alumconnect.edu</li>
              <li>+1 (555) 123-4567</li>
              <li>123 University Ave, City</li>
            </ul>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter"
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/60">
          © 2024 AlumConnect. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
