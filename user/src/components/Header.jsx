import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActivePath = (path) => {
    return location.pathname === path
  }

  return (
    <header className="bg-white">
      {/* TOP NAVBAR */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </div>
                <span className="text-xl font-bold text-gray-900">AlumConnect</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-gray-700 hover:text-blue-600 font-medium transition-colors ${
                  isActivePath('/') ? 'text-blue-600' : ''
                }`}
              >
                Home
              </Link>
              <Link 
                to="/directory" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Directory
              </Link>
              <Link 
                to="/events" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Events
              </Link>
              <Link 
                to="/mentorship" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Mentorship
              </Link>
              <Link 
                to="/gallery" 
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Gallery
              </Link>
            </nav>

            {/* Right side buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/login" 
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-2 space-y-1">
              <Link 
                to="/" 
                className={`block px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium ${
                  isActivePath('/') ? 'text-blue-600 bg-blue-50' : ''
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/directory" 
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Directory
              </Link>
              <Link 
                to="/events" 
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Events
              </Link>
              <Link 
                to="/mentorship" 
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Mentorship
              </Link>
              <Link 
                to="/gallery" 
                className="block px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Gallery
              </Link>
              <div className="pt-2 border-t border-gray-200">
                <Link 
                  to="/login" 
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="block px-3 py-2 mt-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* COLLEGE HEADER SECTION */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* College Logo */}
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              
              {/* College Info */}
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  ANANTRAO PAWAR COLLEGE OF ENGINEERING & RESEARCH
                </h1>
                <p className="text-sm text-gray-600">PUNE</p>
                <p className="text-xs text-gray-500">
                  Approved by AICTE & Govt. of Maharashtra | Affiliated to Savitribai Phule Pune University
                </p>
              </div>
            </div>

            {/* Profile Circle */}
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* SECOND NAVBAR */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-12">
            <nav className="flex items-center space-x-8">
              <Link 
                to="/" 
                className={`text-white hover:text-blue-100 font-medium transition-colors ${
                  isActivePath('/') ? 'text-blue-100 border-b-2 border-white pb-1' : ''
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                About
              </Link>
              <Link 
                to="/prominent-alumni" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Prominent Alumni
              </Link>
              <Link 
                to="/reunion" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Reunion
              </Link>
              <Link 
                to="/blog" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Blog
              </Link>
              <Link 
                to="/engage" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Engage
              </Link>
              <Link 
                to="/contact" 
                className="text-white hover:text-blue-100 font-medium transition-colors"
              >
                Contact Us
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
