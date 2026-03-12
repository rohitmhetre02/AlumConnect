import { useMemo, useState } from 'react'
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

const StudentManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [statusModalMember, setStatusModalMember] = useState(null)
  const [deleteModalMember, setDeleteModalMember] = useState(null)
  const provisionModal = useModal(false)

  const { data: students, isLoading, error, refetch } = useDirectoryMembers('students')
  const navigate = useNavigate()
  const { memberId: memberIdParam } = useParams()
  const memberId = memberIdParam ? decodeURIComponent(memberIdParam) : null

  // Get current user info for department filtering
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}')
  const isCoordinator = adminUser.role === 'coordinator'
  const userDepartment = adminUser.department || ''

  const normalizedStudents = useMemo(() => {
    return students.map((member, index) => {
      const firstName = member.firstName?.trim() ?? ''
      const lastName = member.lastName?.trim() ?? ''
      const name = member.name || [firstName, lastName].filter(Boolean).join(' ').trim()
      const email = member.email ?? ''
      const phone = member.phone ?? ''
      const department = member.department ?? member.program ?? ''
      const admissionYear = member.admissionYear || ''
      const expectedPassoutYear = member.expectedPassoutYear || member.expectedGraduationYear || ''
      const currentYear = member.currentYear || ''
      const createdAt = member.createdAt ? new Date(member.createdAt) : null
      const rawStatus = member.status || (member.active === false ? 'Inactive' : 'Active')
      const status = typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus : 'Active'
      const rawId =
        member.id ??
        member._id ??
        member.userId ??
        member.user?._id ??
        (email || phone ? `${email || phone}-${admissionYear || index}` : null)
      const id = rawId ? String(rawId) : `student-${index}`

      return {
        id,
        name: name || email || 'Student',
        email,
        phone,
        avatar: member.avatar || '',
        department: department || '—',
        admissionYear: admissionYear ? String(admissionYear) : '—',
        expectedPassoutYear: expectedPassoutYear ? String(expectedPassoutYear) : '—',
        currentYear: currentYear ? String(currentYear) : '—',
        joinDate: createdAt ? createdAt.toLocaleDateString() : '—',
        status,
        raw: member,
      }
    })
  }, [students])

  const yearOptions = useMemo(() => {
    const values = new Set()
    normalizedStudents.forEach(({ currentYear, expectedPassoutYear, admissionYear }) => {
      if (currentYear && currentYear !== '—') values.add(currentYear)
      if (expectedPassoutYear && expectedPassoutYear !== '—') values.add(expectedPassoutYear)
      if (admissionYear && admissionYear !== '—') values.add(admissionYear)
    })
    return Array.from(values).sort().reverse()
  }, [normalizedStudents])

  const statusOptions = useMemo(() => {
    const values = new Set()
    normalizedStudents.forEach(({ status }) => {
      if (status) values.add(status)
    })
    return Array.from(values).sort()
  }, [normalizedStudents])

  const handleStudentClick = (student) => {
    const encodedId = encodeURIComponent(String(student.id))
    navigate(`/admin/students/${encodedId}`)
  }

  const selectedStudent = useMemo(() => {
    if (!memberId) return null
    return normalizedStudents.find((student) => String(student.id) === memberId)
  }, [memberId, normalizedStudents])

  const getOriginalStudent = (normalizedStudent) => {
    if (!normalizedStudent) return null
    if (normalizedStudent.raw) return normalizedStudent.raw
    const targetId = String(normalizedStudent.id)
    return (
      students.find((s) => {
        const candidateIds = [s.id, s._id, s.userId, s.user?._id, s.email]
          .filter(Boolean)
          .map(String)
        return candidateIds.includes(targetId)
      }) ?? null
    )
  }

  const handleStatusChange = (member) => {
    setStatusModalMember(member)
  }

  const handleDelete = (member) => {
    setDeleteModalMember(member)
  }

  const confirmStatusChange = async (member, newStatus) => {
    try {
      // For coordinators, if no newStatus is provided, it means suspend action
      if (isCoordinator && !newStatus) {
        newStatus = 'Inactive'
      }

      const response = await put(`/directory/students/${member.id}/status`, { status: newStatus })
      setStatusModalMember(null)
      
      // Show success message
      const actionText = newStatus === 'Inactive' ? 'suspended' : `status updated to ${newStatus}`
      alert(`Member ${actionText} successfully!`)
      
      // Refetch data to get updated status
      refetch()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const confirmDelete = async (member) => {
    try {
      await del(`/directory/students/${member.id}`)
      setDeleteModalMember(null)
      refetch()
    } catch (error) {
      console.error('Failed to delete member:', error)
      alert('Failed to delete member. Please try again.')
    }
  }

  // Handle file selection for bulk upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please upload a CSV file')
        return
      }
      setSelectedFile(file)
      parseCSV(file)
    }
  }

  // Parse CSV file
  const parseCSV = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())
      
      const data = []
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        data.push(row)
      }
      
      setPreviewData(data.slice(0, 5)) // Show first 5 for preview
      setShowPreview(true)
    }
    reader.readAsText(file)
  }

  // Upload students data
  const handleBulkUpload = async () => {
    if (!selectedFile) return

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await post('/directory/students/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert(`${response.data.count} students uploaded successfully!`)

      // Reset form
      setSelectedFile(null)
      setPreviewData([])
      setShowPreview(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Refresh students list
      refetch()

    } catch (error) {
      alert('Upload failed: ' + (error.response?.data?.message || 'Please try again'))
    } finally {
      setUploading(false)
    }
  }

  const handleBackToManagement = () => {
    navigate('/admin/students')
  }

  const filteredStudents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return normalizedStudents.filter((student) => {
      const matchesSearch =
        !query ||
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        student.phone.toLowerCase().includes(query) ||
        student.department.toLowerCase().includes(query)

      const matchesYear = filterYear === 'all' || 
        student.currentYear === filterYear || 
        student.expectedPassoutYear === filterYear ||
        student.admissionYear === filterYear
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus

      return matchesSearch && matchesYear && matchesStatus
    })
  }, [normalizedStudents, searchTerm, filterYear, filterStatus])

  if (selectedStudent) {
    const originalStudent = getOriginalStudent(selectedStudent)
    const resolvedProfileId =
      originalStudent?.id ??
      originalStudent?._id ??
      originalStudent?.userId ??
      originalStudent?.user?._id ??
      selectedStudent.id

    return (
      <AdminProfileView 
        profileId={resolvedProfileId} 
        role="student" 
        onBack={handleBackToManagement}
        profileData={originalStudent ?? selectedStudent.raw ?? selectedStudent}
      />
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Student Management</h1>
        <p className="text-slate-600">
          Manage student profiles and their academic information.
          {isCoordinator && userDepartment && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {userDepartment} Department
            </span>
          )}
        </p>
        {isCoordinator && (
          <p className="text-sm text-blue-600 mt-1">
            Showing students from your department only
          </p>
        )}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Year</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expected Graduation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">View</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading students…
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {student.avatar && student.avatar.startsWith('http') ? (
                          <img 
                            src={student.avatar} 
                            alt={student.name || 'Student'}
                            className="h-10 w-10 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span 
                          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
                          style={{ display: student.avatar && student.avatar.startsWith('http') ? 'none' : 'flex' }}
                        >
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </span>
                        <div>
                          <button
                            onClick={() => handleStudentClick(student)}
                            className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors text-left cursor-pointer"
                          >
                            {student.name}
                          </button>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-900">{student.phone}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{student.department}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{student.currentYear}</td>
                    <td className="px-4 py-4 text-sm text-slate-900">{student.expectedPassoutYear}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(student.status)}`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleStudentClick(student)}
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
                          member={student}
                          onProfileView={handleStudentClick}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDelete}
                          userRole={adminUser.role || 'admin'}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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

export default StudentManagement
