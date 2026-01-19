import Avatar from '../ui/Avatar'

const PublicDirectoryCard = ({ profile }) => {
  const { name, role, department, category, batch, image } = profile

  return (
    <article className="flex flex-col rounded-2xl bg-white p-6 shadow-soft transition hover:-translate-y-1">
      <div className="flex flex-col items-center text-center">
        <Avatar src={image} name={name} size="md" />
        <h3 className="mt-4 text-lg font-semibold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-500">{role}</p>
      </div>

      <div className="mt-4 text-center text-sm text-slate-500">
        <p>{department}</p>
        <p className="text-slate-400">{category} • Batch {batch}</p>
      </div>

      <button
        type="button"
        className="mt-6 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        aria-label={`View profile for ${name}`}
      >
        View Profile
      </button>
    </article>
  )
}

export default PublicDirectoryCard
