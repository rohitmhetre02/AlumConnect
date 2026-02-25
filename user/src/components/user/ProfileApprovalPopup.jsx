import { X, AlertCircle, Clock, Mail } from 'lucide-react'
import {
  PROFILE_STATUS,
  isProfileInReview,
  isProfileRejected,
  normalizeProfileStatus,
} from '../../utils/profileStatus'

const ProfileApprovalPopup = ({ user, onClose }) => {
  const status = normalizeProfileStatus(user?.profileApprovalStatus)
  const isPending = status === PROFILE_STATUS.IN_REVIEW || isProfileInReview(status)
  const isRejected = status === PROFILE_STATUS.REJECTED || isProfileRejected(status)

  const handleClose = (e) => {
    e?.stopPropagation()
    console.log('ProfileApprovalPopup: Close button clicked')
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log('ProfileApprovalPopup: Backdrop clicked')
      if (onClose && typeof onClose === 'function') {
        onClose()
      }
    }
  }

  if (!isPending && !isRejected) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={handleBackdropClick}>
      <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleClose}
          type="button"
          className="absolute -top-8 right-0 text-white/90 hover:text-white transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
              isRejected ? 'bg-rose-100' : 'bg-amber-100'
            }`}>
              {isRejected ? (
                <AlertCircle className="h-6 w-6 text-rose-600" />
              ) : (
                <Clock className="h-6 w-6 text-amber-600 animate-pulse" />
              )}
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              {isRejected ? 'Profile Not Approved' : 'Profile Under Review'}
            </h1>
            <p className="text-sm text-slate-600">
              {isRejected 
                ? 'Your profile could not be approved at this time.'
                : 'Your profile is currently being reviewed by our administrators.'
              }
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className={`rounded-xl p-3 ${
              isRejected ? 'bg-rose-50 border border-rose-200' : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {isRejected ? (
                  <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`text-sm font-semibold mb-1 ${
                    isRejected ? 'text-rose-800' : 'text-amber-800'
                  }`}>
                    {isRejected ? 'Review Status' : 'Review Timeline'}
                  </h3>
                  <p className={`text-xs ${
                    isRejected ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    {isRejected 
                      ? `Your profile was reviewed but could not be approved. ${user?.profileRejectionReason ? `Reason: ${user.profileRejectionReason}` : 'Please contact support for more details.'}`
                      : 'Our team typically reviews profiles within 2-4 business days.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">What you can do:</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 text-xs">•</span>
                  <span>You can access only your profile page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 text-xs">•</span>
                  <span>Update your profile information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 text-xs">•</span>
                  <span>Check your email regularly for updates</span>
                </li>
              </ul>
            </div>

            <div className={`rounded-xl p-3 ${
              isRejected ? 'bg-rose-50 border border-rose-200' : 'bg-slate-50 border border-slate-200'
            }`}>
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    {isRejected ? 'Contact Your Department Coordinator' : 'Need Help?'}
                  </h3>
                  <p className="text-xs text-slate-700">
                    {isRejected 
                      ? 'Please contact your department coordinator for assistance with your profile approval.'
                      : 'Contact our support team at support@alumconnect.com'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleClose}
              type="button"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-primary-dark transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileApprovalPopup
