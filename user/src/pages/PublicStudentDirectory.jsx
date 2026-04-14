import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const PublicStudentDirectory = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState({})

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/public/students`)
        const data = await response.json()
        
        if (data.success && data.students) {
          // Show only latest 5 students
          const latestStudents = data.students.slice(0, 5)
          setStudents(latestStudents)
          console.log('✅ Successfully loaded students from public API:', latestStudents)
          
          latestStudents.forEach(student => {
            console.log(`Student: "${student.firstName} ${student.lastName}"`)
            console.log(`  Program: ${student.program || student.course || 'Not specified'}`)
            console.log(`  Department: ${student.department}`)
            console.log(`  Year: ${student.year || student.batch || `Class of ${student.graduationYear}`}`)
            console.log('---')
          })
        } else {
          console.error('API Error:', data.error || 'No students found')
          setError(data.error || 'No students found')
          setStudents([])
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        setError(error.message)
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const handleImageError = (studentId) => {
    setImageErrors(prev => ({
      ...prev,
      [studentId]: true
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
        <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
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
          backgroundColor: "#166534"
        }}
      >
        <h1 className="text-5xl font-bold">Student Directory</h1>
        <p className="text-xl mt-4 opacity-90">Meet our talented student community</p>
      </div>

      {/* STUDENT CARDS */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Students</h2>

        {students.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            {students.map((student) => {
              const initials =
                (student.firstName?.charAt(0) || "") +
                (student.lastName?.charAt(0) || "")

              return (
                <div
                  key={student._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6 text-center"
                >
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl font-bold overflow-hidden">
                      {student.profileImage && !imageErrors[student._id] ? (
                        <img
                          src={getValidImageUrl(student.profileImage)}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(student._id)}
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {student.firstName} {student.lastName}
                  </h3>

                  {/* Course/Program */}
                  <p className="text-gray-600 text-sm font-medium mb-1">
                    {student.program || student.course || "Student"}
                  </p>

                  {/* Department */}
                  <p className="text-gray-500 text-sm mb-1">
                    {student.department}
                  </p>

                  {/* Year */}
                  <p className="text-gray-500 text-sm mb-4">
                    {student.year || student.batch || `Class of ${student.graduationYear}`}
                  </p>

                  {/* View Profile Button */}
                  <Link
                    to="/login"
                    className="block w-full bg-green-600 text-white py-2 rounded-full font-medium hover:bg-green-700 transition-colors"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error ? "Unable to Load Students" : "No Students Available"}
            </h3>
            <p className="text-gray-600">
              {error 
                ? "There was an error loading students. Please try again later."
                : "No students are currently available in the directory."
              }
            </p>
          </div>
        )}

        {/* LOAD MORE / LOGIN BUTTON */}
        <div className="text-center mt-12">
          <Link
            to="/login"
            className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Login to View More Students
          </Link>
        </div>

      </div>

    </div>
  )
}

export default PublicStudentDirectory
