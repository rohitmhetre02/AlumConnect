import { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

let toastCounter = 0

export { ToastContext }
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = ({ type = 'info', message = '', duration = 4000 } = {}) => {
    if (!message) return
    toastCounter += 1
    const id = toastCounter
    setToasts((prev) => [...prev, { id, type, message }])
    if (duration > 0) {
      setTimeout(() => dismissToast(id), duration)
    }
  }

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  const contextValue = useMemo(() => ({ addToast, dismissToast }), [])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed inset-x-0 top-4 z-[1000] flex flex-col items-center space-y-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-lg transition-all ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : toast.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800'
                  : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-current" aria-hidden="true" />
              <div className="flex-1">{toast.message}</div>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-white/60 hover:text-slate-600"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss toast"
              >
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <line x1="5" y1="5" x2="15" y2="15" />
                  <line x1="15" y1="5" x2="5" y2="15" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.addToast
}
