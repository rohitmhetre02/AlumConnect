import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get, put } from '../../utils/api'
import useToast from '../../hooks/useToast'

const normalizeSkills = (skills) => {
  if (!skills) return []

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => (typeof skill === 'string' ? skill.trim() : ''))
      .filter(Boolean)
  }

  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean)
  }

  return []
}

const EditOpportunity = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [opportunity, setOpportunity] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    type: 'full-time',
    location: '',
    description: '',
    skills: '',
    contactEmail: '',
    deadline: '',
    isRemote: false,
  })

  const fetchOpportunity = useCallback(async () => {
    if (!id) return
    
    try {
      const response = await get(`/opportunities/${id}`)
      const opportunityData = response?.data
      console.log('EditOpportunity: Fetched opportunity data:', opportunityData)
      if (opportunityData) {
        setOpportunity(opportunityData)
        setFormData({
          title: opportunityData.title || '',
          company: opportunityData.company || '',
          type: opportunityData.type || 'full-time',
          location: opportunityData.location || '',
          description: opportunityData.description || '',
          skills: Array.isArray(opportunityData.skills) ? opportunityData.skills.join(', ') : '',
          contactEmail: opportunityData.contactEmail || '',
          deadline: opportunityData.deadline ? new Date(opportunityData.deadline).toISOString().slice(0, 16) : '',
          isRemote: opportunityData.isRemote || false,
        })
        console.log('EditOpportunity: Form data set:', {
          title: opportunityData.title || '',
          company: opportunityData.company || '',
          type: opportunityData.type || 'full-time',
          location: opportunityData.location || '',
          description: opportunityData.description || '',
          skills: Array.isArray(opportunityData.skills) ? opportunityData.skills.join(', ') : '',
          contactEmail: opportunityData.contactEmail || '',
          deadline: opportunityData.deadline ? new Date(opportunityData.deadline).toISOString().slice(0, 16) : '',
          isRemote: opportunityData.isRemote || false,
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to load opportunity')
      console.error('Failed to load opportunity:', err)
    } finally {
      console.log('EditOpportunity: Setting loading to false')
        setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOpportunity()
  }, [fetchOpportunity, id])

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
      const submissionData = {
        ...formData,
        skills: normalizeSkills(formData.skills),
        deadline: formData.deadline ? new Date(formData.deadline) : null,
      }

      const response = await put(`/opportunities/${id}`, submissionData)
      
      addToast?.({
        title: 'Opportunity Updated',
        description: 'Your opportunity has been updated successfully.',
        tone: 'success',
      })

      navigate('/dashboard/content-posted')
    } catch (err) {
      setError(err.message || 'Failed to update opportunity')
      addToast?.({
        title: 'Update Failed',
        description: err.message || 'Unable to update opportunity. Please try again.',
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
          <p className="mt-4 text-slate-600">Loading opportunity...</p>
        </div>
      </div>
    )
  }

  if (error && !opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-rose-600 mb-4">Error Loading Opportunity</h2>
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
            <h1 className="text-3xl font-semibold">Edit Opportunity</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80">
              Update the details for your opportunity. Changes will be reflected immediately on your content page.
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
                      Job Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter job title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-semibold text-slate-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Company name"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-semibold text-slate-700 mb-2">
                      Type *
                    </label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contactEmail" className="block text-sm font-semibold text-slate-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      id="contactEmail"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="contact@company.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="deadline" className="block text-sm font-semibold text-slate-700 mb-2">
                      Application Deadline *
                    </label>
                    <input
                      type="datetime-local"
                      id="deadline"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={6}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Describe the role, responsibilities, and requirements"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="skills" className="block text-sm font-semibold text-slate-700 mb-2">
                      Skills
                    </label>
                    <input
                      type="text"
                      id="skills"
                      value={formData.skills}
                      onChange={(e) => handleInputChange('skills', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="React, JavaScript, Node.js (comma-separated)"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      Enter skills separated by commas
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isRemote"
                        checked={formData.isRemote}
                        onChange={(e) => handleInputChange('isRemote', e.target.checked)}
                        className="h-4 w-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="isRemote" className="ml-2 text-sm font-medium text-slate-700">
                        This is a remote position
                      </label>
                    </div>
                  </div>

                  {!formData.isRemote && (
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
                        placeholder="City, State or Country"
                        required={!formData.isRemote}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between gap-4 mt-6">
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
                    {submitting ? 'Updating...' : 'Update Opportunity'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditOpportunity
