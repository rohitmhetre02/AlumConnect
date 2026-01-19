import AuthCarousel from './AuthCarousel'

const AuthTemplate = ({ header, children, footer, align = 'start' }) => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f3f6fb]">
      <div className="absolute inset-0" aria-hidden="true">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),_transparent_55%)]" />
      </div>
      <div className="relative mx-auto flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_44px_110px_rgba(15,23,42,0.18)] ring-1 ring-slate-100/70 lg:flex-row">
          <AuthCarousel variant="mobile" className="rounded-t-[36px]" />
          <div className="flex w-full flex-col lg:flex-row">
            <AuthCarousel variant="desktop" className="rounded-l-[36px]" />
            <div
              className={`flex flex-1 flex-col justify-between px-6 py-8 sm:px-8 sm:py-10 lg:px-12 ${
                align === 'center' ? 'text-center lg:text-left' : ''
              }`}
            >
              <div className="space-y-8">
                {header}
                <div className="space-y-6">{children}</div>
              </div>
              {footer && <div className="pt-8 text-sm text-slate-500">{footer}</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AuthTemplate
