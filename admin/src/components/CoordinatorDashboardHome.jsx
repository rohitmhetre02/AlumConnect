import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../utils/api'
import useToast from '../hooks/useToast'

const CoordinatorDashboardHome = () => {
  const [stats, setStats] = useState(null)
  const [pendingItems, setPendingItems] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const addToast = useToast()
  const navigate = useNavigate()

  const coordinator = useMemo(() => {
    try {
      const stored = localStorage.getItem('adminUser')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }, [])

  const department = coordinator.department || ''
  const userName = coordinator.firstName
    ? `${coordinator.firstName} ${coordinator.lastName || ''}`
    : coordinator.email || 'Coordinator'

  useEffect(() => {
    fetchDashboardData()
  }, [department])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const params = `role=coordinator&department=${encodeURIComponent(department)}`

      const [statsRes, pendingRes, activityRes] = await Promise.all([
        get(`/admin/dashboard/stats?${params}`).catch(() => null),
        get(`/admin/dashboard/pending?${params}`).catch(() => null),
        get(`/admin/dashboard/activity?${params}`).catch(() => null),
      ])

      if (statsRes?.data) setStats(statsRes.data)
      if (pendingRes?.data) setPendingItems(pendingRes.data)
      if (activityRes?.data) setRecentActivity(activityRes.data)
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to load dashboard data' })
    } finally {
      setLoading(false)
    }
  }

  const pendingProfiles = useMemo(() => {
    return (pendingItems || []).filter(item => item.type === 'profile')
  }, [pendingItems])

  const recentItems = useMemo(() => {
    return (recentActivity || []).slice(0, 5)
  }, [recentActivity])

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  const totalStudents = stats?.totalStudents ?? 0
  const totalAlumni = stats?.totalAlumni ?? 0
  const pendingApprovals = stats?.pendingApprovals ?? 0

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Coordinator Dashboard</h1>
        <p className="text-slate-600">
          Welcome back, {userName}! {department ? `Managing ${department} department.` : ''}
        </p>
      </header>

      {/* Top Stat Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Department Students</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{totalStudents}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>in {department || 'your department'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Department Alumni</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{totalAlumni}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-purple-100 text-purple-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span>in {department || 'your department'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Profile Verification Requests</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pendingApprovals}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 12l2 2 4-4" />
                <path d="M12 2a10 10 0 1 0 10 10" />
              </svg>
            </span>
          </div>
          <div className="mt-3">
            <button
              onClick={() => navigate('/coordinator/profile-approval')}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition"
            >
              Review Pending &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* Requires Your Attention */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Requires Your Attention</h2>
          {pendingProfiles.length > 3 && (
            <button
              onClick={() => navigate('/coordinator/profile-approval')}
              className="text-sm font-semibold text-primary hover:text-primary-dark transition"
            >
              View All &rarr;
            </button>
          )}
        </div>

        {pendingProfiles.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-5 py-4">
            <svg className="h-5 w-5 text-emerald-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p className="text-sm font-medium text-emerald-700">All caught up! No pending verification requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProfiles.slice(0, 3).map((item) => {
              const itemId = item.id || item._id
              return (
                <div
                  key={itemId}
                  onClick={() => navigate('/coordinator/profile-approval')}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-amber-50/50 px-5 py-4 cursor-pointer transition hover:bg-amber-50 hover:border-amber-200"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.department} &middot; {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    Pending
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Quick Management */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <button
          onClick={() => navigate('/coordinator/users')}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft text-left transition hover:border-primary/30 hover:shadow-md"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-600 mb-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-slate-900">User Management</h3>
          <p className="text-xs text-slate-500 mt-1">Manage students, alumni & faculty</p>
        </button>

        <button
          onClick={() => navigate('/coordinator/events')}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft text-left transition hover:border-primary/30 hover:shadow-md"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-orange-600 mb-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Events</h3>
          <p className="text-xs text-slate-500 mt-1">Create & manage department events</p>
        </button>

        <button
          onClick={() => navigate('/coordinator/opportunities')}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft text-left transition hover:border-primary/30 hover:shadow-md"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Opportunities</h3>
          <p className="text-xs text-slate-500 mt-1">Post jobs & opportunities</p>
        </button>

        <button
          onClick={() => navigate('/coordinator/profile-approval')}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft text-left transition hover:border-primary/30 hover:shadow-md"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-purple-100 text-purple-600 mb-3">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 12l2 2 4-4" />
              <path d="M12 2a10 10 0 1 0 10 10" />
            </svg>
          </span>
          <h3 className="text-sm font-semibold text-slate-900">Profile Approval</h3>
          <p className="text-xs text-slate-500 mt-1">Verify pending profiles</p>
        </button>
      </section>

      {/* Recent Activity */}
      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900 mb-5">Recent Activity</h2>

        {recentItems.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-200 px-5 py-4">
            <svg className="h-5 w-5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <p className="text-sm font-medium text-slate-500">No recent activity in your department.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentItems.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center gap-4 px-4 py-3 rounded-xl transition hover:bg-slate-50"
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  item.type === 'job' ? 'bg-emerald-100 text-emerald-600' :
                  item.type === 'event' ? 'bg-orange-100 text-orange-600' :
                  item.type === 'donation' ? 'bg-cyan-100 text-cyan-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {item.type === 'job' ? <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" /></> :
                     item.type === 'event' ? <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><path d="M16 2v4M8 2v4M3 10h18" /></> :
                     item.type === 'donation' ? <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></> :
                     <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>}
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 truncate">
                    <span className="font-semibold">{item.user}</span>
                    <span className="text-slate-500"> {item.action}</span>
                    {item.entity && <span className="text-slate-500"> &mdash; </span>}
                    {item.entity && <span className="font-medium">{item.entity}</span>}
                  </p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{item.timestamp}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default CoordinatorDashboardHome
