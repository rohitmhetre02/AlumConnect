const BadgesList = ({ certifications = [], onEditSection }) => {
  const hasCertifications = Array.isArray(certifications) && certifications.length > 0

  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const [year, month] = dateString.split('-')
      const date = new Date(year, month - 1)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    } catch {
      return dateString
    }
  }

  return (
    <section className="rounded-3xl bg-white p-6 shadow-soft">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Certifications</h2>
        {onEditSection ? (
          <button
            type="button"
            onClick={() => onEditSection('badges')}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary/40 hover:text-primary"
          >
            Edit
          </button>
        ) : null}
      </header>

      <div className="mt-5 space-y-4">
        {hasCertifications ? (
          certifications.map((cert, index) => (
            <article key={`${cert.organization}-${cert.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{cert.title}</p>
                  <p className="text-sm text-slate-500">{cert.organization}</p>
                  {cert.location && (
                    <p className="text-sm text-slate-600">{cert.location}</p>
                  )}
                  {cert.date && (
                    <p className="text-xs text-slate-400 mt-1">{formatDate(cert.date)}</p>
                  )}
                </div>
                {cert.fileName && (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    Certificate
                  </span>
                )}
              </div>
              {cert.fileName && (
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Document: {cert.fileName}
                </p>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-6 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-600">No certifications added yet</p>
            <p className="mt-2 text-xs uppercase tracking-[0.2em]">Use the Edit button to add your professional certifications.</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default BadgesList
