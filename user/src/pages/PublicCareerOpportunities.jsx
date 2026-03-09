import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"

const PublicCareerOpportunities = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [jobTypeFilter, setJobTypeFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/career-opportunities")
      const data = await response.json()
      setJobs(data.jobs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !searchTerm ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = !jobTypeFilter || job.jobType === jobTypeFilter
    const matchesLocation = !locationFilter || job.location === locationFilter

    return matchesSearch && matchesType && matchesLocation
  })

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
        <h1 className="text-5xl font-bold">Career Opportunities</h1>
      </div>

      {/* INTRO SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT IMAGE */}
        <div>
          <img
            src="/images/career-opportunities.jpeg"
            alt="Career"
            className="rounded-lg shadow-lg w-full"
          />
        </div>

        {/* RIGHT TEXT */}
        <div>
          <p className="text-gray-700 leading-relaxed mb-4">
            The Career Opportunities section provides a platform for students and alumni to discover job and internship opportunities shared within the community network. This space helps members stay informed about relevant openings across various industries and organizations.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            By exploring these opportunities, users can apply for positions that match their skills, interests, and career goals. The platform also allows users to connect with members of the alumni network and request referrals, which can significantly improve their chances during the hiring process.
          </p>

          <p className="text-gray-700 leading-relaxed mb-4">
            Through this system, students and alumni can build meaningful professional connections while accessing valuable career opportunities. The goal is to create a supportive ecosystem where members help each other grow and succeed in their careers.
          </p>

          <p className="text-gray-700 mb-6 font-medium">
            So what are you waiting for!!!
          </p>

          <Link
            to="/login"
            className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded font-semibold"
          >
            Login to find a job
          </Link>
        </div>
      </div>




    </div>
  )
}

export default PublicCareerOpportunities