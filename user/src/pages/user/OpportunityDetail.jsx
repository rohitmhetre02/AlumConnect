import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import OpportunityReferralBadge from '../../components/user/opportunities/OpportunityReferralBadge'
import OpportunityReferralModal from '../../components/user/opportunities/OpportunityReferralModal'
import useOpportunityReferral from '../../hooks/useOpportunityReferral'
import { useOpportunity } from '../../hooks/useOpportunities'
import { useAuth } from '../../context/AuthContext'

const getDaysLeft = (deadline) => {
  if (!deadline) return null

  const today = new Date()
  const deadlineDate = new Date(deadline)

  const diff = deadlineDate.getTime() - today.getTime()

  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const formatDate = (value) => {
  if (!value) return 'Not specified'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not specified'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const OpportunityDetail = () => {

  const { opportunityId } = useParams()
  const navigate = useNavigate()
  const { role } = useAuth()

  const { data, loading, error } = useOpportunity(opportunityId)

  const [isReferralModalOpen, setReferralModalOpen] = useState(false)

  const { referral, setReferral } =
    useOpportunityReferral(opportunityId, { autoFetch: Boolean(opportunityId) })

  const isStudent = role?.toLowerCase() === 'student'

  const descriptionParagraphs =
    (data?.description ?? '')
      .split(/\n+/)
      .map(p => p.trim())
      .filter(Boolean)

  const handleReferralSubmitted = (result) => {
    if (result) setReferral(result)
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500">
        Loading opportunity...
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center p-10">
        Opportunity not found
      </div>
    )
  }

  const daysLeft = getDaysLeft(data.deadline)
  const isExpired = daysLeft !== null && daysLeft < 0

  return (

    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">

      {/* Back button */}

      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-600 hover:text-primary flex items-center gap-2"
      >
        ← Back to Opportunities
      </button>


      {/* Header */}

      <section className="bg-white border rounded-3xl p-10 shadow-sm">

        <div className="space-y-4">

          <h1 className="text-3xl font-bold text-slate-900">
            {data.title}
          </h1>

          <p className="text-slate-600">
            {data.company} • {data.location}
          </p>

        </div>


        {/* Summary */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

          <SummaryTile label="Company" value={data.company} />
          <SummaryTile label="Role Type" value={data.type} />
          <SummaryTile label="Location" value={data.location} />
          <SummaryTile label="Deadline" value={formatDate(data.deadline)} />

        </div>

      </section>


      {/* Content */}

      <div className="grid lg:grid-cols-3 gap-8">


        {/* LEFT SIDE */}

        <div className="lg:col-span-2 space-y-8">


          {/* Description */}

          <section className="bg-white border rounded-3xl p-8">

            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Role Overview
            </h2>

            <div className="space-y-4 text-slate-600">

              {descriptionParagraphs.length
                ? descriptionParagraphs.map((p, i) => <p key={i}>{p}</p>)
                : <p>No description available.</p>
              }

            </div>

          </section>


          {/* Skills */}

          {(data.skills ?? []).length > 0 && (

            <section className="bg-white border rounded-3xl p-8">

              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Required Skills
              </h2>

              <div className="flex flex-wrap gap-3">

                {data.skills.map((skill) => (

                  <span
                    key={skill}
                    className="px-4 py-2 text-sm rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {skill}
                  </span>

                ))}

              </div>

            </section>

          )}

        </div>


        {/* RIGHT PANEL */}

        <aside className="space-y-6">


          {/* Take Action */}

          <section className="bg-white border rounded-3xl p-8">

            <h3 className="text-lg font-semibold text-slate-900">
              Take Action
            </h3>

            <p className="text-sm text-slate-500 mt-2">
              Request referral from alumni or network members.
            </p>

            {(isStudent || role) && (

              <button
                onClick={() => {
                  if (!isExpired) setReferralModalOpen(true)
                }}
                disabled={isExpired}
                className={`mt-6 w-full py-3 rounded-full font-semibold transition
                ${isExpired
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
              >

                {isExpired
                  ? 'Applications Closed'
                  : referral
                    ? 'Update Referral Request'
                    : 'Request Referral'}

              </button>

            )}

            {referral && (
              <div className="mt-4">
                <OpportunityReferralBadge referral={referral} />
              </div>
            )}

          </section>


          {/* Application Timeline */}

          <section className="bg-white border rounded-3xl p-8">

            <h3 className="text-lg font-semibold text-slate-900">
              Application Timeline
            </h3>

            <div className="mt-6 space-y-6">

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Application deadline
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  {formatDate(data.deadline)}
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  {daysLeft !== null
                    ? `${Math.max(daysLeft, 0)} days left`
                    : 'No deadline specified'}
                </p>

              </div>

              <div>

                <p className="text-sm font-semibold text-slate-900">
                  Opportunity posted
                </p>

                <p className="text-sm text-slate-600 mt-1">
                  {formatDate(data.postedAt)}
                </p>

              </div>

            </div>

          </section>


          {/* Posted By */}

          {data.postedBy && (

            <section className="bg-white border rounded-3xl p-8">

              <h3 className="text-lg font-semibold text-slate-900">
                Posted By
              </h3>

              <p className="mt-3 text-slate-600">
                {data.postedBy}
              </p>

              <p className="text-sm text-slate-500">
                {data.createdByRole || 'Community Member'}
              </p>

            </section>

          )}

        </aside>

      </div>


      {/* Referral Modal */}

      <OpportunityReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setReferralModalOpen(false)}
        opportunity={data}
        initialReferral={referral}
        onSubmitted={handleReferralSubmitted}
      />

    </div>

  )

}


const SummaryTile = ({ label, value }) => (

  <div className="border rounded-2xl p-5 bg-slate-50">

    <p className="text-xs uppercase text-slate-400 font-semibold">
      {label}
    </p>

    <p className="text-base font-semibold text-slate-900 mt-2">
      {value || '—'}
    </p>

  </div>

)

export default OpportunityDetail