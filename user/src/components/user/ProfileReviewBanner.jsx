import { useEffect, useState } from 'react'
import { AlertCircle, Clock, X } from 'lucide-react'
import {
  PROFILE_STATUS,
  normalizeProfileStatus,
} from '../../utils/profileStatus'

const ProfileReviewBanner = ({ user, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-dismiss after 10 seconds
    const timer = setTimeout(() => {
      setIsVisible(false)
      onDismiss?.()
    }, 10000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!isVisible || !user) return null

  const status = normalizeProfileStatus(user.profileApprovalStatus)
  const isPending = status === PROFILE_STATUS.IN_REVIEW
  const isRejected = status === PROFILE_STATUS.REJECTED

  if (user.isProfileApproved || !['student', 'alumni', 'faculty'].includes(user.role)) {
    return null
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r ${
      isRejected ? 'from-rose-600 to-red-700' : 'from-amber-600 to-orange-700'
    } text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isRejected ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Clock className="h-5 w-5 flex-shrink-0 animate-pulse" />
            )}
            <div>
              <p className="font-semibold">
                {isRejected ? 'Profile Review Update' : 'Profile Under Review'}
              </p>
              <p className="text-sm opacity-90">
                {isRejected 
                  ? `Your profile was not approved. Reason: ${user.profileRejectionReason || 'Please contact support for details.'}`
                  : 'Your profile is currently being reviewed by administrators. This typically takes 2-4 days.'
                }
              </p>
              {!isRejected && (
                <p className="text-sm opacity-90 mt-1">
                  Complete your profile to help speed up the approval process.
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              onDismiss?.()
            }}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileReviewBanner
