import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get, put } from '../../utils/api'
import useToast from '../../hooks/useToast'

const ALLOWED_EVENT_MODES = Object.freeze(['online', 'in-person', 'hybrid'])
export const EVENT_MODES = ALLOWED_EVENT_MODES

const normalizeMode = (mode) => {
  const normalized = String(mode ?? '').toLowerCase().trim()
  return ALLOWED_EVENT_MODES.includes(normalized) ? normalized : 'in-person'
}

const EditEvent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [event, setEvent] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    coverImage: '',
    startAt: '',
    endAt: '',
    mode: 'in-person',
    registrationLink: '',
    organization: 'alumni',
    department: '',
    branch: '',
  })

  const fetchEvent = useCallback(async () => {
    if (!id) return
    
    console.log('EditEvent: Fetching event with ID:', id)
    try {
      const response = await get(`/events/${id}`)
      console.log('EditEvent: Raw API response:', response)
      const eventData = response?.data
      console.log('EditEvent: Fetched event data:', eventData)
      if (eventData) {
        setEvent(eventData)
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          location: eventData.location || '',
          coverImage: eventData.coverImage || '',
          startAt: eventData.startAt ? new Date(eventData.startAt).toISOString().slice(0, 16) : '',
          endAt: eventData.endAt ? new Date(eventData.endAt).toISOString().slice(0, 16) : '',
          mode: normalizeMode(eventData.mode),
          registrationLink: eventData.registrationLink || '',
          organization: eventData.organization || 'alumni',
          department: eventData.department || '',
          branch: eventData.branch || '',
        })
        console.log('EditEvent: Setting loading to false')
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to load event')
      console.error('Failed to load event:', err)
    } finally {
      console.log('EditEvent: Finally block - loading state:', loading)
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent, id])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const response = await put(`/events/${id}`, formData)
      
      addToast?.({
        title: 'Event Updated',
        description: 'Your event has been updated successfully.',
        tone: 'success',
      })

      navigate('/dashboard/content-posted')
    } catch (err) {
      setError(err.message || 'Failed to update event')
      addToast?.({
        title: 'Update Failed',
        description: err.message || 'Unable to update event. Please try again.',
        tone: 'error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-rose-600 mb-4">Error Loading Event</h2>
          <p className="text-slate-600">{error}</p>
          <button
            onClick={() => navigate('/dashboard/content-posted')}
            className="mt-4 rounded-full bg-primary px-6 py-2 text-white hover:bg-primary-dark"
          >
            Back to My Content
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <header className="rounded-3xl bg-gradient-to-r from-primary to-primary-dark p-10 text-white shadow-soft">
            <h1 className="text-3xl font-semibold">Edit Event</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80">
              Update the details for your event. Changes will be reflected immediately on your content page.
            </p>
          </header>

          {/* Error Display */}
          {error && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
              <p>{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={6}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Describe your event"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-semibold text-slate-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Event location or venue"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="coverImage" className="block text-sm font-semibold text-slate-700 mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      id="coverImage"
                      value={formData.coverImage}
                      onChange={(e) => handleInputChange('coverImage', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="startAt" className="block text-sm font-semibold text-slate-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      id="startAt"
                      value={formData.startAt}
                      onChange={(e) => handleInputChange('startAt', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="endAt" className="block text-sm font-semibold text-slate-700 mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      id="endAt"
                      value={formData.endAt}
                      onChange={(e) => handleInputChange('endAt', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="mode" className="block text-sm font-semibold text-slate-700 mb-2">
                      Mode
                    </label>
                    <select
                      id="mode"
                      value={formData.mode}
                      onChange={(e) => handleInputChange('mode', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="in-person">In-Person</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="registrationLink" className="block text-sm font-semibold text-slate-700 mb-2">
                      Registration Link
                    </label>
                    <input
                      type="url"
                      id="registrationLink"
                      value={formData.registrationLink}
                      onChange={(e) => handleInputChange('registrationLink', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="https://example.com/register"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mt-6">
                <div>
                  <label htmlFor="organization" className="block text-sm font-semibold text-slate-700 mb-2">
                    Organization *
                  </label>
                  <select
                    id="organization"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="alumni">Alumni</option>
                    <option value="college">College</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-semibold text-slate-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Department name (if applicable)"
                  />
                </div>

                <div>
                  <label htmlFor="branch" className="block text-sm font-semibold text-slate-700 mb-2">
                    Branch
                  </label>
                  <input
                    type="text"
                    id="branch"
                    value={formData.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="Branch name (if applicable)"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/content-posted')}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Updating...' : 'Update Event'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditEvent
