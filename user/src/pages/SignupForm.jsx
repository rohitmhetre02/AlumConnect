import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuthTemplate from '../components/auth/AuthTemplate'
import { getSignupRoleById, signupRoles } from '../data/authRoles'
import { post } from '../utils/api'
import useToast from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'

const programOptions = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'mca', label: 'MCA' },
]

const departmentOptions = [
  { value: 'civil', label: 'Civil Engineering' },
  { value: 'computer', label: 'Computer Engineering' },
  { value: 'it', label: 'Information Technology' },
  { value: 'entc', label: 'Electronics & Telecommunication Engineering' },
  { value: 'mechanical', label: 'Mechanical Engineering' },
  { value: 'aids', label: 'Artificial Intelligence & Data Science' },
  { value: 'vlsi', label: 'Electronics Engineering (VLSI Design And Technology)' },
  { value: 'communication', label: 'Electronics & Communication (Advanced Communication Technology)' },
]

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const yearPattern = /^\d{4}$/

const initialFormState = {
  email: '',
  firstName: '',
  lastName: '',
  program: 'engineering',
  department: '',
  admissionYear: '',
  expectedPassoutYear: '',
  passoutYear: '',
  prn: '',
  password: '',
  confirmPassword: '',
  agreeDataPolicy: false,
  agreeTerms: false,
  subscribeUpdates: false,
}

const SignupForm = () => {
  const { role: roleParam } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const { login } = useAuth()

  const role = useMemo(() => getSignupRoleById(roleParam) ?? signupRoles[0], [roleParam])

  const [form, setForm] = useState(initialFormState)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isStudent = role?.id === 'student'
  const isAlumni = role?.id === 'alumni'
  const isFaculty = role?.id === 'faculty'

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      admissionYear: isStudent ? prev.admissionYear : '',
      expectedPassoutYear: isStudent ? prev.expectedPassoutYear : '',
      passoutYear: isAlumni ? prev.passoutYear : '',
    }))
    setTouched({})
  }, [isStudent, isAlumni])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    if (name === 'program') {
      setForm((prev) => ({
        ...prev,
        program: value,
        department: value === 'engineering' ? prev.department : '',
      }))
      return
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleBlur = (event) => {
    const { name } = event.target
    setTouched((prev) => ({ ...prev, [name]: true }))
  }

  const errors = useMemo(() => {
    const next = {}
    if (!emailPattern.test(form.email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (!form.firstName.trim()) {
      next.firstName = 'First name is required.'
    }
    if (!form.lastName.trim()) {
      next.lastName = 'Last name is required.'
    }
    if (!form.program) {
      next.program = 'Select your program.'
    }
    if (form.program === 'engineering' && !form.department) {
      next.department = 'Select your department.'
    }
    if (isStudent) {
      if (!yearPattern.test(form.admissionYear.trim())) {
        next.admissionYear = 'Enter a valid 4-digit year.'
      }
      if (!yearPattern.test(form.expectedPassoutYear.trim())) {
        next.expectedPassoutYear = 'Enter a valid 4-digit year.'
      }
    }
    if (isAlumni) {
      if (!yearPattern.test(form.passoutYear.trim())) {
        next.passoutYear = 'Enter a valid 4-digit year.'
      }
    }
    if (!form.prn.trim()) {
      next.prn = isFaculty ? 'Staff ID is required.' : 'PRN number is required.'
    }
    if (!form.password.trim()) {
      next.password = 'Create a password.'
    }
    if (!form.confirmPassword.trim()) {
      next.confirmPassword = 'Confirm your password.'
    }
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match.'
    }
    if (!form.agreeDataPolicy) {
      next.agreeDataPolicy = 'You must agree to continue.'
    }
    if (!form.agreeTerms) {
      next.agreeTerms = 'You must accept the terms.'
    }
    return next
  }, [form, isStudent, isAlumni])

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

  const touchFields = (fields) => {
    setTouched((prev) => {
      const next = { ...prev }
      fields.forEach((field) => {
        next[field] = true
      })
      return next
    })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const requiredFields = [
      'email',
      'firstName',
      'lastName',
      'program',
      'prn',
      'password',
      'confirmPassword',
      'agreeDataPolicy',
      'agreeTerms',
    ]
    if (form.program === 'engineering') {
      requiredFields.push('department')
    }
    if (isStudent) {
      requiredFields.push('admissionYear', 'expectedPassoutYear')
    }
    if (isAlumni) {
      requiredFields.push('passoutYear')
    }

    touchFields(requiredFields)

    if (!isValid) return
    setIsSubmitting(true)

    const payload = {
      role: role.id,
      email: form.email.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      password: form.password,
      department: form.department || 'General',
    }

    if (isStudent || isAlumni) {
      payload.prnNumber = form.prn.trim()
    }
    if (isStudent) {
      payload.admissionYear = form.admissionYear
      payload.expectedPassoutYear = form.expectedPassoutYear
    }
    if (isAlumni) {
      payload.passoutYear = form.passoutYear
    }

    try {
      const response = await post('/auth/signup', payload)
      addToast({ type: 'success', message: 'Account created successfully.' })
      login({ ...response.user, token: response.token })
      
      // Show profile under review popup for student, alumni, and faculty
      if (['student', 'alumni', 'faculty'].includes(role.id)) {
        setTimeout(() => {
          addToast({
            type: 'info',
            title: 'Profile Under Review',
            message: 'Your profile is currently under review by administrators. You will be notified within 2-4 days. Please complete your profile for faster approval.',
            duration: 8000
          })
        }, 1000)
      }
      
      // Navigate to dashboard after successful signup
      navigate('/dashboard')
    } catch (error) {
      const message = error?.message ?? 'Failed to create account.'
      addToast({ type: 'error', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const fieldError = (field) => (touched[field] && errors[field] ? errors[field] : '')

  return (
    <AuthTemplate
      header={
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-[#2563EB]">Join AlumConnect</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-[34px]">
            {role?.title ?? 'Create your account'}
          </h1>
          <p className="text-sm text-slate-500 md:text-base">
            {role?.description ?? 'Complete your details to access tailored mentorship, events, and opportunities inside the community.'}
          </p>
        </div>
      }
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#2563EB] hover:text-[#1d4ed8]">
            Login
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@domain.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
            required
          />
          {fieldError('email') && <p className="text-xs font-medium text-red-500">{fieldError('email')}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">
              First Name*
            </label>
            <input
              id="firstName"
              name="firstName"
              placeholder="Aarya"
              value={form.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('firstName') && <p className="text-xs font-medium text-red-500">{fieldError('firstName')}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">
              Last Name*
            </label>
            <input
              id="lastName"
              name="lastName"
              placeholder="Saxena"
              value={form.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('lastName') && <p className="text-xs font-medium text-red-500">{fieldError('lastName')}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="program" className="text-sm font-semibold text-slate-700">
            User Program*
          </label>
          <select
            id="program"
            name="program"
            value={form.program}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
          >
            {programOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('program') && <p className="text-xs font-medium text-red-500">{fieldError('program')}</p>}
        </div>

        {form.program === 'engineering' && (
          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-semibold text-slate-700">
              Department*
            </label>
            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
            >
              <option value="">Select department</option>
              {departmentOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {fieldError('department') && <p className="text-xs font-medium text-red-500">{fieldError('department')}</p>}
          </div>
        )}

        {isStudent && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="admissionYear" className="text-sm font-semibold text-slate-700">
                Admission Year*
              </label>
              <input
                id="admissionYear"
                name="admissionYear"
                value={form.admissionYear}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="2022"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              />
              {fieldError('admissionYear') && <p className="text-xs font-medium text-red-500">{fieldError('admissionYear')}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="expectedPassoutYear" className="text-sm font-semibold text-slate-700">
                Expected Passout Year*
              </label>
              <input
                id="expectedPassoutYear"
                name="expectedPassoutYear"
                value={form.expectedPassoutYear}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="numeric"
                pattern="\d{4}"
                maxLength={4}
                placeholder="2026"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              />
              {fieldError('expectedPassoutYear') && <p className="text-xs font-medium text-red-500">{fieldError('expectedPassoutYear')}</p>}
            </div>
          </div>
        )}

        {isAlumni && (
          <div className="space-y-2">
            <label htmlFor="passoutYear" className="text-sm font-semibold text-slate-700">
              Passout Year*
            </label>
            <input
              id="passoutYear"
              name="passoutYear"
              value={form.passoutYear}
              onChange={handleChange}
              onBlur={handleBlur}
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              placeholder="2018"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('passoutYear') && <p className="text-xs font-medium text-red-500">{fieldError('passoutYear')}</p>}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="prn" className="text-sm font-semibold text-slate-700">
            {isFaculty ? 'Staff ID*' : 'PRN Number*'}
          </label>
          <input
            id="prn"
            name="prn"
            value={form.prn}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={isFaculty ? 'Enter your Staff ID' : 'Enter your PRN'}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
            required
          />
          {fieldError('prn') && <p className="text-xs font-medium text-red-500">{fieldError('prn')}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Password*
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Create a password"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('password') && <p className="text-xs font-medium text-red-500">{fieldError('password')}</p>}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
              Confirm Password*
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Re-type your password"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('confirmPassword') && <p className="text-xs font-medium text-red-500">{fieldError('confirmPassword')}</p>}
          </div>
        </div>

        <div className="space-y-3 text-sm text-slate-500">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreeDataPolicy"
              checked={form.agreeDataPolicy}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span>
              All your information is collected, stored, and processed in line with our privacy policy. By continuing, you agree to our data practices.
            </span>
          </label>
          {fieldError('agreeDataPolicy') && <p className="text-xs font-medium text-red-500">{fieldError('agreeDataPolicy')}</p>}
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="subscribeUpdates"
              checked={form.subscribeUpdates}
              onChange={handleChange}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span>Stay in the loop with curated updates and events just for you.</span>
          </label>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={form.agreeTerms}
              onChange={handleChange}
              onBlur={handleBlur}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <span>
              By continuing you accept the <span className="font-semibold text-slate-700">Terms of Service</span> and{' '}
              <span className="font-semibold text-slate-700">Privacy Policy</span>.
            </span>
          </label>
          {fieldError('agreeTerms') && <p className="text-xs font-medium text-red-500">{fieldError('agreeTerms')}</p>}
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD]"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12.5 4.5 7.5 10l5 5.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={`inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#93C5FD] ${
              isValid
                ? 'bg-[#2563EB] text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)] hover:bg-[#1d4ed8]'
                : 'cursor-not-allowed bg-slate-200 text-slate-500'
            }`}
          >
            Continue
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M7.5 4.5 12.5 10 7.5 15.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </AuthTemplate>
  )
}

export default SignupForm
