import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useDirectoryMembers from '../hooks/useDirectoryMembers'
import getStatusBadgeClass from '../utils/status'
import AdminProfileView from './AdminProfileView'
import useModal from '../hooks/useModal'
import UserProvisionModal from './UserProvisionModal'

const AlumniManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const provisionModal = useModal(false)

  const { data: alumni, isLoading, error, refetch } = useDirectoryMembers('alumni')
  const navigate = useNavigate()
  const { memberId: memberIdParam } = useParams()
  const memberId = memberIdParam ? decodeURIComponent(memberIdParam) : null

  const normalizedAlumni = useMemo(() => {
    return alumni.map((member, index) => {
      const firstName = member.firstName?.trim() ?? ''
      const lastName = member.lastName?.trim() ?? ''
      const name = member.name || [firstName, lastName].filter(Boolean).join(' ').trim()
      const email = member.email ?? ''
      const phone = member.phone ?? ''
      const department = member.department ?? member.program ?? ''
      const passoutYear = member.passoutYear || member.graduationYear || member.year || ''
      const createdAt = member.createdAt ? new Date(member.createdAt) : null
      const rawStatus = member.status || (member.active === false ? 'Inactive' : 'Active')
      const status = typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus : 'Active'
      const rawId =
        member.id ??
        member._id ??
        member.userId ??
        member.user?._id ??
        (email || phone ? `${email || phone}-${passoutYear || index}` : null)
      const id = rawId ? String(rawId) : `alumni-${index}`

      return {
        id,
        name: name || email || 'Alumni Member',
        email,
        phone,
        avatar: member.avatar || (name ? name.charAt(0).toUpperCase() : 'A'),
        department: department || '—',
        graduationYear: passoutYear ? String(passoutYear) : '—',
        joinDate: createdAt ? createdAt.toLocaleDateString() : '—',
        status,
        raw: member,
      }
    })
  }, [alumni])

  const yearOptions = useMemo(() => {
    const values = new Set()
    normalizedAlumni.forEach(({ graduationYear }) => {
      if (graduationYear && graduationYear !== '—') values.add(graduationYear)
    })
    return Array.from(values).sort().reverse()
  }, [normalizedAlumni])

  const statusOptions = useMemo(() => {
    const values = new Set()
    normalizedAlumni.forEach(({ status }) => {
      if (status) values.add(status)
    })
    return Array.from(values).sort()
  }, [normalizedAlumni])

  const handleAlumniClick = (alumnus) => {
    const encodedId = encodeURIComponent(String(alumnus.id))
    navigate(`/admin/alumni/${encodedId}`)
  }

  const selectedAlumni = useMemo(() => {
    if (!memberId) return null
    return normalizedAlumni.find((alumnus) => String(alumnus.id) === memberId)
  }, [memberId, normalizedAlumni])

  const getOriginalAlumni = (normalizedAlumnus) => {
    if (!normalizedAlumnus) return null
    if (normalizedAlumnus.raw) return normalizedAlumnus.raw
    const targetId = String(normalizedAlumnus.id)
    return (
      alumni.find((a) => {
        const candidateIds = [a.id, a._id, a.userId, a.user?._id, a.email]
          .filter(Boolean)
          .map(String)
        return candidateIds.includes(targetId)
      }) ?? null
    )
  }

  const handleBackToManagement = () => {
    navigate('/admin/alumni')
  }

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Graduation Year', 'Status']
    const rows = filteredAlumni.map(a => [
      a.id || '',
      a.name || '',
      a.email || '',
      a.phone || '',
      a.department || '',
      a.graduationYear || '',
      a.status || ''
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `alumni_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredAlumni = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return normalizedAlumni.filter((alumnus) => {
      const matchesSearch =
        !query ||
        alumnus.name.toLowerCase().includes(query) ||
        alumnus.email.toLowerCase().includes(query) ||
        alumnus.phone.toLowerCase().includes(query) ||
        alumnus.department.toLowerCase().includes(query)

      const matchesYear = filterYear === 'all' || alumnus.graduationYear === filterYear
      const matchesStatus = filterStatus === 'all' || alumnus.status === filterStatus

      return matchesSearch && matchesYear && matchesStatus
    })
  }, [normalizedAlumni, searchTerm, filterYear, filterStatus])

  if (selectedAlumni) {
    const originalAlumni = getOriginalAlumni(selectedAlumni)
    const resolvedProfileId =
      originalAlumni?.id ??
      originalAlumni?._id ??
      originalAlumni?.userId ??
      originalAlumni?.user?._id ??
      selectedAlumni.id

    return (
      <AdminProfileView 
        profileId={resolvedProfileId} 
        role="alumni" 
        onBack={handleBackToManagement}
        profileData={originalAlumni ?? selectedAlumni.raw ?? selectedAlumni}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Alumni Management</h1>
        <p className="text-slate-600">Manage alumni profiles and their professional information.</p>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search alumni..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-11 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={downloadCSV}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400/50"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={provisionModal.openModal}
              className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.25)] transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Add Alumni
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alumnus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pass-out Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading alumni…
                  </td>
                </tr>
              ) : (
                filteredAlumni.map((alumnus) => (
                  <tr key={alumnus.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {alumnus.avatar}
                        </span>
                        <div>
                          <button
                            onClick={() => handleAlumniClick(alumnus)}
                            className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors text-left cursor-pointer"
                          >
                            {alumnus.name}
                          </button>
                          <p className="text-xs text-slate-500">{alumnus.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{alumnus.phone}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{alumnus.department}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{alumnus.graduationYear}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{alumnus.joinDate}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(alumnus.status)}`}>
                        {alumnus.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-primary hover:text-primary">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-red-200 hover:text-red-600">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && filteredAlumni.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No alumni found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </section>
      <UserProvisionModal
        isOpen={provisionModal.isOpen}
        onClose={provisionModal.closeModal}
        role="alumni"
        onSuccess={refetch}
      />
    </div>
  )
}

export default AlumniManagement
