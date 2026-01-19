const normalizeOption = (option) => {
  if (!option) return null
  if (typeof option === 'string') {
    const value = option.toLowerCase()
    return { value, label: option }
  }
  const value = option.value ?? option.label ?? ''
  if (!value) return null
  return {
    value: value.toLowerCase(),
    label: option.label ?? option.value ?? value,
  }
}

const MentorFilterBar = ({ search, onSearchChange, industry, onIndustryChange, industries = [], loading = false }) => {
  const options = (() => {
    const seen = new Set(['all industries'])
    const base = [{ value: 'all industries', label: 'All Industries' }]
    const dynamic = industries
      .map(normalizeOption)
      .filter((item) => item && !seen.has(item.value))
      .map((item) => {
        seen.add(item.value)
        return item
      })
    return [...base, ...dynamic]
  })()

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <label className="relative flex-1 min-w-[200px]">
        <span className="sr-only">Search by expertise</span>
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="7" />
            <path d="M14 14l4 4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search by expertise..."
          className="w-full rounded-full border border-slate-200 px-11 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
        />
      </label>

      <select
        value={industry}
        onChange={(e) => onIndustryChange?.(e.target.value)}
        disabled={loading}
        className="rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
      >
        Filter
      </button>
    </div>
  )
}

export default MentorFilterBar
