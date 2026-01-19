import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useOpportunities from '../../hooks/useOpportunities'
import { useAuth } from '../../context/AuthContext'

const allowedOpportunityTypes = [
  { label: 'Full-time', value: 'full-time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Part-time', value: 'part-time' },
]

const PostOpportunity = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createOpportunity } = useOpportunities()
  
  const [form, setForm] = useState({
    title: '',
    company: '',
    type: 'full-time',
    location: '',
    isRemote: false,
    description: '',
    skills: '',
    contactEmail: user?.email || '',
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

    setIsSubmitting(true)
    try {
      await createOpportunity({
        title: form.title.trim(),
        company: form.company.trim(),
        type: form.type,
        location: form.isRemote ? 'Remote' : form.location.trim(),
        description: form.description.trim(),
        skills: form.skills,
        contactEmail: form.contactEmail.trim(),
        deadline: form.deadline,
        postedBy: `${user?.firstName} ${user?.lastName}` || 'Anonymous',
      })
      navigate('/dashboard/opportunities')
    } catch (error) {
      // errors are surfaced via toast from hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard/opportunities')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-8">
          <header>
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary mb-4"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Back to Opportunities
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Post Opportunity</p>
              <h1 className="text-3xl font-bold text-slate-900">Share a role with the community</h1>
              <p className="text-sm text-slate-500 mt-2">
                Help students and alumni find their next opportunity by posting a job or internship.
              </p>
            </div>
          </header>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <InputField 
                  label="Role Title" 
                  value={form.title} 
                  onChange={handleChange('title')} 
                  placeholder="Senior Product Designer" 
                  required 
                />
                <InputField 
                  label="Company" 
                  value={form.company} 
                  onChange={handleChange('company')} 
                  placeholder="Figma" 
                  required 
                />
                <SelectField 
                  label="Opportunity Type" 
                  value={form.type} 
                  onChange={handleChange('type')} 
                  options={allowedOpportunityTypes} 
                />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Location</label>
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
                      <InputField 
                        label=""
                        value={form.location} 
                        onChange={handleChange('location')} 
                        placeholder="New York, USA" 
                        required={!form.isRemote}
                      />
                    )}
                  </div>
                </div>
              </div>

              <TextareaField
                label="Description"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Outline responsibilities, requirements, and why this role is impactful."
                rows={6}
                required
              />

              <div className="grid gap-6 md:grid-cols-2">
                <InputField
                  label="Skills"
                  value={form.skills}
                  onChange={handleChange('skills')}
                  placeholder="React, Design Systems, Leadership"
                />
                <InputField
                  label="Application Deadline"
                  type="date"
                  value={form.deadline}
                  onChange={handleChange('deadline')}
                  required
                />
                <InputField
                  label="Contact Email"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange('contactEmail')}
                  placeholder="careers@company.com"
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark hover:shadow-xl disabled:cursor-not-allowed disabled:bg-primary/50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const InputField = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <label className="block text-sm font-semibold text-slate-700">
    {label}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
    />
  </label>
)

const TextareaField = ({ label, value, onChange, placeholder, rows = 3, required }) => (
  <label className="block text-sm font-semibold text-slate-700">
    {label}
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
    />
  </label>
)

const SelectField = ({ label, value, onChange, options }) => (
  <label className="block text-sm font-semibold text-slate-700">
    {label}
    <select
      value={value}
      onChange={onChange}
      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
)

export default PostOpportunity
