import { useEffect, useMemo, useState } from 'react'

import { createPortal } from 'react-dom'

import PropTypes from 'prop-types'

import { post, get } from '../utils/api'

import { useToast } from '../context/ToastContext'



const TABS = [

  { id: 'single', label: 'Add one' },

  { id: 'bulk', label: 'Bulk upload' },

]



const ensurePortalRoot = () => {

  if (typeof document === 'undefined') return null

  let node = document.getElementById('modal-root')

  if (!node) {

    node = document.createElement('div')

    node.setAttribute('id', 'modal-root')

    document.body.appendChild(node)

  }

  return node

}



const FieldLabel = ({ children }) => (

  <label className="text-sm font-semibold text-slate-700">{children}</label>

)



FieldLabel.propTypes = {

  children: PropTypes.node.isRequired,

}



const ResultList = ({ results }) => {

  if (!Array.isArray(results) || !results.length) return null



  return (

    <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">

      <p className="font-semibold text-slate-700">Generated credentials</p>

      <ul className="space-y-1">

        {results.map((entry) => (

          <li key={entry.email} className="flex flex-wrap items-center gap-2">

            <span className="font-medium text-slate-800">{entry.email}</span>

            <span className="hidden sm:inline">•</span>

            <span>Password:</span>

            <code className="rounded bg-white px-2 py-0.5 text-slate-900 shadow-sm">{entry.password}</code>

          </li>

        ))}

      </ul>

    </div>

  )

}



ResultList.propTypes = {

  results: PropTypes.arrayOf(

    PropTypes.shape({

      email: PropTypes.string.isRequired,

      password: PropTypes.string.isRequired,

    }),

  ),

}



const formatRoleLabel = (role = '') => role.charAt(0).toUpperCase() + role.slice(1)



const UserProvisionModal = ({ isOpen, onClose, role, onSuccess }) => {

  const toast = useToast()

  const portalRoot = ensurePortalRoot()



  const [activeTab, setActiveTab] = useState('single')



  const [singleForm, setSingleForm] = useState({ 
    name: '', 
    email: '', 
    prn: '', 
    department: '', 
    year: '', 
    passoutYear: '' 
  })

  const [singleLoading, setSingleLoading] = useState(false)

  const [singleResult, setSingleResult] = useState(null)



  const [bulkFile, setBulkFile] = useState(null)

  const [bulkLoading, setBulkLoading] = useState(false)

  const [bulkResult, setBulkResult] = useState(null)

  const [departments, setDepartments] = useState([])

  const [departmentsLoading, setDepartmentsLoading] = useState(false)



  const roleLabel = useMemo(() => formatRoleLabel(role), [role])



  // Fetch departments when modal opens
  useEffect(() => {
    if (isOpen && departments.length === 0) {
      fetchDepartments()
    }
  }, [isOpen])

  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true)
      const response = await get('/directory/departments')
      setDepartments(response.departments || [])
    } catch (error) {
      console.error('Failed to fetch departments:', error)
      // Fallback departments
      setDepartments([
         'Civil Engineering',
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication Engineering',
  'Mechanical Engineering',
  'Artificial Intelligence & Data Science',
  'Electronics Engineering (VLSI Design And Technology)',
  'Electronics & Communication (Advanced Communication Technology)'
      ])
    } finally {
      setDepartmentsLoading(false)
    }
  }



  useEffect(() => {

    if (!isOpen) {

      setActiveTab('single')

      setSingleForm({ 
        name: '', 
        email: '', 
        prn: '', 
        department: '', 
        year: '', 
        passoutYear: '' 
      })

      setSingleResult(null)

      setBulkFile(null)

      setBulkResult(null)

      setSingleLoading(false)

      setBulkLoading(false)

    }

  }, [isOpen])



  if (!isOpen || typeof document === 'undefined' || !portalRoot) {

    return null

  }



  const handleSingleSubmit = async (event) => {

    event.preventDefault()

    if (singleLoading) return



    const trimmedEmail = singleForm.email.trim().toLowerCase()

    const trimmedName = singleForm.name.trim()



    if (!trimmedEmail) {

      toast({ type: 'error', message: 'Email is required.' })

      return

    }



    // Role-specific validation
    if (role === 'student' && !singleForm.prn) {
      toast({ type: 'error', message: 'PRN is required for students.' })
      return
    }

    if (role === 'student' && !singleForm.department) {
      toast({ type: 'error', message: 'Department is required for students.' })
      return
    }

    if (role === 'student' && !singleForm.year) {
      toast({ type: 'error', message: 'Year is required for students.' })
      return
    }

    if (role === 'alumni' && !singleForm.department) {
      toast({ type: 'error', message: 'Department is required for alumni.' })
      return
    }

    if (role === 'alumni' && !singleForm.passoutYear) {
      toast({ type: 'error', message: 'Passout year is required for alumni.' })
      return
    }

    if (role === 'coordinator' && !singleForm.department) {
      toast({ type: 'error', message: 'Department is required for coordinators.' })
      return
    }



    try {

      setSingleLoading(true)

      const payload = { 
        email: trimmedEmail, 
        name: trimmedName 
      }

      // Add role-specific fields
      if (role === 'student') {
        payload.prn = singleForm.prn
        payload.department = singleForm.department
        payload.year = singleForm.year
      } else if (role === 'alumni') {
        payload.prn = singleForm.prn
        payload.department = singleForm.department
        payload.passoutYear = singleForm.passoutYear
      } else if (role === 'coordinator') {
        payload.department = singleForm.department
      }

      const response = await post(`/admin/users/${role}/single`, payload)

      setSingleResult(response)

      toast({ type: 'success', message: `${roleLabel} user created successfully.` })

      onSuccess?.()

    } catch (error) {

      toast({ type: 'error', message: error?.message || 'Unable to create user.' })

    } finally {

      setSingleLoading(false)

    }

  }



  const handleBulkSubmit = async (event) => {

    event.preventDefault()

    if (bulkLoading) return

    if (!bulkFile) {

      toast({ type: 'error', message: 'Please select an Excel file to upload.' })

      return

    }



    const formData = new FormData()

    formData.append('file', bulkFile)



    try {

      setBulkLoading(true)

      const response = await post(`/admin/users/${role}/bulk`, formData)

      setBulkResult(response)

      toast({ type: 'success', message: `${response.created.length} ${roleLabel.toLowerCase()} users added.` })

      if (response.errors?.length) {

        toast({ type: 'info', message: `${response.errors.length} rows skipped. Check details below.` })

      }

      onSuccess?.()

    } catch (error) {

      toast({ type: 'error', message: error?.message || 'Unable to process file.' })

    } finally {

      setBulkLoading(false)

    }

  }

  const downloadTemplate = () => {
    // Create a proper Excel file using a simple XML-based approach
    let data = []
    let filename = ''
    
    if (role === 'student') {
      data = [
        ['Full Name', 'Email', 'PRN', 'Department', 'Year'],
        ['Rahul Sharma', 'rahul@gmail.com', 'PRN00123', 'Information Technology', 'Third Year'],
        ['Priya Patel', 'priya@gmail.com', 'PRN00124', 'Computer Engineering', 'Second Year']
      ]
      filename = 'student_template.csv'
    } else if (role === 'alumni') {
      data = [
        ['Full Name', 'Email', 'Department', 'Passout Year', 'PRN'],
        ['Amit Patil', 'amit@gmail.com', 'Computer Engineering', '2022', 'PRN00991'],
        ['Neha Singh', 'neha@gmail.com', 'Information Technology', '2021', 'PRN00992']
      ]
      filename = 'alumni_template.csv'
    } else if (role === 'coordinator') {
      data = [
        ['Full Name', 'Email', 'Department'],
        ['Dr. Mehta', 'mehta@gmail.com', 'Information Technology'],
        ['Prof. Kumar', 'kumar@gmail.com', 'Computer Engineering']
      ]
      filename = 'coordinator_template.csv'
    }

    // Convert data to CSV string (Excel can open CSV files properly)
    const csvContent = data.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    // Create blob with proper Excel MIME type
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' 
    })
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const renderSingleForm = () => (
    <form onSubmit={handleSingleSubmit} className="space-y-4">
      <div className="space-y-2">
        <FieldLabel>Full Name *</FieldLabel>
        <input
          type="text"
          value={singleForm.name}
          onChange={(event) => setSingleForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="e.g. Alex Johnson"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel>Email *</FieldLabel>
        <input
          type="email"
          value={singleForm.email}
          onChange={(event) => setSingleForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="name@example.com"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {/* PRN Field - Required for Student, Optional for Alumni */}
      {(role === 'student' || role === 'alumni') && (
        <div className="space-y-2">
          <FieldLabel>PRN {role === 'student' ? '*' : '(Optional)'}</FieldLabel>
          <input
            type="text"
            value={singleForm.prn}
            onChange={(event) => setSingleForm((prev) => ({ ...prev, prn: event.target.value }))}
            placeholder="e.g. PRN00123"
            required={role === 'student'}
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>
      )}

      {/* Department Field - Required for all roles */}
      <div className="space-y-2">
        <FieldLabel>Department *</FieldLabel>
        <select
          value={singleForm.department}
          onChange={(event) => setSingleForm((prev) => ({ ...prev, department: event.target.value }))}
          required
          disabled={departmentsLoading}
          className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      {/* Year Field - Only for Students */}
      {role === 'student' && (
        <div className="space-y-2">
          <FieldLabel>Year *</FieldLabel>
          <select
            value={singleForm.year}
            onChange={(event) => setSingleForm((prev) => ({ ...prev, year: event.target.value }))}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          >
            <option value="">Select Year</option>
            <option value="First Year">First Year</option>
            <option value="Second Year">Second Year</option>
            <option value="Third Year">Third Year</option>
            <option value="Last Year">Last Year</option>
          </select>
        </div>
      )}

      {/* Passout Year Field - Only for Alumni */}
      {role === 'alumni' && (
        <div className="space-y-2">
          <FieldLabel>Passout Year *</FieldLabel>
          <input
            type="number"
            value={singleForm.passoutYear}
            onChange={(event) => setSingleForm((prev) => ({ ...prev, passoutYear: event.target.value }))}
            placeholder="e.g. 2022"
            min="2000"
            max={new Date().getFullYear()}
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={singleLoading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          singleLoading ? 'cursor-wait bg-slate-200 text-slate-500' : 'bg-primary text-white shadow-[0_16px_40px_rgba(37,99,235,0.25)] hover:bg-primary-dark'
        }`}
      >
        {singleLoading ? 'Creating…' : `Create ${roleLabel}`}
      </button>

      {singleResult?.temporaryPassword && (
        <ResultList results={[{ email: singleResult.user.email, password: singleResult.temporaryPassword }]} />
      )}

      {!singleResult?.emailSent && singleResult?.temporaryPassword && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Email sending is not configured; share these credentials manually.
        </p>
      )}
    </form>
  )

  const renderBulkForm = () => (
    <form onSubmit={handleBulkSubmit} className="space-y-4">
      <div className="space-y-2">
        <FieldLabel>Excel file *</FieldLabel>
        <div className="relative">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              setBulkFile(event.target.files?.[0] ?? null)
              setBulkResult(null)
            }}
            className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-8 text-sm text-slate-600 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1114 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm font-medium text-slate-600 mb-1">
                Drop your Excel file here or click to browse
              </p>
              <p className="text-xs text-slate-500">
                Supports: .xlsx and .xls files only
              </p>
            </div>
          </div>
        </div>
        
        {bulkFile && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ File selected: <span className="font-medium">{bulkFile.name}</span>
            </p>
            <p className="text-xs text-green-600 mt-1">
              File size: {(bulkFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}
        
        
      </div>

      <button
        type="button"
        onClick={downloadTemplate}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Template
      </button>

      <button
        type="submit"
        disabled={bulkLoading}
        className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          bulkLoading ? 'cursor-wait bg-slate-200 text-slate-500' : 'bg-primary text-white shadow-[0_16px_40px_rgba(37,99,235,0.25)] hover:bg-primary-dark'
        }`}
      >
        {bulkLoading ? 'Uploading…' : `Upload ${roleLabel} list`}
      </button>

      {bulkResult?.temporaryPasswords?.length ? (
        <ResultList results={bulkResult.temporaryPasswords} />
      ) : null}

      {bulkResult?.errors?.length ? (
        <div className="space-y-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <p className="font-semibold">Rows skipped</p>
          <ul className="list-inside list-disc space-y-1">
            {bulkResult.errors.map((item, index) => (
              <li key={`${item.row}-${index}`}>
                Row {item.row}: {item.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {bulkResult && !bulkResult.emailSent && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Email sending is not configured; export credentials above and share manually.
        </p>
      )}
    </form>
  )

  const renderContent = () => (
    <div className="flex min-h-[60vh] flex-col gap-6">

      <header className="space-y-2">

        <h2 className="text-2xl font-semibold text-slate-900">Add {roleLabel}</h2>

        <p className="text-sm text-slate-500">

          Choose between adding a single {roleLabel.toLowerCase()} or uploading an Excel sheet for bulk creation.

        </p>

      </header>

      <div className="flex gap-3 rounded-full bg-slate-100 p-1 text-sm font-medium text-slate-700">

        {TABS.map((tab) => (

          <button

            key={tab.id}

            type="button"

            onClick={() => setActiveTab(tab.id)}

            className={`flex-1 rounded-full px-4 py-2 transition ${

              activeTab === tab.id ? 'bg-white text-primary shadow-sm' : 'text-slate-600 hover:text-slate-900'

            }`}

          >

            {tab.label}

          </button>

        ))}

      </div>

      <div className="flex-1 overflow-y-auto">

        {activeTab === 'single' ? renderSingleForm() : renderBulkForm()}

      </div>

    </div>
  )



  return createPortal(

    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/50 px-4 py-10" role="dialog" aria-modal="true">

      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">

        <button

          type="button"

          onClick={onClose}

          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"

          aria-label="Close modal"

        >

          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">

            <line x1="5" y1="5" x2="15" y2="15" />

            <line x1="15" y1="5" x2="5" y2="15" />

          </svg>

        </button>

        {renderContent()}

      </div>

    </div>,

    portalRoot,

  )

}



UserProvisionModal.propTypes = {

  isOpen: PropTypes.bool.isRequired,

  onClose: PropTypes.func.isRequired,

  role: PropTypes.string.isRequired,

  onSuccess: PropTypes.func,

}



UserProvisionModal.defaultProps = {

  onSuccess: undefined,

}



export default UserProvisionModal

