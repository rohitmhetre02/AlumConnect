const statusToneMap = {
  submitted: {
    label: 'Referral submitted',
    className: 'bg-primary/10 text-primary',
  },
  reviewed: {
    label: 'Referral reviewed',
    className: 'bg-blue-100 text-blue-700',
  },
  accepted: {
    label: 'Referral accepted',
    className: 'bg-emerald-100 text-emerald-700',
  },
  declined: {
    label: 'Referral declined',
    className: 'bg-rose-100 text-rose-700',
  },
}

const OpportunityReferralBadge = ({ referral }) => {
  if (!referral) return null
  const tone = statusToneMap[referral.status] ?? statusToneMap.submitted

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${tone.className}`}>
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
      {tone.label}
    </span>
  )
}

export default OpportunityReferralBadge
