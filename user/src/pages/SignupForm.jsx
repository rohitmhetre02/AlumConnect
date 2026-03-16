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

const currentYearOptions = [
  { value: '1st', label: '1st Year' },
  { value: '2nd', label: '2nd Year' },
  { value: '3rd', label: '3rd Year' },
  { value: '4th', label: 'Last Year' },
]

const admissionYearOptions = [
  { value: '2012', label: '2012' },
  { value: '2013', label: '2013' },
  { value: '2014', label: '2014' },
  { value: '2015', label: '2015' },
  { value: '2016', label: '2016' },
  { value: '2017', label: '2017' },
  { value: '2018', label: '2018' },
  { value: '2019', label: '2019' },
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
  { value: '2022', label: '2022' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
  { value: '2027', label: '2027' },
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
  currentYear: '',
  phoneNumber: '',
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isStudent = role?.id === 'student'
  const isAlumni = role?.id === 'alumni'
  const isFaculty = role?.id === 'faculty'

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      admissionYear: isStudent ? prev.admissionYear : '',
      currentYear: isStudent ? prev.currentYear : '',
      phoneNumber: (isStudent || isFaculty) ? prev.phoneNumber : '',
      passoutYear: isAlumni ? prev.passoutYear : '',
    }))
    setTouched({})
  }, [isStudent, isAlumni, isFaculty])

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
      if (!form.currentYear) {
        next.currentYear = 'Select your current year.'
      }
      if (!form.phoneNumber.trim()) {
        next.phoneNumber = 'Phone number is required.'
      } else if (!/^[0-9]{10}$/.test(form.phoneNumber.trim())) {
        next.phoneNumber = 'Enter a valid 10-digit phone number.'
      }
    }
    if (isAlumni) {
      if (!yearPattern.test(form.passoutYear.trim())) {
        next.passoutYear = 'Enter a valid 4-digit year.'
      }
    }
    if (isFaculty) {
      if (!form.phoneNumber.trim()) {
        next.phoneNumber = 'Phone number is required.'
      } else if (!/^[0-9]{10}$/.test(form.phoneNumber.trim())) {
        next.phoneNumber = 'Enter a valid 10-digit phone number.'
      }
      if (!form.department.trim()) {
        next.department = 'Department is required.'
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
      requiredFields.push('admissionYear', 'currentYear', 'phoneNumber')
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
      payload.currentYear = form.currentYear
      payload.phoneNumber = form.phoneNumber
    }
    if (isAlumni) {
      payload.passoutYear = form.passoutYear
      payload.phoneNumber = form.phoneNumber
    }
    if (isFaculty) {
      payload.prnNumber = form.prn.trim()
      payload.phoneNumber = form.phoneNumber
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-700">
            Email*
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your Email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
            required
          />
          {fieldError('email') && <p className="text-xs font-medium text-red-500">{fieldError('email')}</p>}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('firstName') && <p className="text-xs font-medium text-red-500">{fieldError('firstName')}</p>}
          </div>
          <div className="space-y-1.5">
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('lastName') && <p className="text-xs font-medium text-red-500">{fieldError('lastName')}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="program" className="text-sm font-semibold text-slate-700">
            User Program*
          </label>
          <select
            id="program"
            name="program"
            value={form.program}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
          >
            {programOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError('program') && <p className="text-xs font-medium text-red-500">{fieldError('program')}</p>}
        </div>

        {(form.program === 'engineering' || isFaculty) && (
          <div className="space-y-1.5">
            <label htmlFor="department" className="text-sm font-semibold text-slate-700">
              Department*
            </label>
            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
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
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="admissionYear" className="text-sm font-semibold text-slate-700">
                Admission Year*
              </label>
              <select
                id="admissionYear"
                name="admissionYear"
                value={form.admissionYear}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              >
                <option value="">Select admission year</option>
                {admissionYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldError('admissionYear') && <p className="text-xs font-medium text-red-500">{fieldError('admissionYear')}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="currentYear" className="text-sm font-semibold text-slate-700">
                Current Year*
              </label>
              <select
                id="currentYear"
                name="currentYear"
                value={form.currentYear}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              >
                <option value="">Select current year</option>
                {currentYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldError('currentYear') && <p className="text-xs font-medium text-red-500">{fieldError('currentYear')}</p>}
            </div>
          </div>
        )}

        {isAlumni && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="passoutYear" className="text-sm font-semibold text-slate-700">
                Passout Year*
              </label>
              <select
                id="passoutYear"
                name="passoutYear"
                value={form.passoutYear}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              >
                <option value="">Select passout year</option>
                {admissionYearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {fieldError('passoutYear') && <p className="text-xs font-medium text-red-500">{fieldError('passoutYear')}</p>}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700">
                Phone Number*
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                placeholder="write your number"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              />
              {fieldError('phoneNumber') && <p className="text-xs font-medium text-red-500">{fieldError('phoneNumber')}</p>}
            </div>
          </div>
        )}

        {isStudent && (
          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700">
              Phone Number*
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="write your number"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('phoneNumber') && <p className="text-xs font-medium text-red-500">{fieldError('phoneNumber')}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="prn" className="text-sm font-semibold text-slate-700">
            {isFaculty ? 'Staff ID*' : 'PRN Number*'}
          </label>
          <input
            id="prn"
            name="prn"
            value={form.prn}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={isFaculty ? 'Enter your Staff ID' : 'ex: 72264567G'}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
            required
          />
          {fieldError('prn') && <p className="text-xs font-medium text-red-500">{fieldError('prn')}</p>}
        </div>

        {isFaculty && (
          <div className="space-y-1.5">
            <label htmlFor="phoneNumber" className="text-sm font-semibold text-slate-700">
              Phone Number*
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="write your number"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
              required
            />
            {fieldError('phoneNumber') && <p className="text-xs font-medium text-red-500">{fieldError('phoneNumber')}</p>}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Password*
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldError('password') && <p className="text-xs font-medium text-red-500">{fieldError('password')}</p>}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
              Confirm Password*
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Re-type your password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.05)] outline-none transition focus:border-[#2563EB] focus:shadow-[0_18px_40px_rgba(37,99,235,0.15)]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {fieldError('confirmPassword') && <p className="text-xs font-medium text-red-500">{fieldError('confirmPassword')}</p>}
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-500">
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

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
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
