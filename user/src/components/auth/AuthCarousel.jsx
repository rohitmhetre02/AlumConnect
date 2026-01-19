import { useEffect, useState } from 'react'
import heroOne from '../../assets/101.webp'
import heroTwo from '../../assets/102.webp'
import heroThree from '../../assets/103.webp'
import heroFour from '../../assets/104.webp'

const slides = [
  {
    image: heroOne,
    badge: 'Practice',
    title: 'Crack challenges with confidence',
    description: 'Mock interviews, coding sprints, and intensive prep to sharpen your skills.',
    accent: 'from peer champions',
    background: 'linear-gradient(180deg, #F8C531 0%, #F5951D 100%)',
  },
  {
    image: heroTwo,
    badge: 'Mentorship',
    title: 'Grow with expert mentors',
    description: '1:1 sessions, tailored roadmaps, and milestone tracking to keep you on course.',
    accent: 'guided by alumni',
    background: 'linear-gradient(180deg, #2969FF 0%, #1A47C6 100%)',
  },
  {
    image: heroThree,
    badge: 'Assessments',
    title: 'Hire and evaluate with ease',
    description: 'Advanced proctoring, video prompts, and real-time scoring for streamlined hiring.',
    accent: 'trusted by recruiters',
    background: 'linear-gradient(180deg, #0B1F3A 0%, #102E5B 100%)',
  },
  {
    image: heroFour,
    badge: 'Opportunities',
    title: 'Unlock internships & jobs',
    description: 'Curated openings, referral programs, and event invites tailored to your goals.',
    accent: 'handpicked for you',
    background: 'linear-gradient(180deg, #21B573 0%, #0D8B5E 100%)',
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
  const imageHeight = isDesktop ? 'h-36' : 'h-32 sm:h-40'
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
          <p className="text-lg font-semibold">Community</p>
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
          <img src={activeSlide.image} alt={activeSlide.badge} className={`${imageHeight} w-full rounded-2xl object-cover`} />
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
