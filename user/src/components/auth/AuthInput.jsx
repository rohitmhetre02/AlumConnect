const AuthInput = ({ label, type = 'text', id, placeholder, value, onChange, error, ...props }) => {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
        {...props}
      />
      <span className="text-xs font-normal text-red-500">{error}</span>
    </label>
  )
}

export default AuthInput
