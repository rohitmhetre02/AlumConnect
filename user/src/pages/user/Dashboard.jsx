import { useAuth } from '../../context/AuthContext'
import ProfileProgress from '../../components/user/dashboard/ProfileProgress'
import StatCard from '../../components/user/dashboard/StatCard'
import ProfileApprovedPopup from '../../components/user/ProfileApprovedPopup'
import ProfilePendingPopup from '../../components/user/ProfilePendingPopup'
import ProfileRejectedPopup from '../../components/user/ProfileRejectedPopup'
import WelcomeNotification from '../../components/user/WelcomeNotification'
import useProfileCompletion from '../../hooks/useProfileCompletion'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../utils/api'

import {
  PROFILE_STATUS,
  normalizeProfileStatus
} from '../../utils/profileStatus'

import StudentDashboard from './StudentDashboard'
import AlumniDashboard from './AlumniDashboard'
import FacultyDashboard from './FacultyDashboard'

const APPROVED_POPUP_DISMISS_PREFIX = 'profile_approved_popup_dismissed'
const PENDING_POPUP_DISMISS_PREFIX = 'profile_pending_popup_dismissed'
const REJECTED_POPUP_DISMISS_PREFIX = 'profile_rejected_popup_dismissed'

const stats = [
  {
    title: 'Upcoming Events',
    value: '3',
    subtext: 'View calendar',
  },
  {
    title: 'New Messages',
    value: '5',
    subtext: 'Open inbox',
  },
]

const insights = [
  {
    label: 'Upcoming Mentorships',
    value: '3',
    delta: '+2 this month',
    tone: 'positive',
    description: 'You have mentorship sessions scheduled this month.',
  },
  {
    label: 'Connection Requests',
    value: '5',
    delta: '-1 pending',
    tone: 'neutral',
    description: 'Respond to connection requests from alumni.',
  },
  {
    label: 'Community Contributions',
    value: '12',
    delta: '+4 this quarter',
    tone: 'positive',
    description: 'Members appreciated your latest post.',
  },
  {
    label: 'Events Registered',
    value: '2',
    delta: 'Next event in 5 days',
    tone: 'info',
    description: 'Prepare for upcoming registered events.',
  },
]

const timeline = [
  {
    title: 'Mentorship session scheduled',
    timestamp: '2 hours ago',
    type: 'success',
    description: 'You will mentor three students interested in AI.',
  },
  {
    title: 'Responded to student message',
    timestamp: '1 day ago',
    type: 'message',
    description: 'Provided feedback on portfolio review.',
  },
  {
    title: 'Published community article',
    timestamp: '3 days ago',
    type: 'highlight',
    description: 'Your article received strong engagement.',
  },
  {
    title: 'Completed donation contribution',
    timestamp: '1 week ago',
    type: 'donation',
    description: 'Supported scholarship fundraising initiative.',
  },
]

const toneStyles = {
  positive: 'bg-emerald-100 text-emerald-600',
  neutral: 'bg-slate-100 text-slate-600',
  info: 'bg-sky-100 text-sky-600',
}

const activityAccent = {
  success: 'bg-emerald-100 text-emerald-600',
  message: 'bg-sky-100 text-sky-600',
  highlight: 'bg-primary/10 text-primary',
  donation: 'bg-amber-100 text-amber-600',
}

const Dashboard = () => {

  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [showPendingPopup, setShowPendingPopup] = useState(false)
  const [showRejectedPopup, setShowRejectedPopup] = useState(false)
  const [showApprovedPopup, setShowApprovedPopup] = useState(false)

  const [previousApprovalStatus, setPreviousApprovalStatus] =
    useState(user?.profileApprovalStatus ?? null)

  const {
    loading: profileLoading,
    percentage: profilePercentage,
    refresh: refreshProfileCompletion,
    lastUpdated
  } = useProfileCompletion()

  const userStorageId = useMemo(() => {
    return user?.id ?? user?._id ?? user?.email ?? 'anonymous'
  }, [user])

  const buildStorageKey = useCallback(
    (prefix, status) => `${prefix}:${userStorageId}:${status}`,
    [userStorageId]
  )

  const isPopupDismissed = useCallback(
    (prefix, status) => {
      if (typeof window === 'undefined') return false
      return window.localStorage.getItem(buildStorageKey(prefix, status)) === 'true'
    },
    [buildStorageKey]
  )

  const dismissPopup = useCallback(
    (prefix, status) => {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(buildStorageKey(prefix, status), 'true')
    },
    [buildStorageKey]
  )

  const refreshUserData = useCallback(async () => {
    try {
      const response = await get('/auth/profile')
      if (response?.data) {
        await updateUser(response.data)
      }
    } catch (error) {
      console.error('Failed to refresh profile', error)
    }
  }, [updateUser])

  useEffect(() => {

    const currentStatus = normalizeProfileStatus(user?.profileApprovalStatus)
    const previousStatus = normalizeProfileStatus(previousApprovalStatus)

    const pendingDismissed = isPopupDismissed(PENDING_POPUP_DISMISS_PREFIX, currentStatus)
    const rejectedDismissed = isPopupDismissed(REJECTED_POPUP_DISMISS_PREFIX, currentStatus)
    const approvedDismissed = isPopupDismissed(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)

    setShowPendingPopup(currentStatus === PROFILE_STATUS.IN_REVIEW && !pendingDismissed)
    setShowRejectedPopup(currentStatus === PROFILE_STATUS.REJECTED && !rejectedDismissed)
    setShowApprovedPopup(currentStatus === PROFILE_STATUS.APPROVED && !approvedDismissed)

    setPreviousApprovalStatus(currentStatus)

  }, [user?.profileApprovalStatus, previousApprovalStatus, isPopupDismissed])

  useEffect(() => {
    refreshUserData()
  }, [refreshUserData])

  useEffect(() => {

    const interval = setInterval(() => {
      refreshUserData()
    }, 15000)

    return () => clearInterval(interval)

  }, [refreshUserData])

  const handleClosePendingPopup = () => {
    dismissPopup(PENDING_POPUP_DISMISS_PREFIX, PROFILE_STATUS.IN_REVIEW)
    setShowPendingPopup(false)
  }

  const handleCloseRejectedPopup = () => {
    dismissPopup(REJECTED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.REJECTED)
    setShowRejectedPopup(false)
  }

  const handleCloseApprovedPopup = () => {
    dismissPopup(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)
    setShowApprovedPopup(false)
  }

  return (

    <>
      {/* Welcome Notification for admin-created users */}
      <WelcomeNotification 
        firstName={user?.firstName || user?.name?.split(' ')[0] || 'User'} 
      />

      {user?.role === 'student' ? (
        <StudentDashboard />
      ) : user?.role === 'alumni' ? (
        <AlumniDashboard />
      ) : user?.role === 'faculty' ? (
        <FacultyDashboard />
      ) : (

        <div className="space-y-10">

          <header className="flex items-center justify-between">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.name?.split(' ')[0] ?? 'User'}
              </h1>

              <p className="text-sm text-slate-500 mt-1">
                Overview of your activity and community engagement
              </p>
            </div>

            <div
              className={`px-4 py-1.5 rounded-full text-sm font-medium
              ${
                user?.profileApprovalStatus === 'APPROVED'
                  ? 'bg-green-100 text-green-700'
                  : user?.profileApprovalStatus === 'IN_REVIEW'
                  ? 'bg-amber-100 text-amber-700'
                  : user?.profileApprovalStatus === 'REJECTED'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {user?.profileApprovalStatus || 'Unknown'}
            </div>

          </header>

          <section className="grid gap-6 lg:grid-cols-3">

            <div className="lg:col-span-2">
              <ProfileProgress
                percentage={profilePercentage}
                loading={profileLoading}
                onRefresh={refreshProfileCompletion}
                lastUpdated={lastUpdated}
                onOpenProfile={() => navigate('/dashboard/profile')}
              />
            </div>

            <div className="space-y-6">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>

          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

            {insights.map((item) => (
              <InsightCard key={item.label} item={item} />
            ))}

          </section>

          <ActivityTimeline timeline={timeline} />

          {showPendingPopup && (
            <ProfilePendingPopup user={user} onClose={handleClosePendingPopup} />
          )}

          {showRejectedPopup && (
            <ProfileRejectedPopup user={user} onClose={handleCloseRejectedPopup} />
          )}

          {showApprovedPopup && (
            <ProfileApprovedPopup user={user} onClose={handleCloseApprovedPopup} />
          )}

        </div>

      )}
    </>
  )
}

const InsightCard = ({ item }) => (

  <article className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">

    <span
      className={`text-xs font-semibold uppercase px-3 py-1 rounded-full
      ${toneStyles[item.tone] ?? toneStyles.neutral}`}
    >
      {item.delta}
    </span>

    <h3 className="text-sm text-slate-500 mt-3">
      {item.label}
    </h3>

    <p className="text-3xl font-semibold text-slate-900 mt-1">
      {item.value}
    </p>

    <p className="text-sm text-slate-600 mt-3">
      {item.description}
    </p>

  </article>

)

const ActivityTimeline = ({ timeline }) => (

  <section className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">

    <h2 className="text-lg font-semibold text-slate-900">
      Recent Activity
    </h2>

    <ol className="mt-6 space-y-6">

      {timeline.map((item) => (

        <li key={item.title} className="flex gap-4">

          <span
            className={`h-10 w-10 flex items-center justify-center rounded-full font-semibold
            ${activityAccent[item.type] ?? 'bg-slate-100 text-slate-500'}`}
          >
            {item.title.charAt(0)}
          </span>

          <div>

            <p className="font-semibold text-slate-900">
              {item.title}
            </p>

            <p className="text-xs text-slate-400">
              {item.timestamp}
            </p>

            <p className="text-sm text-slate-600 mt-1">
              {item.description}
            </p>

          </div>

        </li>

      ))}

    </ol>

  </section>

)

export default Dashboard