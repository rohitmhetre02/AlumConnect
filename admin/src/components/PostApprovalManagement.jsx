import { useCallback, useEffect, useMemo, useState } from 'react'
import { Check, X, Clock, FileText, MapPin, Calendar, Briefcase, Coins } from 'lucide-react'
import { get, post } from '../utils/api'
import { useLocation } from 'react-router-dom'

const CONTENT_TYPES = ['event', 'opportunity', 'donation', 'campaign']

const STAT_CARDS = {
  event: {
    icon: Calendar,
    label: 'Events Pending',
    tone: 'emerald',
  },
  opportunity: {
    icon: Briefcase,
    label: 'Opportunities Pending',
    tone: 'indigo',
  },
  donation: {
    icon: Coins,
    label: 'Donations Pending',
    tone: 'amber',
  },
  campaign: {
    icon: Coins,
    label: 'Campaigns Pending',
    tone: 'purple',
  },
}

const toneClasses = {
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
  },
  slate: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  },
}

const PostApprovalManagement = () => {
  const location = useLocation()
  const [posts, setPosts] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [meta, setMeta] = useState({ reviewerRole: '', department: '', totals: { total: 0, byType: {} } })
  const [decidingId, setDecidingId] = useState(null)
  const [rejectModal, setRejectModal] = useState({ open: false, post: null, reason: '' })

  // Determine if we're on pending or approved route
  const isPendingRoute = location.pathname.includes('/pending')
  const routeType = isPendingRoute ? 'pending' : 'approved'

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = `/admin/content-approval/${routeType}`
      const response = await get(endpoint)
      if (response?.success) {
        setPosts(response.data || [])
        setMeta(response.meta || meta)
      }
    } catch (error) {
      console.error(`Failed to load ${routeType} posts`, error)
      alert(error.message || `Unable to load ${routeType} posts right now.`)
    } finally {
      setLoading(false)
    }
  }, [routeType])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return posts
    return posts.filter((post) => post.contentType === filter)
  }, [posts, filter])

  const totals = useMemo(() => {
    const base = { total: posts.length }
    CONTENT_TYPES.forEach((type) => {
      base[type] = posts.filter((post) => post.contentType === type).length
    })
    return base
  }, [posts])

  const handleDecision = async ({ item, action, reason }) => {
    if (!item) return
    setDecidingId(item.id)

    try {
      const payload = {
        id: item.id,
        contentType: item.contentType,
        action,
      }

      if (action === 'reject') {
        payload.reason = reason
      }

      const response = await post('/admin/content-approval/decision', payload)

      if (response?.success) {
        setPosts((prev) => prev.filter((entry) => entry.id !== item.id))
        alert(response.message || `Post ${action}ed successfully.`)
      } else {
        alert(response?.message || 'Unable to process decision.')
      }
    } catch (error) {
      console.error('Decision error', error)
      alert(error.message || 'Unable to process decision right now.')
    } finally {
      setDecidingId(null)
    }
  }

  const openRejectModal = (post) => {
    setRejectModal({ open: true, post, reason: '' })
  }

  const closeRejectModal = () => {
    setRejectModal({ open: false, post: null, reason: '' })
  }

  const confirmReject = () => {
    if (!rejectModal.reason.trim()) {
      alert('Please provide a rejection reason.')
      return
    }

    handleDecision({ item: rejectModal.post, action: 'reject', reason: rejectModal.reason.trim() })
    closeRejectModal()
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Post Management</p>
        <h1 className="text-2xl font-bold text-slate-900">
          {isPendingRoute ? 'Pending Posts' : 'Approved Posts'}
        </h1>
        <p className="text-sm text-slate-500">
          {meta.reviewerRole === 'admin'
            ? `Viewing all ${isPendingRoute ? 'pending' : 'approved'} posts across departments.`
            : `Reviewing ${isPendingRoute ? 'pending' : 'approved'} posts for the ${meta.department || 'assigned'} department.`}
        </p>
      </header>

      <StatsRow totals={totals} />

      <div className="bg-white rounded-2xl border shadow-soft p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">Filter by type:</span>
          {['all', ...CONTENT_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === type ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {type === 'all' ? 'All Posts' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <section className="bg-white rounded-2xl border shadow-soft p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <Clock className="mx-auto h-10 w-10 mb-3 text-slate-300" />
            No {isPendingRoute ? 'pending' : 'approved'} posts to review.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <article key={post.id} className="border border-slate-200 rounded-xl p-5 hover:border-primary/40 transition">
                <header className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">
                        <FileText className="h-3.5 w-3.5" />
                        {post.contentType}
                      </span>
                      <span>•</span>
                      <span>{post.department || 'No department specified'}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-900 mt-1">{post.title || 'Untitled submission'}</h2>
                    <p className="text-sm text-slate-500">
                      Submitted by {post.createdByName || 'Unknown'} ({post.createdByRole || 'role unknown'}) on{' '}
                      {post.createdAt ? new Date(post.createdAt).toLocaleString() : '—'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Pending Review
                  </span>
                </header>

                {post.summary && (
                  <p className="mt-4 text-sm text-slate-600 leading-relaxed">{post.summary}</p>
                )}

                {post.metadata ? <MetadataGrid type={post.contentType} metadata={post.metadata} /> : null}

                {post.approvalRejectionReason ? (
                  <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    Last rejection reason: {post.approvalRejectionReason}
                  </div>
                ) : null}

                <footer className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleDecision({ item: post, action: 'approve' })}
                    disabled={decidingId === post.id}
                    className={`inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400`}
                  >
                    {decidingId === post.id ? 'Processing…' : <><Check className="h-4 w-4" /> Approve</>}
                  </button>
                  <button
                    onClick={() => openRejectModal(post)}
                    disabled={decidingId === post.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-400"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>

      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">Add rejection reason</h3>
            <p className="mt-1 text-sm text-slate-500">
              Let the author know what needs to change before resubmitting.
            </p>
            <textarea
              value={rejectModal.reason}
              onChange={(event) => setRejectModal((prev) => ({ ...prev, reason: event.target.value }))}
              rows={4}
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Explain why this post was rejected"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeRejectModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Reject Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const StatsRow = ({ totals }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        tone="slate"
        icon={Clock}
        title="Total Pending"
        value={totals.total}
      />
      {CONTENT_TYPES.map((type) => {
        const config = STAT_CARDS[type]
        return (
          <StatCard
            key={type}
            tone={config.tone}
            icon={config.icon}
            title={config.label}
            value={totals[type]}
          />
        )
      })}
    </div>
  )
}

const StatCard = ({ tone, icon: Icon, title, value }) => {
  const palette = toneClasses[tone] || toneClasses.slate
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${palette.bg}`}>
        <Icon className={`h-5 w-5 ${palette.text}`} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
        <p className="text-lg font-bold text-slate-900">{Number(value || 0)}</p>
      </div>
    </div>
  )
}

const MetadataGrid = ({ type, metadata = {} }) => {
  if (type === 'event') {
    return (
      <dl className="mt-4 grid gap-4 rounded-xl bg-slate-50/80 p-4 text-sm text-slate-600 sm:grid-cols-2">
        <Detail label="Mode" value={metadata.mode || '—'} />
        <Detail label="Location" value={metadata.location || '—'} icon={MapPin} />
        <Detail label="Starts" value={metadata.startAt ? new Date(metadata.startAt).toLocaleString() : '—'} />
        <Detail label="Ends" value={metadata.endAt ? new Date(metadata.endAt).toLocaleString() : '—'} />
        <Detail label="Organization" value={metadata.organization || '—'} />
      </dl>
    )
  }

  if (type === 'opportunity') {
    return (
      <dl className="mt-4 grid gap-4 rounded-xl bg-slate-50/80 p-4 text-sm text-slate-600 sm:grid-cols-2">
        <Detail label="Company" value={metadata.company || '—'} />
        <Detail label="Type" value={metadata.type || '—'} />
        <Detail label="Remote" value={metadata.isRemote ? 'Yes' : 'No'} />
        <Detail label="Location" value={metadata.location || '—'} />
        <Detail label="Deadline" value={metadata.deadline ? new Date(metadata.deadline).toLocaleDateString() : '—'} />
      </dl>
    )
  }

  if (type === 'donation') {
    return (
      <dl className="mt-4 grid gap-4 rounded-xl bg-slate-50/80 p-4 text-sm text-slate-600 sm:grid-cols-2">
        <Detail label="Goal" value={formatCurrency(metadata.goalAmount)} />
        <Detail label="Raised" value={formatCurrency(metadata.raisedAmount)} />
        <Detail label="Deadline" value={metadata.deadline ? new Date(metadata.deadline).toLocaleDateString() : '—'} />
      </dl>
    )
  }

  if (type === 'campaign') {
    return (
      <dl className="mt-4 grid gap-4 rounded-xl bg-slate-50/80 p-4 text-sm text-slate-600 sm:grid-cols-2">
        <Detail label="Goal" value={formatCurrency(metadata.goalAmount)} />
        <Detail label="Raised" value={formatCurrency(metadata.raisedAmount)} />
        <Detail label="Category" value={metadata.category || '—'} />
        <Detail label="Deadline" value={metadata.deadline ? new Date(metadata.deadline).toLocaleDateString() : '—'} />
      </dl>
    )
  }

  return null
}

const Detail = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-2">
    {Icon ? <Icon className="mt-0.5 h-4 w-4 text-slate-400" /> : null}
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value || '—'}</p>
    </div>
  </div>
)

const formatCurrency = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return '—'
  return Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export default PostApprovalManagement
