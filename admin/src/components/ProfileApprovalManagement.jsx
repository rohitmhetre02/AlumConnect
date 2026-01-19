import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Check,
  X,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react'
import { get, post } from '../utils/api'

const PROFILE_STATUS = {
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
}

const normalizeStatus = (value) => {
  if (!value) return PROFILE_STATUS.IN_REVIEW
  const normalized = String(value).trim().toUpperCase()
  return PROFILE_STATUS[normalized] ?? PROFILE_STATUS.IN_REVIEW
}

const ProfileApprovalManagement = () => {
  const [pendingProfiles, setPendingProfiles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [approvingId, setApprovingId] = useState(null)

  /* ---------------- Fetch Pending Profiles ---------------- */
  const fetchPendingProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const response = await get('/admin/profile-approval/pending')
      if (response?.success) {
        setPendingProfiles(response.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch pending profiles:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ---------------- Fetch Stats ---------------- */
  const refreshStats = useCallback(async () => {
    try {
      const response = await get('/admin/profile-approval/stats')
      if (response?.success) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchPendingProfiles()
    refreshStats()
  }, [fetchPendingProfiles, refreshStats])

  /* ---------------- Filter Profiles ---------------- */
  const filteredProfiles = useMemo(() => {
    if (filterRole === 'all') return pendingProfiles
    return pendingProfiles.filter(p => p.role === filterRole)
  }, [pendingProfiles, filterRole])

  /* ---------------- Approve Profile ---------------- */
  const handleApprove = async (id, role) => {
    try {
      console.log('Approving profile:', { id, role })
      setApprovingId(id)
      const response = await post('/admin/profile-approval/approve', { id, role })
      console.log('Approve response:', response)
      
      if (response?.success) {
        setPendingProfiles(prev => prev.filter(p => (p._id || p.id) !== id))
        refreshStats()
        // Show success feedback
        alert('Profile approved successfully!')
      } else {
        console.error('Approve failed:', response)
        alert('Failed to approve profile. Please try again.')
      }
    } catch (err) {
      console.error('Approve error:', err)
      alert('Failed to approve profile. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  /* ---------------- Reject Profile ---------------- */
  const handleReject = async () => {
    if (!selectedProfile || !rejectionReason.trim()) return

    try {
      console.log('Rejecting profile:', { id: selectedProfile._id, rejectionReason })
      setApprovingId(selectedProfile._id)
      const response = await post('/admin/profile-approval/reject', {
        id: selectedProfile._id,
        role: selectedProfile.role,
        reason: rejectionReason
      })
      console.log('Reject response:', response)
      
      if (response?.success) {
        setPendingProfiles(prev =>
          prev.filter(p => (p._id || p.id) !== selectedProfile._id)
        )
        closeRejectionModal()
        refreshStats()
        // Show success feedback
        alert('Profile rejected successfully!')
      } else {
        console.error('Reject failed:', response)
        alert('Failed to reject profile. Please try again.')
      }
    } catch (err) {
      console.error('Reject error:', err)
      alert('Failed to reject profile. Please try again.')
    } finally {
      setApprovingId(null)
    }
  }

  const openRejectionModal = profile => {
    setSelectedProfile(profile)
    setShowRejectionModal(true)
  }

  const closeRejectionModal = () => {
    setSelectedProfile(null)
    setRejectionReason('')
    setShowRejectionModal(false)
  }

  /* ---------------- Loading ---------------- */
  if (loading && !pendingProfiles.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  const total =
    (stats?.approved?.total || 0) +
    (stats?.rejected?.total || 0) +
    (stats?.inReview?.total || 0)

  const approvalRate =
    total > 0
      ? Math.round(((stats?.approved?.total || 0) / total) * 100)
      : 0

  return (
    <div className="space-y-6">
      {/* ---------------- Header ---------------- */}
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Profile Approval Requests</p>
        <h1 className="text-2xl font-bold text-slate-900">Review and approve pending user profiles</h1>
        <p className="text-sm text-slate-500">
          {pendingProfiles.length} pending
        </p>
        <p className="text-slate-600">
          Review and approve user profile submissions
        </p>
      </header>

      {/* ---------------- Stats ---------------- */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Clock />}
            color="amber"
            value={stats.pending.total}
            label="Pending Review"
          />
          <StatCard
            icon={<Check />}
            color="emerald"
            value={stats.approved?.total ?? 0}
            label="Approved"
          />
          <StatCard
            icon={<X />}
            color="rose"
            value={stats.rejected?.total ?? 0}
            label="Rejected"
          />
          <StatCard
            icon={<TrendingUp />}
            color="blue"
            value={`${approvalRate}%`}
            label="Approval Rate"
          />
        </div>
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="bg-white p-6 rounded-2xl border shadow-soft">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium">Filter by role:</span>
          {['all', 'student', 'alumni', 'faculty'].map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterRole === role
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {role === 'all'
                ? 'All Roles'
                : role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Profiles List ---------------- */}
      <div className="bg-white p-6 rounded-2xl border shadow-soft">
        <h2 className="text-lg font-semibold mb-4">
          Pending Profiles ({filteredProfiles.length})
        </h2>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="mx-auto h-10 w-10 mb-3 text-slate-300" />
            No pending profiles
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProfiles.map(profile => (
              <div
                key={profile._id}
                className="border rounded-xl p-4 flex justify-between gap-4 hover:border-primary/30"
              >
                <div>
                  <h3 className="font-semibold">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">{profile.email}</p>
                  <p className="text-sm text-slate-500 capitalize">
                    Role: {profile.role}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleApprove(profile._id, profile.role)
                    }
                    disabled={approvingId === profile._id}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      approvingId === profile._id
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-emerald-600 text-white hover:bg-emerald-700'
                    }`}
                  >
                    {approvingId === profile._id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12v8l8-4-4-4" />
                        </svg>
                        Approving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Approve
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => openRejectionModal(profile)}
                    disabled={approvingId === profile._id}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      approvingId === profile._id
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-rose-600 text-white hover:bg-rose-700'
                    }`}
                  >
                    {approvingId === profile._id ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12v8l8-4-4-4" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <X className="h-4 w-4" />
                        Reject
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------- Rejection Modal ---------------- */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Reject Profile</h3>

            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full border rounded-lg p-2"
              rows={4}
              placeholder="Reason for rejection"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={closeRejectionModal}
                className="flex-1 border rounded-lg py-2"
              >
                Cancel
              </button>
              <button
                disabled={!rejectionReason.trim() || approvingId === selectedProfile?._id}
                onClick={handleReject}
                className={`flex-1 rounded-lg py-2 text-white font-medium transition ${
                  !rejectionReason.trim() || approvingId === selectedProfile?._id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {approvingId === selectedProfile?._id ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12v8l8-4-4-4" />
                    </svg>
                    Rejecting...
                  </span>
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------- Reusable Stat Card ---------------- */
const StatCard = ({ icon, value, label, color }) => (
  <div className="bg-white p-6 rounded-2xl border shadow-soft flex items-center gap-3">
    <div className={`p-2 rounded-full bg-${color}-100 text-${color}-600`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  </div>
)

export default ProfileApprovalManagement
