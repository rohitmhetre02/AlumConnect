const EducationList = ({ education = [], onEditSection }) => {
  // Sort education in descending order (most recent first)
  const sortedEducation = [...education].sort((a, b) => {
    // Helper function to get sort year for education
    const getSortYear = (edu) => {
      // If currently pursuing, use expected passout year or current year
      if (edu.isCurrent) {
        if (edu.expectedPassoutYear) return edu.expectedPassoutYear
        return new Date().getFullYear()
      }
      
      // If has passout year, use that
      if (edu.passoutYear) return edu.passoutYear
      
      // If has admission year, use that
      if (edu.admissionYear) return edu.admissionYear
      
      // If has legacy year field, use that
      if (edu.year) {
        const year = parseInt(edu.year)
        if (!isNaN(year)) return year
      }
      
      // Default to oldest year
      return 0
    }

    const yearA = getSortYear(a)
    const yearB = getSortYear(b)
    
    // Sort in descending order (newest first)
    return yearB - yearA
  })

  const formatEducationInfo = (item) => {
    let degreeInfo = item.degree || ''
    
    // Add other degree if specified
    if (item.otherDegree) {
      degreeInfo += degreeInfo ? ` - ${item.otherDegree}` : item.otherDegree
    }
    
    // Add field if different from degree
    if (item.field && item.field !== item.degree && !degreeInfo.includes(item.field)) {
      degreeInfo += degreeInfo ? `, ${item.field}` : item.field
    }
    
    return degreeInfo
  }

  const formatDateRange = (edu) => {
    if (edu.isCurrent) {
      if (edu.admissionYear && edu.expectedPassoutYear) {
        const startMonth = 'Jan'
        const endMonth = 'Jun'
        return `${startMonth} ${edu.admissionYear} - Present`
      } else if (edu.admissionYear) {
        return `Jan ${edu.admissionYear} - Present`
      } else if (edu.expectedPassoutYear) {
        return `Expected ${edu.expectedPassoutYear}`
      }
      return 'Currently Pursuing'
    } else {
      if (edu.admissionYear && edu.passoutYear) {
        return `Jan ${edu.admissionYear} - Jun ${edu.passoutYear}`
      } else if (edu.passoutYear) {
        return `Jun ${edu.passoutYear}`
      } else if (edu.admissionYear) {
        return `Jan ${edu.admissionYear}`
      } else if (edu.year) {
        return edu.year
      }
      return 'Year not specified'
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Education</h2>
        <button
          type="button"
          onClick={() => onEditSection?.('education')}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
        >
          Edit
        </button>
      </header>

      <div className="mt-5 space-y-4">
        {sortedEducation.length > 0 ? (
          sortedEducation.map((item) => (
            <article key={`${item.school}-${item.degree}`} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="space-y-2">
                {/* School Name */}
                <p className="text-lg font-semibold text-slate-900">{item.school}</p>
                
                {/* Degree and Field Information */}
                <p className="text-sm text-slate-600">
                  {formatEducationInfo(item)}
                </p>
                
                {/* Date Range */}
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {formatDateRange(item)}
                </p>
                
                {/* Additional Details (CGPA, Status) */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {item.cgpa && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      CGPA: {item.cgpa}
                    </span>
                  )}
                  {item.isCurrent && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                      Currently Pursuing
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-600">No education history yet</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em]">Use the Edit button to include your academic milestones.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default EducationList
