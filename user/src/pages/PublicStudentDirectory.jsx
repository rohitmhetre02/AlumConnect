import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const FALLBACK_IMAGE = 'https://picsum.photos/seed/student/200/200.jpg'

const PublicStudentDirectory = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [displayCount, setDisplayCount] = useState(12)
  const [imageErrors, setImageErrors] = useState({})

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/public/students")
        const data = await response.json()
        
        if (data.success) {
          setStudents(data.students || [])
        } else {
          console.error('API Error:', data.error)
          setStudents([])
        }
      } catch (error) {
        console.error('Error fetching students:', error)
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  const displayedStudents = students.slice(0, displayCount)
  const hasMore = students.length > displayCount

  const handleImageError = (studentId) => {
    setImageErrors(prev => ({
      ...prev,
      [studentId]: true
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
      </div>

      {/* STUDENT CARDS */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {displayedStudents.map((student) => {

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
                <h3 className="text-lg font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </h3>

                {/* Course/Program */}
                <p className="text-gray-600 text-sm">
                  {student.program || student.course || "Student"}
                </p>

                {/* Department */}
                <p className="text-gray-500 text-sm mt-2">
                  {student.department}
                </p>

                {/* Year */}
                <p className="text-gray-500 text-sm mb-4">
                  {student.year || student.batch || `Class of ${student.graduationYear}`}
                </p>

                {/* Button */}
                <Link
                  to="/login"
                  className="block w-full bg-green-600 text-white py-2 rounded-full font-medium hover:bg-green-700"
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
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Login to View More Students
            </Link>
          ) : students.length > 0 ? (
            <p className="text-gray-500 text-sm">
              Showing all {students.length} students
            </p>
          ) : (
            <p className="text-gray-500 text-sm">
              No students found
            </p>
          )}
        </div>

      </div>

    </div>
  )
}

export default PublicStudentDirectory
