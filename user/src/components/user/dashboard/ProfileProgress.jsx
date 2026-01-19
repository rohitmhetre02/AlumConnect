const ProfileProgress = ({ percentage = 0, loading = false, onRefresh, lastUpdated, onOpenProfile }) => {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100)

  const handleNavigate = () => {
    if (typeof onOpenProfile === 'function') {
      onOpenProfile()
    }
  }

  return (
    <article className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Profile completeness</p>
          {lastUpdated ? (
            <p className="text-xs text-slate-500">Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-600 transition hover:border-primary hover:text-primary"
            >
              Refresh
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleNavigate}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm transition hover:bg-primary-dark"
            aria-label="Go to profile"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
              <path d="M7 5l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex items-baseline gap-3">
        <p className="text-5xl font-bold text-slate-900">{loading ? '—' : `${clampedPercentage}%`}</p>
        <p className="text-sm text-slate-500">Keep your profile up to date to stand out.</p>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${loading ? 'bg-primary/40' : 'bg-primary'}`}
          style={{ width: loading ? '20%' : `${clampedPercentage}%`, transition: 'width 300ms ease' }}
        ></div>
      </div>
    </article>
  )
}

export default ProfileProgress
