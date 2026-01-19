import { useEffect, useState } from 'react'

const slides = [
  {
    image: null,
    badge: 'Management',
    title: 'Manage with confidence',
    description: 'Complete control over users, events, and platform settings.',
    accent: 'powered by admin',
    background: 'linear-gradient(180deg, #2563EB 0%, #1d4ed8 100%)',
    color: 'bg-blue-500'
  },
  {
    image: null,
    badge: 'Analytics',
    title: 'Data-driven insights',
    description: 'Comprehensive analytics and reporting for informed decisions.',
    accent: 'real-time data',
    background: 'linear-gradient(180deg, #0B1F3A 0%, #102E5B 100%)',
    color: 'bg-slate-700'
  },
  {
    image: null,
    badge: 'Security',
    title: 'Enterprise-grade security',
    description: 'Advanced security features to protect your platform and users.',
    accent: 'protected 24/7',
    background: 'linear-gradient(180deg, #21B573 0%, #0D8B5E 100%)',
    color: 'bg-green-600'
  },
  {
    image: null,
    badge: 'Control',
    title: 'Complete platform control',
    description: 'Customize settings, permissions, and platform configurations.',
    accent: 'full control',
    background: 'linear-gradient(180deg, #F8C531 0%, #F5951D 100%)',
    color: 'bg-amber-500'
  },
]

const SLIDE_DURATION = 4000

const AuthCarousel = ({ variant = 'desktop', className = '' }) => {
  const [index, setIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, SLIDE_DURATION)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    setIsVisible(false)
    const timeout = setTimeout(() => setIsVisible(true), 40)
    return () => clearTimeout(timeout)
  }, [index])

  const activeSlide = slides[index]
  const isDesktop = variant === 'desktop'

  const containerClasses = isDesktop
    ? 'hidden lg:flex lg:w-[45%]'
    : 'flex w-full lg:hidden'

  const containerPadding = isDesktop ? 'px-7 py-8' : 'px-4 py-6 sm:px-6 sm:py-7'
  const cardPadding = isDesktop ? 'px-6 py-7' : 'px-4 py-5 sm:px-5 sm:py-6'
  const cardMinHeight = isDesktop ? 'min-h-[320px]' : 'min-h-[260px]'
  const progressSpacing = isDesktop ? 'pt-5' : 'pt-4'

  return (
    <aside
      className={`${containerClasses} relative flex-shrink-0 flex-col justify-between overflow-hidden text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] ${containerPadding} ${className}`}
      style={{ background: activeSlide.background }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.9) 0%, transparent 60%)' }}
      />
      <div className="relative z-20 flex items-center gap-3 pb-8">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-lg font-semibold uppercase text-slate-900 shadow-lg">
          AC
        </span>
        <div className="leading-tight">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">AlumConnect</p>
          <p className="text-lg font-semibold">Admin Portal</p>
        </div>
      </div>
      <div
        className={`relative z-10 flex flex-col justify-between rounded-3xl bg-white/10 ${cardPadding} backdrop-blur ${cardMinHeight} transition-opacity duration-700 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          {activeSlide.badge}
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-snug">
            {activeSlide.title}
          </h2>
          <p className="text-sm text-white/80">{activeSlide.description}</p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#FFD166]">
            <span className="h-1 w-8 rounded-full bg-[#FFD166]" />
            {activeSlide.accent}
          </span>
        </div>
        <div className="mt-10 rounded-3xl bg-white/20 p-4 shadow-lg">
          <div className={`${activeSlide.color} h-36 w-full rounded-2xl flex items-center justify-center`}>
            <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className={`relative z-10 flex items-center gap-2 ${progressSpacing}`}>
        {slides.map((_, slideIndex) => (
          <span
            key={slideIndex}
            className={`h-1 w-full rounded-full transition ${slideIndex === index ? 'bg-[#FFD166]' : 'bg-white/30'}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </aside>
  )
}

export default AuthCarousel
