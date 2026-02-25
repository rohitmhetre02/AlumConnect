import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'

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

const AdminPostCampaign = () => {
  const navigate = useNavigate()
  const { campaignId } = useParams()
  const isEditing = !!campaignId
  
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
  const [isLoading, setIsLoading] = useState(false)

  // Load campaign data for editing
  useEffect(() => {
    if (isEditing) {
      loadCampaign()
    }
  }, [campaignId])

  const loadCampaign = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/campaigns/${campaignId}`)
      const campaign = response.data
      
      setForm({
        title: campaign.title || '',
        goalAmount: campaign.goalAmount || '',
        description: campaign.description || '',
        coverImage: campaign.coverImage || '',
        deadline: campaign.deadline ? new Date(campaign.deadline).toISOString().split('T')[0] : '',
        category: campaign.category || 'community',
        tags: Array.isArray(campaign.tags) ? campaign.tags.join(', ') : '',
        featured: campaign.featured || false,
        priority: campaign.priority || 0,
      })
      setImagePreview(campaign.coverImage || '')
    } catch (error) {
      console.error('Failed to load campaign:', error)
      alert('Failed to load campaign. Please try again.')
      navigate('/admin/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

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
      // For now, create a preview URL (in production, you'd upload to Cloudinary)
      const previewUrl = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, coverImage: previewUrl }))
      setImagePreview(previewUrl)
      alert('Campaign image uploaded successfully.')
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

    // Basic validation
    if (!form.title.trim() || !form.description.trim() || !form.goalAmount) {
      alert('Please fill in all required fields.')
      return
    }

    const numericGoal = Number(form.goalAmount)
    if (Number.isNaN(numericGoal) || numericGoal <= 0) {
      alert('Please enter a valid goal amount')
      return
    }

    setIsSubmitting(true)
    try {
      const campaignData = {
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: numericGoal,
        coverImage: form.coverImage.trim() || DEFAULT_IMAGE,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        category: form.category,
        tags: form.tags ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        featured: form.featured,
        priority: Number(form.priority) || 0,
        postedBy: 'Admin',
      }
      
      console.log('Submitting campaign data:', campaignData)
      
      let result
      if (isEditing) {
        result = await api.put(`/campaigns/${campaignId}`, campaignData)
        console.log('Campaign updated successfully:', result)
        alert('Campaign has been successfully updated.')
      } else {
        result = await api.post('/campaigns', campaignData)
        console.log('Campaign created successfully:', result)
        alert('Campaign has been successfully created.')
      }
      
      navigate('/admin/campaigns')
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} campaign:`, error)
      alert(`Failed to ${isEditing ? 'update' : 'create'} campaign: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/campaigns')
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
          Back to Campaigns Management
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
          </h1>
          <p className="text-slate-600">
            {isEditing ? 'Update campaign details and settings' : 'Launch fundraising campaigns for the alumni community'}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Campaign Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="Equip Computer Science Lab"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Goal Amount (₹) *
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
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-8 pr-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  {form.goalAmount && (
                    <p className="mt-2 text-sm text-slate-500">
                      Target: {formatCurrency(form.goalAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Campaign Category *
                  </label>
                  <div className="relative">
                    <select
                      value={form.category}
                      onChange={handleChange('category')}
                      required
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {CAMPAIGN_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
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
                    Tags
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={handleChange('tags')}
                    placeholder="education, technology, students"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Campaign Description *
              </label>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Explain the impact of this campaign, who it supports, and how funds will be used."
                rows={6}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Media and Deadline */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Media & Timeline</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cover Image
                  </label>
                  <div className="space-y-3">
                    {/* Image Preview */}
                    {(imagePreview || form.coverImage) && (
                      <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-slate-100">
                        <img 
                          src={imagePreview || form.coverImage} 
                          alt="Campaign cover preview" 
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setForm(prev => ({ ...prev, coverImage: '' }))
                            setImagePreview('')
                          }}
                          className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-slate-600 hover:bg-white hover:text-red-500 transition"
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
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <div className="flex items-center justify-center w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition hover:border-primary hover:bg-primary/5">
                        <div className="space-y-2">
                          <svg className="mx-auto h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div className="text-sm text-slate-600">
                            {uploadingImage ? 'Uploading...' : 'Click to upload or drag and drop'}
                          </div>
                          <div className="text-xs text-slate-500">
                            PNG, JPG, GIF up to 5MB
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Campaign Deadline
                  </label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={handleChange('deadline')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Options */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Campaign Options</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={handleChange('featured')}
                    className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-slate-700">
                    Feature this campaign on homepage
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Priority Level
                  </label>
                  <div className="relative">
                    <select
                      value={form.priority}
                      onChange={handleChange('priority')}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="0">Normal</option>
                      <option value="1">High</option>
                      <option value="2">Urgent</option>
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
                {isSubmitting ? 'Publishing Campaign...' : 'Publish Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminPostCampaign
