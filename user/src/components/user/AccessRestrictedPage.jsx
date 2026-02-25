import { AlertCircle, Clock, Mail } from 'lucide-react'
import {
  PROFILE_STATUS,
  normalizeProfileStatus,
} from '../../utils/profileStatus'
import {
  REGISTRATION_STATUS,
  normalizeRegistrationStatus,
} from '../../utils/registrationStatus'

const AccessRestrictedPage = ({ user = {} }) => {
  const profileStatus = normalizeProfileStatus(user.profileApprovalStatus)
  const registrationStatus = normalizeRegistrationStatus(user.registrationStatus)

  const isRegistrationPending =
    user?.role?.toLowerCase() !== 'admin' && registrationStatus === REGISTRATION_STATUS.PENDING
  const isRegistrationRejected =
    user?.role?.toLowerCase() !== 'admin' && registrationStatus === REGISTRATION_STATUS.REJECTED

  const isProfilePending = !isRegistrationPending && !isRegistrationRejected && profileStatus === PROFILE_STATUS.IN_REVIEW
  const isProfileRejected = !isRegistrationPending && !isRegistrationRejected && profileStatus === PROFILE_STATUS.REJECTED

  const isRejected = isRegistrationRejected || isProfileRejected
  const isPending = isRegistrationPending || isProfilePending

  const title = isRegistrationRejected
    ? 'Registration Not Approved'
    : isRegistrationPending
      ? 'Registration Under Review'
      : isProfileRejected
        ? 'Profile Not Approved'
        : 'Profile Under Review'

  const description = isRegistrationRejected
    ? 'Your registration request could not be approved.'
    : isRegistrationPending
      ? 'Your registration is currently being reviewed by your department coordinator.'
      : isProfileRejected
        ? 'Your profile could not be approved at this time.'
        : 'Your profile is currently being reviewed by our administrators.'

  const rejectionReason = isRegistrationRejected
    ? user.registrationRejectionReason
    : user.profileRejectionReason

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
              isRejected ? 'bg-rose-100' : 'bg-amber-100'
            }`}
          >
            {isRejected ? (
              <AlertCircle className="h-8 w-8 text-rose-600" />
            ) : (
              <Clock className="h-8 w-8 text-amber-600 animate-pulse" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-soft">
          <div className="space-y-6">
            <div
              className={`rounded-xl p-4 ${
                isRejected ? 'bg-rose-50 border border-rose-200' : 'bg-amber-50 border border-amber-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {isRejected ? (
                  <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h3
                    className={`font-semibold mb-1 ${
                      isRejected ? 'text-rose-800' : 'text-amber-800'
                    }`}
                  >
                    {isRegistrationRejected
                      ? 'Registration Decision'
                      : isRegistrationPending
                        ? 'Registration Timeline'
                        : isProfileRejected
                          ? 'Profile Decision'
                          : 'Profile Timeline'}
                  </h3>
                  <p
                    className={`text-sm ${
                      isRejected ? 'text-rose-700' : 'text-amber-700'
                    }`}
                  >
                    {isRejected
                      ? `Your submission was reviewed but could not be approved. ${
                          rejectionReason
                            ? `Reason: ${rejectionReason}`
                            : 'Please contact support for more details.'
                        }`
                      : isRegistrationPending
                        ? 'Department coordinators typically review new registrations within 2-3 business days. You will receive an email once a decision has been made.'
                        : 'Our team typically reviews profiles within 2-4 business days. You will receive an email notification once a decision has been made.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">What you can do:</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                {isRegistrationPending || isRegistrationRejected ? (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Verify that your registration details, especially department selection, are accurate.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Reach out to your department coordinator if you require expedited review or have supporting documents.
                      </span>
                    </li>
                  </>
                ) : null}
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Complete your profile with detailed academic and professional information.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Add a professional profile photo to help reviewers verify your identity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Check your inbox and spam folder for messages from the AlumConnect team.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl p-4 bg-slate-50 border border-slate-200">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-slate-700">
                    If you have questions about your review status or need to submit additional information, please contact support@alumconnect.com with your registered email address.
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
