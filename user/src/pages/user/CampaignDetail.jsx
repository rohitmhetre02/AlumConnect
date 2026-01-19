import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

import ProgressBar from '../../components/user/donations/ProgressBar'
import useToast from '../../hooks/useToast'
import useCampaigns from '../../hooks/useCampaigns'
import { useAuth } from '../../context/AuthContext'

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric)
}

const getCategoryColor = (category) => {
  const colors = {
    scholarship: 'bg-blue-100 text-blue-800',
    infrastructure: 'bg-green-100 text-green-800',
    equipment: 'bg-purple-100 text-purple-800',
    research: 'bg-orange-100 text-orange-800',
    community: 'bg-pink-100 text-pink-800',
    emergency: 'bg-red-100 text-red-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[category] || colors.other
}

const getCategoryLabel = (category) => {
  const labels = {
    scholarship: 'Scholarship',
    infrastructure: 'Infrastructure',
    equipment: 'Equipment',
    research: 'Research',
    community: 'Community',
    emergency: 'Emergency',
    other: 'Other',
  }
  return labels[category] || 'Other'
}

const PRESET_AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000]

const CampaignDetail = () => {
  const { campaignId } = useParams()
  const addToast = useToast()
  const { user } = useAuth()
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [supported, setSupported] = useState(false)
  const [donationAmount, setDonationAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, loading, error, donateToCampaign } = useCampaigns(campaignId)

  console.log('CampaignDetail - campaignId:', campaignId)
  console.log('CampaignDetail - data:', data)
  console.log('CampaignDetail - loading:', loading)
  console.log('CampaignDetail - error:', error)

  const progress = useMemo(() => {
    if (!data || !data.goalAmount) return 0
    return Math.min(100, Math.round((Number(data.raisedAmount ?? 0) / Number(data.goalAmount)) * 100))
  }, [data])

  const heroImage = data?.coverImage || FALLBACK_IMAGE

  const handleDonateClick = () => {
    console.log('Donate button clicked!')
    setShowDonationModal(true)
    // Pre-fill user info if logged in
    if (user) {
      setDonorName(`${user.firstName || ''} ${user.lastName || ''}`.trim())
      setDonorEmail(user.email || '')
    }
  }

  const handleDonate = async (e) => {
    e.preventDefault()
    console.log('Handle donate called!', { isSubmitting, donationAmount, customAmount, donorName, donorEmail })
    if (isSubmitting) return

    const finalAmount = customAmount || donationAmount
    if (!donorName || !donorEmail || !finalAmount) {
      addToast?.({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        tone: 'error',
      })
      return
    }

    const numericAmount = Number(finalAmount)
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      addToast?.({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount.',
        tone: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      console.log('Calling donateToCampaign with:', {
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        amount: numericAmount,
        message: donorMessage.trim(),
        anonymous,
      })
      
      await donateToCampaign({
        donorName: donorName.trim(),
        donorEmail: donorEmail.trim(),
        amount: numericAmount,
        message: donorMessage.trim(),
        anonymous,
      })
      
      setSupported(true)
      setShowDonationModal(false)
      setDonationAmount('')
      setCustomAmount('')
      setDonorName('')
      setDonorEmail('')
      setDonorMessage('')
      setAnonymous(false)
      
      addToast?.({
        title: 'Thank You for Your Support!',
        description: `Your donation of ${formatCurrency(numericAmount)} has been processed successfully.`,
        tone: 'success',
      })
    } catch (error) {
      console.error('Donation error:', error)
      addToast?.({
        title: 'Donation Failed',
        description: 'Unable to process your donation. Please try again.',
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePresetAmount = (amount) => {
    setDonationAmount(amount)
    setCustomAmount('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="animate-pulse">
          <div className="h-64 bg-slate-200"></div>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="h-8 bg-slate-200 rounded"></div>
              <div className="h-32 bg-slate-200 rounded"></div>
              <div className="h-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Campaign Not Found</h1>
          <p className="mt-2 text-slate-500">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link to="/dashboard/campaigns" className="mt-4 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative h-64 w-full overflow-hidden">
        <img src={heroImage} alt={data.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <Link to="/dashboard/campaigns" className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold">{data.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getCategoryColor(data.category)}`}>
              {getCategoryLabel(data.category)}
            </span>
            {data.featured && (
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-sm font-medium text-yellow-900">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Campaign Progress</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Raised</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(data.raisedAmount)}</span>
                  </div>
                  <ProgressBar value={progress} />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Goal</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(data.goalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-semibold text-emerald-600">{progress}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Donors</span>
                    <span className="font-semibold text-slate-900">{data.donorCount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About This Campaign</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap">{data.description}</p>
                </div>
                {data.tags && data.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag, index) => (
                        <span key={index} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Donors */}
              {data.donations && data.donations.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Donors</h2>
                  <div className="space-y-3">
                    {data.donations.slice(-5).reverse().map((donation, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div>
                          <p className="font-medium text-slate-900">
                            {donation.anonymous ? 'Anonymous' : donation.donorName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(donation.donatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-emerald-600">{formatCurrency(donation.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Donation CTA */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Support This Campaign</h2>
                <p className="text-slate-600 mb-6">
                  Your contribution helps make a real difference in our community.
                </p>
                
                <button
                  onClick={handleDonateClick}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 mb-4"
                >
                  Donate Now
                </button>

                <div className="space-y-2 text-sm text-slate-500">
                  <div className="flex justify-between">
                    <span>Progress</span>
                    <span className="font-semibold text-emerald-600">{progress}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Donors</span>
                    <span className="font-semibold">{data.donorCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal</span>
                    <span className="font-semibold">{formatCurrency(data.goalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-12 backdrop-blur" role="dialog" aria-modal="true">
          <div className="absolute inset-0" onClick={() => setShowDonationModal(false)} aria-hidden="true" />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-40px_rgba(15,23,42,0.6)]">
            <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-primary">Make a Donation</p>
                <h3 className="text-lg font-semibold text-slate-900">Support {data.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDonationModal(false)}
                className="rounded-full border border-slate-200 p-2 text-slate-400 transition hover:border-primary hover:text-primary"
                aria-label="Close"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <form onSubmit={handleDonate} className="p-6 space-y-6">
              {/* Preset Amounts */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Choose Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handlePresetAmount(amount)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                        donationAmount === amount && !customAmount
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-200 text-slate-700 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {formatCurrency(amount)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Custom Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-slate-500">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setDonationAmount('')
                    }}
                    placeholder="Enter amount"
                    className="w-full rounded-lg border border-slate-200 pl-8 pr-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <InputField
                label="Your Name"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="John Doe"
                required
              />

              <InputField
                label="Your Email"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />

              <TextareaField
                label="Message (Optional)"
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                placeholder="Add a message of support..."
                rows={3}
              />

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={anonymous}
                  onChange={(e) => setAnonymous(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <label htmlFor="anonymous" className="ml-2 text-sm text-slate-700">
                  Donate anonymously
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDonationModal(false)}
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-primary hover:text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
                >
                  {isSubmitting ? 'Processing...' : 'Donate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const InputField = ({ label, type = 'text', value, onChange, placeholder, required }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
    />
  </div>
)

export default CampaignDetail
