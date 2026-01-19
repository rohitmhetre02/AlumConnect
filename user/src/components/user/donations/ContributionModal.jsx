import { useMemo, useState } from 'react'

import Modal from '../../../components/ui/Modal'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric)
}

const ContributionModal = ({ isOpen, onClose, onSubmit, campaign }) => {
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const goalAmount = useMemo(() => Number(campaign?.goalAmount ?? 0), [campaign])
  const raisedAmount = useMemo(() => Number(campaign?.raisedAmount ?? 0), [campaign])
  const proposedAmount = useMemo(() => {
    const numeric = parseFloat(amount)
    return Number.isFinite(numeric) ? numeric : 0
  }, [amount])

  const projectedRaised = useMemo(() => {
    if (!Number.isFinite(raisedAmount)) return 0
    return raisedAmount + (Number.isFinite(proposedAmount) ? proposedAmount : 0)
  }, [raisedAmount, proposedAmount])
  const progress = useMemo(() => {
    if (!goalAmount || goalAmount <= 0) return 0
    return Math.min(100, Math.round((projectedRaised / goalAmount) * 100))
  }, [goalAmount, projectedRaised])

  const handleClose = () => {
    if (isSubmitting) return
    setAmount('')
    setMessage('')
    setError('')
    onClose?.()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const numericAmount = parseFloat(amount)
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid contribution amount greater than 0.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit?.({ amount: numericAmount, message })
      setAmount('')
      setMessage('')
      onClose?.()
    } catch (submitError) {
      setError(submitError?.message ?? 'Unable to process your contribution right now.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAmountChange = (event) => {
    const { value } = event.target
    if (value === '') {
      setAmount('')
      return
    }

    const sanitized = value.replace(/[^0-9.]/g, '')
    const decimalMatch = sanitized.match(/^\d*(?:\.\d{0,2})?$/)
    if (!decimalMatch) {
      return
    }

    setAmount(sanitized)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Contribute to this campaign"
      width="max-w-xl"
      closeOnBackdrop={false}
      closeOnEscape={false}
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="donation-amount" className="block text-sm font-semibold text-slate-700">
            Contribution amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">₹</span>
            <input
              id="donation-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              autoFocus
              pattern="^\d*(?:\.\d{0,2})?$"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className="w-full rounded-full border border-slate-200 py-3 pl-9 pr-4 text-sm font-semibold text-slate-800 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="donation-message" className="block text-sm font-semibold text-slate-700">
            Message (optional)
          </label>
          <textarea
            id="donation-message"
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Share a note with the campaign organizers"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Current raised</span>
            <span className="font-semibold text-slate-900">{formatCurrency(raisedAmount)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-slate-600">
            <span>After your contribution</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(projectedRaised)}</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Goal: {formatCurrency(goalAmount)}</p>
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? 'Processing…' : 'Contribute'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ContributionModal
