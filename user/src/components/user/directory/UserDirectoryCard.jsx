import Avatar from '../../ui/Avatar'

const getClassFromYear = (yearStr) => {
  const year = Number(yearStr)
  if (Number.isNaN(year)) return ''
  const now = new Date().getFullYear()
  const diff = year - now
  if (diff < 0) return 'Alumni'
  if (diff === 0) return 'Final Year'
  if (diff === 1) return 'Third Year'
  if (diff === 2) return 'Second Year'
  if (diff === 3) return 'First Year'
  return `${diff} years to go`
}

const roleLabels = {
  students: 'Student',
  alumni: 'Alumni',
  faculty: 'Faculty',
}

const UserDirectoryCard = ({ person, onOpen }) => {
  const { name, program, avatar, role, department, year, location, title } = person
  const displayDept = department ?? (program?.split(' ').slice(0, -1).join(' ') ?? '')
  const displayYear = year ?? (program?.split(' ').slice(-1)[0] ?? '')
  const displayClass = role === 'students' ? getClassFromYear(displayYear) : ''
  const roleLabel = roleLabels[role] ?? 'Member'

  return (
    <article className="group flex flex-col rounded-2xl bg-white p-5 shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/30">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar src={avatar} name={name} size="xl" className="ring-4 ring-slate-100 group-hover:ring-primary/20 transition-all duration-300" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-sm font-medium text-slate-600 mt-1">{title ?? roleLabel}</p>
      </div>

      <div className="mt-6 space-y-2 text-center">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium">{displayDept || program}</span>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{role === 'students' ? displayClass : displayYear || roleLabel}</span>
        </div>
        
        {location && (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <button
          type="button"
          className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:bg-primary-dark hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={`View profile for ${name}`}
          onClick={() => onOpen?.(person)}
        >
          View Profile
        </button>
      </div>
    </article>
  )
}

export default UserDirectoryCard
