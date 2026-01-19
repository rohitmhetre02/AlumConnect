import { useEffect, useRef } from 'react'

const ICONS = {
  success: '✓',
  error: '!',
  info: 'ℹ',
}

const COLORS = {
  success: 'border-green-500 text-green-600',
  error: 'border-red-500 text-red-600',
  info: 'border-blue-500 text-blue-600',
}

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

const ToastItem = ({ toast, onDismiss }) => {
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 3000)
    return () => clearTimeout(timerRef.current)
  }, [toast.id, onDismiss])

  const pauseTimer = () => clearTimeout(timerRef.current)
  const resumeTimer = () => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), 1500)
  }

  return (
    <div
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      className={`flex items-center gap-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-slate-100 transition ${COLORS[toast.type]}`}
      role="status"
    >
      <span className="text-lg">{ICONS[toast.type]}</span>
      <p className="text-sm text-slate-700">{toast.message}</p>
    </div>
  )
}

export default ToastContainer
