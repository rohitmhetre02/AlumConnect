import { useState, useRef, useEffect } from 'react'

const ActionMenu = ({ member, onProfileView, onStatusChange, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfileClick = () => {
    setIsOpen(false)
    onProfileView(member)
  }

  const handleStatusChange = () => {
    setIsOpen(false)
    onStatusChange(member)
  }

  const handleDelete = () => {
    setIsOpen(false)
    onDelete(member)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-primary hover:text-primary"
        aria-label="Actions"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          <button
            onClick={handleProfileClick}
            className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
          <button
            onClick={handleStatusChange}
            className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <svg className="mr-3 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Status Change
          </button>
          <div className="border-t border-slate-100"></div>
          <button
            onClick={handleDelete}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="mr-3 h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 011-1h2a1 1 0 011 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default ActionMenu
