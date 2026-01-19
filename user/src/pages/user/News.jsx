import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadMore from '../../components/ui/LoadMore'
import NewsCard from '../../components/user/news/NewsCard'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import useNews from '../../hooks/useNews'

const PAGE_SIZE = 6

const News = () => {
  const { role } = useAuth()
  const addToast = useToast()
  const normalizedRole = role?.toLowerCase() ?? null
  const canPublish = normalizedRole === 'faculty'

  const { items, loading, error, refresh } = useNews()
  const navigate = useNavigate()

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const sortedArticles = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0))
  }, [items])

  const visibleArticles = useMemo(() => sortedArticles.slice(0, visibleCount), [sortedArticles, visibleCount])
  const canLoadMore = visibleCount < sortedArticles.length
  const isInitialLoading = loading && items.length === 0

  useEffect(() => {
    setVisibleCount((prev) => (sortedArticles.length === 0 ? PAGE_SIZE : Math.min(sortedArticles.length, Math.max(PAGE_SIZE, prev))))
  }, [sortedArticles.length])

  const handleLoadMore = () => {
    if (loading || !canLoadMore) return
    setVisibleCount((prev) => Math.min(sortedArticles.length, prev + PAGE_SIZE))
  }

  return (
    <div className="space-y-10">
      <section className="rounded-4xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-soft sm:p-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">Faculty Newsroom</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">University News & Updates</h1>
            <p className="text-sm text-white/80 sm:text-base">
              Stay informed with the latest announcements, achievements, and stories curated by faculty members for our alumni community.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-white/70">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Weekly Highlights
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                Faculty Verified
              </span>
            </div>
          </div>
          {canPublish && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/news/create')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-primary shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Publish Faculty Story
            </button>
          )}
        </div>
      </section>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <p>{error.message ?? 'Unable to load news right now.'}</p>
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:text-rose-700"
          >
            Retry
          </button>
        </div>
      )}

      {isInitialLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: PAGE_SIZE }).map((_, index) => (
            <div key={index} className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <SkeletonText lines={2} widths={['85%', '60%']} />
                <SkeletonText lines={1} widths={['40%']} />
              </div>
            </div>
          ))}
        </div>
      ) : visibleArticles.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-slate-900">No stories yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            When faculty publish news, it will appear here. {canPublish ? 'Share your first story!' : ''}
          </p>
        </div>
      )}

      {canLoadMore ? (
        <LoadMore isLoading={loading} disabled={loading} onClick={handleLoadMore}>
          Load More Stories
        </LoadMore>
      ) : visibleArticles.length ? (
        <p className="text-center text-sm text-slate-500">You’re caught up on the latest stories ✨</p>
      ) : null}
    </div>
  )
}

const InputField = ({ label, type = 'text', value, onChange, placeholder, required, min, autoFocus }) => (
  <label className="block text-sm font-semibold text-slate-700">
    <span>{label}</span>
    <input
      type={type}
      min={min}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      autoFocus={autoFocus}
      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </label>
)

const TextareaField = ({ label, value, onChange, placeholder, rows = 3, required }) => (
  <label className="block text-sm font-semibold text-slate-700">
    <span>{label}</span>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  </label>
)

export default News
