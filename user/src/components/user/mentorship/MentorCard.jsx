const MentorCard = ({ mentor, onViewProfile }) => {
  const { name, position, avatar, rating } = mentor

  const displayRating = typeof rating === 'number' && !Number.isNaN(rating)

  return (
    <article className="relative flex flex-col items-center gap-4 rounded-[28px] border border-slate-100 bg-white p-6 text-center shadow-[0_12px_30px_-18px_rgba(30,64,175,0.35)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_-18px_rgba(30,64,175,0.4)]">
      <div className="size-24 rounded-full border-4 border-white bg-slate-100 shadow-[0_8px_25px_-12px_rgba(15,23,42,0.45)]">
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="size-full rounded-full object-cover"
        />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        {position ? (
          <p className="text-sm font-medium text-sky-600">{position}</p>
        ) : null}
      </div>
      {displayRating ? (
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-500">
          <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden>
            <path d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 13.9 5.06 16.7 6 11.2l-4-3.9 5.53-.8z" />
          </svg>
          {rating.toFixed(1)}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onViewProfile}
        className="w-full rounded-full border border-primary/70 px-5 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
      >
        View Profile
      </button>
    </article>
  )
}

export default MentorCard
