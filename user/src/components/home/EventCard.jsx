import { useNavigate } from 'react-router-dom'

const EventCard = ({ event }) => {
  const navigate = useNavigate()
  const { title, date, type, location, image } = event

  const handleViewDetails = () => {
    navigate(`/events/${event.id}`)
  }

  return (
    <article className="relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 w-full">
        <img src={image} alt={`${title} promotional`} className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase text-slate-800">
          {type}
        </span>
        <span className="absolute right-4 top-4 rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white">
          {date}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-6 py-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{location}</p>
        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={handleViewDetails}
            className="flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`View details for ${title}`}
          >
            View Details
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  )
}

export default EventCard
