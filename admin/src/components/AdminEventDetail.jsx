import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import useToast from '../hooks/useToast'
import { useEvent } from '../hooks/useEvents'

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

  return `${startDate} • ${startTime}`
}

const capitalize = (value = '') => value.charAt(0).toUpperCase() + value.slice(1)

const AdminEventDetail = () => {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()

  const { data, loading, error } = useEvent(eventId)

  const schedule = useMemo(() => formatSchedule(data?.startAt, data?.endAt), [data?.startAt, data?.endAt])
  const modeLabel = useMemo(() => capitalize(data?.mode ?? 'in-person'), [data?.mode])

  const banner = useMemo(() => {
    const cover = data?.coverImage?.trim()
    if (!cover || cover.startsWith('blob:')) {
      return FALLBACK_BANNER
    }
    return cover
  }, [data?.coverImage])

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
          onClick={() => navigate('/admin/events')}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events Management
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
            </div>

            <div className="grid gap-4 rounded-2xl border border-slate-100 p-5 sm:grid-cols-3">
              <MetaInfo icon={CalendarIcon} label={schedule} />
              <MetaInfo icon={LocationIcon} label={data.location} />
              <MetaInfo
                icon={UsersIcon}
                label={
                  data.registrationCount
                    ? `${data.registrationCount} ${data.registrationCount === 1 ? 'attendee' : 'attendees'}`
                    : 'No attendees yet'
                }
              />
            </div>

            <p className="text-base text-slate-600 whitespace-pre-line">{data.description}</p>

            {/* Additional event details for admin view */}
            <div className="grid gap-4 rounded-2xl border border-slate-100 p-5 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Event Details</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Event ID:</dt>
                    <dd className="font-medium text-slate-900">#{data.id || data._id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Organization:</dt>
                    <dd className="font-medium text-slate-900">{data.organization || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Department:</dt>
                    <dd className="font-medium text-slate-900">{data.department || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Registration Link:</dt>
                    <dd className="font-medium text-slate-900 truncate max-w-xs">
                      {data.registrationLink ? (
                        <a href={data.registrationLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          External Link
                        </a>
                      ) : (
                        'Internal Registration'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Created By</h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Name:</dt>
                    <dd className="font-medium text-slate-900">{data.createdByName || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Role:</dt>
                    <dd className="font-medium text-slate-900">{capitalize(data.createdByRole) || '—'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Created At:</dt>
                    <dd className="font-medium text-slate-900">
                      {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>
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

export default AdminEventDetail
