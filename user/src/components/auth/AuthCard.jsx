const AuthCard = ({
  title,
  description,
  children,
  actions,
  footer,
  onSubmit,
  ariaLabel = 'Authentication form',
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-3xl bg-white p-8 shadow-soft"
      aria-label={ariaLabel}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-xl font-bold text-white">A</span>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
        </div>
      </div>

      <div className="mt-8 space-y-5">{children}</div>

      {actions && <div className="mt-6 space-y-3">{actions}</div>}

      {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
    </form>
  )
}

export default AuthCard
