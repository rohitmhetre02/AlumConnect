import { useEffect, useMemo, useState } from 'react'

import Modal from '../../ui/Modal'
import useOpportunityReferral from '../../../hooks/useOpportunityReferral'

const formatDateTime = (value) => {
  if (!value) return null
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch (error) {
    return null
  }
}

const OpportunityReferralModal = ({
  isOpen,
  onClose,
  opportunity,
  initialReferral = null,
  onSubmitted,
}) => {
  const opportunityId = opportunity?.id ?? opportunity?._id ?? null
  const title = opportunity?.title ?? 'Request referral'

  const { referral, loading, submitting, setReferral, submitReferral } = useOpportunityReferral(
    opportunityId,
    {
      autoFetch: Boolean(isOpen && opportunityId && !initialReferral),
    },
  )

  const activeReferral = useMemo(() => {
    if (referral) return referral
    if (initialReferral) return initialReferral
    return null
  }, [referral, initialReferral])

  const [proposal, setProposal] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeFileName, setResumeFileName] = useState('')
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setProposal('')
      setResumeFile(null)
      setResumeFileName('')
      setLocalError('')
      return
    }

    if (initialReferral) {
      setReferral(initialReferral)
    }
  }, [isOpen, initialReferral, setReferral])

  useEffect(() => {
    if (!isOpen) return
    if (activeReferral) {
      setProposal(activeReferral.proposal ?? '')
      setResumeFileName(activeReferral.resumeFileName ?? '')
    } else {
      setProposal('')
      setResumeFileName('')
    }
    setResumeFile(null)
  }, [isOpen, activeReferral])

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    setResumeFile(file || null)
    setResumeFileName(file?.name || activeReferral?.resumeFileName || '')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')

    if (!proposal.trim()) {
      setLocalError('Please describe why you are requesting this referral.')
      return
    }

    try {
      const result = await submitReferral({ proposal, resumeFile })
      if (result) {
        onSubmitted?.(result)
      }
      onClose?.()
    } catch (error) {
      if (error?.code === 'VALIDATION_ERROR') {
        setLocalError(error.message)
      }
    }
  }

  const handleClose = () => {
    if (submitting) return
    onClose?.()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Request referral • ${title}`} width="max-w-2xl">
      {!opportunityId ? (
        <div className="space-y-2 text-sm text-slate-500">
          <p>Select an opportunity to request a referral.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
            <header className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">Opportunity</p>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                {opportunity?.company ? (
                  <p className="text-xs text-slate-500">{opportunity.company}</p>
                ) : null}
              </div>
              {activeReferral ? (
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    activeReferral.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : activeReferral.status === 'reviewed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {activeReferral.status === 'submitted' ? 'Submitted' : activeReferral.status}
                </span>
              ) : null}
            </header>
            {activeReferral?.submittedAt ? (
              <p className="text-xs text-slate-500">
                Submitted {formatDateTime(activeReferral.submittedAt)}{' '}
                {activeReferral.updatedAt && activeReferral.updatedAt !== activeReferral.submittedAt
                  ? `(updated ${formatDateTime(activeReferral.updatedAt)})`
                  : ''}
              </p>
            ) : (
              <p className="text-xs text-slate-500">Craft a short note explaining why you’re a great fit.</p>
            )}
          </section>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700" htmlFor="referral-proposal">
              Proposal
              <span className="ml-2 text-xs font-semibold text-primary">(Required)</span>
            </label>
            <textarea
              id="referral-proposal"
              name="proposal"
              value={proposal}
              onChange={(event) => setProposal(event.target.value)}
              rows={6}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
              placeholder="Share a brief pitch or context for your referral request."
              disabled={loading || submitting}
              required
            />
            {localError ? <p className="text-xs font-semibold text-rose-500">{localError}</p> : null}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700" htmlFor="referral-resume">
                  Resume or supporting document
                </label>
                <p className="text-xs text-slate-500">PDF, DOC, PPT, XLS, or TXT up to 25 MB.</p>
              </div>
              {activeReferral?.resumeUrl ? (
                <a
                  href={activeReferral.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:text-primary/80"
                >
                  View uploaded résumé
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-6" />
                    <path d="M15 10l-3-3-3 3" />
                    <path d="M12 7v12" />
                  </svg>
                </a>
              ) : null}
            </div>
            <input
              id="referral-resume"
              name="resume"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.rtf,.ppt,.pptx,.xls,.xlsx"
              onChange={handleFileChange}
              disabled={loading || submitting}
              className="block w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
            />
            {resumeFileName ? (
              <p className="text-xs text-slate-500">Selected: {resumeFileName}</p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              disabled={submitting}
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              {activeReferral ? (
                <span className="text-xs text-slate-500">Existing request will be updated.</span>
              ) : null}
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting || loading}
              >
                {submitting ? 'Sending…' : activeReferral ? 'Update request' : 'Send request'}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default OpportunityReferralModal
