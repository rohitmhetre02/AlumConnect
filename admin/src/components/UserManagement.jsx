import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useDirectoryMembers from '../hooks/useDirectoryMembers'
import getStatusBadgeClass from '../utils/status'
import AdminProfileView from './AdminProfileView'
import useModal from '../hooks/useModal'
import UserProvisionModal from './UserProvisionModal'

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const provisionModal = useModal(false)
  const { data: students, isLoading, error, refetch } = useDirectoryMembers('students')
  const navigate = useNavigate()
  const { memberId: memberIdParam } = useParams()
  const memberId = memberIdParam ? decodeURIComponent(memberIdParam) : null
  const studentsList = Array.isArray(students) ? students : []

  const normalizedStudents = useMemo(() => {
    return studentsList.map((student, index) => {
      const firstName = student.firstName?.trim() ?? ''
      const lastName = student.lastName?.trim() ?? ''
      const name = student.name || [firstName, lastName].filter(Boolean).join(' ').trim()
      const email = student.email ?? ''
      const phone = student.phone ?? ''
      const department = student.department ?? student.program ?? ''
      const yearValue = student.year || student.classYear || student.expectedPassoutYear || ''
      const rawStatus = student.status || (student.active === false ? 'Inactive' : 'Active')
      const status = typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus : 'Active'
      const createdAt = student.createdAt ? new Date(student.createdAt) : null
      const rawId =
        student.id ??
        student._id ??
        student.userId ??
        student.user?._id ??
        (email || phone ? `${email || phone}-${department || index}` : null)
      const id = rawId ? String(rawId) : `student-${index}`

      return {
        id,
        name,
        email,
        phone,
        avatar: student.avatar || (name ? name.charAt(0).toUpperCase() : 'S'),
        department: department || '—',
        year: yearValue ? String(yearValue) : '—',
        joinDate: createdAt ? createdAt.toLocaleDateString() : '—',
        status,
        raw: student,
      }
    })
  }, [studentsList])

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return normalizedStudents.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.phone.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query)

      const matchesYear = filterYear === 'all' || student.year === String(filterYear)
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus

      return matchesSearch && matchesYear && matchesStatus
    })
  }, [normalizedStudents, searchTerm, filterYear, filterStatus])

  const yearOptions = useMemo(() => {
    const years = new Set()
    normalizedStudents.forEach((student) => {
      if (student.year && student.year !== '—') {
        years.add(student.year)
      }
    })
    return Array.from(years).sort()
  }, [normalizedStudents])

  const statusOptions = useMemo(() => {
    const statuses = new Set()
    normalizedStudents.forEach((student) => {
      if (student.status) {
        statuses.add(student.status)
      }
    })
    return Array.from(statuses)
  }, [normalizedStudents])

  const handleStudentClick = (student) => {
    const encodedId = encodeURIComponent(String(student.id))
    navigate(`/admin/users/${encodedId}`)
  }

  const selectedStudent = useMemo(() => {
    if (!memberId) return null
    return normalizedStudents.find((student) => String(student.id) === memberId)
  }, [memberId, normalizedStudents])

  const originalStudent = useMemo(() => {
    if (!selectedStudent) return null
    if (selectedStudent.raw) return selectedStudent.raw
    const targetId = String(selectedStudent.id)
    return (
      studentsList.find(
        (student) =>
          String(student.id) === targetId ||
          String(student._id) === targetId ||
          String(student.userId) === targetId ||
          String(student.user?._id) === targetId ||
          student.email === targetId
      ) ?? null
    )
  }, [selectedStudent, studentsList])

  const handleBackToManagement = () => {
    navigate('/admin/users')
  }

  const downloadCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Year', 'Status']
    const rows = filteredStudents.map(s => [
      s.id || '',
      s.name || '',
      s.email || '',
      s.phone || '',
      s.department || '',
      s.year || '',
      s.status || ''
    ])
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (selectedStudent) {
    return (
      <AdminProfileView 
        profileId={selectedStudent.id} 
        role="students" 
        onBack={handleBackToManagement}
        profileData={originalStudent ?? selectedStudent.raw ?? selectedStudent}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
        <p className="text-slate-600">Manage student records, enrollment details, and access levels.</p>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search students..."
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
              Add Student
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading students…
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                          {student.avatar}
                        </span>
                        <div>
                          <button
                            onClick={() => handleStudentClick(student)}
                            className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors text-left cursor-pointer"
                          >
                            {student.name || '—'}
                          </button>
                          <p className="text-xs text-slate-500">{student.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{student.phone || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{student.department || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{student.year || '—'}</td>
                    <td className="px-4 py-4 text-sm text-slate-500">{student.joinDate}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(student.status)}`}>
                        {student.status}
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

        {!isLoading && !error && filteredStudents.length === 0 && (
          <div className="py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No students found</h3>
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
        role="student"
        onSuccess={refetch}
      />
    </div>
  )
}

export default UserManagement
