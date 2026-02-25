import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthTemplate from '../components/auth/AuthTemplate'
import { post, setAuthToken } from '../utils/api'

const departmentOptions = [
  'Civil Engineering',
  'Computer Engineering',
  'Information Technology',
  'Electronics & Telecommunication Engineering',
  'Mechanical Engineering',
  'Artificial Intelligence & Data Science',
  'Electronics Engineering (VLSI Design And Technology)',
  'Electronics & Communication (Advanced Communication Technology)',
  'School of Architecture',
]

const Signup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [role, setRole] = useState('admin')

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const trimmedDepartment = formData.department.trim()
    const requiresDepartment = role === 'coordinator'

    if (requiresDepartment && !trimmedDepartment) {
      setError('Please select a department for this role.')
      return
    }

    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const payload = {
        role,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      }

      if (requiresDepartment) {
        payload.department = trimmedDepartment
      }

      const response = await post('/auth/signup', payload, { includeAuth: false })

      const { token, user } = response || {}
      if (!token || !user) {
        throw new Error('Unexpected response from server.')
      }

      setAuthToken(token)
      localStorage.setItem('adminUser', JSON.stringify(user))
      
      // Role-based navigation
      navigate('/admin/dashboard')
    } catch (err) {
      const message = err?.message || 'Unable to create account. Please try again.'
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
            Admin Signup
          </span>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-[34px]">Create your AlumConnect Admin account</h1>
          <p className="text-sm text-slate-500 md:text-base">
            Set up access to manage the platform, community, and analytics tools.
          </p>
        </div>
      }
      footer={
        <p>
          Already have access?{' '}
          <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
            Sign in
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
              Register as
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value)
                setFormData((prev) => ({
                  ...prev,
                  department: event.target.value === 'coordinator' ? prev.department : '',
                }))
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="admin">Administrator</option>
              <option value="coordinator">Department Coordinator</option>
            </select>
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
              First name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
              Last name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Enter your last name"
            />
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

          {role === 'coordinator' && (
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-slate-700 mb-2">
                Department
              </label>
              <select
                id="department"
                name="department"
                required
                value={formData.department}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="" disabled>
                  Select department
                </option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.25)] transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              isSubmitting ? 'bg-primary/60 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
            }`}
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

      </div>
    </AuthTemplate>
  )
}

export default Signup
