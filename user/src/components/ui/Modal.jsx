import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

const focusableSelectors =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  width = 'max-w-lg',
  closeOnBackdrop = true,
  closeOnEscape = true,
}) => {
  const dialogRef = useRef(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const previouslyFocusedElement = document.activeElement

    const getFocusableElements = () => {
      if (!dialogRef.current) return []
      return Array.from(dialogRef.current.querySelectorAll(focusableSelectors)).filter(
        (element) => !element.hasAttribute('disabled') && element.getAttribute('tabindex') !== '-1',
      )
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!closeOnEscape) {
          return
        }
        event.preventDefault()
        onCloseRef.current?.()
      }

      if (event.key !== 'Tab') return

      const focusableElements = getFocusableElements()

      if (!focusableElements.length) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const isShiftPressed = event.shiftKey
      const activeElement = document.activeElement

      if (isShiftPressed && (activeElement === firstElement || !dialogRef.current?.contains(activeElement))) {
        event.preventDefault()
        lastElement.focus()
      } else if (!isShiftPressed && activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    const focusTarget = getFocusableElements()[0] ?? dialogRef.current
    focusTarget?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocusedElement?.focus?.()
    }
  }, [isOpen, closeOnEscape])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onCloseRef.current?.()
    }
  }

  const labelledBy = title ? `${titleId}-title` : undefined

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8"
      onMouseDown={closeOnBackdrop ? handleBackdropClick : undefined}
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`relative w-full ${width} max-h-[90vh] rounded-2xl bg-white shadow-soft focus:outline-none overflow-hidden flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4 flex-shrink-0">
          {title ? (
            <h2 id={labelledBy} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
          ) : (
            <span aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={() => onCloseRef.current?.()}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 flex-shrink-0"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default Modal
