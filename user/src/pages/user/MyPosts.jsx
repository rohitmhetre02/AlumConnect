import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { get } from '../../utils/api'
import OpportunityReferralBadge from '../../components/user/opportunities/OpportunityReferralBadge'

const MyPosts = () => {
  const { role } = useAuth()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isStudent = String(role ?? '').trim().toLowerCase() === 'student'

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!isStudent) {
        setReferrals([])
        setLoading(false)
        return
      }

      try {
        const response = await get('/api/opportunities/referrals/me')
        const data = Array.isArray(response?.data) ? response.data : []
        setReferrals(data)
      } catch (err) {
        setError(err.message || 'Failed to load referrals')
      } finally {
        setLoading(false)
      }
    }

    fetchReferrals()
  }, [isStudent])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">My Activity</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Your Published Content</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Manage the news, events, and resources you have shared with the AlumConnect community. 
            {isStudent && ' View your referral requests below.'}
          </p>
        </header>

        {isStudent && (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">My Referral Requests</h2>
            {loading ? (
              <div className="text-center text-sm text-slate-500">Loading referrals...</div>
            ) : error ? (
              <div className="text-center text-sm text-rose-600">{error}</div>
            ) : referrals.length === 0 ? (
              <div className="text-center text-sm text-slate-500">No referral requests submitted yet.</div>
            ) : (
              <div className="space-y-4">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <h3 className="font-medium text-slate-900">{referral.opportunity?.title || 'Unknown Opportunity'}</h3>
                      <p className="text-sm text-slate-500">{referral.opportunity?.company || ''}</p>
                    </div>
                    <OpportunityReferralBadge referral={referral} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-dashed border-slate-200 bg-white/70 p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="mt-6 text-xl font-semibold text-slate-800">Content management workspace</h2>
          <p className="mt-2 text-sm text-slate-500">
            This section will soon list the content you have published, along with tools to edit or track engagement.
          </p>
        </section>
      </div>
    </div>
  )
}

export default MyPosts
