import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const FALLBACK_IMAGE = 'https://picsum.photos/seed/alumni/200/200.jpg'

const PublicAlumniDirectory = () => {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(12)
  const [imageErrors, setImageErrors] = useState({})

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/public/alumni")
        const data = await response.json()
        
        if (data.success) {
          setAlumni(data.alumni || [])
        } else {
          console.error('API Error:', data.error)
          setAlumni([])
        }
      } catch (error) {
        console.error('Error fetching alumni:', error)
        setAlumni([])
      } finally {
        setLoading(false)
      }
    }

    fetchAlumni()
  }, [])

  const displayedAlumni = alumni.slice(0, displayCount)
  const hasMore = alumni.length > displayCount

  const handleImageError = (alumnusId) => {
    setImageErrors(prev => ({
      ...prev,
      [alumnusId]: true
    }))
  }

  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null') {
      return FALLBACK_IMAGE
    }
    return imageUrl
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="w-full">

      {/* HERO BANNER */}
      <div
        className="w-full py-20 text-center text-white"
        style={{
          backgroundImage: "url('/images/banner-pattern.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#7c1d1d"
        }}
      >
        <h1 className="text-5xl font-bold">Alumni Directory</h1>
      </div>


      {/* ALUMNI CARDS */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {displayedAlumni.map((alumnus) => {

            const initials =
              (alumnus.firstName?.charAt(0) || "") +
              (alumnus.lastName?.charAt(0) || "")

            return (
              <div
                key={alumnus._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 text-center"
              >

                {/* Avatar */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold overflow-hidden">
                    {alumnus.profileImage && !imageErrors[alumnus._id] ? (
                      <img
                        src={getValidImageUrl(alumnus.profileImage)}
                        alt={`${alumnus.firstName} ${alumnus.lastName}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(alumnus._id)}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {alumnus.firstName} {alumnus.lastName}
                </h3>

                {/* Position */}
                <p className="text-gray-600 text-sm">
                  {alumnus.position || "Alumni"}
                </p>

                {/* Department */}
                <p className="text-gray-500 text-sm mt-2">
                  {alumnus.department}
                </p>

                {/* Year */}
                <p className="text-gray-500 text-sm mb-4">
                  {alumnus.graduationYear}
                </p>

                {/* Button */}
                <Link
                  to="/login"
                  className="block w-full bg-blue-600 text-white py-2 rounded-full font-medium hover:bg-blue-700"
                >
                  View Profile
                </Link>

              </div>
            )
          })}

        </div>

        {/* LOAD MORE / LOGIN BUTTON */}
        <div className="text-center mt-12">
          {hasMore ? (
            <Link
              to="/login"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Login to View More Alumni
            </Link>
          ) : alumni.length > 0 ? (
            <p className="text-gray-500 text-sm">
              Showing all {alumni.length} alumni
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              No alumni found
            </p>
          )}
        </div>

      </div>

    </div>
  )
}

export default PublicAlumniDirectory