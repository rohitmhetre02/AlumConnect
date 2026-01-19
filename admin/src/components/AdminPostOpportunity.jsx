import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

const allowedOpportunityTypes = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Part-time', value: 'part-time' },
  { label: 'Contract', value: 'contract' },
]

const AdminPostOpportunity = () => {
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    title: '',
    company: '',
    type: 'full-time',
    location: '',
    isRemote: false,
    description: '',
    skills: '',
    contactEmail: '',
    deadline: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleCheckboxChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.checked }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    // Basic validation
    if (!form.title.trim() || !form.company.trim() || !form.description.trim()) {
      alert('Please fill in all required fields.')
      return
    }

    if (!form.isRemote && !form.location.trim()) {
      alert('Please provide a location or mark as remote.')
      return
    }

    if (!form.contactEmail.trim()) {
      alert('Please provide a contact email.')
      return
    }

    setIsSubmitting(true)
    try {
      const opportunityData = {
        title: form.title.trim(),
        company: form.company.trim(),
        type: form.type,
        location: form.isRemote ? 'Remote' : form.location.trim(),
        description: form.description.trim(),
        skills: form.skills.trim(),
        contactEmail: form.contactEmail.trim(),
        deadline: form.deadline,
        postedBy: 'Admin',
      }
      
      console.log('Submitting opportunity data:', opportunityData)
      
      const result = await api.post('/opportunities', opportunityData)
      
      console.log('Opportunity created successfully:', result)
      alert('Opportunity has been successfully created.')
      navigate('/admin/opportunities')
    } catch (createError) {
      console.error('Failed to create opportunity:', createError)
      alert(`Failed to create opportunity: ${createError.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/opportunities')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Opportunities Management
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Post New Opportunity</h1>
          <p className="text-slate-600">Share job opportunities with the alumni community</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Basic Information</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="Senior Product Designer"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={handleChange('company')}
                    placeholder="Figma"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Opportunity Type *
                  </label>
                  <div className="relative">
                    <select
                      value={form.type}
                      onChange={handleChange('type')}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {allowedOpportunityTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    <svg
                      className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Location
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isRemote}
                        onChange={handleCheckboxChange('isRemote')}
                        className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-slate-600">Remote</span>
                    </label>
                    {!form.isRemote && (
                      <input
                        type="text"
                        value={form.location}
                        onChange={handleChange('location')}
                        placeholder="New York, USA"
                        required={!form.isRemote}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Outline responsibilities, requirements, and why this role is impactful."
                rows={6}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Additional Details */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Required Skills
                  </label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={handleChange('skills')}
                    placeholder="React, Design Systems, Leadership"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={handleChange('deadline')}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange('contactEmail')}
                    placeholder="careers@company.com"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Publishing...' : 'Publish Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminPostOpportunity
