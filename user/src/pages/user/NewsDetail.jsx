import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

import { useNewsArticle } from '../../hooks/useNews'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80'

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

const NewsDetail = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const { data, loading, error } = useNewsArticle(articleId)

  const publishedLabel = useMemo(() => formatDate(data?.publishedAt ?? data?.createdAt), [data?.publishedAt, data?.createdAt])
  const readingLabel = data?.readingTimeMinutes ? `${data.readingTimeMinutes} min read` : ''
  const coverImage = data?.coverImage || FALLBACK_IMAGE

  const paragraphs = useMemo(() => {
    if (!data?.content) return []
    return data.content.split(/\n+/).map((piece) => piece.trim()).filter(Boolean)
  }, [data?.content])

  if (loading) {
    return (
      <section className="grid min-h-[60vh] place-items-center rounded-4xl bg-white shadow-soft">
        <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
          <span className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-primary/30 border-t-primary" />
          Loading faculty story…
        </div>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="grid min-h-[40vh] place-items-center rounded-4xl border border-rose-200 bg-rose-50 p-12 text-center text-sm text-rose-600">
        <div>
          <h2 className="text-lg font-semibold text-rose-700">Story unavailable</h2>
          <p className="mt-2">{error?.message ?? 'We couldn’t find the faculty update you’re looking for.'}</p>
          <Link
            to="/dashboard/news"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-700"
          >
            Return to Newsroom
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/dashboard/news')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Newsroom
      </button>

      {/* Article Content */}
      <article className="overflow-hidden rounded-4xl bg-white shadow-soft">
        <div className="relative">
          <img src={coverImage} alt={`${data.title} banner`} className="h-80 w-full object-cover sm:h-[28rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute left-0 right-0 bottom-0 px-6 pb-10 sm:px-12">
            <div className="max-w-4xl space-y-4 text-white">
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{data.title}</h1>
              {data.subtitle && <p className="text-sm text-white/80 sm:text-base">{data.subtitle}</p>}
              {data.createdByName && (
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Curated by {data.createdByName}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-10 sm:px-12">
          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold uppercase tracking-[0.3em] text-primary">{data.category || 'Faculty Desk'}</span>
            {publishedLabel && <span className="text-slate-400">•</span>}
            {publishedLabel && <span>{publishedLabel}</span>}
            {readingLabel && <span className="text-slate-400">•</span>}
            {readingLabel && <span>{readingLabel}</span>}
          </div>

          {/* Article Content */}
          <div className="max-w-4xl space-y-6">
            {paragraphs.length ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base leading-relaxed text-slate-600">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-600">{data.content}</p>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}

export default NewsDetail
