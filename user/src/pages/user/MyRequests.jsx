import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useMentorRequests from '../../hooks/useMentorRequests'

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
}

const formatDateTime = (value) => {
  if (!value) return '—'
  try {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch (error) {
    return '—'
  }
}

const getJoinButtonState = (scheduledDateTime) => {
  if (!scheduledDateTime) return null
  
  const now = new Date()
  const meetingTime = new Date(scheduledDateTime)
  const timeDiff = meetingTime.getTime() - now.getTime()
  const hoursDiff = timeDiff / (1000 * 60 * 60)
  
  if (hoursDiff > 3) {
    return { text: 'Starts at ' + formatDateTime(scheduledDateTime), disabled: false, variant: 'primary' }
  } else if (hoursDiff <= 0) {
    return { text: 'Expired', disabled: true, variant: 'slate' }
  } else {
    return { text: 'Join', disabled: false, variant: 'emerald' }
  }
}

const MyRequests = () => {
  const { requests, loading, error, refresh, selfId, role, confirmRequest } = useMentorRequests()
  const [activeTab, setActiveTab] = useState('sent')
  const [confirmationModal, setConfirmationModal] = useState({ open: false, request: null, selectedIndex: 0, submitting: false, error: '' })

  const { sent, received } = useMemo(() => {
    const result = { sent: [], received: [] }
    ;(Array.isArray(requests) ? requests : []).forEach((request) => {
      const normalizedStatus = request.status?.toLowerCase?.() || request.status || 'pending'
      const base = { ...request, status: normalizedStatus, isSent: request.menteeId === selfId }

      if (base.isSent) {
        result.sent.push(base)
      }
      if (request.mentorId === selfId) {
        result.received.push(base)
      }
    })
    return result
  }, [requests, selfId])

  const activeRequests = activeTab === 'sent' ? sent : received

  const grouped = useMemo(() => {
    const buckets = { pending: [], accepted: [], confirmed: [], rejected: [] }
    activeRequests.forEach((request) => {
      if (request.status === 'confirmed') buckets.confirmed.push(request)
      else if (request.status === 'accepted') buckets.accepted.push(request)
      else if (request.status === 'rejected') buckets.rejected.push(request)
      else buckets.pending.push(request)
    })
    return buckets
  }, [activeRequests])

  const openConfirmationModal = (request) => {
    const slots = Array.isArray(request.proposedSlots) ? request.proposedSlots : []
    setConfirmationModal({
      open: true,
      request,
      selectedIndex: slots.length ? 0 : -1,
      submitting: false,
      error: slots.length ? '' : 'No schedule options were provided by the mentor.',
    })
  }

  const closeConfirmationModal = () => {
    setConfirmationModal({ open: false, request: null, selectedIndex: 0, submitting: false, error: '' })
  }

  const handleConfirmSchedule = async () => {
    const { request, selectedIndex } = confirmationModal
    if (!request) return

    const slots = Array.isArray(request.proposedSlots) ? request.proposedSlots : []
    const activeSlot = slots[selectedIndex]

    if (!activeSlot) {
      setConfirmationModal((prev) => ({ ...prev, error: 'Select one of the schedule options to continue.' }))
      return
    }

    try {
      setConfirmationModal((prev) => ({ ...prev, submitting: true, error: '' }))
      await confirmRequest(request.id, {
        slotIndex: selectedIndex,
        scheduledMode: activeSlot.mode,
      })
      closeConfirmationModal()
    } catch (err) {
      setConfirmationModal((prev) => ({
        ...prev,
        submitting: false,
        error: err?.message ?? 'Unable to confirm this schedule. Please try again.',
      }))
    }
  }

  const renderCard = (request) => {
    const tone = STATUS_TONE[request.status] ?? STATUS_TONE.pending
    const counterpartName = request.isSent ? request.mentorName || 'Mentor' : request.menteeName || 'Mentee'
    const counterpartEmail = request.isSent ? request.mentorEmail : request.menteeEmail
    const avatar = request.isSent ? request.mentorAvatar : request.menteeAvatar
    const scheduledLabel = request.scheduledDateTime
      ? `${formatDateTime(request.scheduledDateTime)} • ${(request.scheduledMode || request.preferredMode || 'online').toUpperCase()}`
      : null
    const proposedSlots = Array.isArray(request.proposedSlots) ? request.proposedSlots : []
    const awaitingConfirmation = request.status === 'accepted'

    return (
      <article key={request.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-primary/30 hover:shadow-md">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-1 items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {avatar ? <img src={avatar} alt={counterpartName} className="h-full w-full object-cover" /> : counterpartName.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{counterpartEmail || 'Mentorship contact'}</p>
              <h3 className="text-lg font-semibold text-slate-900">{counterpartName}</h3>
              <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-slate-400">
                <span>{request.serviceName || 'Mentorship session'}</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <span>{(request.serviceMode || request.preferredMode || 'online').toUpperCase()}</span>
                {request.preferredDateTime ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{formatDateTime(request.preferredDateTime)}</span>
                  </>
                ) : null}
              </div>
              {scheduledLabel ? (
                <p className="mt-2 text-xs font-semibold text-primary/80">
                  Confirmed schedule: <span className="font-mono text-slate-700">{scheduledLabel}</span>
                </p>
              ) : awaitingConfirmation && proposedSlots.length ? (
                <div className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-600">
                  <p className="font-semibold uppercase tracking-[0.3em] text-amber-500">Awaiting confirmation</p>
                  <ul className="mt-2 space-y-1 text-[11px] text-amber-700">
                    {proposedSlots.map((slot, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span>{formatDateTime(slot.slotDate)}</span>
                        <span className="font-semibold">{slot.mode?.toUpperCase?.() ?? 'ONLINE'}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {!request.isSent && Array.isArray(request.menteeSkills) && request.menteeSkills.length ? (
                <div className="flex flex-wrap gap-2 pt-2">
                  {request.menteeSkills.map((skill) => (
                    <span key={skill} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
              {Number.isFinite(request.servicePrice) && request.servicePrice > 0 ? (
                <p className="text-xs font-semibold text-slate-500">Quoted price: ₹{request.servicePrice}</p>
              ) : null}
              {request.notes ? <p className="mt-3 text-sm text-slate-500">{request.notes}</p> : null}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 text-right">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{request.status}</span>
            <div className="text-[11px] text-slate-400">
              <p>Requested {formatDateTime(request.createdAt)}</p>
              {request.updatedAt ? <p>Updated {formatDateTime(request.updatedAt)}</p> : null}
            </div>
            {request.isSent && awaitingConfirmation && proposedSlots.length ? (
              <button
                type="button"
                onClick={() => openConfirmationModal(request)}
                className="rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                Select Schedule
              </button>
            ) : null}

            {request.isSent && request.meetingLink && request.scheduledDateTime ? (
              <button
                type="button"
                onClick={() => window.open(request.meetingLink, '_blank')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  getJoinButtonState(request.scheduledDateTime)?.disabled
                    ? 'border border-slate-200 text-slate-400 cursor-not-allowed'
                    : `border border-${getJoinButtonState(request.scheduledDateTime)?.variant} bg-${getJoinButtonState(request.scheduledDateTime)?.variant} text-white hover:bg-${getJoinButtonState(request.scheduledDateTime)?.variant}/90`
                }`}
                disabled={getJoinButtonState(request.scheduledDateTime)?.disabled}
              >
                {getJoinButtonState(request.scheduledDateTime)?.text}
              </button>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  const renderSection = (title, items, emptyMessage) => (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length}</span>
      </header>
      {items.length ? <div className="spacey-3 space-y-3">{items.map(renderCard)}</div> : <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-4 text-sm text-slate-500">{emptyMessage}</p>}
    </section>
  )

  const tabs = [
    { key: 'sent', label: 'Sent by me', show: true },
    { key: 'received', label: 'Received', show: ['alumni', 'alumni-student'].includes(role) },
    { key: 'opportunities', label: 'Opportunities', show: true },
    { key: 'connections', label: 'Connection Requests', show: true },
  ].filter((tab) => tab.show)

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">
          <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">My Activity</p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">Mentorship Requests</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Keep track of mentorship requests you have sent or received, and monitor their status over time.
                </p>
              </div>
              <button
                type="button"
                onClick={refresh}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
              >
                Refresh
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M4 4v6h6M20 20v-6h-6" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M20 9a7 7 0 00-12.9-3M4 15a7 7 0 0012.9 3" />
                </svg>
              </button>
            </div>
          </header>

          <div className="mt-8 flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  activeTab === tab.key ? 'bg-primary text-white shadow-sm' : 'border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              Loading your requests...
            </div>
          ) : error ? (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600 shadow-sm">
              <span>{error.message ?? 'Unable to load requests right now.'}</span>
              <button
                type="button"
                onClick={refresh}
                className="rounded-full border border-rose-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-600 transition hover:border-rose-500 hover:bg-rose-100"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {activeTab === 'sent' || activeTab === 'received' ? (
                <>
                  {renderSection('Pending', grouped.pending, activeTab === 'sent' ? 'No pending requests right now. Submit a new request to connect with mentors.' : 'No pending requests from mentees at the moment.')}
                  {renderSection(
                    'Awaiting Confirmation',
                    grouped.accepted,
                    activeTab === 'sent' ? 'No mentor responses are waiting on you yet.' : 'No mentee confirmations are pending right now.',
                  )}
                  {renderSection('Confirmed', grouped.confirmed, 'No confirmed sessions in this view yet.')}
                  {renderSection('Rejected', grouped.rejected, 'No rejected requests in this view.')}
                </>
              ) : activeTab === 'opportunities' ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-10 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.001 9.001 0 0012.9 3M12 3a9.001 9.001 0 00-9 9.255V15H3v6h6v-6h3v-1.745z" />
                    </svg>
                  </div>
                  <h2 className="mt-6 text-xl font-semibold text-slate-800">Opportunities</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    View and manage available mentorship opportunities, job postings, and networking events.
                  </p>
                  <Link
                    to="/dashboard/opportunities"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
                  >
                    Browse Opportunities
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : activeTab === 'connections' ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-10 py-14 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.314 10.314a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.1-1.1" />
                    </svg>
                  </div>
                  <h2 className="mt-6 text-xl font-semibold text-slate-800">Connection Requests</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Manage networking requests and professional connection invitations from other users.
                  </p>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                      <p className="text-sm text-slate-500">No connection requests available at the moment.</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {confirmationModal.open && confirmationModal.request ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
          <div className="w-full max-w-lg space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Confirm schedule</h2>
                <p className="text-xs text-slate-500">
                  Choose one of the mentor’s proposed slots to finalize your mentorship session.
                </p>
              </div>
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </header>
            <div className="space-y-3">
              {confirmationModal.request.proposedSlots?.map((slot, index) => {
                const isActive = confirmationModal.selectedIndex === index
                return (
                  <label
                    key={`${slot.slotDate}-${index}`}
                    className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm transition ${
                      isActive ? 'border-primary/80 bg-primary/5' : 'border-slate-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-700">{formatDateTime(slot.slotDate)}</p>
                      <p className="text-xs text-slate-500">Mode: {slot.mode?.toUpperCase?.() ?? 'ONLINE'}</p>
                    </div>
                    <input
                      type="radio"
                      name="confirmation-slot"
                      checked={isActive}
                      onChange={() => setConfirmationModal((prev) => ({ ...prev, selectedIndex: index, error: '' }))}
                    />
                  </label>
                )
              })}
              {!confirmationModal.request.proposedSlots?.length ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                  This request does not include any proposed schedule options. Please ask your mentor to provide available slots.
                </p>
              ) : null}
              {confirmationModal.error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">{confirmationModal.error}</p>
              ) : null}
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={confirmationModal.submitting}
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
              >
                {confirmationModal.submitting ? 'Confirming…' : 'Confirm schedule'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default MyRequests
