import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get, put } from '../../utils/api'
import useToast from '../../hooks/useToast'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric)
}

const EditDonation = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [donation, setDonation] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    coverImage: '',
    deadline: '',
  })

  const fetchDonation = useCallback(async () => {
    if (!id) return
    
    try {
      const response = await get(`/donations/${id}`)
      const donationData = response?.data
      console.log('EditDonation: Fetched donation data:', donationData)
      
      if (donationData) {
        setDonation(donationData)
        setFormData({
          title: donationData.title || '',
          description: donationData.description || '',
          goalAmount: donationData.goalAmount ? donationData.goalAmount.toString() : '',
          coverImage: donationData.coverImage || '',
          deadline: donationData.deadline ? new Date(donationData.deadline).toISOString().slice(0, 16) : '',
        })
        console.log('EditDonation: Form data set:', {
          title: donationData.title || '',
          description: donationData.description || '',
          goalAmount: donationData.goalAmount ? donationData.goalAmount.toString() : '',
          coverImage: donationData.coverImage || '',
          deadline: donationData.deadline ? new Date(donationData.deadline).toISOString().slice(0, 16) : '',
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to load donation campaign')
      console.error('Failed to load donation:', err)
    } finally {
      console.log('EditDonation: Setting loading to false')
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDonation()
  }, [fetchDonation, id])

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
        goalAmount: Number(formData.goalAmount),
        deadline: formData.deadline ? new Date(formData.deadline) : null,
      }

      const response = await put(`/donations/${id}`, submissionData)
      
      addToast?.({
        title: 'Campaign Updated',
        description: 'Your donation campaign has been updated successfully.',
        tone: 'success',
      })

      navigate('/dashboard/content-posted')
    } catch (err) {
      setError(err.message || 'Failed to update campaign')
      addToast?.({
        title: 'Update Failed',
        description: err.message || 'Unable to update donation campaign. Please try again.',
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
          <p className="mt-4 text-slate-600">Loading campaign...</p>
        </div>
      </div>
    )
  }

  if (error && !donation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-rose-600 mb-4">Error Loading Campaign</h2>
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
            <h1 className="text-3xl font-semibold">Edit Donation Campaign</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80">
              Update your donation campaign details. Changes will be reflected immediately on your content page.
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
                <div className="space-y-6 md:col-span-2">
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                      Campaign Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="Enter campaign title"
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
                      placeholder="Describe your donation campaign"
                      required
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label htmlFor="goalAmount" className="block text-sm font-semibold text-slate-700 mb-2">
                        Goal Amount (₹) *
                      </label>
                      <input
                        type="number"
                        id="goalAmount"
                        value={formData.goalAmount}
                        onChange={(e) => handleInputChange('goalAmount', e.target.value)}
                        min="1"
                        step="100"
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        placeholder="100000"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="deadline" className="block text-sm font-semibold text-slate-700 mb-2">
                        Deadline
                      </label>
                      <input
                        type="datetime-local"
                        id="deadline"
                        value={formData.deadline}
                        onChange={(e) => handleInputChange('deadline', e.target.value)}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
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
              </div>

              {/* Current Progress Display */}
              {donation && (
                <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Current Progress</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Raised:</span>
                      <span className="font-semibold text-slate-900 ml-2">
                        {formatCurrency(donation.raisedAmount)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Supporters:</span>
                      <span className="font-semibold text-slate-900 ml-2">
                        {donation.contributionCount || 0}
                      </span>
                    </div>
                  </div>
                </div>
              )}

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
                    {submitting ? 'Updating...' : 'Update Campaign'}
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

export default EditDonation
