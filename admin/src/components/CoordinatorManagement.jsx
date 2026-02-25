import { useMemo, useState } from 'react'
import useDirectoryMembers from '../hooks/useDirectoryMembers'
import getStatusBadgeClass from '../utils/status'
import ActionMenu from './ActionMenu'
import StatusChangeModal from './StatusChangeModal'
import { put } from '../utils/api'

const CoordinatorManagement = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [statusModalMember, setStatusModalMember] = useState(null)

  const { data: coordinators, isLoading, error, refetch } = useDirectoryMembers('coordinator')

  const normalizedCoordinators = useMemo(() => {
    return coordinators.map((coordinator) => {
      const firstName = coordinator.firstName?.trim() ?? ''
      const lastName = coordinator.lastName?.trim() ?? ''
      const name = coordinator.name || [firstName, lastName].filter(Boolean).join(' ').trim()
      const email = coordinator.email ?? ''
      const phone = coordinator.phone ?? ''
      const department = coordinator.department ?? coordinator.program ?? ''
      const role = coordinator.role || 'Coordinator'
      
      // Get real-time profile status from profileApprovalStatus field
      let status = 'Active' // Default status
      
      // Check profileApprovalStatus first (real-time profile status)
      if (coordinator.profileApprovalStatus) {
        const normalizedStatus = coordinator.profileApprovalStatus.toUpperCase()
        if (normalizedStatus === 'IN_REVIEW') {
          status = 'Pending'
        } else if (normalizedStatus === 'APPROVED') {
          status = 'Active'
        } else if (normalizedStatus === 'REJECTED') {
          status = 'Rejected'
        }
      } else {
        // Fallback to legacy status field
        const rawStatus = coordinator.status || (coordinator.active === false ? 'Inactive' : 'Active')
        status = typeof rawStatus === 'string' && rawStatus.trim() ? rawStatus : 'Active'
      }

      return {
        id: coordinator.id || coordinator._id || `${email}-${department}`,
        name: name || email || 'Coordinator',
        email,
        phone,
        avatar: coordinator.avatar || (name ? name.charAt(0).toUpperCase() : 'C'),
        department: department || '—',
        role: role.charAt(0).toUpperCase() + role.slice(1),
        status,
        profileApprovalStatus: coordinator.profileApprovalStatus, // Keep original for reference
        joinDate: coordinator.joinDate || coordinator.createdAt || '',
        lastActive: coordinator.lastActive || coordinator.lastLogin || '',
        permissions: coordinator.permissions || [],
        assignedEvents: coordinator.assignedEvents || 0,
        assignedStudents: coordinator.assignedStudents || 0,
        raw: coordinator, // Keep original data for API calls
      }
    })
  }, [coordinators])

  const departmentOptions = useMemo(() => {
    const values = new Set()
    normalizedCoordinators.forEach(({ department }) => {
      if (department && department !== '—') values.add(department)
    })
    return Array.from(values).sort()
  }, [normalizedCoordinators])

  const statusOptions = useMemo(() => {
    const values = new Set()
    normalizedCoordinators.forEach(({ status }) => {
      if (status) values.add(status)
    })
    return Array.from(values).sort()
  }, [normalizedCoordinators])

  const filteredCoordinators = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return normalizedCoordinators.filter((coordinator) => {
      const matchesSearch =
        !query ||
        coordinator.name.toLowerCase().includes(query) ||
        coordinator.email.toLowerCase().includes(query) ||
        coordinator.phone.toLowerCase().includes(query) ||
        coordinator.department.toLowerCase().includes(query)

      const matchesDepartment = filterDepartment === 'all' || coordinator.department === filterDepartment
      const matchesStatus = filterStatus === 'all' || coordinator.status === filterStatus

      return matchesSearch && matchesDepartment && matchesStatus
    })
  }, [normalizedCoordinators, searchTerm, filterDepartment, filterStatus])

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    } catch {
      return '—'
    }
  }

  const handleStatusChange = (coordinator) => {
    setStatusModalMember(coordinator)
  }

  const confirmStatusChange = async (member, newStatus) => {
    try {
      // Map admin status to profile approval status
      let profileApprovalStatus = 'APPROVED' // Default
      if (newStatus === 'Pending') {
        profileApprovalStatus = 'IN_REVIEW'
      } else if (newStatus === 'Rejected') {
        profileApprovalStatus = 'REJECTED'
      } else if (newStatus === 'Active') {
        profileApprovalStatus = 'APPROVED'
      } else if (newStatus === 'Inactive') {
        profileApprovalStatus = 'APPROVED' // Keep approved but mark as inactive
      }
      
      const response = await put(`/directory/coordinators/${member.id}/status`, { 
        status: newStatus,
        profileApprovalStatus: profileApprovalStatus 
      })
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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Coordinator Management</h1>
        <p className="text-slate-600">Manage coordinator accounts, permissions, and assignments.</p>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Search coordinators..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 pl-11 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={filterDepartment}
              onChange={(event) => setFilterDepartment(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <button className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.25)] transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50">
            Add Coordinator
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Coordinator</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Join Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignments</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-sm text-slate-500">
                    Loading coordinators…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center">
                    <p className="text-sm text-red-600 mb-2">Error loading coordinators</p>
                    <p className="text-xs text-slate-500">{error}</p>
                  </td>
                </tr>
              ) : filteredCoordinators.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-sm text-slate-500">
                    No coordinators match the filters.
                  </td>
                </tr>
              ) : (
                filteredCoordinators.map((coordinator) => (
                  <tr key={coordinator.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {coordinator.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{coordinator.name}</p>
                          <p className="text-xs text-slate-500">{coordinator.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700">{coordinator.department}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700">{coordinator.email}</p>
                        <p className="text-xs text-slate-500">{coordinator.phone || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(coordinator.status)}`}>
                        {coordinator.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700">{formatDate(coordinator.joinDate)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-slate-700">{coordinator.assignedEvents} Events</p>
                        <p className="text-xs text-slate-500">{coordinator.assignedStudents} Students</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <ActionMenu
                          member={coordinator}
                          onStatusChange={handleStatusChange}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      
      <StatusChangeModal
        member={statusModalMember}
        isOpen={!!statusModalMember}
        onClose={() => setStatusModalMember(null)}
        onConfirm={confirmStatusChange}
      />
    </div>
  )
}

export default CoordinatorManagement
