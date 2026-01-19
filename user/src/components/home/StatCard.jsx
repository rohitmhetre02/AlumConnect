const StatCard = ({ icon, title, value, iconClass = 'bg-soft-purple text-primary' }) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-soft">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${iconClass}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default StatCard
