import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState({
    totalAlumni: 0,
    studentsConnected: 0,
    mentorshipSessions: 0,
    eventsHosted: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const slides = [
    {
      id: 0,
      image: "/images/college-building.webp",
      title: "Alumni! Together We Thrive...",
      subtitle:
        "Extending a helping hand for young alumni and guiding them to shape their future together.",
    },
    {
      id: 1,
      image: "/images/college-building2.webp",
      title: "Connect With Alumni Network",
      subtitle:
        "Build meaningful connections, mentorship opportunities and career growth.",
    },
  ];

  /* AUTO SLIDER */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  /* FETCH STATS */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching stats from API...');
        
        const response = await fetch('/public/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
        });
        
        console.log('📡 API Response status:', response.status);
        console.log('📡 Content-Type:', response.headers.get('content-type'));
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('✅ Stats data received:', data);
            
            setStats({
              totalAlumni: data.totalAlumni || 0,
              studentsConnected: data.studentsConnected || 0,
              mentorshipSessions: data.mentorshipSessions || 0,
              eventsHosted: data.eventsHosted || 0
            });
            
            console.log('📊 Stats updated:', {
              totalAlumni: data.totalAlumni || 0,
              studentsConnected: data.studentsConnected || 0,
              mentorshipSessions: data.mentorshipSessions || 0,
              eventsHosted: data.eventsHosted || 0
            });
          } else {
            const text = await response.text();
            console.warn('⚠️ Received non-JSON response:', text.substring(0, 200));
            // Set to zero to show no data until API is fixed
            setStats({
              totalAlumni: 0,
              studentsConnected: 0,
              mentorshipSessions: 0,
              eventsHosted: 0
            });
          }
        } else {
          console.warn('⚠️ API responded with status:', response.status);
          const text = await response.text();
          console.warn('⚠️ Response text:', text.substring(0, 200));
          
          // Set to zero to show no data until API is fixed
          setStats({
            totalAlumni: 0,
            studentsConnected: 0,
            mentorshipSessions: 0,
            eventsHosted: 0
          });
        }
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        console.error('❌ Error details:', error.message);
        
        // Set to zero to show no data until API is fixed
        setStats({
          totalAlumni: 0,
          studentsConnected: 0,
          mentorshipSessions: 0,
          eventsHosted: 0
        });
      } finally {
        setLoading(false);
        console.log('✅ Stats fetching completed');
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="font-sans">
      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] md:h-[75vh] lg:h-[80vh] overflow-hidden">

        {/* SLIDES */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"
              }`}
          >
            {/* Background Image */}
            <img
              src={slide.image}
              alt="College"
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            {/* CONTENT */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-4xl px-4 sm:px-6 md:px-10 lg:px-20 text-left">

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-6 sm:mb-8">
                  {slide.subtitle}
                </p>

                <button
                  onClick={() => navigate("/signup")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-full text-sm sm:text-base md:text-lg transition transform hover:scale-105 shadow-xl"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* SLIDER DOTS */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 sm:h-3 rounded-full transition-all ${currentSlide === index
                  ? "bg-white w-6 sm:w-8"
                  : "bg-white/50 w-2 sm:w-3"
                }`}
            />
          ))}
        </div>
      </section>


      {/* STATS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              PLATFORM STATISTICS
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              Join our thriving alumni network and be part of something bigger
            </p>
          </div>

          {/* Stats Grid - Centered Cards */}
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl w-full">
              
              {/* Total Alumni Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
                  </svg>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
                  ) : (
                    `${stats.totalAlumni.toLocaleString()}+`
                  )}
                </div>
                <p className="text-gray-700 font-semibold text-sm sm:text-base">Total Alumni</p>
                <p className="text-gray-500 text-xs mt-1">Professional Network</p>
              </div>

              {/* Students Connected Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
                  ) : (
                    `${stats.studentsConnected.toLocaleString()}+`
                  )}
                </div>
                <p className="text-gray-700 font-semibold text-sm sm:text-base">Students Connected</p>
                <p className="text-gray-500 text-xs mt-1">Career Growth</p>
              </div>

              {/* Mentorship Sessions Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
                  ) : (
                    `${stats.mentorshipSessions.toLocaleString()}+`
                  )}
                </div>
                <p className="text-gray-700 font-semibold text-sm sm:text-base">Mentorship Sessions</p>
                <p className="text-gray-500 text-xs mt-1">Knowledge Sharing</p>
              </div>

              {/* Events Hosted Card */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-10 w-20 mx-auto rounded"></div>
                  ) : (
                    `${stats.eventsHosted.toLocaleString()}+`
                  )}
                </div>
                <p className="text-gray-700 font-semibold text-sm sm:text-base">Events Hosted</p>
                <p className="text-gray-500 text-xs mt-1">Community Building</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              FEATURES
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              Discover everything our alumni platform has to offer - from networking opportunities to mentorship programs
            </p>
          </div>

          {/* Features Grid - 6 Cards with Simple Professional Colors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">

            {/* Networking Card */}
            <div onClick={() => navigate('/login')} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 cursor-pointer group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Networking</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Connect with fellow alumni, build professional relationships, and expand your network across industries and locations.
              </p>
              <div className="flex items-center text-gray-700 font-semibold group-hover:text-gray-900">
                <span>Login to Connect</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Opportunities Card */}
            <div onClick={() => navigate('/login')} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 cursor-pointer group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.002 9.002 0 0112 21a9.002 9.002 0 01-9-9.745M12 3v9m0 0l3-3m-3 3l-3-3" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Opportunities</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Discover career opportunities, job openings, internships, and professional development resources shared by alumni.
              </p>
              <div className="flex items-center text-gray-700 font-semibold group-hover:text-gray-900">
                <span>Login to Explore</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Events Card */}
            <div onClick={() => navigate('/login')} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 cursor-pointer group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Events</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Stay updated with alumni meetups, webinars, workshops, and special events organized by the association.
              </p>
              <div className="flex items-center text-gray-700 font-semibold group-hover:text-gray-900">
                <span>Login to View</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Campaigns Card */}
            <div onClick={() => navigate('/login')} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 cursor-pointer group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Campaigns</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Support meaningful causes, contribute to fundraising initiatives, and make a difference through alumni campaigns.
              </p>
              <div className="flex items-center text-gray-700 font-semibold group-hover:text-gray-900">
                <span>Login to Support</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Mentorship Card */}
            <div onClick={() => navigate('/login')} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 cursor-pointer group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mentorship</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Share your expertise, guide current students, and participate in our alumni mentorship programs.
              </p>
              <div className="flex items-center text-gray-700 font-semibold group-hover:text-gray-900">
                <span>Login to Mentor</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* College News Card */}
            <div onClick={() => navigate('/login')} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-8 cursor-pointer group">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">College News</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                Stay updated with the latest news, achievements, and developments from your alma mater.
              </p>
              <div className="flex items-center text-gray-700 font-semibold group-hover:text-gray-900">
                <span>Login to Read</span>
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

          </div>
        </div>
      </section>

     
    </div>
  );
};

export default Home;