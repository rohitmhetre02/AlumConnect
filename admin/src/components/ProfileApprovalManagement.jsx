import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Check,
  X,
  Clock,
  Users,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { get, post } from '../utils/api'
import { useLocation } from 'react-router-dom'

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
  const location = useLocation()
  const [profiles, setProfiles] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterRole, setFilterRole] = useState('all')
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [approvingId, setApprovingId] = useState(null)
  const [reviewerRole, setReviewerRole] = useState('')
  const [department, setDepartment] = useState('')

  // Determine if we're on pending or approved route
  const isPendingRoute = location.pathname.includes('/pending')
  const routeType = isPendingRoute ? 'pending' : 'approved'

  /* ---------------- Fetch Profiles Based on Route ---------------- */
  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const endpoint = `/admin/profile-approval/${routeType}`
      console.log(`Fetching ${routeType} profiles from:`, endpoint)
      const response = await get(endpoint)
      console.log(`${routeType} profiles response:`, response)
      if (response?.success) {
        const profiles = response.data || []
        console.log(`Setting ${routeType} profiles:`, profiles)
        console.log(`Raw profiles data:`, JSON.stringify(profiles, null, 2))
        setProfiles(profiles)
        const meta = response.meta || {}
        setReviewerRole(meta.reviewerRole || '')
        setDepartment(meta.department || '')
        // Reset filter if it no longer applies to new reviewer role
        const allowedFilters = getRoleFilters(meta.reviewerRole || '')
        if (!allowedFilters.includes(filterRole)) {
          setFilterRole('all')
        }
      } else {
        console.error(`Failed to fetch ${routeType} profiles:`, response?.message)
        setProfiles([])
      }
    } catch (err) {
      console.error(`Failed to fetch ${routeType} profiles:`, err)
      setProfiles([])
    } finally {
      setLoading(false)
    }
  }, [routeType, filterRole])

  /* ---------------- Fetch Stats ---------------- */
  const refreshStats = useCallback(async () => {
    try {
      console.log('Fetching profile approval stats...')
      const response = await get('/admin/profile-approval/stats')
      console.log('Stats response:', response)
      if (response?.success) {
        setStats(response.data)
        console.log('Stats set:', response.data)
      } else {
        console.error('Failed to fetch stats:', response?.message)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  useEffect(() => {
    fetchProfiles()
    refreshStats()
  }, [fetchProfiles, refreshStats])

  const roleFilters = useMemo(() => getRoleFilters(reviewerRole), [reviewerRole])

  /* ---------------- Filter Profiles ---------------- */
  const filteredProfiles = useMemo(() => {
    if (filterRole === 'all') return profiles
    return profiles.filter(p => p.role === filterRole)
  }, [profiles, filterRole])

  const pendingCount = stats?.[PROFILE_STATUS.IN_REVIEW]?.total ?? 0
  const approvedCount = stats?.[PROFILE_STATUS.APPROVED]?.total ?? 0
  const rejectedCount = stats?.[PROFILE_STATUS.REJECTED]?.total ?? 0
  const total = pendingCount + approvedCount + rejectedCount
  const approvalRate = total > 0 ? Math.round((approvedCount / total) * 100) : 0

  /* ---------------- Approve Profile ---------------- */
  const handleApprove = async (id, role) => {
    try {
      console.log('Approving profile:', { id, role })
      setApprovingId(id)
      const response = await post('/admin/profile-approval/approve', { id, role })
      console.log('Approve response:', response)
      
      if (response?.success) {
        setProfiles(prev => prev.filter(p => (p._id || p.id) !== id))
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
        setProfiles(prev =>
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

  const updateCoordinatorStatus = async () => {
    try {
      console.log('Triggering coordinator status update...')
      const response = await post('/admin/profile-approval/update-coordinator-status')
      console.log('Coordinator status update response:', response)
      if (response?.success) {
        alert(`Updated ${response.message} - Found ${response.pendingCount} pending coordinators`)
        // Refresh the profiles to show the updated data
        await fetchProfiles()
        await refreshStats()
      } else {
        alert('Failed to update coordinator status')
      }
    } catch (error) {
      console.error('Error updating coordinator status:', error)
      alert('Error updating coordinator status')
    }
  }

  /* ---------------- Loading ---------------- */
  if (loading && !profiles.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ---------------- Header ---------------- */}
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Profile Management</p>
        <h1 className="text-2xl font-bold text-slate-900">
          {isPendingRoute ? 'Pending Profiles' : 'Approved Profiles'}
        </h1>
        <p className="text-sm text-slate-500">
          {profiles.length} {isPendingRoute ? 'pending' : 'approved'}
        </p>
        <p className="text-slate-600">
          {reviewerRole === 'admin' && 'Admins can review Faculty and Coordinator profiles.'}
          {reviewerRole === 'coordinator' && `Department coordinators can review Student, Alumni, and Faculty profiles for ${department || 'their department'}.`}
        </p>
      </header>

      {/* ---------------- Stats ---------------- */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Clock />}
            color="amber"
            value={pendingCount}
            label="Pending Review"
          />
          <StatCard
            icon={<Check />}
            color="emerald"
            value={approvedCount}
            label="Approved"
          />
          <StatCard
            icon={<X />}
            color="rose"
            value={rejectedCount}
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

      {/* ---------------- Pending Profiles Alert ---------------- */}
      {isPendingRoute && pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-800">Requires Your Attention</h3>
              <p className="text-sm text-amber-700">
                {pendingCount} profile{pendingCount === 1 ? '' : 's'} pending your review and approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Filters ---------------- */}
      <div className="bg-white p-6 rounded-2xl border shadow-soft">
        <div className="flex flex-wrap gap-3 items-center">
          <span className="text-sm font-medium">Filter by role:</span>
          {roleFilters.map(role => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filterRole === role
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
            >
              {ROLE_LABELS[role] || role.charAt(0).toUpperCase() + role.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Profiles List ---------------- */}
      <div className="bg-white p-6 rounded-2xl border shadow-soft">
        <h2 className="text-lg font-semibold mb-4">
          {isPendingRoute ? 'Pending Profiles' : 'Approved Profiles'} ({filteredProfiles.length})
        </h2>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Users className="mx-auto h-10 w-10 mb-3 text-slate-300" />
            <p className="text-lg font-medium mb-2">
              {isPendingRoute ? 'No pending profiles' : 'No approved profiles'}
            </p>
            <p className="text-sm text-slate-400">
              {isPendingRoute 
                ? 'All profiles have been reviewed and processed.'
                : 'No profiles have been approved yet.'
              }
            </p>
            {/* Debug information */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-slate-100 rounded-lg text-left">
                <p className="text-xs font-semibold text-slate-600 mb-1">Debug Info:</p>
                <p className="text-xs text-slate-500">Total profiles: {profiles.length}</p>
                <p className="text-xs text-slate-500">Filtered profiles: {filteredProfiles.length}</p>
                <p className="text-xs text-slate-500">Filter role: {filterRole}</p>
                <p className="text-xs text-slate-500">Route type: {routeType}</p>
                <p className="text-xs text-slate-500">Reviewer role: {reviewerRole}</p>
              </div>
            )}
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
                  {profile.department && (
                    <p className="text-sm text-slate-500">Department: {profile.department}</p>
                  )}
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

const ROLE_LABELS = {
  all: 'All Roles',
  faculty: 'Faculty',
  coordinator: 'Coordinator',
  student: 'Student',
  alumni: 'Alumni',
}

const getRoleFilters = (reviewerRole) => {
  if (reviewerRole === 'admin') {
    return ['all', 'faculty', 'coordinator']
  }
  if (reviewerRole === 'coordinator') {
    return ['all', 'student', 'alumni', 'faculty']
  }
  return ['all']
}

export default ProfileApprovalManagement
