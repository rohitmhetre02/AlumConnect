import { useState } from 'react'

const DangerZone = ({ onDelete }) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const isReady = confirmText === 'DELETE'

  const handleDelete = () => {
    if (isReady) {
      onDelete?.()
      setShowConfirm(false)
      setConfirmText('')
    }
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-red-600">Danger Zone</h2>
      <p className="mt-2 text-sm text-slate-600">Permanently delete your account and all associated data.</p>
      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="mt-4 rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
        >
          Delete Account
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-500">Type DELETE to confirm.</p>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm"
          />
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowConfirm(false)
                setConfirmText('')
              }}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!isReady}
              onClick={handleDelete}
              className={`rounded-full px-5 py-2 text-sm font-semibold text-white ${
                isReady ? 'bg-red-600 hover:bg-red-700' : 'bg-red-300'
              }`}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DangerZone
