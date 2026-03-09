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
      <section className="relative h-[75vh] overflow-hidden">

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
              <div className="max-w-4xl px-10 md:px-20 text-left">

                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                  {slide.title}
                </h1>

                <p className="text-lg md:text-xl text-white mb-8">
                  {slide.subtitle}
                </p>

                <button
                  onClick={() => navigate("/signup")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-xl"
                >
                  Join Now
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* SLIDER DOTS */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all ${currentSlide === index
                  ? "bg-white w-8"
                  : "bg-white/50 w-3"
                }`}
            />
          ))}
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">

            {/* CONNECT */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" />
                </svg>
              </div>

              <h3 className="text-xl font-bold mb-2">Connect</h3>
              <p className="text-gray-600">
                Build meaningful connections with fellow alumni
              </p>
            </div>

            {/* MENTOR */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5" />
                </svg>
              </div>

              <h3 className="text-xl font-bold mb-2">Mentor</h3>
              <p className="text-gray-600">
                Guide and inspire current students
              </p>
            </div>

            {/* ENGAGE */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10" />
                </svg>
              </div>

              <h3 className="text-xl font-bold mb-2">Engage</h3>
              <p className="text-gray-600">
                Participate in events and activities
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">

            <div>
              <div className="text-4xl font-bold text-blue-600">12,500+</div>
              <p className="text-gray-600">Total Alumni</p>
            </div>

            <div>
              <div className="text-4xl font-bold text-green-600">4,200+</div>
              <p className="text-gray-600">Students Connected</p>
            </div>

            <div>
              <div className="text-4xl font-bold text-purple-600">1,800+</div>
              <p className="text-gray-600">Mentorship Sessions</p>
            </div>

            <div>
              <div className="text-4xl font-bold text-orange-600">350+</div>
              <p className="text-gray-600">Events Hosted</p>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;