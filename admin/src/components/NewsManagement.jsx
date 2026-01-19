import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiList from '../hooks/useApiList'
import getStatusBadgeClass from '../utils/status'

const formatDate = (date) => {
  if (!date) return '—'
  const parsed = typeof date === 'string' ? new Date(date) : date
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatRole = (role) => {
  if (!role) return ''
  const str = role.toString().trim()
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const NewsManagement = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const { data: newsItems, isLoading, error } = useApiList('/news')

  const normalizedArticles = useMemo(() => {
    return newsItems.map((item) => ({
      id: item.id || item._id,
      title: item.title || 'Untitled',
      author: item.createdByName || '—',
      date: formatDate(item.publishedAt || item.createdAt),
      category: item.category || 'General',
      status: 'Published',
      views: 0,
      image: item.coverImage || null,
      postedBy: {
        name: item.createdByName || '—',
        role: formatRole(item.createdByRole) || '',
      },
    }))
  }, [newsItems])

  const filteredArticles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return normalizedArticles.filter((article) => {
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.postedBy.name.toLowerCase().includes(query) ||
        article.postedBy.role.toLowerCase().includes(query)
      const matchesCategory = filterCategory === 'all' || article.category === filterCategory
      const matchesStatus = filterStatus === 'all' || article.status === filterStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [normalizedArticles, searchTerm, filterCategory, filterStatus])

  const categoryOptions = useMemo(() => {
    const values = new Set()
    normalizedArticles.forEach((article) => {
      if (article.category) values.add(article.category)
    })
    return Array.from(values).sort()
  }, [normalizedArticles])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">News Management</h1>
        <p className="text-slate-600">Manage news articles, announcements, and content updates.</p>
      </header>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pl-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600/50"
            >
              <option value="all">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <button 
            onClick={() => navigate('/admin/news/create')}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/50"
          >
            Create Article
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-sm text-slate-500">Loading articles…</div>
          ) : filteredArticles.length === 0 ? (
            <div className="col-span-full text-center py-12 text-sm text-slate-500">
              No articles match the current filters.
            </div>
          ) : (
            filteredArticles.map((article) => (
              <div key={article.id} className="rounded-2xl border border-slate-100 bg-white shadow-soft transition hover:-translate-y-1 hover:border-red-600/20 hover:shadow-lg cursor-pointer"
                   onClick={() => navigate(`/admin/news/${article.id}`)}>
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-2xl overflow-hidden">
                  {article.image ? (
                    <img 
                      src={article.image} 
                      alt={`${article.title} cover`} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-4xl">
                      📰
                    </div>
                  )}
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass('active')}`}>
                      {article.category}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(article.status)}`}>
                      {article.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{article.title}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{article.author}</span>
                    <span>{article.date}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{article.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-slate-400 hover:text-slate-600 transition">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button className="text-slate-400 hover:text-red-600 transition">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <span className="text-xs uppercase tracking-wide text-slate-500">Posted By</span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{article.postedBy.name}</span>
                      {article.postedBy.role && (
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadgeClass('active')}`}>
                          {article.postedBy.role}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}
      </section>
    </div>
  )
}

export default NewsManagement
