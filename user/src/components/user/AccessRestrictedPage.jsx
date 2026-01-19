import { AlertCircle, Clock, Mail } from 'lucide-react'
import {
  PROFILE_STATUS,
  normalizeProfileStatus,
} from '../../utils/profileStatus'

const AccessRestrictedPage = ({ user }) => {
  const status = normalizeProfileStatus(user.profileApprovalStatus)
  const isPending = status === PROFILE_STATUS.IN_REVIEW
  const isRejected = status === PROFILE_STATUS.REJECTED

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            isRejected ? 'bg-rose-100' : 'bg-amber-100'
          }`}>
            {isRejected ? (
              <AlertCircle className="h-8 w-8 text-rose-600" />
            ) : (
              <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isRejected ? 'Profile Not Approved' : 'Profile Under Review'}
          </h1>
          <p className="text-slate-600">
            {isRejected 
              ? 'Your profile could not be approved at this time.'
              : 'Your profile is currently being reviewed by our administrators.'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
          <div className="space-y-6">
            <div className={`rounded-xl p-4 ${
              isRejected ? 'bg-rose-50 border border-rose-200' : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex items-start gap-3">
                {isRejected ? (
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className={`font-semibold mb-1 ${
                    isRejected ? 'text-rose-800' : 'text-amber-800'
                  }`}>
                    {isRejected ? 'Review Status' : 'Review Timeline'}
                  </h3>
                  <p className={`text-sm ${
                    isRejected ? 'text-rose-700' : 'text-amber-700'
                  }`}>
                    {isRejected 
                      ? `Your profile was reviewed but could not be approved. ${user.profileRejectionReason ? `Reason: ${user.profileRejectionReason}` : 'Please contact support for more details.'}`
                      : 'Our team typically reviews profiles within 2-4 business days. You will receive an email notification once a decision has been made.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">What you can do:</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Complete your profile with detailed information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Add a professional profile photo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Include your academic and professional background</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Check your email regularly for updates</span>
                </li>
              </ul>
            </div>

            <div className={`rounded-xl p-4 bg-slate-50 border border-slate-200`}>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-slate-700">
                    If you haven't received a response within 4 days or have questions about the review process, please contact our support team at support@alumconnect.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessRestrictedPage
