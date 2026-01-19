import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthTemplate from '../components/auth/AuthTemplate'
import { post, setAuthToken } from '../utils/api'

const Login = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [role, setRole] = useState('admin')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await post('/auth/login', {
        role,
        email: formData.email.trim(),
        password: formData.password
      }, { includeAuth: false })

      const { token, user } = response || {}
      if (!token || !user) {
        throw new Error('Unexpected response from server.')
      }

      setAuthToken(token)
      localStorage.setItem('adminUser', JSON.stringify(user))
      navigate('/admin/dashboard')
    } catch (err) {
      const message = err?.message || 'Unable to sign in. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthTemplate
      align="center"
      header={
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Admin Access
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-[34px]">Sign in to AlumConnect Admin</h1>
          <p className="text-sm text-slate-500 md:text-base">
            Manage users, events, campaigns, and analytics from a unified dashboard.
          </p>
        </div>
      }
      footer={
        <p>
          Don’t have an admin account?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:text-primary-dark">
            Sign up
          </Link>
        </p>
      }
    >
      <div className="w-full max-w-md">
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
              Sign in as
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="admin">Administrator</option>
              <option value="coordinator">Department Coordinator</option>
            </select>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.25)] transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              isSubmitting ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-medium text-slate-700">Having trouble?</p>
          <div className="space-y-1 text-xs text-slate-500">
            <div>Ensure your admin account is approved by the platform owner.</div>
            <div>If issues persist, contact support for assistance.</div>
          </div>
        </div>
      </div>
    </AuthTemplate>
  )
}

export default Login
