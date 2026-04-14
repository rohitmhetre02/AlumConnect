import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import useNews from '../../hooks/useNews'
import FileUpload from '../../components/common/FileUpload'
import { uploadFile } from '../../utils/upload'

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
        <FileUpload
          onFileSelect={onUpload}
          accept="image/*"
          className="w-full"
        >
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-slate-700">Upload News Image</p>
            <p className="text-xs text-slate-500">Images up to 5MB</p>
          </div>
        </FileUpload>
        <input
          type="url"
          value={value}
          onChange={onChange}
          placeholder="Or paste an image URL"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
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

const NewsCreate = () => {
  const navigate = useNavigate()
  const { role } = useAuth()
  const addToast = useToast()
  const { createNews } = useNews()

  const [form, setForm] = useState(DEFAULT_FORM_STATE)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const canPublish = useMemo(() => role?.toLowerCase() === 'faculty', [role])

  useEffect(() => {
    if (!canPublish) {
      addToast?.({
        title: 'Access restricted',
        description: 'Only faculty members can publish news stories.',
        tone: 'warning',
      })
      navigate('/dashboard/news', { replace: true })
    }
  }, [canPublish, addToast, navigate])

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'coverImage') {
      setImagePreview(value?.trim() ? value.trim() : '')
    }
  }

  const handleImageUpload = async (file) => {
    console.log('=== DEBUG: NewsCreate handleImageUpload called ===')
    console.log('File:', file)
    
    if (!file.type.startsWith('image/')) {
      addToast?.({
        title: 'Invalid file',
        description: 'Please select a valid image file (JPG, PNG, GIF).',
        tone: 'error',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast?.({
        title: 'File too large',
        description: 'Images must be smaller than 5MB.',
        tone: 'error',
      })
      return
    }

    setUploadingImage(true)
    try {
      console.log('Calling uploadFile with type: news')
      const result = await uploadFile(file, 'news')
      console.log('Upload result:', result)
      
      if (result?.url) {
        setForm((prev) => ({ ...prev, coverImage: result.url }))
        setImagePreview(result.url)
        addToast?.({
          title: 'Image uploaded',
          description: 'Cover image is ready to publish.',
          tone: 'success',
        })
        console.log('News image uploaded successfully:', result.url)
      } else {
        throw new Error('No URL returned from upload')
      }
    } catch (error) {
      console.error('=== NEWS UPLOAD ERROR ===')
      console.error('Error:', error)
      addToast?.({
        title: 'Upload failed',
        description: error.message ?? 'Unable to upload image right now.',
        tone: 'error',
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canPublish || isSubmitting) return

    if (!form.title.trim() || !form.content.trim()) {
      addToast?.({
        title: 'Missing information',
        description: 'Title and full story are required to publish.',
        tone: 'error',
      })
      return
    }

    const readingTime = form.readingTimeMinutes ? Number(form.readingTimeMinutes) : undefined
    if (readingTime !== undefined && (!Number.isFinite(readingTime) || readingTime <= 0)) {
      addToast?.({
        title: 'Invalid reading time',
        description: 'Reading time must be a positive number of minutes.',
        tone: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createNews({
        title: form.title.trim(),
        subtitle: form.subtitle.trim(),
        category: form.category.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        coverImage: form.coverImage.trim() || undefined,
        readingTimeMinutes: readingTime,
      })
      addToast?.({
        title: 'Story published',
        description: 'Your news update is now live for the community.',
        tone: 'success',
      })
      navigate('/dashboard/news')
    } catch (error) {
      // Error toast handled in hook
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <header className="rounded-4xl bg-gradient-to-br from-primary to-primary-dark p-8 text-white shadow-soft sm:p-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">Faculty Publication</p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Publish a News Story</h1>
          <p className="max-w-2xl text-sm text-white/80 sm:text-base">
            Share achievements, announcements, and opportunities with the alum community. Provide a compelling headline, captivating excerpt, and rich story details to inspire readers.
          </p>
          <button
            type="button"
            onClick={() => navigate('/dashboard/news')}
            className="inline-flex items-center gap-2 text-sm font-medium text-white/80 transition hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Newsroom
          </button>
        </div>
      </header>

      <section className="rounded-4xl bg-white p-8 shadow-soft sm:p-12">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Headline"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="Innovation grants awarded to 5 startups"
              required
            />
            <InputField
              label="Category"
              value={form.category}
              onChange={handleChange('category')}
              placeholder="Entrepreneurship"
            />
            <InputField
              label="Subtitle"
              value={form.subtitle}
              onChange={handleChange('subtitle')}
              placeholder="Optional supporting headline"
            />
            <ImageUploadField
              label="Cover Image"
              value={form.coverImage}
              onChange={handleChange('coverImage')}
              onUpload={handleImageUpload}
              uploading={uploadingImage}
              imagePreview={imagePreview || form.coverImage}
            />
          </div>

          <TextareaField
            label="Short Excerpt"
            value={form.excerpt}
            onChange={handleChange('excerpt')}
            placeholder="Summarize the story in a short paragraph to hook readers."
            rows={3}
          />

          <TextareaField
            label="Full Story"
            value={form.content}
            onChange={handleChange('content')}
            placeholder="Share the full details of the story. Use paragraphs and line breaks to make it easy to read."
            rows={10}
            required
          />

          <div className="grid gap-6 md:grid-cols-2">
            <InputField
              label="Reading Time (minutes)"
              type="number"
              min="1"
              value={form.readingTimeMinutes}
              onChange={handleChange('readingTimeMinutes')}
              placeholder="5"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/news')}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
            >
              {isSubmitting ? 'Publishing…' : 'Publish Story'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default NewsCreate
