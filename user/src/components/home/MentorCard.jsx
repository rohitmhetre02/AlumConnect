import Avatar from '../ui/Avatar'

const ratingStars = (rating = 5) =>
  Array.from({ length: 5 }, (_, index) => (
    <svg
      key={index}
      className={`h-4 w-4 ${index < rating ? 'text-amber-400' : 'text-slate-200'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.298-.921 1.604-.921 1.902 0l1.122 3.474a1 1 0 00.95.69h3.65c.969 0 1.371 1.24.588 1.81l-2.954 2.146a1 1 0 00-.364 1.118l1.122 3.473c.299.922-.755 1.688-1.54 1.118l-2.954-2.146a1 1 0 00-1.175 0l-2.954 2.146c-.784.57-1.838-.196-1.54-1.118l1.123-3.473a1 1 0 00-.365-1.118L2.64 8.901c-.783-.57-.38-1.81.588-1.81h3.65a1 1 0 00.95-.69l1.221-3.474z" />
    </svg>
  ))

const MentorCard = ({ mentor }) => {
  const { name, role, avatar, rating } = mentor
  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-white p-6 text-center shadow-soft">
      <Avatar src={avatar} name={name} size="lg" />
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-500">{role}</p>
      </div>
      <div className="flex items-center justify-center gap-1" aria-label={`${rating} star rating`}>
        {ratingStars(rating)}
        <span className="text-sm font-medium text-slate-600">{rating.toFixed(1)}</span>
      </div>
      <button
        type="button"
        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        Request Mentorship
      </button>
    </article>
  )
}

export default MentorCard
