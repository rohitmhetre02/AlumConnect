import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const baseActions = [
  {
    label: 'My Applications',
    description: 'Review every opportunity you have applied for and track live status updates.',
    to: '/dashboard/applications',
    accent: 'bg-sky-100 text-sky-700 border-sky-200',
  },
  {
    label: 'My Referrals',
    description: 'View and manage referral requests you have submitted for opportunities.',
    to: '/dashboard/opportunities',
    accent: 'bg-violet-100 text-violet-700 border-violet-200',
  },
  {
    label: 'Post Contents',
    description: 'Publish articles, events, or resources for the community.',
    to: '/dashboard/posts',
    accent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    requiresNonStudent: true,
  },
  {
    label: 'Requests',
    description: 'Respond to mentorship and referral requests awaiting your attention.',
    to: '/dashboard/requests',
    accent: 'bg-amber-100 text-amber-700 border-amber-200',
  },
]

const MyActivity = () => {
  const { role: contextRole, user } = useAuth()
  const rawRole = contextRole ?? user?.role ?? user?.profile?.role
  const normalizedRole = rawRole ? String(rawRole).trim().toLowerCase() : ''
  const isStrictStudent = normalizedRole === 'student'

  const actions = useMemo(
    () => baseActions.filter((action) => !(action.requiresNonStudent && isStrictStudent)),
    [isStrictStudent],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">My Activity</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Manage Your Engagement</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Quickly jump to the areas you use the most. Review your submitted applications, publish new content, or
            manage incoming requests from mentors and organizers.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map(({ label, description, to, accent }) => (
            <Link
              key={label}
              to={to}
              className={`group flex h-full flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md`}
            >
              <div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${accent}`}>
                  {label}
                </span>
                <p className="mt-4 text-sm text-slate-500">{description}</p>
              </div>
              <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-semibold text-sky-600 transition group-hover:text-sky-700">
                Open {label}
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}

export default MyActivity
