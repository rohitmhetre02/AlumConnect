import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  UserIcon,
  HomeIcon,
  BuildingOfficeIcon,
  PhotoIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  CalendarIcon,
  HeartIcon,
  PhoneIcon
} from "@heroicons/react/24/outline";

const PublicNavbar = () => {
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [engageOpen, setEngageOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close dropdowns when closing mobile menu
    if (!mobileMenuOpen) {
      setDirectoryOpen(false);
      setEngageOpen(false);
    }
  };

  const handleDirectoryToggle = () => {
    setDirectoryOpen(!directoryOpen);
    setEngageOpen(false);
  };

  const handleEngageToggle = () => {
    setEngageOpen(!engageOpen);
    setDirectoryOpen(false);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setDirectoryOpen(false);
    setEngageOpen(false);
  };

  return (
    <>
      {/* TOP ADDRESS BAR */}
      <div className="bg-gray-100 text-sm text-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">

            <div className="text-center sm:text-left">
              <span className="hidden sm:inline">S. No. 103, Shahu College Road, Parvati, Pune - 411009</span>
              
            </div>

            <div className="flex gap-4 sm:gap-6 font-medium">
              <Link to="/" className="text-orange-500 hover:text-orange-600 transition-colors">Home</Link>
              <Link to="/login" className="hover:text-orange-500 transition-colors">Login</Link>
              <Link to="/signup" className="hover:text-orange-500 transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </div>

      {/* COLLEGE HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:items-center">

            {/* Logo and Founder Images Row */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              
              {/* Logo */}
              <div className="flex items-center justify-center">
                <img src="/images/apcoer-logo.webp" alt="College Logo" className="h-16 sm:h-20 w-auto object-contain" />
              </div>

              {/* Founder Image */}
              <div className="flex items-center justify-center">
                <img src="/images/founder.png" alt="Founder" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
            </div>

            {/* College Info */}
            <div className="text-center flex-1">
              <p className="text-xs sm:text-sm text-red-700 font-semibold">
                AKHIL BHARATIYA MARATHA SHIKSHAN PARISHAD'S
              </p>

              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                ANANTRAO PAWAR COLLEGE OF ENGINEERING & RESEARCH
              </h1>

              <p className="text-xs text-gray-600">
                (Approved by AICTE & Govt. of Maharashtra | Affiliated to Savitribai Phule Pune University)
              </p>

              <p className="text-red-600 text-xs sm:text-sm font-semibold">
                Accredited by NAAC with "A" Grade | NBA - Mechanical and Civil
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* MAIN NAVIGATION */}
      <nav className="bg-blue-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Mobile Menu Button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex justify-center flex-1">
              <div className="flex justify-center gap-6 lg:gap-10 font-medium text-sm lg:text-base">

                {/* HOME */}
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 flex items-center gap-1" : "hover:text-orange-400 flex items-center gap-1 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <HomeIcon className="w-4 h-4" />
                  Home
                </NavLink>

                {/* ABOUT */}
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 flex items-center gap-1" : "hover:text-orange-400 flex items-center gap-1 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <BuildingOfficeIcon className="w-4 h-4" />
                  About
                </NavLink>

                {/* DIRECTORY DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={handleDirectoryToggle}
                    className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Directory
                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${directoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {directoryOpen && (
                    <div className="absolute top-full left-0 bg-white text-gray-900 shadow-lg rounded-lg border min-w-[200px] mt-2 z-50">
                      <Link
                        to="/student-directory"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Student Directory
                      </Link>

                      <Link
                        to="/alumni-directory"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Alumni Directory
                      </Link>
                    </div>
                  )}
                </div>

                {/* MEMORIES */}
                <NavLink
                  to="/memories"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 flex items-center gap-1" : "hover:text-orange-400 flex items-center gap-1 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <PhotoIcon className="w-4 h-4" />
                  Memories
                </NavLink>

                {/* ENGAGE DROPDOWN */}
                <div className="relative">
                  <button
                    onClick={handleEngageToggle}
                    className="flex items-center gap-1 hover:text-orange-400 transition-colors"
                  >
                    <HeartIcon className="w-4 h-4" />
                    Engage
                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${engageOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {engageOpen && (
                    <div className="absolute top-full left-0 bg-white text-gray-900 shadow-lg rounded-lg border min-w-[220px] mt-2 z-50">
                      <Link
                        to="/opportunities"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <BriefcaseIcon className="w-4 h-4" />
                        Career Opportunities
                      </Link>

                      <Link
                        to="/mentor-student"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <AcademicCapIcon className="w-4 h-4" />
                        Mentor a Student
                      </Link>

                      <Link
                        to="/events"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        Upcoming Events
                      </Link>

                      <Link
                        to="/campaigns"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <HeartIcon className="w-4 h-4" />
                        Active Campaigns
                      </Link>
                    </div>
                  )}
                </div>

                {/* CONTACT */}
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 flex items-center gap-1" : "hover:text-orange-400 flex items-center gap-1 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <PhoneIcon className="w-4 h-4" />
                  Contact Us
                </NavLink>
              </div>
            </div>

            {/* Desktop Spacer */}
            <div className="hidden sm:block w-16"></div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden bg-blue-800 border-t border-blue-700">
              <div className="px-2 pt-2 pb-3 space-y-1">

                {/* HOME */}
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2" : "text-white hover:bg-blue-700 hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <HomeIcon className="w-5 h-5" />
                  Home
                </NavLink>

                {/* ABOUT */}
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2" : "text-white hover:bg-blue-700 hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <BuildingOfficeIcon className="w-5 h-5" />
                  About
                </NavLink>

                {/* DIRECTORY DROPDOWN - MOBILE */}
                <div>
                  <button
                    onClick={handleDirectoryToggle}
                    className="w-full text-white hover:bg-blue-700 hover:text-orange-400 px-3 py-2 rounded-md text-base font-medium flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      Directory
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${directoryOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {directoryOpen && (
                    <div className="mt-1 ml-4 space-y-1">
                      <Link
                        to="/student-directory"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Student Directory
                      </Link>

                      <Link
                        to="/alumni-directory"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        Alumni Directory
                      </Link>
                    </div>
                  )}
                </div>

                {/* MEMORIES */}
                <NavLink
                  to="/memories"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2" : "text-white hover:bg-blue-700 hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <PhotoIcon className="w-5 h-5" />
                  Memories
                </NavLink>

                {/* ENGAGE DROPDOWN - MOBILE */}
                <div>
                  <button
                    onClick={handleEngageToggle}
                    className="w-full text-white hover:bg-blue-700 hover:text-orange-400 px-3 py-2 rounded-md text-base font-medium flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <HeartIcon className="w-5 h-5" />
                      Engage
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${engageOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {engageOpen && (
                    <div className="mt-1 ml-4 space-y-1">
                      <Link
                        to="/opportunities"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        <BriefcaseIcon className="w-4 h-4" />
                        Career Opportunities
                      </Link>

                      <Link
                        to="/mentor-student"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        <AcademicCapIcon className="w-4 h-4" />
                        Mentor a Student
                      </Link>

                      <Link
                        to="/events"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        Upcoming Events
                      </Link>

                      <Link
                        to="/campaigns"
                        onClick={closeAllMenus}
                        className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-blue-600 px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        <HeartIcon className="w-4 h-4" />
                        Active Campaigns
                      </Link>
                    </div>
                  )}
                </div>

                {/* CONTACT */}
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    isActive ? "text-orange-400 bg-blue-700 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2" : "text-white hover:bg-blue-700 hover:text-orange-400 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2 transition-colors"
                  }
                  onClick={closeAllMenus}
                >
                  <PhoneIcon className="w-5 h-5" />
                  Contact Us
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default PublicNavbar;

