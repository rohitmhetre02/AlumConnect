import { Link, NavLink } from "react-router-dom";
import { useState } from "react";

const PublicNavbar = () => {

  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [engageOpen, setEngageOpen] = useState(false);

  return (
    <>
      {/* TOP ADDRESS BAR */}
      <div className="bg-gray-100 text-sm text-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-2 flex justify-between items-center">

          <div>
            S. No. 103, Shahu College Road, Parvati, Pune - 411009
          </div>

          <div className="flex gap-6 font-medium">
            <Link to="/" className="text-orange-500">Home</Link>
            <Link to="/login" className="hover:text-orange-500">Login</Link>
            <Link to="/signup" className="hover:text-orange-500">Register</Link>
          </div>

        </div>
      </div>

      {/* COLLEGE HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          <img src="/images/apcoer-logo.webp" alt="College Logo" className="h-20" />

          <div className="text-center">
            <p className="text-sm text-red-700 font-semibold">
              AKHIL BHARATIYA MARATHA SHIKSHAN PARISHAD'S
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              ANANTRAO PAWAR COLLEGE OF ENGINEERING & RESEARCH
            </h1>

            <p className="text-xs text-gray-600">
              (Approved by AICTE & Govt. of Maharashtra | Affiliated to Savitribai Phule Pune University)
            </p>

            <p className="text-red-600 text-sm font-semibold">
              Accredited by NAAC with "A" Grade | NBA - Mechanical and Civil
            </p>
          </div>

          <img src="/images/founder.png" alt="Founder" className="h-20" />

        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <nav className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center gap-10 py-4 font-medium text-sm">

            {/* HOME */}
            <NavLink to="/" className={({isActive}) =>
              isActive ? "text-orange-400" : "hover:text-orange-400"
            }>
              Home
            </NavLink>

            {/* ABOUT */}
            <NavLink to="/about" className={({isActive}) =>
              isActive ? "text-orange-400" : "hover:text-orange-400"
            }>
              About
            </NavLink>

            {/* DIRECTORY DROPDOWN */}
            <div className="relative">

              <button
                onClick={() => {
                  setDirectoryOpen(!directoryOpen);
                  setEngageOpen(false);
                }}
                className="flex items-center gap-1 hover:text-orange-400"
              >
                Directory
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {directoryOpen && (
                <div className="absolute top-full left-0 bg-white text-gray-900 shadow-lg rounded-lg border min-w-[200px] mt-2 z-50">

                  <Link
                    to="/student-directory"
                    onClick={() => setDirectoryOpen(false)}
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Student Directory
                  </Link>

                  <Link
                    to="/alumni-directory"
                    onClick={() => setDirectoryOpen(false)}
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Alumni Directory
                  </Link>

                </div>
              )}

            </div>

            {/* MEMORIES */}
            <NavLink to="/memories" className={({isActive}) =>
              isActive ? "text-orange-400" : "hover:text-orange-400"
            }>
              Memories
            </NavLink>

            {/* ENGAGE DROPDOWN */}
            <div className="relative">

              <button
                onClick={() => {
                  setEngageOpen(!engageOpen);
                  setDirectoryOpen(false);
                }}
                className="flex items-center gap-1 hover:text-orange-400"
              >
                Engage
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {engageOpen && (
                <div className="absolute top-full left-0 bg-white text-gray-900 shadow-lg rounded-lg border min-w-[220px] mt-2 z-50">

                  <Link
                    to="/opportunities"
                    onClick={() => setEngageOpen(false)}
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Career Opportunities
                  </Link>

                  <Link
                    to="/mentor-student"
                    onClick={() => setEngageOpen(false)}
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Mentor a Student
                  </Link>

                  <Link
                    to="/events"
                    onClick={() => setEngageOpen(false)}
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Upcoming Events
                  </Link>

                  <Link
                    to="/campaigns"
                    onClick={() => setEngageOpen(false)}
                    className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600"
                  >
                    Active Campaigns
                  </Link>

                </div>
              )}

            </div>

            {/* CONTACT */}
            <NavLink to="/contact" className={({isActive}) =>
              isActive ? "text-orange-400" : "hover:text-orange-400"
            }>
              Contact Us
            </NavLink>

          </div>
        </div>
      </nav>
    </>
  );
};

export default PublicNavbar;