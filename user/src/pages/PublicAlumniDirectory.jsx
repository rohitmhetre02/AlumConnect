import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const PublicAlumniDirectory = () => {
  const [alumni, setAlumni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState({})

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/public/alumni`)
        const data = await response.json()
        
        if (data.success && data.alumni) {
          // Show only latest 5 alumni
          const latestAlumni = data.alumni.slice(0, 5)
          setAlumni(latestAlumni)
          console.log('✅ Successfully loaded alumni from public API:', latestAlumni)
          
          latestAlumni.forEach(alumnus => {
            console.log(`Alumnus: "${alumnus.firstName} ${alumnus.lastName}"`)
            console.log(`  Position: ${alumnus.position || 'Not specified'}`)
            console.log(`  Company: ${alumnus.currentCompany || 'Not specified'}`)
            console.log(`  Department: ${alumnus.department}`)
            console.log(`  Graduation Year: ${alumnus.graduationYear}`)
            console.log('---')
          })
        } else {
          console.error('API Error:', data.error || 'No alumni found')
          setError(data.error || 'No alumni found')
          setAlumni([])
        }
      } catch (error) {
        console.error('Error fetching alumni:', error)
        setError(error.message)
        setAlumni([])
      } finally {
        setLoading(false)
      }
    }

    fetchAlumni()
  }, [])

  const handleImageError = (alumnusId) => {
    setImageErrors(prev => ({
      ...prev,
      [alumnusId]: true
    }))
  }

  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null') {
      return null
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
        <p className="text-xl mt-4 opacity-90">Connect with our successful alumni network</p>
      </div>

      {/* ALUMNI CARDS */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Alumni</h2>

        {alumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {alumni.map((alumnus) => {
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {alumnus.firstName} {alumnus.lastName}
                  </h3>

                  {/* Position */}
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {alumnus.position || "Professional"}
                  </p>

                  {/* Company */}
                  {alumnus.currentCompany && (
                    <p className="text-gray-500 text-sm mb-2">
                      {alumnus.currentCompany}
                    </p>
                  )}

                  {/* Department */}
                  <p className="text-gray-500 text-sm mb-1">
                    {alumnus.department}
                  </p>

                  {/* Year */}
                  <p className="text-gray-500 text-sm mb-4">
                    Class of {alumnus.graduationYear}
                  </p>

                  {/* View Profile Button */}
                  <Link
                    to="/login"
                    className="block w-full bg-blue-600 text-white py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error ? "Unable to Load Alumni" : "No Alumni Available"}
            </h3>
            <p className="text-gray-600">
              {error 
                ? "There was an error loading alumni. Please try again later."
                : "No alumni are currently available in the directory."
              }
            </p>
          </div>
        )}

        {/* LOAD MORE / LOGIN BUTTON */}
        <div className="text-center mt-12">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Login to View More Alumni
          </Link>
        </div>

      </div>

    </div>
  )
}

export default PublicAlumniDirectory