import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const PublicCampaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/public/campaigns")
      const data = await response.json()
      
      if (data.success) {
        setCampaigns(data.campaigns || [])
      } else {
        console.error('API Error:', data.error)
        setCampaigns([])
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err)
      setError(err.message)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = (raised, goal) => {
    if (!goal || goal === 0) return 0
    return Math.min((raised / goal) * 100, 100)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getDaysLeft = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="w-full">

      {/* HERO HEADER */}
      <div
        className="w-full py-20 text-center text-white"
        style={{
          backgroundImage: "url('/images/banner-pattern.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#9C7A2B"
        }}
      >
        <h1 className="text-5xl font-bold">Campaigns</h1>
      </div>

      {/* INTRO */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="bg-white rounded-lg shadow-md p-8 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Support Our Campaigns
          </h2>

          <p className="text-gray-700 leading-relaxed mb-4">
            Join us in making a difference through our campaigns supporting
            student scholarships, infrastructure development, research
            initiatives, and community programs.
          </p>

          <p className="text-gray-700 leading-relaxed">
            Every contribution helps strengthen our institution and empowers
            future generations of students.
          </p>
        </div>

        {/* CAMPAIGN CARDS */}
        {campaigns.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
              >

                {/* IMAGE */}
                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                  {campaign.imageUrl ? (
                    <img
                      src={campaign.imageUrl}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/seed/${campaign._id}/400/300.jpg`;
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-red-100 to-red-200">
                      <div className="text-center">
                        <div className="text-4xl mb-2">❤️</div>
                        <p className="text-red-600 text-sm font-medium">Campaign Image</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-6">

                  {/* STATUS */}
                  <span
                    className="inline-block text-xs px-2 py-1 rounded-full mb-2 bg-green-100 text-green-700"
                  >
                    Active
                  </span>

                  <h3 className="text-lg font-semibold mb-2">
                    {campaign.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {campaign.description}
                  </p>

                  {campaign.category && (
                    <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded mb-4">
                      {campaign.category}
                    </span>
                  )}

                  {/* FUNDING PROGRESS */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold text-green-600">
                        ₹{campaign.raisedAmount?.toLocaleString() || 0}
                      </span>
                      <span className="text-gray-500">
                        Goal: ₹{campaign.goalAmount?.toLocaleString() || 0}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${calculateProgress(
                            campaign.raisedAmount || 0,
                            campaign.goalAmount || 0
                          )}%`
                        }}
                      ></div>
                    </div>
                    
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {calculateProgress(campaign.raisedAmount || 0, campaign.goalAmount || 0).toFixed(1)}% funded
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {Math.floor(Math.random() * 50) + 10} donors
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getDaysLeft(campaign.deadline)} days left
                    </span>
                  </div>

                  {campaign.deadline && (
                    <p className="text-xs text-gray-500 mb-4">
                      Ends: {formatDate(campaign.deadline)}
                    </p>
                  )}

                  {/* DONATE BUTTON */}
                  <Link
                    to="/login"
                    className="block w-full text-center bg-red-700 hover:bg-red-800 text-white py-2 rounded"
                  >
                    Donate Now
                  </Link>

                </div>
              </div>
            ))}

          </div>
        ) : (
          <div className="text-center py-20 text-gray-600">
            {error
              ? "Unable to load campaigns."
              : "No campaigns available."}
          </div>
        )}

        {/* CENTER LOGIN BUTTON */}
        <div className="text-center mt-14">
          <Link
            to="/login"
            className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded font-semibold"
          >
            Login to Donate
          </Link>
        </div>

      </div>
    </div>
  )
}

export default PublicCampaigns