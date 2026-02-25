import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Clock, RefreshCw, ShieldAlert, Users2 } from 'lucide-react'
import useRegistrationApprovals from '../../hooks/useRegistrationApprovals'
import { REGISTRATION_STATUS } from '../../utils/registrationStatus'
import { buildDisplayName, useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'

const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'all' },
  { label: 'Students', value: 'student' },
  { label: 'Alumni', value: 'alumni' },
]

const STATUS_BADGE = {
  [REGISTRATION_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [REGISTRATION_STATUS.APPROVED]: 'bg-emerald-100 text-emerald-700',
  [REGISTRATION_STATUS.REJECTED]: 'bg-rose-100 text-rose-700',
}

const emptyStateCopy = {
  student: {
    title: 'No pending student registrations',
    message: 'You are all caught up with student registrations for your department.',
  },
  alumni: {
    title: 'No pending alumni registrations',
    message: 'All alumni registrations in your department have been reviewed.',
  },
  all: {
    title: 'No pending registrations',
    message: 'New registrations from your department will appear here for review.',
  },
}

const StatsCard = ({ icon: Icon, title, count, accent }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${accent || ''}`}>
    <div className="flex items-center gap-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-[0.25em]">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{count}</p>
      </div>
    </div>
  </div>
)

const PendingRegistrationRow = ({ entry, onDecision, loading }) => {
  const displayName = entry.name || buildDisplayName(entry, entry.email)
  const createdLabel = entry.createdAt ? new Date(entry.createdAt).toLocaleString() : '—'

  const handleApprove = () => onDecision(entry.id, entry.role, 'approve')
  const handleReject = () => onDecision(entry.id, entry.role, 'reject')

  return (
    <tr className="border-b border-slate-100 last:border-none">
      <td className="px-4 py-4 align-top">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">{entry.email}</p>
          <div className="flex flex-wrap gap-2 pt-2 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              {entry.role === 'student' ? 'Student' : 'Alumni'}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              {entry.department || 'Department N/A'}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-xs ${STATUS_BADGE[entry.registrationStatus]}`}>
              {entry.registrationStatus}
            </span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="grid gap-1 text-xs text-slate-600">
          {entry.metadata.prnNumber ? (
            <span><span className="font-medium">PRN:</span> {entry.metadata.prnNumber}</span>
          ) : null}
          {entry.metadata.admissionYear ? (
            <span><span className="font-medium">Admission Year:</span> {entry.metadata.admissionYear}</span>
          ) : null}
          {entry.metadata.expectedPassoutYear ? (
            <span><span className="font-medium">Expected Passout:</span> {entry.metadata.expectedPassoutYear}</span>
          ) : null}
          {entry.metadata.passoutYear ? (
            <span><span className="font-medium">Passout Year:</span> {entry.metadata.passoutYear}</span>
          ) : null}
          <span><span className="font-medium">Submitted:</span> {createdLabel}</span>
        </div>
      </td>
      <td className="px-4 py-4 align-top">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            <CheckCircle2 className="h-4 w-4" /> Approve
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-200 disabled:cursor-not-allowed disabled:bg-rose-50"
          >
            <ShieldAlert className="h-4 w-4" /> Reject
          </button>
        </div>
      </td>
    </tr>
  )
}

const CoordinatorRegistrationApprovals = () => {
  const { user } = useAuth()
  const addToast = useToast()
  const {
    loading,
    error,
    setError,
    getCoordinatorPending,
    getCoordinatorStats,
    coordinatorDecision,
  } = useRegistrationApprovals()

  const [roleFilter, setRoleFilter] = useState('all')
  const [pendingData, setPendingData] = useState({ students: [], alumni: [], coordinator: null })
  const [stats, setStats] = useState({ student: { pending: 0 }, alumni: { pending: 0 } })
  const [decisionLoading, setDecisionLoading] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const pendingResponse = await getCoordinatorPending(roleFilter)
      const statsResponse = await getCoordinatorStats()

      setPendingData(pendingResponse.data)
      setStats(statsResponse.data)
    } catch (err) {
      addToast({ tone: 'error', title: 'Unable to load registrations', description: err?.message })
    }
  }, [addToast, getCoordinatorPending, getCoordinatorStats, roleFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const combinedEntries = useMemo(() => {
    if (roleFilter === 'student') return pendingData.students ?? []
    if (roleFilter === 'alumni') return pendingData.alumni ?? []
    return [...(pendingData.students ?? []), ...(pendingData.alumni ?? [])]
  }, [pendingData.students, pendingData.alumni, roleFilter])

  const handleDecision = async (userId, role, action) => {
    try {
      setDecisionLoading(true)
      const reason = action === 'reject' ? window.prompt('Provide a reason for rejection') : undefined

      await coordinatorDecision({ userId, role, action, reason })
      addToast({ tone: 'success', title: `Registration ${action}d` })
      await loadData()
    } catch (err) {
      addToast({ tone: 'error', title: 'Unable to update registration', description: err?.message })
    } finally {
      setDecisionLoading(false)
    }
  }

  const emptyCopy = emptyStateCopy[roleFilter] ?? emptyStateCopy.all

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Registration Approvals</p>
        <h1 className="text-3xl font-bold text-slate-900">Department Registrations</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Review and approve new student and alumni registrations submitted for the {user?.profile?.department || 'department'} department.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard icon={Users2} title="Pending Students" count={stats.student?.pending ?? 0} />
        <StatsCard icon={Users2} title="Pending Alumni" count={stats.alumni?.pending ?? 0} />
        <StatsCard icon={Clock} title="Total Pending" count={combinedEntries.length} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-sky-500' : ''}`} />
          Last synced moments ago
        </div>
        <div className="ml-auto flex gap-3">
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow focus:border-sky-400 focus:outline-none"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-3 text-xs font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        {combinedEntries.length ? (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Registrant</th>
                <th className="px-4 py-4">Details</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedEntries.map((entry) => (
                <PendingRegistrationRow
                  key={entry.id}
                  entry={entry}
                  onDecision={handleDecision}
                  loading={decisionLoading}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <Clock className="h-10 w-10 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900">{emptyCopy.title}</h3>
            <p className="max-w-md text-sm text-slate-500">{emptyCopy.message}</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default CoordinatorRegistrationApprovals
