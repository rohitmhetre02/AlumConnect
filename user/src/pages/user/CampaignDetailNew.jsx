import { Link, useParams } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'

import { useAuth } from '../../context/AuthContext'
import useToast from '../../hooks/useToast'
import { useCampaign } from '../../hooks/useCampaigns'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe with real test key
const stripePromise = loadStripe('pk_test_51234567890abcdef123456789')

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'

const formatCurrency = (value) => {
  const numeric = Number(value)
  if (Number.isNaN(numeric)) return '₹0'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numeric)
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

const CampaignDetail = () => {
  const { campaignId } = useParams()
  const addToast = useToast()
  const { user } = useAuth()
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [supported, setSupported] = useState(false)
  const [donationStep, setDonationStep] = useState(1) // 1: Details, 2: Payment
  const [donationAmount, setDonationAmount] = useState('')
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageError, setImageError] = useState(false)

  const { data, loading, error, donateToCampaign } = useCampaign(campaignId)

  // Component initialization - no payment handling needed since redirect goes directly to campaign page
  useEffect(() => {
    // No need to handle payment URL params since we redirect directly to campaign page
  }, [])

  const progress = useMemo(() => {
    if (!data || !data.goalAmount) return 0
    return Math.min(100, Math.round((Number(data.raisedAmount ?? 0) / Number(data.goalAmount)) * 100))
  }, [data])

  // Validate and sanitize image URL
  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl) return FALLBACK_IMAGE
    
    if (imageUrl.startsWith('blob:')) {
      return FALLBACK_IMAGE
    }
    
    try {
      const url = new URL(imageUrl)
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return imageUrl
      }
    } catch (e) {
      // Invalid URL
    }
    
    return FALLBACK_IMAGE
  }

  const heroImage = imageError ? FALLBACK_IMAGE : getValidImageUrl(data?.coverImage)

  const handleDonateClick = () => {
    setDonationStep(1)
    setDonationAmount('')
    setCustomAmount('')
    setDonorName('')
    setDonorEmail('')
    setDonorMessage('')
    setAnonymous(false)
    setShowDonationModal(true)
  }

  const handleNextStep = () => {
    if (!donorName.trim() || !donorEmail.trim() || (!donationAmount && !customAmount)) {
      addToast?.({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        tone: 'error',
      })
      return
    }

    const numericAmount = Number(customAmount || donationAmount)
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      addToast?.({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount.',
        tone: 'error',
      })
      return
    }

    setDonationStep(2)
  }

  const handlePrevStep = () => {
    setDonationStep(1)
  }

  const handleStripePayment = async () => {
    const finalAmount = Number(customAmount || donationAmount)
    
    if (Number.isNaN(finalAmount) || finalAmount <= 0) {
      addToast?.({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount.',
        tone: 'error',
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Create Stripe checkout session
      const response = await fetch('http://localhost:5000/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalAmount,
          campaignId: campaignId,
          donorName: donorName.trim(),
          donorEmail: donorEmail.trim(),
          message: donorMessage.trim(),
          anonymous,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create payment session')
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      } else {
        // Fallback: Use Stripe.js redirect
        const stripe = await stripePromise
        const { error } = await stripe.redirectToCheckout({
          sessionId: result.sessionId,
        })

        if (error) {
          throw new Error(error.message)
        }
      }

    } catch (error) {
      addToast?.({
        title: 'Payment Failed',
        description: error.message || 'Unable to process payment. Please try again.',
        tone: 'error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading campaign details...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="rounded-full bg-red-100 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Campaign Not Found</h1>
          <p className="text-slate-600 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/dashboard/campaigns"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
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
        <img 
          src={heroImage} 
          alt={data.title || 'Campaign'} 
          className="h-full w-full object-cover"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <Link to="/dashboard/campaigns" className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/30 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back to Campaigns
          </Link>
          <h1 className="text-3xl font-bold">{data.title || 'Untitled Campaign'}</h1>
          <div className="flex items-center gap-4 mt-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getCategoryColor(data.category || 'other')}`}>
              {getCategoryLabel(data.category || 'other')}
            </span>
            {data.featured && (
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-yellow-900">
                Featured
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold text-slate-900 mb-4">About this Campaign</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed">
                  {data.description || 'No description available.'}
                </p>
              </div>
            </section>

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag, index) => (
                    <span key={index} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">Progress</span>
                    <span className="text-sm font-semibold text-slate-900">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Raised</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(data.raisedAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Goal</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(data.goalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Donors</span>
                    <span className="font-semibold text-slate-900">{data.donorCount || 0}</span>
                  </div>
                </div>

                <button
                  onClick={handleDonateClick}
                  className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  {supported ? 'Donate Again' : 'Donate Now'}
                </button>
              </div>
            </div>

            {/* Campaign Info */}
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Status</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    data.approvalStatus === 'APPROVED' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {data.approvalStatus === 'APPROVED' ? 'Approved' : 'Pending'}
                  </span>
                </div>
                {data.deadline && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Deadline</span>
                    <span className="text-slate-900">
                      {new Date(data.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-600">Created</span>
                  <span className="text-slate-900">
                    {new Date(data.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Step Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            {/* Progress Steps */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  donationStep >= 1 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-2 ${
                  donationStep >= 2 ? 'bg-primary' : 'bg-slate-200'
                }`}></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  donationStep >= 2 ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className={donationStep >= 1 ? 'text-primary font-semibold' : 'text-slate-600'}>Details</span>
                <span className={donationStep >= 2 ? 'text-primary font-semibold' : 'text-slate-600'}>Payment</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {donationStep === 1 ? 'Donation Details' : 'Payment Information'}
            </h2>

            {donationStep === 1 ? (
              // Step 1: Donation Details
              <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Donation Amount (₹) *</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {['500', '1000', '2500', '5000'].map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => {
                            setDonationAmount(amount)
                            setCustomAmount('')
                          }}
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                            donationAmount === amount && !customAmount
                              ? 'border-primary bg-primary text-white'
                              : 'border-slate-300 text-slate-700 hover:border-primary'
                          }`}
                        >
                          ₹{amount}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={customAmount || donationAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value)
                        setDonationAmount('')
                      }}
                      placeholder="Enter custom amount"
                      min="1"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message (Optional)</label>
                    <textarea
                      value={donorMessage}
                      onChange={(e) => setDonorMessage(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Add a message of support..."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={anonymous}
                      onChange={(e) => setAnonymous(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <label htmlFor="anonymous" className="ml-2 text-sm text-slate-700">
                      Donate anonymously
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDonationModal(false)}
                    className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
                  >
                    Next →
                  </button>
                </div>
              </form>
            ) : (
              // Step 2: Payment
              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-900 mb-2">Donation Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount:</span>
                      <span className="font-medium">{formatCurrency(customAmount || donationAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Campaign:</span>
                      <span className="font-medium">{data.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Name:</span>
                      <span className="font-medium">{anonymous ? 'Anonymous' : donorName}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="font-semibold text-blue-900">Stripe Test Payment</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    You'll be redirected to Stripe's secure checkout. Use test card 4242 4242 4242 4242 for testing.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStripePayment}
                    disabled={isSubmitting}
                    className="flex-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Processing...' : `Pay ${formatCurrency(customAmount || donationAmount)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CampaignDetail
