import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { get, del } from '../utils/api'

const formatCurrency = (amount) => {
  if (!Number.isFinite(amount)) return "$0";
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date) => {
  if (!date) return "—";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const CampaignDetails = () => {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState(null)
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch campaign details
  const fetchCampaignDetails = async () => {
    try {
      // Fetch campaign data
      const campaignResponse = await get(`/campaigns/${campaignId}`)
      setCampaign(campaignResponse.data)

      // Fetch donors data
      const donorsResponse = await get(`/campaigns/${campaignId}/donors`)
      setDonors(donorsResponse.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaignDetails()
  }, [campaignId])

  const formatCurrency = (amount) => {
    if (!Number.isFinite(amount)) return "$0"
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return "—"
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return "—"
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const deriveStatus = (campaign) => {
    if (!campaign) return "Active"
    const { goalAmount, raisedAmount, deadline } = campaign

    if (goalAmount && raisedAmount >= goalAmount) return "Completed"

    if (deadline) {
      const due = new Date(deadline)
      if (due < new Date()) {
        return raisedAmount >= goalAmount * 0.5 ? "Completed" : "Closed"
      }
    }

    return "Active"
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800"
      case "Completed":
        return "bg-blue-100 text-blue-800"
      case "Closed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-gray-500">Campaign not found</p>
        </div>
      </div>
    )
  }

  const progress = campaign.goalAmount > 0 
    ? (campaign.raisedAmount / campaign.goalAmount) * 100 
    : 0
  const status = deriveStatus(campaign)

  return (
    <div className="p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/campaigns')}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Back to Campaigns
        </button>
      </div>

      {/* Campaign Details */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
            <p className="text-gray-600">{campaign.description}</p>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeClass(status)}`}>
            {status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Goal Amount</h3>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(campaign.goalAmount)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Raised Amount</h3>
            <p className="text-xl font-bold text-green-600">{formatCurrency(campaign.raisedAmount)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Progress</h3>
            <p className="text-xl font-bold text-blue-600">{progress.toFixed(1)}%</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">Deadline</h3>
            <p className="text-xl font-bold text-gray-900">{formatDate(campaign.deadline)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {progress.toFixed(1)}% funded • {campaign.contributionCount || 0} donors
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created By</h3>
            <p className="text-gray-900">{campaign.createdByName || '—'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Created Date</h3>
            <p className="text-gray-900">{formatDate(campaign.createdAt)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Campaign Type</h3>
            <p className="text-gray-900">{campaign.campaignType || 'General'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Category</h3>
            <p className="text-gray-900">{campaign.category || '—'}</p>
          </div>
        </div>
      </div>

      {/* Donors List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Donors List ({donors.length})</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donors.map((donor, index) => (
                <tr key={donor.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.donorName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.donorEmail}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(donor.amount)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(donor.donatedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      donor.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                      donor.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {donor.paymentStatus || 'completed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {donors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No donors found for this campaign.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignDetails
