const Input = ({ label, error, className = '', ...props }) => {
  return (
    <label className={`flex flex-col gap-2 text-sm font-medium text-slate-700 ${className}`}>
      <span>{label}</span>
      <input
        {...props}
        className={`rounded-lg border px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
      />
      {error && <span className="text-xs font-normal text-red-500">{error}</span>}
    </label>
  )
}

export default Input
