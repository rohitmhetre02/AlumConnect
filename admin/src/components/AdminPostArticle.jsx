import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'

function InputField({ label, type = 'text', value, onChange, placeholder, required, min }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  )
}

function TextareaField({ label, value, onChange, placeholder, rows = 4, required }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </label>
  )
}

function ImageUploadField({ label, value, onChange, onUpload, uploading, imagePreview }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700">
        <span>{label}</span>
      </label>
      {imagePreview ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <img src={imagePreview} alt="Selected cover" className="h-48 w-full object-cover" />
        </div>
      ) : null}
      <div className="flex flex-col gap-3">
        <input
          type="url"
          value={value}
          onChange={onChange}
          placeholder="https://images.unsplash.com/..."
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <label
          className={`inline-flex w-max cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold transition ${
            uploading ? 'cursor-not-allowed border-slate-200 text-slate-300' : 'text-slate-600 hover:border-primary hover:text-primary'
          }`}
        >
          <input type="file" accept="image/*" className="hidden" onChange={uploading ? undefined : onUpload} />
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4v16h16V8l-6-4H4z" />
            <path d="M14 4v4h4" />
            <path d="M9 14l2 2 4-4" />
          </svg>
          {uploading ? 'Uploading…' : 'Upload image'}
        </label>
      </div>
    </div>
  )
}

const DEFAULT_FORM_STATE = {
  title: '',
  subtitle: '',
  category: '',
  excerpt: '',
  content: '',
  coverImage: '',
  readingTimeMinutes: '',
}

const AdminPostArticle = () => {
  const navigate = useNavigate()
  
  const [form, setForm] = useState(DEFAULT_FORM_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'coverImage') {
      setImagePreview(value?.trim() ? value.trim() : '')
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPG, PNG, GIF).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Images must be smaller than 5MB.')
      return
    }

    setUploadingImage(true)
    try {
      // For now, create a preview URL (in production, you'd upload to Cloudinary)
      const previewUrl = URL.createObjectURL(file)
      setForm((prev) => ({ ...prev, coverImage: previewUrl }))
      setImagePreview(previewUrl)
      alert('Article image uploaded successfully.')
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    // Basic validation
    if (!form.title.trim() || !form.content.trim()) {
      alert('Title and content are required to publish.')
      return
    }

    const readingTime = form.readingTimeMinutes ? Number(form.readingTimeMinutes) : undefined
    if (readingTime !== undefined && (!Number.isFinite(readingTime) || readingTime <= 0)) {
      alert('Reading time must be a positive number of minutes.')
      return
    }

    setIsSubmitting(true)
    try {
      const articleData = {
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        category: form.category.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        coverImage: form.coverImage.trim() || undefined,
        readingTimeMinutes: readingTime,
        postedBy: 'Admin',
      }
      
      console.log('Submitting article data:', articleData)
      
      const result = await api.post('/news', articleData)
      
      console.log('Article created successfully:', result)
      alert('Article has been successfully published.')
      navigate('/admin/news')
    } catch (createError) {
      console.error('Failed to create article:', createError)
      alert(`Failed to create article: ${createError.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/admin/news')
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
          Back to News Management
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Create New Article</h1>
          <p className="text-slate-600">Publish news and announcements for the alumni community</p>
        </div>

        {/* Form */}
        <div className="rounded-3xl bg-white shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Article Details</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Headline *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={handleChange('title')}
                    placeholder="Innovation grants awarded to 5 startups"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={handleChange('category')}
                    placeholder="Entrepreneurship"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={handleChange('subtitle')}
                    placeholder="Optional supporting headline"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reading Time (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.readingTimeMinutes}
                    onChange={handleChange('readingTimeMinutes')}
                    placeholder="5"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Media</h2>
              <div className="space-y-3">
                {/* Image Preview */}
                {(imagePreview || form.coverImage) && (
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                      src={imagePreview || form.coverImage} 
                      alt="Article cover preview" 
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

                {/* URL Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Or enter image URL directly:
                  </label>
                  <input
                    type="url"
                    value={form.coverImage}
                    onChange={handleChange('coverImage')}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Content</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Short Excerpt
                  </label>
                  <textarea
                    value={form.excerpt}
                    onChange={handleChange('excerpt')}
                    placeholder="Summarize the story in a short paragraph to hook readers."
                    rows={3}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Article Content *
                  </label>
                  <textarea
                    value={form.content}
                    onChange={handleChange('content')}
                    placeholder="Share the full details of the story. Use paragraphs and line breaks to make it easy to read."
                    rows={10}
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
                {isSubmitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AdminPostArticle
