import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiList from '../hooks/useApiList'
import { api } from '../utils/api'
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
  const [isLoading, setIsLoading] = useState(false)
  const { data: newsItems, isLoading: dataLoading, error, refetch } = useApiList('/news')

  // Get user role from localStorage
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const userRole = adminUser.role ? adminUser.role.toString().toLowerCase() : 'admin'
  const isCoordinator = userRole === 'coordinator'

  const normalizedArticles = useMemo(() => {
    return newsItems.map((item) => ({
      id: item.id || item._id,
      title: item.title || 'Untitled',
      content: item.content || item.description || '',
      author: item.createdByName || item.author || '—',
      authorRole: item.createdByRole || item.authorRole || 'admin',
      date: formatDate(item.publishedAt || item.createdAt),
      category: item.category || 'General',
      status: item.status || 'published',
      views: item.views || 0,
      image: item.coverImage || item.imageUrl || null,
      department: item.department || 'All',
      featured: item.featured || false,
      tags: Array.isArray(item.tags) ? item.tags : [],
      excerpt: item.excerpt || (item.content ? item.content.substring(0, 150) + '...' : ''),
      postedBy: {
        name: item.createdByName || item.author || '—',
        role: formatRole(item.createdByRole || item.authorRole) || '',
      },
    }))
  }, [newsItems])

  const filteredArticles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return normalizedArticles.filter((article) => {
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query) ||
        article.department.toLowerCase().includes(query) ||
        article.postedBy.name.toLowerCase().includes(query) ||
        article.postedBy.role.toLowerCase().includes(query)
      const matchesCategory = filterCategory === 'all' || article.category === filterCategory
      const matchesStatus = filterStatus === 'all' || article.status.toLowerCase() === filterStatus.toLowerCase()
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

  // Admin action handlers
  const handleStatusUpdate = async (id, newStatus) => {
    setIsLoading(true)
    try {
      await api.put(`/news/${id}`, { status: newStatus })
      await refetch()
      alert(`Article status updated to: ${newStatus}`)
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      setIsLoading(true)
      try {
        await api.delete(`/news/${id}`)
        await refetch()
        alert('Article deleted successfully')
      } catch (error) {
        console.error('Failed to delete:', error)
        alert('Failed to delete article. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }


  const handleToggleFeatured = async (id, featured) => {
    setIsLoading(true)
    try {
      await api.put(`/news/${id}`, { featured })
      await refetch()
      alert(`Article ${featured ? 'featured' : 'unfeatured'} successfully`)
    } catch (error) {
      console.error('Failed to update featured status:', error)
      alert('Failed to update featured status. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">News Management</h1>
            <p className="text-slate-600 mt-1">Manage news articles, announcements, and content updates.</p>
          </div>
          {!isCoordinator && (
            <button 
              onClick={() => navigate('/admin/news/create')}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-600/50"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Article
            </button>
          )}
        </div>
      </header>

      <section className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search articles by title, content, author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
                />
              </div>
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Article</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Author</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Posted Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">View</th>
                {!isCoordinator && (
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataLoading ? (
                <tr>
                  <td colSpan={isCoordinator ? 6 : 7} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      Loading articles...
                    </div>
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={isCoordinator ? 6 : 7} className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      <div>No articles found matching your criteria.</div>
                      {!isCoordinator && (
                        <button 
                          onClick={() => navigate('/admin/news/create')}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create First Article
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-slate-900 max-w-xs truncate">{article.title}</div>
                        {article.featured && (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                            ⭐ Featured
                          </span>
                        )}
                        {article.image && !article.image.startsWith('blob:') && (
                          <div className="mt-2">
                            <img 
                              src={article.image} 
                              alt={article.title}
                              className="h-16 w-24 object-cover rounded border border-slate-200"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{article.author}</div>
                        <div className="text-xs text-slate-500">{article.authorRole}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{article.date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(article.status)}`}>
                        {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/admin/news/${article.id}`)}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 transition-colors"
                        title="View Article Details"
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                    {!isCoordinator && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/admin/news/${article.id}/edit`)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                            title="Edit"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          
                          <div className="relative group">
                            <button
                              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              More
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            
                            <div className="absolute right-0 z-10 mt-1 w-48 bg-white rounded-lg border border-slate-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                              <div className="py-1">
                                <button
                                  onClick={() => handleDelete(article.id)}
                                  disabled={isLoading}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                                  </svg>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredArticles.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <div>Showing {filteredArticles.length} of {normalizedArticles.length} articles</div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>
        )}
      </section>
    </div>
  )
}

export default NewsManagement
