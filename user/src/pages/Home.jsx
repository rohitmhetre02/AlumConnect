import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
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

      {/* FEATURE SECTION */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">

            {/* CONNECT */}
            <div className="text-center group">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
                </svg>
              </div>

              <h3 className="text-lg sm:text-xl font-bold mb-2">Connect</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Build meaningful connections with fellow alumni
              </p>
            </div>

            {/* MENTOR */}
            <div className="text-center group">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5" />
                </svg>
              </div>

              <h3 className="text-lg sm:text-xl font-bold mb-2">Mentor</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Guide and inspire current students
              </p>
            </div>

            {/* ENGAGE */}
            <div className="text-center group sm:col-span-2 lg:col-span-1">
              <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10" />
                </svg>
              </div>

              <h3 className="text-lg sm:text-xl font-bold mb-2">Engage</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Participate in events and activities
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">

            <div className="group">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 group-hover:scale-105 transition-transform">12,500+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Total Alumni</p>
            </div>

            <div className="group">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 group-hover:scale-105 transition-transform">4,200+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Students Connected</p>
            </div>

            <div className="group">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 group-hover:scale-105 transition-transform">1,800+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Mentorship Sessions</p>
            </div>

            <div className="group">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 group-hover:scale-105 transition-transform">350+</div>
              <p className="text-gray-600 text-sm sm:text-base mt-1">Events Hosted</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;