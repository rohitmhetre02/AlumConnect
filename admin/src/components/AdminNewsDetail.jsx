import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import useToast from '../hooks/useToast'
import useNews from '../hooks/useNews'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80'

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

const formatRole = (role) => {
  if (!role) return ''
  const str = role.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const AdminNewsDetail = () => {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()

  const { data, loading, error } = useNews(articleId)

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
          Loading article...
        </div>
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="grid min-h-[40vh] place-items-center rounded-4xl border border-rose-200 bg-rose-50 p-12 text-center text-sm text-rose-600">
        <div>
          <h2 className="text-lg font-semibold text-rose-700">Article unavailable</h2>
          <p className="mt-2">{error?.message ?? 'We couldn\'t find the article you\'re looking for.'}</p>
          <button
            onClick={() => navigate('/admin/news')}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-rose-700"
          >
            Return to News Management
          </button>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/admin/news')}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to News Management
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
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Created by {data.createdByName}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8 px-6 py-10 sm:px-12">
          {/* Article Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="font-semibold uppercase tracking-[0.3em] text-primary">{data.category || 'News'}</span>
            {publishedLabel && <span className="text-slate-400">•</span>}
            {publishedLabel && <span>{publishedLabel}</span>}
            {readingLabel && <span className="text-slate-400">•</span>}
            {readingLabel && <span>{readingLabel}</span>}
          </div>

          {/* Article Content */}
          <div className="max-w-4xl space-y-6">
            {paragraphs.length ? (
              paragraphs.map((paragraph, index) => (
                <p key={index} className="text-base text-slate-600 leading-relaxed">
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-base text-slate-600">No content available.</p>
            )}
          </div>

          {/* Additional details for admin view */}
          <div className="grid gap-6 rounded-2xl border border-slate-100 p-6 sm:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Article Details</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Article ID:</dt>
                  <dd className="font-medium text-slate-900">#{data.id || data._id}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Category:</dt>
                  <dd className="font-medium text-slate-900">{data.category || 'News'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Status:</dt>
                  <dd className="font-medium text-slate-900">{data.status || 'Published'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Reading Time:</dt>
                  <dd className="font-medium text-slate-900">{readingLabel || 'Not specified'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Created By</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Name:</dt>
                  <dd className="font-medium text-slate-900">{data.createdByName || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Role:</dt>
                  <dd className="font-medium text-slate-900">{formatRole(data.createdByRole) || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Created At:</dt>
                  <dd className="font-medium text-slate-900">
                    {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Published At:</dt>
                  <dd className="font-medium text-slate-900">
                    {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : '—'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

export default AdminNewsDetail
