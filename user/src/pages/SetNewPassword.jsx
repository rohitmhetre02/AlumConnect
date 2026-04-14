import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { post } from '../utils/api'
import useToast from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

const SetNewPassword = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [tempPassword, setTempPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const navigate = useNavigate()
  const location = useLocation()
  const addToast = useToast()
  const { login } = useAuth()

  useEffect(() => {
    // Get email and temp password from location state or localStorage
    const state = location.state
    if (state?.email && state?.tempPassword) {
      setEmail(state.email)
      setTempPassword(state.tempPassword)
    } else {
      // Fallback to localStorage if state is lost
      const storedEmail = localStorage.getItem('tempLoginEmail')
      const storedTempPassword = localStorage.getItem('tempLoginPassword')
      if (storedEmail && storedTempPassword) {
        setEmail(storedEmail)
        setTempPassword(storedTempPassword)
        // Clear from localStorage after retrieving
        localStorage.removeItem('tempLoginEmail')
        localStorage.removeItem('tempLoginPassword')
      } else {
        // Redirect to login if no credentials found
        navigate('/login', { replace: true })
      }
    }
  }, [location.state, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.newPassword.trim()) {
      addToast({ type: 'error', message: 'New password is required' })
      return false
    }
    
    if (formData.newPassword.length < 6) {
      addToast({ type: 'error', message: 'Password must be at least 6 characters long' })
      return false
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      addToast({ type: 'error', message: 'Passwords do not match' })
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Update password and activate account
      const response = await post('/auth/activate-account', {
        email: email,
        tempPassword: tempPassword,
        newPassword: formData.newPassword
      })
      
      if (response.success) {
        addToast({ 
          type: 'success', 
          message: 'Password updated successfully! Your account is now active.' 
        })
        
        // Auto-login with new credentials
        const loginResponse = await post('/auth/login', {
          email: email,
          password: formData.newPassword
        })
        
        if (loginResponse) {
          await login({ 
            ...loginResponse.user, 
            token: loginResponse.token,
            isFirstLogin: false // Mark first login as completed
          })
        }
      }
    } catch (error) {
      const message = error?.message || 'Failed to update password. Please try again.'
      addToast({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = formData.newPassword && 
                 formData.confirmPassword && 
                 formData.newPassword === formData.confirmPassword &&
                 formData.newPassword.length >= 6

  return (
    <div className="mt-12 bg-slate-30 flex items-center justify-center">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Set New Password
          </h1>
          <p className="text-slate-600">
            Your account was created by admin. Please set a new password to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter your new password"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.newPassword && (
              <p className="text-xs text-slate-500">
                {formData.newPassword.length < 6 
                  ? 'Password must be at least 6 characters' 
                  : 'Password strength: Good'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your new password"
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
              isValid && !isSubmitting
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Updating Password...' : 'Set New Password & Activate Account'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-slate-600 hover:text-primary transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default SetNewPassword
