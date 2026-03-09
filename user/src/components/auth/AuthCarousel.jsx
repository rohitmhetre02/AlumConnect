import { useEffect, useState } from 'react'
import heroOne from '../../assets/101.webp'
import heroTwo from '../../assets/102.webp'
import heroThree from '../../assets/103.webp'
import heroFour from '../../assets/104.webp'

const slides = [
  {
    image: heroOne,
    badge: 'Connect',
    title: 'Build your alumni network',
    description: 'Connect with fellow graduates, expand your professional network, and create lasting relationships.',
    accent: 'from alumni community',
    background: 'linear-gradient(180deg, #F8C531 0%, #F5951D 100%)',
  },
  {
    image: heroTwo,
    badge: 'Mentorship',
    title: 'Guide the next generation',
    description: 'Share your experience, mentor current students, and help shape future leaders in your field.',
    accent: 'guided by experience',
    background: 'linear-gradient(180deg, #2969FF 0%, #1A47C6 100%)',
  },
  {
    image: heroThree,
    badge: 'Opportunities',
    title: 'Discover career opportunities',
    description: 'Access exclusive job postings, career resources, and professional development opportunities.',
    accent: 'trusted by professionals',
    background: 'linear-gradient(180deg, #0B1F3A 0%, #102E5B 100%)',
  },
  {
    image: heroFour,
    badge: 'Events',
    title: 'Join alumni events',
    description: 'Attend reunions, networking events, workshops, and stay connected with your alma mater.',
    accent: 'crafted for you',
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

  const containerPadding = isDesktop ? 'px-7 py-4' : 'px-4 py-3 sm:px-6 sm:py-4'
  const imageHeight = isDesktop ? 'h-80' : 'h-56 sm:h-64'

  return (
    <aside
      className={`${containerClasses} relative flex-shrink-0 flex-col justify-between overflow-hidden text-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] ${containerPadding} ${className}`}
      style={{ background: activeSlide.background }}
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle at top, rgba(255,255,255,0.9) 0%, transparent 60%)' }}
      />
      <div className="relative z-20 flex items-center gap-3 pb-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-xs font-semibold uppercase text-slate-900 shadow-lg">
          AC
        </span>
        <div className="leading-tight">
          <p className="text-xs uppercase tracking-[0.35em] text-white/70">APCOER Alumni</p>
          <p className="text-sm font-semibold">Community</p>
        </div>
      </div>
      
      {/* Title at Very Top */}
      <div className="relative z-10 text-center mt-8">
        <h2 className="text-lg font-semibold leading-snug transition-opacity duration-700">
          {activeSlide.title}
        </h2>
      </div>
      
      {/* Image in Center - Much Larger */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        <div className="w-full rounded-2xl bg-white/20 p-3 shadow-lg transition-opacity duration-700">
          <img 
            src={activeSlide.image} 
            alt={activeSlide.badge} 
            className={`${imageHeight} w-full rounded-xl object-cover`}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className={`${imageHeight} w-full rounded-xl bg-white/10 flex items-center justify-center`} style={{display: 'none'}}>
            <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress indicators removed to save space */}
    </aside>
  )
}

export default AuthCarousel
