import { useEffect, useMemo, useState } from 'react'

const roles = ['Students', 'Alumni', 'Faculty']

const cloneFilters = (source, template) => {
  const result = {}
  Object.entries(template).forEach(([key, defaultValue]) => {
    const value = source?.[key]
    if (Array.isArray(defaultValue)) {
      result[key] = Array.isArray(value) ? [...value] : []
    } else {
      result[key] = typeof value === 'string' ? value : ''
    }
  })
  return result
}

const UserDirectoryFilter = ({
  search,
  role,
  filters,
  filterOptions,
  onSearchChange,
  onRoleChange,
  onFiltersChange,
  defaultFiltersFactory,
}) => {
  const baseFilters = useMemo(() => defaultFiltersFactory?.() ?? {}, [defaultFiltersFactory])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => cloneFilters(filters, baseFilters))

  useEffect(() => {
    setDraft(cloneFilters(filters, baseFilters))
  }, [filters, baseFilters])

  const toggleValue = (key, value) => {
    setDraft((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : []
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
      return { ...prev, [key]: next }
    })
  }

  const updateDraftField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  const clearDraft = () => {
    const reset = cloneFilters(baseFilters, baseFilters)
    setDraft(reset)
    onFiltersChange?.(reset)
    setOpen(false)
  }

  const applyFilters = () => {
    onFiltersChange?.(cloneFilters(draft, baseFilters))
    setOpen(false)
  }

  const isFilterActive = useMemo(() => {
    if (!filters) return false
    return Object.keys(baseFilters).some((key) => {
      const value = filters[key]
      const defaultValue = baseFilters[key]
      if (Array.isArray(defaultValue)) {
        return Array.isArray(value) && value.length > 0
      }
      return typeof value === 'string' && value.trim() !== ''
    })
  }, [filters, baseFilters])

  const sections = filterOptions?.sections ?? []
  const locationPlaceholder = filterOptions?.locationPlaceholder ?? 'Filter by city or campus'

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search directory</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="7" />
              <path d="M14 14l4 4" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder="Search by name"
            className="w-full rounded-full border border-slate-200 bg-white px-11 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none"
          />
        </label>

        <select
          value={role}
          onChange={(event) => onRoleChange?.(event.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none"
        >
          {roles.map((option) => (
            <option key={option} value={option.toLowerCase()}>
              {option}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
            isFilterActive
              ? 'border-primary/60 text-primary hover:border-primary hover:text-primary'
              : 'border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          Filter
          <svg
            className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 8l5 5 5-5" />
          </svg>
        </button>

        <button
          type="button"
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
        >
          Export
        </button>
      </div>

      {open && (
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              <section className="space-y-3">
                <FilterLabel title="Location" description="Filter by city, region, or campus" />
                <input
                  type="text"
                  value={draft.location}
                  onChange={(event) => updateDraftField('location', event.target.value)}
                  placeholder={locationPlaceholder}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
              </section>

              {sections.map((section) => (
                <section key={section.key} className="space-y-3">
                  <FilterLabel title={section.label} description={section.description} />
                  <div
                    className={
                      section.layout === 'grid'
                        ? 'grid gap-2 sm:grid-cols-2'
                        : 'flex flex-wrap gap-2'
                    }
                  >
                    {section.options.map((option) => {
                      const value = option.value ?? option.label ?? option
                      const label = option.label ?? option
                      const isActive = Array.isArray(draft[section.key])
                        ? draft[section.key].includes(value)
                        : false

                      return section.variant === 'checkbox' ? (
                        <label
                          key={value}
                          className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                            isActive
                              ? 'border-primary/60 bg-primary/5 text-primary'
                              : 'border-slate-200 text-slate-600 hover:border-primary/40'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleValue(section.key, value)}
                            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/40"
                          />
                          {label}
                        </label>
                      ) : (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleValue(section.key, value)}
                          className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                            isActive
                              ? section.accent === 'dark'
                                ? 'bg-slate-900 text-white'
                                : 'bg-primary/10 text-primary'
                              : 'border border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>

            <aside className="flex flex-col justify-between rounded-2xl bg-slate-50/80 p-5 text-sm text-slate-500">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-800">Filtering tips</h3>
                <p>Combine multiple filters to narrow results. Applied filters persist while you explore profiles.</p>
              </div>
              <div className="space-y-2 text-xs text-slate-400">
                <p>Need a quick reset? Use the button below to clear all filters instantly.</p>
                <p>Directory insights will refresh after you press <span className="font-semibold text-slate-500">Apply Filters</span>.</p>
              </div>
            </aside>
          </div>

          <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={clearDraft}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
            >
              Reset
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Apply Filters
              </button>
            </div>
          </footer>
        </div>
      )}
    </div>
  )
}

const FilterLabel = ({ title, description }) => (
  <div>
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {description && <p className="text-xs text-slate-500">{description}</p>}
  </div>
)

export default UserDirectoryFilter
