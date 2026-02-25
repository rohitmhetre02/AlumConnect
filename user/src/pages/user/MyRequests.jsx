import { useMemo, useState } from 'react'
import useMentorRequests from '../../hooks/useMentorRequests'

const STATUS_TONE = {
  pending: 'bg-amber-100 text-amber-700',
  review: 'bg-purple-100 text-purple-700',
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
  const diffHours = (meetingTime.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (diffHours > 3) {
    return { text: `Starts at ${formatDateTime(scheduledDateTime)}`, disabled: false, tone: 'primary' }
  }
  if (diffHours <= 0) {
    return { text: 'Expired', disabled: true, tone: 'slate' }
  }
  return { text: 'Join', disabled: false, tone: 'emerald' }
}

const MyRequests = () => {
  const { requests, loading, error, refresh, selfId, role, confirmRequest, rejectRequest } = useMentorRequests()
  const [activeTab, setActiveTab] = useState('sent')
  const [confirmationModal, setConfirmationModal] = useState({
    open: false,
    request: null,
    selectedIndex: 0,
    submitting: false,
    error: '',
  })

  const openConfirmationModal = (request) => {
    setConfirmationModal({
      open: true,
      request,
      selectedIndex: 0,
      submitting: false,
      error: '',
    })
  }

  const closeConfirmationModal = () => {
    if (confirmationModal.submitting) return
    setConfirmationModal({
      open: false,
      request: null,
      selectedIndex: 0,
      submitting: false,
      error: '',
    })
  }

  const { sent, received } = useMemo(() => {
    const buckets = { sent: [], received: [] }
    ;(Array.isArray(requests) ? requests : []).forEach((request) => {
      const normalizedStatus = request.status?.toLowerCase?.() || request.status || 'pending'
      const base = { ...request, status: normalizedStatus, isSent: request.menteeId === selfId }

      if (base.isSent) buckets.sent.push(base)
      if (request.mentorId === selfId) buckets.received.push(base)
    })
    return buckets
  }, [requests, selfId])

  const activeRequests = activeTab === 'sent' ? sent : received

  const grouped = useMemo(() => {
    const buckets = { pending: [], review: [], accepted: [], confirmed: [], rejected: [] }
    activeRequests.forEach((request) => {
      if (request.status === 'confirmed') buckets.confirmed.push(request)
      else if (request.status === 'accepted') buckets.accepted.push(request)
      else if (request.status === 'rejected') buckets.rejected.push(request)
      else if (request.status === 'review') buckets.review.push(request)
      else buckets.pending.push(request)
    })
    return buckets
  }, [activeRequests])

  const handleConfirmSchedule = async () => {
    const { request, selectedIndex } = confirmationModal
    if (!request) return

    const slots = Array.isArray(request.proposedSlots) ? request.proposedSlots : []
    const selectedSlot = slots[selectedIndex]

    if (!selectedSlot) {
      setConfirmationModal((prev) => ({ ...prev, error: 'Select one of the schedule options to continue.' }))
      return
    }

    try {
      setConfirmationModal((prev) => ({ ...prev, submitting: true, error: '' }))
      await confirmRequest(request.id, {
        slotIndex: selectedIndex,
        scheduledMode: selectedSlot.mode,
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

  const handleRejectProposal = async (request) => {
    if (!window.confirm('Are you sure you want to reject this mentorship proposal?')) {
      return
    }

    try {
      await rejectRequest(request.id)
      refresh()
    } catch (err) {
      console.error('Failed to reject proposal:', err)
      alert('Unable to reject proposal. Please try again.')
    }
  }

  const renderRequestCard = (request) => {
    const tone = STATUS_TONE[request.status] ?? STATUS_TONE.pending
    const counterpartName = request.isSent ? request.mentorName || 'Mentor' : request.menteeName || 'Mentee'
    const counterpartEmail = request.isSent ? request.mentorEmail : request.menteeEmail
    const avatar = request.isSent ? request.mentorAvatar : request.menteeAvatar
    const awaitingConfirmation = request.status === 'accepted'
    const proposedSlots = Array.isArray(request.proposedSlots) ? request.proposedSlots : []
    const scheduleLabel = request.scheduledDateTime
      ? `${formatDateTime(request.scheduledDateTime)} • ${(request.scheduledMode || request.preferredMode || 'online').toUpperCase()}`
      : null

    const joinButton = getJoinButtonState(request.scheduledDateTime)

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
              {scheduleLabel ? (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-semibold text-primary/80">
                    Confirmed schedule: <span className="font-mono text-slate-700">{scheduleLabel}</span>
                  </p>
                  {request.meetingLink && (
                    <div className="rounded-2xl border border-green-200 bg-green-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-green-600">Meeting Link</p>
                      <a 
                        href={request.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-1 block text-xs text-green-700 hover:text-green-800 underline break-all"
                      >
                        {request.meetingLink}
                      </a>
                    </div>
                  )}
                </div>
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
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => openConfirmationModal(request)}
                  className="rounded-full border border-primary px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                >
                  Select Schedule
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectProposal(request)}
                  className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-500 hover:text-white"
                >
                  Reject Proposal
                </button>
              </div>
            ) : null}

            {request.isSent && request.meetingLink && request.scheduledDateTime && joinButton ? (
              <button
                type="button"
                onClick={() => window.open(request.meetingLink, '_blank')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  joinButton.disabled
                    ? 'border border-slate-200 text-slate-400 cursor-not-allowed'
                    : `border border-${joinButton.tone} bg-${joinButton.tone} text-white hover:bg-${joinButton.tone}/90`
                }`}
                disabled={joinButton.disabled}
              >
                {joinButton.text}
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
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length}</span>
      </header>
      {items.length ? (
        <div className="space-y-3">{items.map(renderRequestCard)}</div>
      ) : (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-4 text-sm text-slate-500">{emptyMessage}</p>
      )}
    </section>
  )

  const tabs = [
    { key: 'sent', label: 'Sent by me', show: true },
    { key: 'received', label: 'Received', show: ['alumni', 'alumni-student'].includes(role) },
  ].filter((tab) => tab.show)

  const hasMultipleTabs = tabs.length > 1

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

          {hasMultipleTabs ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'border border-slate-200 text-slate-600 hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          ) : null}

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
                Retry
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {renderSection(
                'Pending',
                grouped.pending,
                activeTab === 'sent'
                  ? 'No pending requests right now. Submit a new request to connect with mentors.'
                  : 'No pending requests from mentees at the moment.',
              )}
              {renderSection(
                'Under Review',
                grouped.review,
                activeTab === 'sent' ? 'No requests are currently under review.' : 'No requests are under review.',
              )}
              {renderSection(
                'Awaiting Confirmation',
                grouped.accepted,
                activeTab === 'sent' ? 'No mentor responses are waiting on you yet.' : 'No mentee confirmations are pending right now.',
              )}
              {renderSection('Confirmed', grouped.confirmed, 'No confirmed sessions in this view yet.')}
              {renderSection('Rejected', grouped.rejected, 'No rejected requests in this view.')}
            </div>
          )}
        </div>
      </div>

      {confirmationModal.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => {
              if (!confirmationModal.submitting) {
                closeConfirmationModal()
              }
            }}
          />
          <div className="relative z-10 w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <header className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Confirm schedule</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {confirmationModal.request?.mentorName || 'Mentorship session'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Choose one of the mentor’s proposed slots to finalize your mentorship session.</p>
              </div>
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </header>

            <div className="mt-6 space-y-3">
              {Array.isArray(confirmationModal.request?.proposedSlots) && confirmationModal.request.proposedSlots.length ? (
                confirmationModal.request.proposedSlots.map((slot, index) => {
                  const isActive = confirmationModal.selectedIndex === index
                  return (
                    <label
                      key={`${slot.slotDate ?? index}-${index}`}
                      className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-sm transition ${
                        isActive ? 'border-primary/80 bg-primary/5' : 'border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-700">{formatDateTime(slot.slotDate ?? slot.preferredDateTime)}</p>
                        <p className="text-xs text-slate-500">Mode: {slot.mode?.toUpperCase?.() ?? 'ONLINE'}</p>
                      </div>
                      <input
                        type="radio"
                        name="confirmation-slot"
                        checked={isActive}
                        onChange={() =>
                          setConfirmationModal((prev) => ({ ...prev, selectedIndex: index, error: '', submitting: false }))
                        }
                      />
                    </label>
                  )
                })
              ) : (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">
                  This request does not include any proposed schedule options. Please ask your mentor to provide available slots.
                </p>
              )}

              {confirmationModal.error ? (
                <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-600">{confirmationModal.error}</p>
              ) : null}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirmationModal}
                className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-primary/40 hover:text-primary"
                disabled={confirmationModal.submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={confirmationModal.submitting || confirmationModal.selectedIndex < 0}
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
