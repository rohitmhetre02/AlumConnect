import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { post } from '../utils/api'
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

  const [singleForm, setSingleForm] = useState({ name: '', email: '' })
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleResult, setSingleResult] = useState(null)

  const [bulkFile, setBulkFile] = useState(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkResult, setBulkResult] = useState(null)

  const roleLabel = useMemo(() => formatRoleLabel(role), [role])

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('single')
      setSingleForm({ name: '', email: '' })
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

    try {
      setSingleLoading(true)
      const response = await post(`/admin/users/${role}/single`, { email: trimmedEmail, name: trimmedName })
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

  const renderSingleForm = () => (
    <form onSubmit={handleSingleSubmit} className="space-y-4">
      <div className="space-y-2">
        <FieldLabel>Name (optional)</FieldLabel>
        <input
          type="text"
          value={singleForm.name}
          onChange={(event) => setSingleForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="e.g. Alex Johnson"
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
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => {
            setBulkFile(event.target.files?.[0] ?? null)
            setBulkResult(null)
          }}
          className="w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 shadow-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary-dark"
        />
        <p className="text-xs text-slate-500">
          Accepted columns: <code>Name</code> (optional) and <code>Email</code> (required). First row should contain headers.
        </p>
      </div>
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
