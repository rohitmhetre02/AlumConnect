import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useApiList from '../hooks/useApiList'
import getStatusBadgeClass from '../utils/status'
import { api } from '../utils/api'

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

const CoordinatorNewsReview = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [rejectModal, setRejectModal] = useState({ isOpen: false, articleId: null, remarks: '' })
  const [forwardModal, setForwardModal] = useState({ isOpen: false, articleId: null, remarks: '' })
  
  // Fetch pending news for coordinator's department
  const { data: newsItems, isLoading: dataLoading, error, refetch } = useApiList('/news/pending-review')

  const normalizedArticles = useMemo(() => {
    return newsItems.map((article) => ({
      id: article.id || article._id,
      title: article.title || 'Untitled Article',
      subtitle: article.subtitle || '',
      category: article.category || 'general',
      excerpt: article.excerpt || '',
      content: article.content || '',
      coverImage: article.coverImage || '',
      readingTimeMinutes: article.readingTimeMinutes || 4,
      createdAt: article.createdAt || null,
      updatedAt: article.updatedAt || null,
      createdBy: article.createdBy || '',
      createdByRole: article.createdByRole || '',
      createdByName: article.createdByName || '—',
      status: article.status || 'pending_review',
      department: article.department || '',
      approvalStatus: article.approvalStatus || 'pending',
      approvalRemarks: article.approvalRemarks || '',
      approvedBy: article.approvedBy || '',
      approvedAt: article.approvedAt || null,
      featured: article.featured || false,
      views: article.views || 0,
    }))
  }, [newsItems])

  const filteredArticles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return normalizedArticles.filter((article) => {
      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.subtitle.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.createdByName.toLowerCase().includes(query)

      const matchesCategory = filterCategory === 'all' || article.category === filterCategory

      return matchesSearch && matchesCategory
    })
  }, [normalizedArticles, searchTerm, filterCategory])

  // Action handlers
  const handleApprove = async (id) => {
    setIsLoading(true)
    try {
      await api.put(`/news/${id}/approve`, { remarks: 'Approved by department coordinator' })
      await refetch()
      alert('Article has been approved successfully.')
    } catch (error) {
      console.error('Failed to approve article:', error)
      alert('Failed to approve article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = (id) => {
    setRejectModal({ isOpen: true, articleId: id, remarks: '' })
  }

  const confirmReject = async () => {
    if (!rejectModal.remarks.trim()) {
      alert('Please provide remarks for rejection.')
      return
    }

    setIsLoading(true)
    try {
      await api.put(`/news/${rejectModal.articleId}/reject`, { remarks: rejectModal.remarks })
      await refetch()
      setRejectModal({ isOpen: false, articleId: null, remarks: '' })
      alert('Article has been rejected successfully.')
    } catch (error) {
      console.error('Failed to reject article:', error)
      alert('Failed to reject article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForward = (id) => {
    setForwardModal({ isOpen: true, articleId: id, remarks: '' })
  }

  const confirmForward = async () => {
    setIsLoading(true)
    try {
      await api.put(`/news/${forwardModal.articleId}/forward`, { remarks: forwardModal.remarks })
      await refetch()
      setForwardModal({ isOpen: false, articleId: null, remarks: '' })
      alert('Article has been forwarded to admin successfully.')
    } catch (error) {
      console.error('Failed to forward article:', error)
      alert('Failed to forward article. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredArticles.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredArticles.map(item => item.id)))
    }
  }

  const handleSelectItem = (id) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedItems(newSelected)
  }

  const handleBulkApprove = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one article')
      return
    }

    const confirmMessage = `Are you sure you want to approve ${selectedItems.size} article(s)?`
    if (!window.confirm(confirmMessage)) return

    setIsLoading(true)
    try {
      const promises = Array.from(selectedItems).map(id => 
        api.put(`/news/${id}/approve`, { remarks: 'Bulk approved by department coordinator' })
      )
      await Promise.all(promises)
      await refetch()
      setSelectedItems(new Set())
      alert(`Successfully approved ${selectedItems.size} article(s)`)
    } catch (error) {
      console.error('Failed to perform bulk approve:', error)
      alert('Failed to perform bulk approve. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedItems.size === 0) {
      alert('Please select at least one article')
      return
    }

    const remarks = prompt('Please provide remarks for bulk rejection:')
    if (!remarks || remarks.trim().length === 0) {
      alert('Remarks are required for rejection.')
      return
    }

    const confirmMessage = `Are you sure you want to reject ${selectedItems.size} article(s)?`
    if (!window.confirm(confirmMessage)) return

    setIsLoading(true)
    try {
      const promises = Array.from(selectedItems).map(id => 
        api.put(`/news/${id}/reject`, { remarks })
      )
      await Promise.all(promises)
      await refetch()
      setSelectedItems(new Set())
      alert(`Successfully rejected ${selectedItems.size} article(s)`)
    } catch (error) {
      console.error('Failed to perform bulk reject:', error)
      alert('Failed to perform bulk reject. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const categories = ['all', 'general', 'announcement', 'event', 'achievement', 'research', 'alumni', 'faculty', 'student']

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Department News Review</h1>
            <p className="text-slate-600 mt-1">Review and manage news articles submitted for your department approval.</p>
          </div>
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
                  placeholder="Search articles by title, author, content..."
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
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              {selectedItems.size > 0 && (
                <>
                  <button
                    onClick={handleBulkApprove}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Approve ({selectedItems.size})
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reject ({selectedItems.size})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === filteredArticles.length && filteredArticles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-600/50"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Article Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Author</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Submission Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Preview</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dataLoading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                      Loading articles...
                    </div>
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.707.293H19a2 2 0 012-2z" />
                      </svg>
                      <div>No pending articles found for your department.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(article.id)}
                        onChange={() => handleSelectItem(article.id)}
                        className="rounded border-slate-300 text-red-600 focus:ring-red-600/50"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-slate-900 truncate">{article.title}</div>
                        {article.subtitle && (
                          <div className="text-xs text-slate-500 truncate mt-1">{article.subtitle}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{article.createdByName}</div>
                        <div className="text-xs text-slate-500">{formatRole(article.createdByRole)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{formatDate(article.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-slate-600 line-clamp-2">{article.excerpt}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {article.readingTimeMinutes} min read • {article.views} views
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleApprove(article.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          title="Approve"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        
                        <button
                          onClick={() => handleReject(article.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                          title="Reject"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reject
                        </button>
                        
                        <button
                          onClick={() => handleForward(article.id)}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
                          title="Forward to Admin"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5-5m5 5V7m0 0l-5 5" />
                          </svg>
                          Forward
                        </button>
                      </div>
                    </td>
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
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <span>{selectedItems.size} selected</span>
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear selection
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Reject Article</h3>
            <textarea
              value={rejectModal.remarks}
              onChange={(e) => setRejectModal({ ...rejectModal, remarks: e.target.value })}
              placeholder="Please provide remarks for rejection..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectModal({ isOpen: false, articleId: null, remarks: '' })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {forwardModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Forward to Admin</h3>
            <textarea
              value={forwardModal.remarks}
              onChange={(e) => setForwardModal({ ...forwardModal, remarks: e.target.value })}
              placeholder="Add remarks for admin (optional)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none"
              rows={4}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setForwardModal({ isOpen: false, articleId: null, remarks: '' })}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmForward}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Forwarding...' : 'Forward'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoordinatorNewsReview
