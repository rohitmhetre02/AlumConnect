import { useState, useEffect } from 'react'
import useEventRegistrations from '../../hooks/useEventRegistrations'

const EventRegistrationModal = ({ isOpen, onClose, eventId, eventTitle }) => {
  const { registerForEvent, loading, error, clearError } = useEventRegistrations()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    department: '',
    passoutYear: '',
    currentYear: '1st Year',
  })
  
  const [hasRegistered, setHasRegistered] = useState(false)
  const [checkingRegistration, setCheckingRegistration] = useState(false)

  const departments = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Business Administration',
    'Physics',
    'Chemistry',
    'Mathematics',
    'English'
  ]

  const currentYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year']

  // Check if user has already registered when email changes
  useEffect(() => {
    const checkExistingRegistration = async () => {
      if (formData.email && isOpen) {
        setCheckingRegistration(true)
        try {
          // For now, we'll rely on backend duplicate check
          // In a real app, you might want to check this before form submission
        } catch (err) {
          console.error('Error checking registration:', err)
        } finally {
          setCheckingRegistration(false)
        }
      }
    }

    const timeoutId = setTimeout(checkExistingRegistration, 500)
    return () => clearTimeout(timeoutId)
  }, [formData.email, isOpen, eventId])

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (error) clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (hasRegistered) {
      alert('You have already registered for this event.')
      return
    }
    
    try {
      const registrationData = {
        ...formData,
        registrationType: 'popup',
        passoutYear: formData.role === 'alumni' ? parseInt(formData.passoutYear) : undefined,
        currentYear: formData.role === 'student' ? formData.currentYear : undefined,
      }

      await registerForEvent(eventId, registrationData)
      
      alert(`Successfully registered for "${eventTitle}"!`)
      setHasRegistered(true)
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose()
        // Reset form
        setFormData({
          name: '',
          email: '',
          role: 'student',
          department: '',
          passoutYear: '',
          currentYear: '1st Year',
        })
        setHasRegistered(false)
      }, 1500)
    } catch (err) {
      // Error is already handled by the hook
      if (err.message.includes('already registered')) {
        setHasRegistered(true)
      }
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      clearError()
      // Reset form when closing
      setFormData({
        name: '',
        email: '',
        role: 'student',
        department: '',
        passoutYear: '',
        currentYear: '1st Year',
      })
      setHasRegistered(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Event Registration</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="rounded-full p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-slate-600 mt-1">{eventTitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {hasRegistered ? (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-6 text-center">
              <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-green-800 mb-1">Already Registered!</h3>
              <p className="text-sm text-green-600">You have successfully registered for this event.</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="John Doe"
                  required
                  disabled={loading || checkingRegistration}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="john@example.com"
                  required
                  disabled={loading || checkingRegistration}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                {checkingRegistration && (
                  <p className="text-xs text-slate-500 mt-1">Checking registration status...</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                    disabled={loading}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                      formData.role === 'student'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    } disabled:opacity-50`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: 'alumni' }))}
                    disabled={loading}
                    className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition ${
                      formData.role === 'alumni'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                    } disabled:opacity-50`}
                  >
                    Alumni
                  </button>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Department
                </label>
                <div className="relative">
                  <select
                    value={formData.department}
                    onChange={handleChange('department')}
                    disabled={loading}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

              {/* Conditional Fields */}
              {formData.role === 'student' ? (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Current Year *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.currentYear}
                      onChange={handleChange('currentYear')}
                      required
                      disabled={loading}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                    >
                      {currentYears.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Passout Year *
                  </label>
                  <input
                    type="number"
                    value={formData.passoutYear}
                    onChange={handleChange('passoutYear')}
                    placeholder="2020"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    required
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || checkingRegistration}
                  className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default EventRegistrationModal
