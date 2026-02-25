import React from 'react'

const AdminMessagesPanelPlaceholder = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <p className="text-gray-600 mb-4">Messaging functionality coming soon!</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default AdminMessagesPanelPlaceholder
