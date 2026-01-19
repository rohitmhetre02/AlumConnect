const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-12 w-12 text-sm',
  lg: 'h-[72px] w-[72px] text-2xl',
  xl: 'h-[110px] w-[110px] text-4xl',
}

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-400',
  busy: 'bg-rose-500',
}

const Avatar = ({ src, name = '', size = 'md', status }) => {
  const normalizedSize = sizeClasses[size] ? size : 'md'
  const initials = getInitials(name)
  const showStatus = Boolean(status && statusColors[status])

  return (
    <div className="relative inline-flex">
      {src ? (
        <img
          src={src}
          alt={name ? `${name} avatar` : 'Profile avatar'}
          className={`rounded-full object-cover ${sizeClasses[normalizedSize]}`}
        />
      ) : (
        <span
          className={`grid place-items-center rounded-full bg-primary/10 font-semibold uppercase text-primary ${sizeClasses[normalizedSize]}`}
          aria-hidden={!name}
        >
          {initials}
        </span>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${statusColors[status]}`}
          aria-label={`${status} status`}
        />
      )}
    </div>
  )
}

const getInitials = (value = '') => {
  if (!value.trim()) return 'A'
  const parts = value.trim().split(' ')
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return `${first}${last}`.toUpperCase()
}

export default Avatar
