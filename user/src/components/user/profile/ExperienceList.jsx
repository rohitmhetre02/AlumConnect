const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatMonthYear = (value) => {
  if (!value || typeof value !== 'string') return ''
  const [yearString, monthString] = value.split('-')
  const year = Number(yearString)
  const month = Number(monthString)

  if (!year || !month || month < 1 || month > 12) return value

  return `${monthNames[month - 1]} ${year}`
}

const formatDuration = ({ startDate, endDate, isCurrent }) => {
  const startLabel = formatMonthYear(startDate)
  const endLabel = isCurrent ? 'Present' : formatMonthYear(endDate)

  if (startLabel && endLabel) return `${startLabel} – ${endLabel}`
  if (startLabel) return `${startLabel}`
  if (endLabel) return `Until ${endLabel}`
  return ''
}

const normalizeType = (rawType) => {
  if (!rawType) return ''
  const tokens = rawType.toString().split(/[-_\s]+/).filter(Boolean)
  if (!tokens.length) return ''
  return tokens
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1).toLowerCase())
    .join(' ')
}

const ExperienceList = ({ experiences = [], onEditSection }) => {
  const hasExperiences = Array.isArray(experiences) && experiences.length > 0

  // Sort experiences in descending order (most recent first)
  const sortedExperiences = [...experiences].sort((a, b) => {
    // Helper function to get sort date for an experience
    const getSortDate = (exp) => {
      // If currently working, use current date
      if (exp.isCurrent) return new Date()
      
      // If has end date, use that
      if (exp.endDate) {
        const [year, month] = exp.endDate.split('-')
        return new Date(year, month - 1)
      }
      
      // If has start date, use that
      if (exp.startDate) {
        const [year, month] = exp.startDate.split('-')
        return new Date(year, month - 1)
      }
      
      // Default to oldest date
      return new Date(0)
    }

    const dateA = getSortDate(a)
    const dateB = getSortDate(b)
    
    // Sort in descending order (newest first)
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Experience</h2>
        <button
          type="button"
          onClick={() => onEditSection?.('experience')}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
        >
          Edit
        </button>
      </header>

      <div className="mt-5 space-y-4">
        {hasExperiences ? (
          sortedExperiences.map((experience, index) => {
            const duration = formatDuration(experience)
            const typeLabel = normalizeType(experience?.type)

            return (
              <article
                key={experience?.id || `${experience?.company || 'company'}-${experience?.title || 'role'}-${index}`}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-slate-900">{experience?.title || 'Role title'}</p>
                  {typeLabel ? <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">{typeLabel}</span> : null}
                </div>
                {experience?.company ? <p className="text-sm text-slate-500">{experience.company}</p> : null}
                {duration ? (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{duration}</p>
                ) : null}
                {experience?.description ? (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">{experience.description}</p>
                ) : null}
              </article>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-600">No experience added yet</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em]">Use the Edit button to share your roles.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default ExperienceList
