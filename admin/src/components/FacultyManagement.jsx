import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useDirectoryMembers from '../hooks/useDirectoryMembers'
import getStatusBadgeClass from '../utils/status'
import AdminProfileView from './AdminProfileView'
import useModal from '../hooks/useModal'
import UserProvisionModal from './UserProvisionModal'
import ActionMenu from './ActionMenu'
import StatusChangeModal from './StatusChangeModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import { del, put } from '../utils/api'

const FacultyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const provisionModal = useModal(false)
  const { data: faculty, isLoading, error, refetch } = useDirectoryMembers('faculty')
  const navigate = useNavigate()
  const { memberId: memberIdParam } = useParams()
  const memberId = memberIdParam || null
  const facultyList = Array.isArray(faculty) ? faculty : []
  const [pendingSelection, setPendingSelection] = useState(null)
  const [statusModalMember, setStatusModalMember] = useState(null)
  const [deleteModalMember, setDeleteModalMember] = useState(null)

  const normalizedFaculty = useMemo(() => {
    return facultyList.map((member, index) => {
      const firstName = member.firstName?.trim() ?? ''
      const lastName = member.lastName?.trim() ?? ''
      const name = member.name || [firstName, lastName].filter(Boolean).join(' ').trim()
      const email = member.email ?? ''
      const phone = member.phone ?? ''
      const department = member.department ?? member.specialization ?? ''
      const title = member.title || member.position || 'Faculty Member'
      const createdAt = member.createdAt ? new Date(member.createdAt) : null
      const rawStatus = member.status || (member.active === false ? 'Inactive' : 'Active')
      const status = typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus : 'Active'
      const rawId =
        member.id ??
        member._id ??
        member.userId ??
        member.user?._id ??
        (email || phone ? `${email || phone}-${department || title || index}` : null)
      const id = rawId ? String(rawId) : `faculty-${index}`

      return {
        id,
        name: name || email || 'Faculty Member',
        email,
        phone,
        avatar: member.avatar || (name ? name.charAt(0).toUpperCase() : 'F'),
        title,
        department: department || '—',
        joinDate: createdAt ? createdAt.toLocaleDateString() : '—',
        status,
        raw: member,
      }
    })
  }, [facultyList])

  const filteredFaculty = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return normalizedFaculty.filter((member) => {
      const matchesSearch =
        !query ||
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        member.phone.toLowerCase().includes(query) ||
        member.department.toLowerCase().includes(query) ||
        member.title.toLowerCase().includes(query)

      const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [normalizedFaculty, searchTerm, filterDepartment, filterStatus])

  const departmentOptions = useMemo(() => {
    const departments = new Set()
    normalizedFaculty.forEach((member) => {
      if (member.department && member.department !== '—') {
        departments.add(member.department)
      }
    })
    return Array.from(departments).sort()
  }, [normalizedFaculty])

  const statusOptions = useMemo(() => {
    const statuses = new Set()
    normalizedFaculty.forEach((member) => {
      if (member.status) {
        statuses.add(member.status)
      }
    })
    return Array.from(statuses)
  }, [normalizedFaculty])

  const handleFacultyClick = (facultyMember) => {
    setPendingSelection(facultyMember)
    const encodedId = encodeURIComponent(String(facultyMember.id))
    navigate(`/admin/faculty/${encodedId}`)
  }

  const selectedFaculty = useMemo(() => {
    if (!memberId) return null
    return normalizedFaculty.find((member) => String(member.id) === memberId)
  }, [memberId, normalizedFaculty])

  useEffect(() => {
    if (selectedFaculty) {
      setPendingSelection(null)
    }
  }, [selectedFaculty])

  const getOriginalFaculty = (normalizedMember) => {
    if (!normalizedMember) return null
    if (normalizedMember.raw) return normalizedMember.raw
    const targetId = String(normalizedMember.id)

    return facultyList.find((member) => {
      const candidateIds = [
        member.id,
        member._id,
        member.userId,
        member.user?._id,
        member.email,
      ]
        .filter(Boolean)
        .map(String)

      return candidateIds.includes(targetId)
    })
  }

  const handleStatusChange = (member) => {
    setStatusModalMember(member)
  }

  const handleDelete = (member) => {
    setDeleteModalMember(member)
  }

  const confirmStatusChange = async (member, newStatus) => {
    try {
      const response = await put(`/directory/faculty/${member.id}/status`, { status: newStatus })
      setStatusModalMember(null)
      
      // Show success message
      alert(`Status updated to ${newStatus} successfully!`)
      
      // Refetch data to get updated status
      refetch()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const confirmDelete = async (member) => {
    try {
      await del(`/directory/faculty/${member.id}`)
      setDeleteModalMember(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete member:', error)
      alert('Failed to delete member. Please try again.')
    }
  }

  const handleBackToManagement = () => {
    setPendingSelection(null)
    navigate('/admin/faculty')
  }

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Title', 'Status']
    const rows = filteredFaculty.map(f => [
      f.id || '',
      f.name || '',
      f.email || '',
      f.phone || '',
      f.department || '',
      f.title || '',
      f.status || ''
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `faculty_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const displayFaculty = selectedFaculty ?? pendingSelection

  if (displayFaculty) {
    const originalFaculty = getOriginalFaculty(displayFaculty)
    const resolvedProfileId =
      originalFaculty?.id ??
      originalFaculty?._id ??
      originalFaculty?.userId ??
      originalFaculty?.user?._id ??
      displayFaculty.id

    return (
      <AdminProfileView
        profileId={resolvedProfileId}
        role="faculty"
        onBack={handleBackToManagement}
        profileData={originalFaculty ?? displayFaculty.raw ?? displayFaculty}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Management</h1>
        <p className="text-slate-600">Manage faculty records, academic profiles, and administrative access.</p>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-11 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
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
              Add Faculty
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Faculty Member</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">View</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading faculty members…
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {member.avatar}
                        </span>
                        <div>
                          <button
                            onClick={() => handleFacultyClick(member)}
                            className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors text-left cursor-pointer"
                          >
                            {member.name || '—'}
                          </button>
                          <p className="text-xs text-slate-500">{member.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{member.title || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{member.department || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{member.phone || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{member.joinDate}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleFacultyClick(member)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors group"
                        title="View Profile"
                      >
                        <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ActionMenu
                          member={member}
                          onProfileView={handleFacultyClick}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDelete}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && filteredFaculty.length === 0 && (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No faculty members found</h3>
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
        role="faculty"
        onSuccess={refetch}
      />
      <StatusChangeModal
        member={statusModalMember}
        isOpen={!!statusModalMember}
        onClose={() => setStatusModalMember(null)}
        onConfirm={confirmStatusChange}
      />
      <ConfirmDeleteModal
        member={deleteModalMember}
        isOpen={!!deleteModalMember}
        onClose={() => setDeleteModalMember(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

export default FacultyManagement
