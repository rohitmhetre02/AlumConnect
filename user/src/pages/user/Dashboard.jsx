import { useAuth } from '../../context/AuthContext'
import ProfileProgress from '../../components/user/dashboard/ProfileProgress'
import StatCard from '../../components/user/dashboard/StatCard'
import ProfileApprovalPopup from '../../components/user/ProfileApprovalPopup'
import ProfileApprovedPopup from '../../components/user/ProfileApprovedPopup'
import useProfileCompletion from '../../hooks/useProfileCompletion'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../utils/api'
import {
  PROFILE_STATUS,
  normalizeProfileStatus,
  isProfileApproved,
} from '../../utils/profileStatus'

const REVIEW_POPUP_DISMISS_PREFIX = 'profile_review_popup_dismissed'
const APPROVED_POPUP_DISMISS_PREFIX = 'profile_approved_popup_dismissed'

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
  const [showApprovalPopup, setShowApprovalPopup] = useState(false)
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
      const response = await get('/auth/profile/me')
      const profile = response?.data
      if (!profile) return

      updateUser({
        profileApprovalStatus: normalizeProfileStatus(profile.profileApprovalStatus),
        isProfileApproved: isProfileApproved(profile.profileApprovalStatus),
        profile
      })
    } catch (error) {
      console.error('Dashboard: Failed to refresh user data:', error)
    }
  }, [updateUser])

  // Check for profile approval status changes
  useEffect(() => {
    const currentStatus = user?.profileApprovalStatus
    if (!currentStatus) return

    const normalizedStatus = normalizeProfileStatus(currentStatus)
    const previousStatus = normalizeProfileStatus(previousApprovalStatus ?? PROFILE_STATUS.IN_REVIEW)

    const shouldShowReviewPopup =
      (normalizedStatus === PROFILE_STATUS.IN_REVIEW || normalizedStatus === PROFILE_STATUS.REJECTED) &&
      !isPopupDismissed(REVIEW_POPUP_DISMISS_PREFIX, normalizedStatus)

    const shouldShowApprovedPopup =
      normalizedStatus === PROFILE_STATUS.APPROVED &&
      previousStatus !== PROFILE_STATUS.APPROVED &&
      !isPopupDismissed(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)

    setShowApprovalPopup(shouldShowReviewPopup)
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

  const handleCloseApprovalPopup = () => {
    console.log('Dashboard: Closing approval popup')
    const normalizedStatus = normalizeProfileStatus(user?.profileApprovalStatus)
    dismissPopup(REVIEW_POPUP_DISMISS_PREFIX, normalizedStatus)
    setShowApprovalPopup(false)
  }

  const handleCloseApprovedPopup = () => {
    console.log('Dashboard: Closing approved popup')
    dismissPopup(APPROVED_POPUP_DISMISS_PREFIX, PROFILE_STATUS.APPROVED)
    setShowApprovedPopup(false)
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {user?.name?.split(' ')[0] ?? 'Alex'}! <span role="img" aria-label="wave">👋</span>
        </h1>
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
      
      {showApprovalPopup ? (
        <ProfileApprovalPopup
          user={user}
          onClose={handleCloseApprovalPopup}
        />
      ) : null}

      {showApprovedPopup ? (
        <ProfileApprovedPopup
          user={user}
          onClose={handleCloseApprovedPopup}
        />
      ) : null}
    </div>
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
