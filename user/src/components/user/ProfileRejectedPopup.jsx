import { X, AlertCircle, Clock, Mail } from 'lucide-react'
import {
  PROFILE_STATUS,
  isProfileInReview,
  isProfileRejected,
  normalizeProfileStatus,
} from '../../utils/profileStatus'

const ProfileRejectedPopup = ({ user, onClose }) => {
  const status = normalizeProfileStatus(user?.profileApprovalStatus)
  const isRejected = status === PROFILE_STATUS.REJECTED || isProfileRejected(status)

  const handleClose = (e) => {
    e?.stopPropagation()
    console.log('ProfileRejectedPopup: Close button clicked')
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      console.log('ProfileRejectedPopup: Backdrop clicked')
      if (onClose && typeof onClose === 'function') {
        onClose()
      }
    }
  }

  if (!isRejected) return null

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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-rose-100">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Profile Not Approved
            </h1>
            <p className="text-sm text-slate-600">
              Your profile could not be approved at this time.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="rounded-xl p-3 bg-rose-50 border border-rose-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-rose-800">Review Status</h3>
                  <p className="text-xs text-rose-700">
                    Your profile was reviewed but could not be approved. {user?.profileRejectionReason ? `Reason: ${user.profileRejectionReason}` : 'Please contact support for more details.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Current Access:</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 mt-0.5 text-xs">•</span>
                  <span>Contact your department coordinator for assistance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 mt-0.5 text-xs">•</span>
                  <span>Update your profile information if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 mt-0.5 text-xs">•</span>
                  <span>Check your email for further instructions</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl p-3 bg-rose-50 border border-rose-200">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">Contact Your Department Coordinator</h3>
                  <p className="text-xs text-slate-700">
                    Please contact your department coordinator for assistance with your profile approval.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleClose}
              type="button"
              className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700 transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileRejectedPopup
