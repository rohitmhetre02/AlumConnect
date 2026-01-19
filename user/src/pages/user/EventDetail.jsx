import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import useToast from '../../hooks/useToast'
import { useEvent } from '../../hooks/useEvents'
import { useAuth } from '../../context/AuthContext'

const FALLBACK_BANNER =
  'https://images.unsplash.com/photo-1475724017904-b712052c192a?auto=format&fit=crop&w=1600&q=80'

const formatSchedule = (startAt, endAt) => {
  if (!startAt) return 'Schedule to be announced'
  const start = new Date(startAt)
  if (Number.isNaN(start.getTime())) return 'Schedule to be announced'

  const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  const timeFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })

  const startDate = dateFormatter.format(start)
  const startTime = timeFormatter.format(start)

  if (!endAt) {
    return `${startDate} • ${startTime}`
  }

  const end = new Date(endAt)
  if (Number.isNaN(end.getTime())) {
    return `${startDate} • ${startTime}`
  }

  const endDate = dateFormatter.format(end)
  const endTime = timeFormatter.format(end)
  const sameDay = start.toDateString() === end.toDateString()

  // For details page, show only start time - cleaner display
  return `${startDate} • ${startTime}`
}

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

const EventDetail = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const { user, role } = useAuth()

  const { data, loading, error, register } = useEvent(eventId)
  const normalizedRole = role?.toLowerCase() ?? null
  const isEligibleRole = normalizedRole ? ['student', 'alumni', 'faculty'].includes(normalizedRole) : false
  const isRegistered = Boolean(data?.isRegistered)

  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [submissionLoading, setSubmissionLoading] = useState(false)
  const [formValues, setFormValues] = useState({
    name: '',
    department: '',
    academicYear: '',
    graduationYear: '',
    role: '',
  })

  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      name: user?.name || user?.profile?.fullName || prev.name,
      department: user?.profile?.department || prev.department,
      role: prev.role || (normalizedRole && ['student', 'alumni', 'faculty'].includes(normalizedRole) ? normalizedRole : prev.role),
    }))
  }, [user?.name, user?.profile?.fullName, user?.profile?.department, normalizedRole])

  const schedule = useMemo(() => formatSchedule(data?.startAt, data?.endAt), [data?.startAt, data?.endAt])
  const modeLabel = useMemo(() => capitalize(data?.mode ?? 'in-person'), [data?.mode])

  const banner = useMemo(() => {
    const cover = data?.coverImage?.trim()
    if (!cover || cover.startsWith('blob:')) {
      return FALLBACK_BANNER
    }
    return cover
  }, [data?.coverImage])

  const handleRegistrationClick = () => {
    if (data?.registrationLink) {
      window.open(data.registrationLink, '_blank', 'noopener,noreferrer')
      return
    }

    if (!user?.id) {
      addToast?.({
        title: 'Sign in required',
        description: 'Please log in to register for this event.',
        tone: 'warning',
      })
      navigate('/login', { replace: false })
      return
    }

    if (!isEligibleRole) {
      addToast?.({
        title: 'Registration unavailable',
        description: 'Your account is not eligible to register for events.',
        tone: 'error',
      })
      return
    }

    if (isRegistered) {
      addToast?.({
        title: 'Already registered',
        description: 'You have already registered for this event.',
        tone: 'info',
      })
      return
    }

    setFormValues((prev) => ({
      ...prev,
      role:
        prev.role || (normalizedRole && ['student', 'alumni', 'faculty'].includes(normalizedRole)
          ? normalizedRole
          : 'student'),
    }))
    setShowRegistrationModal(true)
  }

  const studentYearOptions = useMemo(
    () => ['1st year', '2nd year', '3rd year', '4th year', '5th year'],
    [],
  )

  const departmentOptions = useMemo(
    () => [
      'Computer Science',
      'Information Technology',
      'Electronics',
      'Electrical',
      'Mechanical',
      'Civil',
      'Chemical',
      'Biotechnology',
      'Business Administration',
      'Design',
      'Mathematics',
      'Physics',
      'Chemistry',
    ],
    [],
  )

  const graduationYearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 40 }, (_, index) => String(current - index))
  }, [])

  const handleFormFieldChange = (field) => (event) => {
    const value = event.target.value
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const selectedRole = formValues.role || (normalizedRole && ['student', 'alumni', 'faculty'].includes(normalizedRole) ? normalizedRole : '')
  const isModalStudent = selectedRole === 'student'
  const isModalAlumni = selectedRole === 'alumni'
  const isModalFaculty = selectedRole === 'faculty'

  const handleSubmitRegistration = async (event) => {
    event.preventDefault()

    if (!selectedRole) {
      addToast?.({
        title: 'Select role',
        description: 'Please choose whether you are a student or alumni.',
        tone: 'error',
      })
      return
    }

    if (!isEligibleRole || (selectedRole && normalizedRole && selectedRole !== normalizedRole)) {
      addToast?.({
        title: 'Registration unavailable',
        description: 'Your selected role does not match your account permissions.',
        tone: 'error',
      })
      return
    }

    const errors = []
    if (!formValues.name.trim()) errors.push('Name is required.')
    if (!formValues.department.trim()) errors.push('Department is required.')

    if (isModalStudent && !formValues.academicYear.trim()) {
      errors.push('Select your current academic year.')
    }

    if (isModalAlumni && !formValues.graduationYear.trim()) {
      errors.push('Select your graduation year.')
    }

    if (errors.length) {
      addToast?.({
        title: 'Missing information',
        description: errors.join(' '),
        tone: 'error',
      })
      return
    }

    try {
      setSubmissionLoading(true)
      await register({
        name: formValues.name.trim(),
        department: formValues.department.trim(),
        academicYear: isModalStudent ? formValues.academicYear.trim() : undefined,
        graduationYear: isModalAlumni ? formValues.graduationYear.trim() : undefined,
      })

      addToast?.({
        title: 'Registration confirmed',
        description: 'You have been registered for this event.',
        tone: 'success',
      })

      setShowRegistrationModal(false)
    } catch (submissionError) {
      addToast?.({
        title: 'Unable to register',
        description: submissionError.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setSubmissionLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-3xl bg-white p-10 text-center text-sm text-slate-400 shadow-soft">
        Loading event…
      </section>
    )
  }

  if (error || !data) {
    return (
      <section className="space-y-4">
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {error?.message ?? 'Event not found or unavailable.'}
        </div>
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/dashboard/events')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </button>

        <section className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <img src={banner} alt={`${data.title} banner`} className="h-72 w-full object-cover" />
          <div className="space-y-6 p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
                  {modeLabel}
                  <span className="h-1 w-1 rounded-full bg-primary/40" aria-hidden />
                  {data.location}
                </p>
                <h1 className="text-3xl font-bold text-slate-900">{data.title}</h1>
                <p className="text-sm text-slate-500">Hosted by {data.createdByName || 'an alumni member'}</p>
              </div>
              <button
                type="button"
                onClick={handleRegistrationClick}
                disabled={isRegistered && !data?.registrationLink}
                className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition ${
                  data?.registrationLink
                    ? 'bg-primary hover:bg-primary-dark'
                    : isRegistered
                    ? 'bg-emerald-500'
                    : 'bg-primary hover:bg-primary-dark'
                } ${isRegistered && !data?.registrationLink ? 'cursor-not-allowed opacity-80' : ''}`}
              >
                {data?.registrationLink
                  ? 'Register'
                  : isRegistered
                  ? 'Registered'
                  : 'Register'}
              </button>
            </div>

            <div className="grid gap-4 rounded-2xl border border-slate-100 p-5 sm:grid-cols-3">
              <MetaInfo icon={CalendarIcon} label={schedule} />
              <MetaInfo icon={LocationIcon} label={data.location} />
              <MetaInfo
                icon={UsersIcon}
                label={
                  data.registrationCount
                    ? `${data.registrationCount} ${data.registrationCount === 1 ? 'attendee' : 'attendees'}`
                    : 'Be the first to join'
                }
              />
            </div>

            <p className="text-base text-slate-600 whitespace-pre-line">{data.description}</p>
          </div>
        </section>

        {showRegistrationModal && (
          <RegistrationModal
            onClose={() => !submissionLoading && setShowRegistrationModal(false)}
            onSubmit={handleSubmitRegistration}
            submitting={submissionLoading}
            formValues={formValues}
            onFieldChange={handleFormFieldChange}
            isStudent={isModalStudent}
            isAlumni={isModalAlumni}
            departmentOptions={departmentOptions}
            studentYearOptions={studentYearOptions}
            graduationYearOptions={graduationYearOptions}
            roleOptions={[
              { label: 'Student', value: 'student' },
              { label: 'Alumni', value: 'alumni' },
              { label: 'Faculty', value: 'faculty' },
            ]}
            roleValue={selectedRole}
            onRoleChange={handleFormFieldChange('role')}
            roleLocked={Boolean(normalizedRole && ['student', 'alumni', 'faculty'].includes(normalizedRole))}
          />
        )}
      </div>
    </div>
  )
}

const MetaInfo = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
    <Icon className="h-10 w-10 rounded-2xl bg-primary/10 p-2 text-primary" />
    <span>{label}</span>
  </div>
)

const RegistrationModal = ({
  onClose,
  onSubmit,
  submitting,
  formValues,
  onFieldChange,
  isStudent,
  isAlumni,
  departmentOptions,
  studentYearOptions,
  graduationYearOptions,
  roleOptions,
  roleValue,
  onRoleChange,
  roleLocked,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Register for this event</h2>
          <p className="mt-1 text-sm text-slate-500">Share your details so the organizing team can confirm your seat.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <label className="block text-sm font-semibold text-slate-700">
          Registering as
          <select
            value={roleValue}
            onChange={onRoleChange}
            disabled={roleLocked}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">Select role</option>
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Full name
          <input
            type="text"
            value={formValues.name}
            onChange={onFieldChange('name')}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Enter your full name"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Department
          <select
            value={formValues.department}
            onChange={onFieldChange('department')}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select department</option>
            {departmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        {isStudent && (
          <label className="block text-sm font-semibold text-slate-700">
            Current academic year
            <select
              value={formValues.academicYear}
              onChange={onFieldChange('academicYear')}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select current year</option>
              {studentYearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        {isAlumni && (
          <label className="block text-sm font-semibold text-slate-700">
            Graduation year
            <select
              value={formValues.graduationYear}
              onChange={onFieldChange('graduationYear')}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select graduation year</option>
              {graduationYearOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
          >
            {submitting ? 'Submitting…' : 'Confirm registration'}
          </button>
        </div>
      </form>
    </div>
  </div>
)

const IconBase = ({ className, children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
)

const CalendarIcon = (props) => (
  <IconBase {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4" />
    <path d="M8 2v4" />
    <path d="M3 10h18" />
  </IconBase>
)

const LocationIcon = (props) => (
  <IconBase {...props}>
    <path d="M12 21s6-4.35 6-10a6 6 0 10-12 0c0 5.65 6 10 6 10z" />
    <circle cx="12" cy="11" r="2" />
  </IconBase>
)

const UsersIcon = (props) => (
  <IconBase {...props}>
    <path d="M16 18v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1" />
    <circle cx="9" cy="7" r="3" />
    <path d="M22 18v-1a4 4 0 00-3-3.87" />
    <path d="M16 4.13a4 4 0 010 7.75" />
  </IconBase>
)

export default EventDetail
