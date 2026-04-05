import { useLocation, useNavigate, Link } from 'react-router-dom'

const statusSteps = {
  submitted: 1,
  viewed: 2, 
  reviewing: 3,
  accepted: 4,
  rejected: 4,
  declined: 4,
}

const statusLabels = {
  submitted: 'Application Submitted',
  viewed: 'Application Viewed',
  reviewing: 'Under Review',
  accepted: 'Application Accepted',
  rejected: 'Application Rejected',
  declined: 'Application Rejected',
}

const statusToneClasses = {
  submitted: 'bg-blue-100 text-blue-600',
  viewed: 'bg-purple-100 text-purple-600',
  reviewing: 'bg-amber-100 text-amber-600',
  accepted: 'bg-emerald-100 text-emerald-600',
  rejected: 'bg-rose-100 text-rose-600',
}

const statusMessages = {
  submitted: 'Application submitted - Waiting for review',
  viewed: 'Application viewed by recruiter',
  reviewing: 'Under review - Your application is being considered',
  accepted: 'Application accepted - Congratulations! Check your email for next steps',
  rejected: 'Application declined - Thank you for your interest',
  declined: 'Application declined - Thank you for your interest',
}

const getCurrentStatusMessage = () => {
  return statusMessages[status] || statusMessages.submitted
}

const formatDate = (value) => {
  if (!value) return '—'
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch (error) {
    return '—'
  }
}

const ApplicationDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const application = location.state?.application


  if (!application) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Application Not Found</h1>
          <p className="text-slate-600 mb-4">No application data was passed to this page.</p>
          <Link
            to="/dashboard/applications"
            className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Back to Applications
          </Link>
        </div>
      </div>
    )
  }

  const { opportunity, status, submittedAt, updatedAt, reviewerNote } = application
  const currentStep = statusSteps[status] || 1

  // Dynamic steps based on application status
  const getSteps = () => {
    if (status === 'accepted' || status === 'rejected' || status === 'declined') {
      return [
        "Application Submitted",
        "Application Viewed", 
        "Under Review",
        status === 'accepted' ? "Application Accepted" : "Application Rejected"
      ]
    }
    return [
      "Application Submitted",
      "Application Viewed", 
      "Under Review",
      "Final Decision"
    ]
  }

  const steps = getSteps()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-2 hover:bg-slate-100 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Application Details</h1>
          </div>
        </header>

        {/* Job Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                {opportunity.company}
              </p>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {opportunity.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span>{opportunity.location || 'Location Flexible'}</span>
                <span className="text-gray-400">•</span>
                <span>{opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}</span>
                {opportunity.deadline && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span>Deadline: {formatDate(opportunity.deadline)}</span>
                  </>
                )}
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${statusToneClasses[status] || 'bg-slate-100 text-slate-600'}`}>
              {status.replace(/_/g, ' ').charAt(0).toUpperCase() + status.replace(/_/g, ' ').slice(1)}
            </div>
          </div>
        </div>

        {/* Status Flow */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Application Status</h3>
          
          {/* Status Stepper */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => {
              const stepNumber = index + 1
              const isActive = stepNumber <= currentStep
              const isCurrent = stepNumber === currentStep
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        isActive 
                          ? isCurrent 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                            : 'bg-green-500 text-white'
                          : 'bg-gray-300 text-gray-500'
                      }`}
                    >
                      {isActive ? (
                        stepNumber === 4 ? (status === 'accepted' || status === 'submitted' ? '✓' : '✗') : '✓'
                      ) : (
                        stepNumber
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute top-4 left-8 w-24 h-0.5 -translate-y-1/2 transition-all ${
                          stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                  <p className={`text-xs mt-3 text-center font-medium ${
                    isActive ? 'text-slate-900' : 'text-gray-400'
                  }`}>
                    {step}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Current Status Message */}
          <div className={`p-4 rounded-lg ${
            status === 'accepted' ? 'bg-emerald-50' : 
            status === 'rejected' || status === 'declined' ? 'bg-rose-50' : 
            'bg-blue-50'
          }`}>
            <p className={`text-sm font-medium ${
              status === 'accepted' ? 'text-emerald-700' : 
              status === 'rejected' || status === 'declined' ? 'text-rose-700' : 
              'text-blue-700'
            }`}>
              {getCurrentStatusMessage()}
            </p>
          </div>

          {/* Final Status Display */}
          {status === 'accepted' && (
            <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <p className="text-emerald-700 font-semibold text-center">
                🎉 Congratulations! Your application has been accepted!
              </p>
              <p className="text-emerald-600 text-sm text-center mt-2">
                Check your email for next steps and further instructions.
              </p>
            </div>
          )}

          {(status === 'rejected' || status === 'declined') && (
            <div className="mt-6 p-4 bg-rose-50 rounded-lg border border-rose-200">
              <p className="text-rose-700 font-semibold text-center">
                ❌ Application Not Selected
              </p>
              <p className="text-rose-600 text-sm text-center mt-2">
                Thank you for your interest. Keep applying for other opportunities!
              </p>
              {reviewerNote && (
                <div className="mt-3 p-3 bg-white rounded border border-rose-200">
                  <p className="text-rose-600 text-sm">
                    <strong>Feedback:</strong> {reviewerNote}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Application Timeline</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-slate-900">Application Submitted</p>
                <p className="text-xs text-slate-500">{formatDate(submittedAt)}</p>
              </div>
            </div>
            {updatedAt && updatedAt !== submittedAt && (
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  status === 'accepted' ? 'bg-emerald-600' : 
                  status === 'rejected' ? 'bg-rose-600' : 
                  'bg-amber-600'
                }`}></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {status === 'accepted' ? 'Application Accepted' : 
                     status === 'rejected' ? 'Application Rejected' : 
                     'Status Updated'}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4">
          <Link
            to={`/dashboard/opportunities/${opportunity.id}`}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            View Opportunity
          </Link>
          <button
            onClick={() => navigate('/dashboard/applications')}
            className="flex-1 rounded-xl bg-sky-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationDetail
