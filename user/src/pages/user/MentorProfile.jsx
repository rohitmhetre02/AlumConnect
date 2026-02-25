import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMentorDetails } from '../../hooks/useMentorDetails'
import { get, post } from '../../utils/api'
import useToast from '../../hooks/useToast'
import { useAuth } from '../../context/AuthContext'

const MentorProfile = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mentorId } = useParams()
  const toast = useToast()
  const { mentor, loading, error, refresh } = useMentorDetails(mentorId)
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [requestSubmitting, setRequestSubmitting] = useState(false)
  const [existingRequest, setExistingRequest] = useState(null)
  const [checkingExistingRequest, setCheckingExistingRequest] = useState(false)

  const fallbackName = useMemo(() => {
    if (!mentor) return 'Mentor'
    return mentor.fullName || mentor.jobRole || 'Mentor'
  }, [mentor])

  const currentUserId = (user?._id || user?.id || user?.profile?._id || user?.profile?.id || '').toString()
  const mentorOwnerId = mentor?.profileId ? mentor.profileId.toString() : ''
  const isOwnProfile = Boolean(currentUserId && mentorOwnerId && currentUserId === mentorOwnerId)

  const fetchExistingRequest = useCallback(async () => {
    if (!currentUserId) {
      setExistingRequest(null)
      setCheckingExistingRequest(false)
      return
    }

    if (isOwnProfile || !mentorOwnerId) {
      setExistingRequest(null)
      setCheckingExistingRequest(false)
      return
    }

    setCheckingExistingRequest(true)
    try {
      const response = await get('/api/mentors/me/requests')
      const rawData = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : []

      const match = rawData.find((request) => {
        const rawStatus = (request?.status || '').toString().toLowerCase()
        if (!rawStatus || rawStatus === 'rejected') return false

        const mentorValue =
          request?.mentor?._id ||
          request?.mentor?.id ||
          request?.mentorId ||
          request?.mentor ||
          ''

        const mentorIdString =
          typeof mentorValue === 'object' && mentorValue !== null && typeof mentorValue.toString === 'function'
            ? mentorValue.toString()
            : mentorValue?.toString?.() || String(mentorValue || '')

        return mentorIdString === mentorOwnerId
      })

      setExistingRequest(match ?? null)
    } catch (err) {
      console.error('Failed to check existing mentorship requests:', err)
      setExistingRequest(null)
    } finally {
      setCheckingExistingRequest(false)
    }
  }, [currentUserId, isOwnProfile, mentorOwnerId])

  useEffect(() => {
    fetchExistingRequest()
  }, [fetchExistingRequest])

  const formatStatusLabel = (status) => {
    const normalized = (status || '').toString().toLowerCase()
    return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : ''
  }

  const hasActiveRequest = Boolean(existingRequest)
  const activeRequestStatusLabel = hasActiveRequest ? formatStatusLabel(existingRequest.status) : ''

  if (loading && !mentor) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <span className="text-lg">←</span>
          Back to Mentorship
        </button>
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="h-20 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-64 animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-40 animate-pulse rounded-full bg-slate-100" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !mentor) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <span className="text-lg">←</span>
          Back to Mentorship
        </button>
        <div className="rounded-3xl border border-rose-200 bg-rose-50/60 p-10 text-center shadow-sm text-rose-600">
          {error.message ?? 'Unable to load mentor profile. Please try again later.'}
        </div>
      </div>
    )
  }

  if (!mentor) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <span className="text-lg">←</span>
          Back to Mentorship
        </button>
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Mentor not found</h1>
          <p className="mt-2 text-sm text-slate-500">The mentor profile you are looking for is unavailable. Please choose another mentor.</p>
        </div>
      </div>
    )
  }

  const categories = mentor.categories || []
  const expertise = mentor.expertise || []
  const services = mentor.services || []
  const resources = mentor.resources || []
  const workExperience = mentor.workExperience || []
  const education = mentor.education || []
  const alias = mentor.fullName?.split(' ')[0] || 'the mentor'
  const mentorApplicationId = mentor.applicationId || mentor.id

  const handleSubmitRequest = async (payload) => {
    if (!mentorApplicationId) {
      toast?.({ title: 'Mentor unavailable', description: 'Unable to submit request for this mentor.', tone: 'error' })
      return
    }

    try {
      setRequestSubmitting(true)
      await post(`/mentors/${mentorApplicationId}/requests`, payload)
      toast?.({ title: 'Request sent', description: 'Your mentorship request has been shared with the mentor.', tone: 'success' })
      setRequestModalOpen(false)
      await fetchExistingRequest()
    } catch (err) {
      toast?.({
        title: 'Unable to send request',
        description: err?.message ?? 'Please try again later.',
        tone: 'error',
      })
    } finally {
      setRequestSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <span className="text-lg">←</span>
          Back to Mentorship
        </button>
        {!isOwnProfile && !hasActiveRequest && (
          <button
            type="button"
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
            onClick={() => setRequestModalOpen(true)}
            disabled={requestSubmitting || checkingExistingRequest}
          >
            {checkingExistingRequest ? 'Checking…' : 'Request Mentorship'}
          </button>
        )}
        {!isOwnProfile && hasActiveRequest && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {activeRequestStatusLabel || 'Request Pending'}
            </span>
            <button
              type="button"
              onClick={() => navigate('/dashboard/my-activity/requests')}
              className="rounded-full border border-primary/40 px-4 py-1 text-xs font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
            >
              View in Requests
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start gap-6">
              <img
                src={
                  mentor.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fallbackName.slice(0, 2))}`
                }
                alt={fallbackName}
                className="h-24 w-24 rounded-3xl object-cover"
              />
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">Mentor ID</p>
                  <p className="mt-1 font-mono text-sm text-slate-500">{mentor.id || 'Unavailable'}</p>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{mentor.fullName || mentor.jobRole || mentor.email}</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {mentor.jobRole || 'Role not specified'}
                    {mentor.companyName ? ` @ ${mentor.companyName}` : ''}
                  </p>
                </div>
                {categories.length ? (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((tag) => (
                      <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoCard
              title="Contact"
              items={[
                { label: 'Email', value: mentor.email || '—', isLink: mentor.email, linkPrefix: 'mailto:' },
                { label: 'Phone', value: mentor.contactNumber || '—' },
                { label: 'Location', value: mentor.location || '—' },
                { label: 'LinkedIn', value: mentor.linkedin || '—', isLink: mentor.linkedin },
              ]}
            />
            <InfoCard
              title="Professional"
              items={[
                { label: 'Role', value: mentor.jobRole || '—' },
                { label: 'Company', value: mentor.companyName || '—' },
                { label: 'Industry', value: mentor.industry || '—' },
                { label: 'Experience', value: mentor.experience || '—' },
              ]}
            />
            <InfoCard
              title="Academic"
              items={[
                { label: 'Graduation Year', value: mentor.graduationYear || '—' },
                { label: 'Department', value: mentor.department || '—' },
                { label: 'Preferred Students', value: mentor.preferredStudents || '—' },
                { label: 'Weekly Hours', value: mentor.weeklyHours || '—' },
              ]}
            />
            <InfoCard
              title="Availability"
              items={[
                { label: 'Availability', value: mentor.availability || '—' },
                { label: 'Modes', value: (mentor.modes || []).join(', ') || '—' },
                { label: 'Max Students', value: mentor.maxStudents || '—' },
                { label: 'Skills', value: mentor.skills || '—' },
              ]}
            />
          </div>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/60 p-6">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">About {alias}</h2>
              <button
                type="button"
                onClick={refresh}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-primary hover:text-primary"
              >
                Refresh
              </button>
            </header>
            <p className="text-sm text-slate-600">{mentor.bio || 'No mentorship summary published yet.'}</p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Areas of Expertise</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expertise.length ? (
                    expertise.map((item) => (
                      <span key={item} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">Expertise not specified.</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Mentorship Focus</p>
                <p className="mt-2 text-sm text-slate-600">{mentor.motivation || 'No motivation shared yet.'}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <article className="rounded-3xl border border-primary/30 bg-gradient-to-br from-slate-50 via-white to-primary/10 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Work with {alias}</h2>
            <p className="mt-2 text-sm text-slate-600">
              Explore services and resources curated by this mentor. When you are ready, send a mentorship request to get started.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-500">
                {services.length} Services
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-xs font-semibold text-slate-500">
                {resources.length} Resources
              </div>
            </div>
            {!isOwnProfile && !hasActiveRequest ? (
              <button
                type="button"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
                onClick={() => setRequestModalOpen(true)}
                disabled={requestSubmitting || checkingExistingRequest}
              >
                {checkingExistingRequest ? 'Checking…' : 'Request Mentorship'}
              </button>
            ) : null}
            {!isOwnProfile && hasActiveRequest ? (
              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-white/70 px-4 py-3 text-xs text-primary">
                <span className="font-semibold uppercase tracking-[0.2em]">{activeRequestStatusLabel || 'Request Pending'}</span>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard/my-activity/requests')}
                  className="rounded-full border border-primary/40 px-3 py-1 font-semibold text-primary transition hover:border-primary hover:bg-primary/10"
                >
                  View in Requests
                </button>
              </div>
            ) : null}
          </article>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Services Offered</h2>
            </header>
            <div className="space-y-4">
              {services.length ? (
                services.map((service) => (
                  <article key={service.id || service.title} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                    <header className="space-y-1">
                      <h3 className="text-base font-semibold text-slate-900">{service.title}</h3>
                      <p className="text-xs text-slate-400">
                        {service.duration || 'Duration not specified'} • {service.mode ? service.mode.toUpperCase() : 'Mode TBD'}
                      </p>
                    </header>
                    <p className="text-sm text-slate-600">{service.description || 'No description provided.'}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                      <span
                        className={`rounded-full px-3 py-1 ${
                          service.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {service.status === 'active' ? 'Active service' : 'Inactive service'}
                      </span>
                      <span className="text-slate-500">
                        Price: {Number.isFinite(service.price) ? `₹${service.price}` : '—'}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  The mentor has not published any services yet.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Resources & Materials</h2>
            </header>
            <div className="space-y-3">
              {resources.length ? (
                resources.map((resource) => (
                  <article key={resource.id || resource.title} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {resource.type?.slice(0, 2).toUpperCase() || 'RS'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{resource.title}</p>
                        <p className="text-xs text-slate-500">{resource.description || 'No description provided.'}</p>
                      </div>
                    </div>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Open resource
                    </a>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                  The mentor has not shared any resources yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Work Experience</h2>
            <span className="text-xs text-slate-500">{workExperience.length} entries</span>
          </header>
          <div className="space-y-3">
            {workExperience.length ? (
              workExperience.map((exp, index) => (
                <article key={`${exp.company}-${exp.role}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{exp.role || 'Role not specified'}</p>
                      <p className="text-xs text-slate-500">{exp.company || 'Company not specified'}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {exp.startDate || 'Start N/A'} – {exp.isCurrentJob ? 'Present' : exp.endDate || 'End N/A'}
                    </span>
                  </div>
                  {exp.description ? <p className="mt-2 text-sm text-slate-600">{exp.description}</p> : null}
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                No work experience has been published yet.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Education</h2>
            <span className="text-xs text-slate-500">{education.length} entries</span>
          </header>
          <div className="space-y-3">
            {education.length ? (
              education.map((edu, index) => (
                <article key={`${edu.institution}-${edu.degree}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{edu.degree || 'Degree not specified'}</p>
                      <p className="text-xs text-slate-500">{edu.institution || 'Institution not specified'}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {edu.admissionYear || 'Start N/A'} – {edu.isCurrentlyPursuing ? 'Present' : edu.passoutYear || 'End N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Field: {edu.field || edu.department || 'Not specified'}</p>
                  {edu.cgpa ? <p className="text-xs text-slate-500">CGPA: {edu.cgpa}</p> : null}
                  {edu.description ? <p className="mt-2 text-sm text-slate-600">{edu.description}</p> : null}
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Education details are not available yet.
              </div>
            )}
          </div>
        </section>
      </div>

      {requestModalOpen && !isOwnProfile && (
        <RequestMentorshipModal
          mentorName={mentor.fullName || mentor.jobRole || mentor.email}
          services={services}
          onClose={() => setRequestModalOpen(false)}
          onSubmit={handleSubmitRequest}
          submitting={requestSubmitting}
        />
      )}
    </div>
  )
}

export default MentorProfile

const InfoCard = ({ title, items }) => (
  <article className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
    <ul className="space-y-2 text-xs text-slate-600">
      {items.map(({ label, value, isLink, linkPrefix }) => (
        <li key={label} className="flex items-center justify-between gap-3">
          <span className="font-semibold uppercase tracking-widest text-slate-400">{label}</span>
          {isLink && value ? (
            <a
              href={`${linkPrefix ?? ''}${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            <span className="text-slate-700">{value || '—'}</span>
          )}
        </li>
      ))}
    </ul>
  </article>
)

const PreferenceItem = ({ label, value }) => (
  <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-2 text-sm font-semibold text-slate-900">{value || '—'}</p>
  </article>
)

const RequestMentorshipModal = ({ mentorName, services, onClose, onSubmit, submitting }) => {
  const [serviceId, setServiceId] = useState(() => services?.[0]?.id || '')
  const [preferredDateTime, setPreferredDateTime] = useState('')
  const [preferredMode, setPreferredMode] = useState(() => services?.[0]?.mode || 'online')
  const [notes, setNotes] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      serviceId: serviceId || undefined,
      preferredDateTime: preferredDateTime ? new Date(preferredDateTime).toISOString() : undefined,
      preferredMode,
      notes,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-8">
      <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">Request Mentorship</h2>
          <p className="text-sm text-slate-500">
            Select a service and send your request to <span className="font-semibold text-slate-700">{mentorName}</span>.
          </p>
        </header>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Service</label>
            {services?.length ? (
              <div className="space-y-2">
                {services.map((service) => (
                  <label key={service.id} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 hover:border-primary/40">
                    <input
                      type="radio"
                      name="service"
                      className="mt-1"
                      value={service.id}
                      checked={serviceId === service.id}
                      onChange={() => {
                        setServiceId(service.id)
                        setPreferredMode(service.mode || 'online')
                      }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{service.title}</p>
                      <p className="text-xs text-slate-500">
                        {service.duration || 'Duration not specified'} • {service.mode?.toUpperCase?.() || 'ONLINE'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{service.description || 'No description provided.'}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                This mentor has no published services. Your request will be sent as a general mentorship session.
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            <label className="space-y-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span className="block text-slate-400">Preferred Date</span>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={preferredDateTime ? preferredDateTime.split('T')[0] : ''}
                onChange={(event) => setPreferredDateTime(event.target.value ? event.target.value + 'T10:00:00' : '')}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-slate-500">Mentor will confirm the exact time</p>
            </label>

            <label className="space-y-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <span className="block text-slate-400">Preferred Mode</span>
              <select
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={preferredMode}
                onChange={(event) => setPreferredMode(event.target.value)}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>
          </div>

          <label className="space-y-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="block text-slate-400">Notes for mentor</span>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Share your goals, background, or any context to help the mentor prepare."
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? 'Sending…' : 'Send Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
