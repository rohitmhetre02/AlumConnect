const getStatusBadgeClass = (status) => {
  const normalized = status?.toString().trim().toLowerCase()
  if (!normalized) return 'bg-slate-100 text-slate-600'

  switch (normalized) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'suspended':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

export default getStatusBadgeClass
