const StatCard = ({ title, value, subtext, linkLabel, onLinkClick }) => {
  return (
    <article className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      {subtext && <p className="mt-1 text-sm text-slate-500">{subtext}</p>}
      {linkLabel && (
        <button
          type="button"
          onClick={onLinkClick}
          className="mt-4 text-sm font-semibold text-primary transition hover:text-primary-dark"
        >
          {linkLabel}
        </button>
      )}
    </article>
  )
}

export default StatCard
