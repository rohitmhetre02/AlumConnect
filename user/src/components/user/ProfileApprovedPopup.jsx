import { X, CheckCircle, ArrowRight } from 'lucide-react'
import { PROFILE_STATUS, normalizeProfileStatus } from '../../utils/profileStatus'

const ProfileApprovedPopup = ({ user, onClose }) => {
  const status = normalizeProfileStatus(user?.profileApprovalStatus)
  if (status !== PROFILE_STATUS.APPROVED) {
    return null
  }

  const handleClose = (e) => {
    e?.stopPropagation()
    if (onClose && typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" onClick={handleClose}>
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Profile Approved! 🎉
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              Congratulations! Your profile has been approved by our administrators.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="text-sm font-semibold text-emerald-700">
                Status: Approved
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Current Access:</h3>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 text-xs">•</span>
                  <span>You have access to all pages and features</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 text-xs">•</span>
                  <span>Complete directory access and networking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 text-xs">•</span>
                  <span>Event participation and registration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 text-xs">•</span>
                  <span>Mentorship programs and opportunities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-0.5 text-xs">•</span>
                  <span>Donations and campaign support</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 mb-1">Start Exploring</h3>
                  <p className="text-sm text-slate-700">
                    Begin connecting with fellow alumni, explore opportunities, and make the most of your alumni network!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleClose}
              type="button"
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileApprovedPopup
