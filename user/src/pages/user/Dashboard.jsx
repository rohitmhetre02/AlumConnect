import { useAuth } from '../../context/AuthContext'
import ProfileProgress from '../../components/user/dashboard/ProfileProgress'
import StatCard from '../../components/user/dashboard/StatCard'
import ProfileApprovedPopup from '../../components/user/ProfileApprovedPopup'
import ProfilePendingPopup from '../../components/user/ProfilePendingPopup'
import ProfileRejectedPopup from '../../components/user/ProfileRejectedPopup'
import useProfileCompletion from '../../hooks/useProfileCompletion'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../utils/api'
import {
  PROFILE_STATUS,
  normalizeProfileStatus,
  isProfileApproved,
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
    subtext: 'View calendar →',
  },
  {
    title: 'New Messages',
    value: '5',
    subtext: 'Open inbox →',
  },
]

const insights = [
  {
    label: 'Upcoming Mentorships',
    value: '3',
    delta: '+2 this month',
    tone: 'positive',
    description: 'You have three mentorship sessions scheduled over the next two weeks.',
  },
  {
    label: 'Open Connection Requests',
    value: '5',
    delta: '-1 pending',
    tone: 'neutral',
    description: 'Respond to connection requests to grow your alumni network.',
  },
  {
    label: 'Community Contributions',
    value: '12',
    delta: '+4 this quarter',
    tone: 'positive',
    description: 'Keep sharing insights—alumni appreciated your latest article.',
  },
  {
    label: 'Events Registered',
    value: '2',
    delta: 'Next event in 5 days',
    tone: 'info',
    description: 'Stay prepared for the upcoming Leadership Summit & Tech Roundtable.',
  },
]

const timeline = [
  {
    title: 'Confirmed as Mentor for “AI Career Pathways”',
    timestamp: '2 hours ago',
    type: 'success',
    description: 'You will guide three students exploring roles in applied AI.',
  },
  {
    title: 'Replied to Meera Gupta’s Message',
    timestamp: '1 day ago',
    type: 'message',
    description: 'Shared feedback on her product design portfolio and next steps.',
  },
  {
    title: 'Published update: “Scaling systems with empathy”',
    timestamp: '3 days ago',
    type: 'highlight',
    description: 'Community members engaged with 42 comments and 180 reactions.',
  },
  {
    title: 'Completed donation for “STEM Scholarship 2025”',
    timestamp: '1 week ago',
    type: 'donation',
    description: 'Contributed $500 towards the scholarship program.',
  },
]

const toneStyles = {
  positive: {
    badgeBg: 'bg-emerald-100 text-emerald-600',
    accent: 'text-emerald-600',
  },
  neutral: {
    badgeBg: 'bg-slate-100 text-slate-500',
    accent: 'text-slate-500',
  },
  info: {
    badgeBg: 'bg-sky-100 text-sky-600',
    accent: 'text-sky-600',
  },
  highlight: {
    badgeBg: 'bg-violet-100 text-violet-600',
    accent: 'text-violet-600',
  },
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
  const [previousApprovalStatus, setPreviousApprovalStatus] = useState(user?.profileApprovalStatus ?? null)
  const {
    loading: profileLoading,
    percentage: profilePercentage,
    missingFields,
    refresh: refreshProfileCompletion,
    lastUpdated,
    error: profileError,
  } = useProfileCompletion()

  const userStorageId = useMemo(() => {
    return user?.id ?? user?._id ?? user?.email ?? 'anonymous'
  }, [user?.email, user?._id, user?.id])

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

  // Function to refresh user data from server
  const refreshUserData = useCallback(async () => {
    try {
      console.log('Dashboard: Refreshing user data...')
      const response = await get('/auth/profile')
      console.log('Dashboard: User data response:', response)
      
      if (response?.data) {
        await updateUser(response.data)
        console.log('Dashboard: User data updated successfully')
      }
    } catch (error) {
      console.error('Dashboard: Failed to refresh user data:', error)
    }
  }, [updateUser])

  // Check for profile approval status changes - Force show popup on login
  useEffect(() => {
    const currentStatus = user?.profileApprovalStatus
    if (!currentStatus) {
      console.log('Dashboard: No profile approval status found')
      return
    }

    const normalizedStatus = normalizeProfileStatus(currentStatus)
    const previousStatus = normalizeProfileStatus(previousApprovalStatus ?? PROFILE_STATUS.IN_REVIEW)

    console.log('Dashboard: Profile status check - Current:', normalizedStatus, 'Previous:', previousStatus)

    // Always check popup dismissal state
    const isPendingDismissed = isPopupDismissed(PENDING_POPUP_DISMISS_PREFIX, normalizedStatus)
    const isRejectedDismissed = isPopupDismissed(REJECTED_POPUP_DISMISS_PREFIX, normalizedStatus)
    const isApprovedDismissed = isPopupDismissed(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)

    console.log('Dashboard: Popup dismissal states - Pending:', isPendingDismissed, 'Rejected:', isRejectedDismissed, 'Approved:', isApprovedDismissed)

    // Show popups based on status and dismissal state
    const shouldShowPendingPopup = normalizedStatus === PROFILE_STATUS.IN_REVIEW && !isPendingDismissed
    const shouldShowRejectedPopup = normalizedStatus === PROFILE_STATUS.REJECTED && !isRejectedDismissed
    const shouldShowApprovedPopup = normalizedStatus === PROFILE_STATUS.APPROVED && !isApprovedDismissed

    console.log('Dashboard: Popup states - Pending:', shouldShowPendingPopup, 'Rejected:', shouldShowRejectedPopup, 'Approved:', shouldShowApprovedPopup)

    setShowPendingPopup(shouldShowPendingPopup)
    setShowRejectedPopup(shouldShowRejectedPopup)
    setShowApprovedPopup(shouldShowApprovedPopup)

    setPreviousApprovalStatus(normalizedStatus)
  }, [previousApprovalStatus, user?.profileApprovalStatus, isPopupDismissed])

  useEffect(() => {
    refreshUserData()
  }, [refreshUserData])

  // Polling mechanism to check profile status every 10 seconds (reduced from 30)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUserData()
    }, 15000) // 15 seconds to reduce network load

    return () => {
      console.log('Dashboard: Clearing profile status polling interval')
      clearInterval(interval)
    }
  }, [refreshUserData, user?.profileApprovalStatus])

  const handleClosePendingPopup = () => {
    console.log('Dashboard: Closing pending popup')
    const normalizedStatus = normalizeProfileStatus(user?.profileApprovalStatus)
    dismissPopup(PENDING_POPUP_DISMISS_PREFIX, normalizedStatus)
    setShowPendingPopup(false)
  }

  const handleCloseRejectedPopup = () => {
    console.log('Dashboard: Closing rejected popup')
    const normalizedStatus = normalizeProfileStatus(user?.profileApprovalStatus)
    dismissPopup(REJECTED_POPUP_DISMISS_PREFIX, normalizedStatus)
    setShowRejectedPopup(false)
  }

  const handleCloseApprovedPopup = () => {
    console.log('Dashboard: Closing approved popup')
    dismissPopup(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)
    setShowApprovedPopup(false)
  }

  return (
    <>
      {/* Show role-specific dashboards */}
      {user?.role === 'student' ? (
        <StudentDashboard />
      ) : user?.role === 'alumni' ? (
        <AlumniDashboard />
      ) : user?.role === 'faculty' ? (
        <FacultyDashboard />
      ) : (
        <div className="space-y-8">
          <header>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.name?.split(' ')[0] ?? 'Alex'}! <span role="img" aria-label="wave">👋</span>
              </h1>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.profileApprovalStatus === 'APPROVED' 
                    ? 'bg-green-100 text-green-800' 
                    : user?.profileApprovalStatus === 'IN_REVIEW' 
                      ? 'bg-amber-100 text-amber-800' 
                      : user?.profileApprovalStatus === 'REJECTED' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-slate-100 text-slate-800'
                }`}>
                  Profile Status: {
                    user?.profileApprovalStatus === 'APPROVED' 
                      ? 'Approved' 
                      : user?.profileApprovalStatus === 'IN_REVIEW' 
                        ? 'Pending Review' 
                        : user?.profileApprovalStatus === 'REJECTED' 
                          ? 'Rejected' 
                          : 'Unknown'
                  }
                </div>
              </div>
            </div>
            {profileError ? (
              <p className="mt-2 text-sm text-rose-500">
                We had trouble checking your profile progress. Please try refreshing.
              </p>
            ) : null}
          </header>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <ProfileProgress
              percentage={profilePercentage}
              loading={profileLoading}
              onRefresh={refreshProfileCompletion}
              lastUpdated={lastUpdated}
              onOpenProfile={() => navigate('/dashboard/profile')}
            />
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {insights.map((item) => (
              <InsightCard key={item.label} item={item} />
            ))}
          </section>

          <ActivityTimeline timeline={timeline} />
          
          {showPendingPopup ? (
            <ProfilePendingPopup
              user={user}
              onClose={handleClosePendingPopup}
            />
          ) : null}

          {showRejectedPopup ? (
            <ProfileRejectedPopup
              user={user}
              onClose={handleCloseRejectedPopup}
            />
          ) : null}

          {showApprovedPopup ? (
            <ProfileApprovedPopup
              user={user}
              onClose={handleCloseApprovedPopup}
            />
          ) : null}
        </div>
      )}
    </>
  )
}

const InsightCard = ({ item }) => {
  const styles = toneStyles[item.tone] ?? toneStyles.neutral

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg">
      <div className="space-y-3">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${styles.badgeBg}`}>
          {item.delta}
        </span>
        <h3 className="text-sm font-medium text-slate-500">{item.label}</h3>
        <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
      </div>
      <p className={`mt-4 text-sm leading-relaxed ${styles.accent}`}>{item.description}</p>
    </article>
  )
}

const ActivityTimeline = ({ timeline }) => (
  <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
    <header className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
        <p className="text-sm text-slate-500">Your latest interactions across the community.</p>
      </div>
      <button type="button" className="text-sm font-semibold text-primary hover:text-primary-dark">
        View all
      </button>
    </header>
    <ol className="mt-6 space-y-5">
      {timeline.map((item) => (
        <li key={`${item.title}-${item.timestamp}`} className="flex gap-4">
          <span className={`mt-1 h-10 w-10 flex-shrink-0 rounded-full ${activityAccent[item.type] ?? 'bg-slate-100 text-slate-500'} grid place-items-center text-sm font-semibold`}>
            {item.title.charAt(0)}
          </span>
          <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/40 p-4">
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="mt-1 text-xs uppercase tracking-widest text-slate-400">{item.timestamp}</p>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        </li>
      ))}
    </ol>
  </section>
)

export default Dashboard
