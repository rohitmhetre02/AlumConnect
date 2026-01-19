import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Clock, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'
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

const AdminDashboardHome = () => {
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const displayName = adminUser.name || 'Admin User'
  const [pendingProfiles, setPendingProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)

  const fetchPendingProfiles = useCallback(async () => {
    try {
      const response = await get('/admin/profile-approval/pending')
      if (response?.success) {
        setPendingProfiles(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending profiles:', error)
      setPendingProfiles([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingProfiles()
  }, [fetchPendingProfiles])

  const refreshData = useCallback(async () => {
    setLoading(true)
    await fetchPendingProfiles()
  }, [fetchPendingProfiles])

  const handleApprove = useCallback(
    async (profile) => {
      if (!profile) return
      const id = profile._id || profile.id
      const role = profile.role

      try {
        const response = await post('/admin/profile-approval/approve', { id, role })
        if (response?.success) {
          setPendingProfiles((prev) => prev.filter((item) => (item._id || item.id) !== id))
          // close modal if the approved user is currently open
          if (selectedUser && (selectedUser._id || selectedUser.id) === id) {
            setSelectedUser(null)
            setShowUserModal(false)
          }
          await refreshData()
        } else {
          console.error('Approve failed:', response)
          alert(response?.message || 'Failed to approve profile. Please try again.')
        }
      } catch (error) {
        console.error('Approve request failed:', error)
        alert(error?.message || 'Failed to approve profile. Please try again.')
      }
    },
    [refreshData, selectedUser]
  )

  const handleReject = useCallback(
    async (profile) => {
      if (!profile) return
      const id = profile._id || profile.id
      const role = profile.role
      const reason = window.prompt('Enter rejection reason', '')
      if (reason === null) {
        return
      }
      const trimmedReason = reason.trim()
      if (!trimmedReason) {
        alert('Rejection reason is required.')
        return
      }

      try {
        const response = await post('/admin/profile-approval/reject', { id, role, reason: trimmedReason })
        if (response?.success) {
          setPendingProfiles((prev) => prev.filter((item) => (item._id || item.id) !== id))
          if (selectedUser && (selectedUser._id || selectedUser.id) === id) {
            setSelectedUser(null)
            setShowUserModal(false)
          }
          await refreshData()
        } else {
          console.error('Reject failed:', response)
          alert(response?.message || 'Failed to reject profile. Please try again.')
        }
      } catch (error) {
        console.error('Reject request failed:', error)
        alert(error?.message || 'Failed to reject profile. Please try again.')
      }
    },
    [refreshData, selectedUser]
  )

  const handleViewUser = (profile) => {
    setSelectedUser(profile)
    setShowUserModal(true)
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
    setShowUserModal(false)
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {displayName.split(' ')[0]}! <span role="img" aria-label="wave">👋</span>
        </h1>
        <p className="mt-2 text-slate-600">Here's what's happening across your AlumConnect platform today.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Platform Overview</h2>
            <span className="text-sm text-slate-500">Last updated: 2 min ago</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900">1,247</p>
              <p className="text-xs text-slate-500">Total Users</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900">89%</p>
              <p className="text-xs text-slate-500">Profile Completion</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900">156</p>
              <p className="text-xs text-slate-500">Active Mentors</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-xl">
              <p className="text-2xl font-bold text-slate-900">42</p>
              <p className="text-xs text-slate-500">Upcoming Events</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Total Users</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">1,247</p>
          <p className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark transition">View all users →</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Active Events</h3>
            <span className="text-2xl">📅</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">8</p>
          <p className="mt-2 text-sm font-semibold text-primary hover:text-primary-dark transition">Manage events →</p>
        </div>
      </section>

      {/* Profile Approval Requests Section */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profile Approval Requests</h2>
              <p className="text-sm text-slate-500">Review and approve pending user profiles</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
              {pendingProfiles.length} pending
            </span>
            <Link
              to="/profile-approval"
              className="text-sm font-semibold text-primary hover:text-primary-dark transition"
            >
              View all →
            </Link>
          </div>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : pendingProfiles.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
            <p className="text-sm text-slate-600">No pending profile approvals at the moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingProfiles.slice(0, 3).map((profile) => (
              <div key={profile._id || profile.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-amber-200 transition-colors">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-slate-600">
                    {(profile.firstName || profile.name || '').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900 truncate">
                      {profile.firstName ? `${profile.firstName} ${profile.lastName || ''}` : profile.name}
                    </h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      profile.role === 'student' ? 'bg-blue-100 text-blue-700' :
                      profile.role === 'alumni' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{profile.email}</p>
                  <p className="text-xs text-slate-500">
                    {profile.department || 'Department not specified'} • 
                    Submitted {profile.submissionDate || profile.createdAt ? 
                      new Date(profile.submissionDate || profile.createdAt).toLocaleDateString() : 
                      'Date not available'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleViewUser(profile)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleApprove(profile)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Approve"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleReject(profile)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Reject"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            
            {pendingProfiles.length > 3 && (
              <div className="text-center pt-2">
                <Link
                  to="/profile-approval"
                  className="text-sm font-medium text-primary hover:text-primary-dark transition"
                >
                  View {pendingProfiles.length - 3} more pending requests →
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-red-600/20 hover:shadow-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-600">
              +12 this week
            </span>
            <h3 className="text-sm font-medium text-slate-500">New Registrations</h3>
            <p className="text-3xl font-semibold text-slate-900">47</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-emerald-600">Student and alumni registrations increased significantly.</p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-red-600/20 hover:shadow-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-600">
              2 ending soon
            </span>
            <h3 className="text-sm font-medium text-slate-500">Active Campaigns</h3>
            <p className="text-3xl font-semibold text-slate-900">5</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-sky-600">Monitor ongoing donation and fundraising campaigns.</p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-red-600/20 hover:shadow-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-600">
              +8 this month
            </span>
            <h3 className="text-sm font-medium text-slate-500">Mentorship Matches</h3>
            <p className="text-3xl font-semibold text-slate-900">18</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-emerald-600">Successful mentor-mentee connections this month.</p>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-red-600/20 hover:shadow-lg">
          <div className="space-y-3">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-primary/10 text-primary">
              All systems operational
            </span>
            <h3 className="text-sm font-medium text-slate-500">System Health</h3>
            <p className="text-3xl font-semibold text-slate-900">98%</p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-emerald-600">All platform services running smoothly.</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <p className="text-sm text-slate-500">Latest platform activities and system events.</p>
          </div>
          <button type="button" className="text-sm font-semibold text-primary hover:text-primary-dark transition">
            View all
          </button>
        </header>
        <ol className="mt-6 space-y-5">
          <li className="flex gap-4">
            <span className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 grid place-items-center text-sm font-semibold">
              N
            </span>
            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-sm font-semibold text-slate-900">New user registration spike detected</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">2 hours ago</p>
              <p className="mt-2 text-sm text-slate-600">45 new users registered in the last 24 hours, mostly from Computer Science department.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-sm font-semibold">
              C
            </span>
            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-sm font-semibold text-slate-900">Campaign "Tech Scholarship 2025" reached 75% goal</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">4 hours ago</p>
              <p className="mt-2 text-sm text-slate-600">Fundraising campaign is performing exceptionally well with strong community support.</p>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="mt-1 h-10 w-10 flex-shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-semibold">
              S
            </span>
            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
              <p className="text-sm font-semibold text-slate-900">System maintenance completed successfully</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">1 day ago</p>
              <p className="mt-2 text-sm text-slate-600">Database optimization and security updates deployed without downtime.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close modal"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-slate-600">
                    {(selectedUser.firstName || selectedUser.name || '').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedUser.firstName ? `${selectedUser.firstName} ${selectedUser.lastName || ''}` : selectedUser.name}
                  </h2>
                  <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    selectedUser.role === 'student' ? 'bg-blue-100 text-blue-700' :
                    selectedUser.role === 'alumni' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {selectedUser.role}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Contact Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Email:</span>
                        <span className="text-sm font-medium text-slate-900">{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">Phone:</span>
                          <span className="text-sm font-medium text-slate-900">{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.location && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">Location:</span>
                          <span className="text-sm font-medium text-slate-900">{selectedUser.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Academic Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Department:</span>
                        <span className="text-sm font-medium text-slate-900">{selectedUser.department || 'Not specified'}</span>
                      </div>
                      {selectedUser.currentYear && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">Current Year:</span>
                          <span className="text-sm font-medium text-slate-900">{selectedUser.currentYear}</span>
                        </div>
                      )}
                      {selectedUser.passoutYear && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600">Passout Year:</span>
                          <span className="text-sm font-medium text-slate-900">{selectedUser.passoutYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Profile Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Submitted:</span>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedUser.submissionDate || selectedUser.createdAt ? 
                            new Date(selectedUser.submissionDate || selectedUser.createdAt).toLocaleDateString() : 
                            'Not available'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-600">Profile Status:</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${(() => {
                          const status = normalizeStatus(selectedUser.profileApprovalStatus)
                          if (status === PROFILE_STATUS.APPROVED) return 'bg-emerald-100 text-emerald-700'
                          if (status === PROFILE_STATUS.REJECTED) return 'bg-rose-100 text-rose-700'
                          return 'bg-amber-100 text-amber-700'
                        })()}`}>
                          {normalizeStatus(selectedUser.profileApprovalStatus).replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedUser.about && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">About</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{selectedUser.about}</p>
                    </div>
                  )}

                  {selectedUser.skills && selectedUser.skills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedUser.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApprove(selectedUser)}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Approve Profile
                </button>
                <button
                  onClick={() => handleReject(selectedUser)}
                  className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Reject Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboardHome
