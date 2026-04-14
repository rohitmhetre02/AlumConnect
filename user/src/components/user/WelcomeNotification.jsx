import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const WelcomeNotification = ({ firstName, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Check if welcome notification has been shown before
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcomeNotification')
    if (hasSeenWelcome) {
      setIsVisible(false)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('hasSeenWelcomeNotification', 'true')
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 p-6 relative max-w-md w-full">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Welcome to AlumConnect!
            </h3>
            <p className="text-slate-600">
              Congratulations {firstName}, your account was created by admin. You're all set to explore the platform!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeNotification
