import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCampaigns from '../../hooks/useCampaigns'
import { useAuth } from '../../context/AuthContext'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric)
}

const CAMPAIGN_CATEGORIES = [
  { label: 'Scholarship Fund', value: 'scholarship' },
  { label: 'Infrastructure', value: 'infrastructure' },
  { label: 'Equipment & Technology', value: 'equipment' },
  { label: 'Research & Development', value: 'research' },
  { label: 'Community Service', value: 'community' },
  { label: 'Emergency Relief', value: 'emergency' },
  { label: 'Other', value: 'other' },
]

const PostDonationCampaign = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { createCampaign } = useCampaigns()
  
  const [form, setForm] = useState({
    title: '',
    goalAmount: '',
    description: '',
    coverImage: '',
    deadline: '',
    category: 'community',
    tags: '',
    featured: false,
    priority: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'Alumni') // Using your Cloudinary preset

      const response = await fetch('https://api.cloudinary.com/v1_1/dwzk5ytq6/image/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      
      if (data.secure_url) {
        setForm((prev) => ({ ...prev, coverImage: data.secure_url }))
        setImagePreview(data.secure_url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    const numericGoal = Number(form.goalAmount)
    if (Number.isNaN(numericGoal) || numericGoal <= 0) {
      alert('Please enter a valid goal amount')
      return
    }

    setIsSubmitting(true)
    try {
      await createCampaign({
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: numericGoal,
        coverImage: form.coverImage.trim() || DEFAULT_IMAGE,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        category: form.category,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        featured: form.featured,
        priority: Number(form.priority) || 0,
      })
      navigate('/dashboard/campaigns')
    } catch (error) {
      console.error('Failed to create campaign:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard/campaigns')
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
              Back to Campaigns
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Create Campaign</p>
              <h1 className="text-3xl font-bold text-slate-900">Launch a fundraiser for the community</h1>
              <p className="text-sm text-slate-500 mt-2">
                Create a campaign to support scholarships, infrastructure, equipment, research, or community initiatives.
              </p>
            </div>
          </header>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <InputField 
                  label="Campaign Title" 
                  value={form.title} 
                  onChange={handleChange('title')} 
                  placeholder="Equip Computer Science Lab" 
                  required 
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Goal Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-slate-500">₹</span>
                    <input
                      type="number"
                      min="1"
                      value={form.goalAmount}
                      onChange={handleChange('goalAmount')}
                      placeholder="50000"
                      required
                      className="w-full rounded-xl border border-slate-200 pl-8 pr-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  {form.goalAmount && (
                    <p className="mt-2 text-sm text-slate-500">
                      Target: {formatCurrency(form.goalAmount)}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Campaign Category
                  </label>
                  <select
                    value={form.category}
                    onChange={handleChange('category')}
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    {CAMPAIGN_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <InputField 
                  label="Tags (comma separated)" 
                  value={form.tags} 
                  onChange={handleChange('tags')} 
                  placeholder="education, technology, students"
                />
              </div>

              <TextareaField
                label="Campaign Description"
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Explain the impact of this campaign, who it supports, and how funds will be used."
                rows={6}
                required
              />

              <div className="grid gap-6 md:grid-cols-2">
                <ImageUploadField
                  label="Cover Image"
                  value={form.coverImage}
                  imagePreview={imagePreview}
                  uploading={uploadingImage}
                  onUpload={handleImageUpload}
                  onChange={handleChange('coverImage')}
                />
                <InputField 
                  label="Campaign Deadline" 
                  type="date" 
                  value={form.deadline} 
                  onChange={handleChange('deadline')}
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
                  className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Publishing Campaign...' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

const InputField = ({ label, type = 'text', value, onChange, placeholder, required, min }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      min={min}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
    />
  </div>
)

const TextareaField = ({ label, value, onChange, placeholder, rows = 4, required }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
    />
  </div>
)

const ImageUploadField = ({ label, value, imagePreview, uploading, onUpload, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    
    <div className="space-y-4">
      {/* Image Preview */}
      {(imagePreview || value) && (
        <div className="relative">
          <img
            src={imagePreview || value}
            alt="Cover preview"
            className="w-full h-48 object-cover rounded-xl border border-slate-200"
          />
          <button
            type="button"
            onClick={() => {
              onChange({ target: { value: '' } })
              setImagePreview('')
            }}
            className="absolute top-2 right-2 rounded-full bg-red-500 text-white p-1 hover:bg-red-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Upload Button */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-slate-500">Uploading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="w-8 h-8 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-slate-600">Click to upload image</p>
              <p className="text-xs text-slate-400">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Fallback URL Input */}
      <div className="text-xs text-slate-500">
        Or enter image URL directly:
      </div>
      <input
        type="url"
        value={value}
        onChange={onChange}
        placeholder="https://example.com/image.jpg"
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
      />
    </div>
  </div>
)

export default PostDonationCampaign
