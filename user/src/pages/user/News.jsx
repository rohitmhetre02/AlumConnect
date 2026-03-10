import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import LoadMore from '../../components/ui/LoadMore'
import NewsCard from '../../components/user/news/NewsCard'
import Skeleton, { SkeletonText } from '../../components/ui/Skeleton'

import { useAuth } from '../../context/AuthContext'
import useNews from '../../hooks/useNews'

const PAGE_SIZE = 6

const News = () => {

  const { role } = useAuth()
  const normalizedRole = role?.toLowerCase() ?? null

  const canPublish = normalizedRole === 'faculty'

  const { items, loading, error, refresh } = useNews()

  const navigate = useNavigate()

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const sortedArticles = useMemo(() => {
    return [...items].sort(
      (a, b) =>
        new Date(b.publishedAt || b.createdAt || 0) -
        new Date(a.publishedAt || a.createdAt || 0)
    )
  }, [items])

  const visibleArticles = useMemo(
    () => sortedArticles.slice(0, visibleCount),
    [sortedArticles, visibleCount]
  )

  const canLoadMore = visibleCount < sortedArticles.length

  const isInitialLoading = loading && items.length === 0

  useEffect(() => {
    setVisibleCount((prev) =>
      sortedArticles.length === 0
        ? PAGE_SIZE
        : Math.min(sortedArticles.length, Math.max(PAGE_SIZE, prev))
    )
  }, [sortedArticles.length])

  const handleLoadMore = () => {
    if (loading || !canLoadMore) return
    setVisibleCount((prev) =>
      Math.min(sortedArticles.length, prev + PAGE_SIZE)
    )
  }

  return (
    <div className="space-y-10">

      {/* Header */}

      <header className="text-center py-6">

        <h1 className="text-3xl font-bold text-slate-900">
          University News & Updates
        </h1>

        {canPublish && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/dashboard/news/create')}
              className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Publish Faculty Story
            </button>
          </div>
        )}

      </header>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600">
          <p>{error.message ?? 'Unable to load news right now.'}</p>
          <button
            type="button"
            onClick={refresh}
            className="rounded-full border border-rose-400 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-rose-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}

      {isInitialLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {Array.from({ length: PAGE_SIZE }).map((_, index) => (

            <div
              key={index}
              className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm"
            >

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

          <h3 className="text-lg font-semibold text-slate-900">
            No stories yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            When faculty publish news, it will appear here.
          </p>

        </div>

      )}

      {/* Load More */}

      {canLoadMore ? (

        <LoadMore
          isLoading={loading}
          disabled={loading}
          onClick={handleLoadMore}
        >
          Load More Stories
        </LoadMore>

      ) : visibleArticles.length ? (

        <p className="text-center text-sm text-slate-500">
          You’re caught up on the latest stories ✨
        </p>

      ) : null}

    </div>
  )
}

export default News