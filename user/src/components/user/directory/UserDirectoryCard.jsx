import React from 'react'
import Avatar from '../../ui/Avatar'

const roleLabels = {
  students: 'Student',
  alumni: 'Alumni',
  faculty: 'Faculty',
  coordinators: 'Coordinator',
}

const UserDirectoryCard = ({ person, onOpen }) => {
  const { name, program, avatar, role, department, currentYear, passoutYear, location, title } = person
  const displayDept = department ?? (program?.split(' ').slice(0, -1).join(' ') ?? '')
  
  // Display year information based on role
  const getYearDisplay = () => {
    if (role === 'students') {
      return currentYear || 'Year not specified'
    } else if (role === 'alumni') {
      return passoutYear ? `Class of ${passoutYear}` : 'Passout year not specified'
    }
    return ''
  }
  
  const roleLabel = roleLabels[role] ?? 'Member'
 
  return (
    <article className="group flex flex-col rounded-2xl bg-white p-5 shadow-lg border border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-primary/30">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar src={avatar} name={name} size="xl" className="ring-4 ring-slate-100 group-hover:ring-primary/20 transition-all duration-300" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-sm font-medium text-slate-600 mt-1">{ roleLabel}</p>
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
          <span>{getYearDisplay()}</span>
        </div>

        
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
