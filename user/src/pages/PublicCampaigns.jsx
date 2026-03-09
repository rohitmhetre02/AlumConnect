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
      const response = await fetch("/api/campaigns")
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      console.error("Error fetching campaigns:", err)
      setError(err.message)
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
                  {campaign.image ? (
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      ❤️
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="p-6">

                  {/* STATUS */}
                  <span
                    className={`inline-block text-xs px-2 py-1 rounded-full mb-2 ${
                      campaign.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : campaign.status === "Completed"
                        ? "bg-gray-200 text-gray-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {campaign.status}
                  </span>

                  <h3 className="text-lg font-semibold mb-2">
                    {campaign.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {campaign.description}
                  </p>

                  <span className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded mb-4">
                    {campaign.category}
                  </span>

                  {/* FUNDING */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>₹{campaign.raised?.toLocaleString() || 0}</span>
                      <span>₹{campaign.goal?.toLocaleString() || 0}</span>
                    </div>

                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${calculateProgress(
                            campaign.raised,
                            campaign.goal
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="flex justify-between text-sm text-gray-600 mb-4">
                    <span>{campaign.donors?.length || 0} donors</span>
                    <span>{getDaysLeft(campaign.endDate)} days left</span>
                  </div>

                  <p className="text-xs text-gray-500 mb-4">
                    Ends: {formatDate(campaign.endDate)}
                  </p>

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