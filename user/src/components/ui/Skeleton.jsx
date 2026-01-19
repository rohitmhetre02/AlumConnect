const Skeleton = ({ className = '', style }) => (
  <div className={`skeleton ${className}`} style={style} aria-hidden="true" />
)

export const SkeletonCircle = ({ size = 48, className = '' }) => (
  <Skeleton className={`rounded-full ${className}`} style={{ width: size, height: size }} />
)

export const SkeletonText = ({ lines = 1, widths = [], className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-3 w-full rounded-full"
          style={{ width: widths[index] ?? '100%' }}
        />
      ))}
    </div>
  )
}

export const SkeletonCard = ({ children, className = '' }) => (
  <div className={`rounded-3xl border border-slate-100 bg-white p-6 shadow-soft ${className}`}>
    {children ?? (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <SkeletonText lines={2} widths={['75%', '45%']} />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    )}
  </div>
)

export default Skeleton
