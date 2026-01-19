import { Link } from 'react-router-dom'

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80'

const resolveCoverImage = (coverImage) => {
  if (!coverImage) return FALLBACK_IMAGE
  const trimmed = coverImage.trim()
  if (!trimmed || trimmed.startsWith('blob:')) return FALLBACK_IMAGE
  return trimmed
}

const NewsCard = ({ article }) => {
  const { id, title, category, excerpt, coverImage, readingTimeMinutes, publishedAt } = article
  const readingLabel = readingTimeMinutes ? `${readingTimeMinutes} min read` : 'Faculty update'
  const publishedLabel = formatDate(publishedAt)
  const resolvedCover = resolveCoverImage(coverImage)

  return (
    <Link
      to={`/dashboard/news/${id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={resolvedCover}
          alt={`${title} thumbnail`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
          <span>{category || 'Faculty'}</span>
          {publishedLabel && <span className="h-1 w-1 rounded-full bg-white/70" />}
          {publishedLabel && <span>{publishedLabel}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold leading-snug text-slate-900 transition group-hover:text-primary">
            {title}
          </h3>
          {excerpt && <p className="text-sm text-slate-500 line-clamp-3">{excerpt}</p>}
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l3 3" />
            </svg>
            {readingLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
            Read story
          </span>
        </div>
      </div>
      <span className="pointer-events-none absolute right-6 top-6 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-primary shadow-sm transition group-hover:bg-white">
        Faculty Desk
      </span>
    </Link>
  )
}

export default NewsCard
