import React from 'react'

const About = () => {
  return (
    <div className="font-sans bg-gray-50">
      {/* HERO SECTION */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] md:h-[75vh] lg:h-[80vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/college-building.webp"
            alt="College"
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* CONTENT */}
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-4xl px-4 sm:px-6 md:px-10 lg:px-20 text-left">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6">
              About APCOER
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white mb-6 sm:mb-8">
              Excellence in Engineering Education & Research Since 2012
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 md:px-8 rounded-full text-sm sm:text-base md:text-lg transition transform hover:scale-105 shadow-xl">
              Explore More
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT CONTENT */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
              About Anantrao Pawar College of Engineering and Research
            </h2>
            
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
              <p className="text-lg">
                Anantrao Pawar College of Engineering and Research is situated in nation's education hub, Pune and recognized for its quality education and research. It is institute of Akhil Bhartiya Maratha Shikshan Parishad, Parvati Pune 09, an educational trust was founded by a team of renowned educationists and social reformers.
              </p>
              
              <p className="text-lg">
                The institute is situated in area of 10 acres of land surrounded by beautiful landscape of Sahyadri Hills of Western Ghat nearing to famous Parvati Hills. The institute is established in 2012 having 5 UG and 2 PG courses affiliated to SPPU, Pune.
              </p>
              
              <p className="text-lg">
                Institute is on creating versatile engineers who can apply their knowledge and skills in any field across globe. Highly qualified faculty members, well equipped laboratories, extensive industry – academia interactions all serve to make engineering education at APCOER campus a unique and enriching experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* VISION */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Vision</h3>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-lg">
                Committed to comprehensive development of students through quality technical education.
              </p>
            </div>

            {/* MISSION */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Mission</h3>
              </div>
              
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li className="text-lg">
                    To Provide state of art infrastructure that shall create ambience to encourage novel ideas, research activities and consultancy services.
                  </li>
                  <li className="text-lg">
                    To inspire students in creation & entrepreneurship.
                  </li>
                  <li className="text-lg">
                    To create future technocrats with intelligence, technical skills, & good ethical moral values so as to serve needs of society & industries.
                  </li>
                  <li className="text-lg">
                    To provide healthy Teaching-Learning environment that will cultivate contemporary research activities, innovations & inventions.
                  </li>
                  <li className="text-lg">
                    To develop center of excellence in technical education.
                  </li>
                </ol>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ADDITIONAL INFO SECTIONS */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              INSTITUTE HIGHLIGHTS
            </h2>
            <div className="w-24 h-1 bg-red-600 mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 max-w-3xl mx-auto">
              Key features and achievements that make APCOER a premier engineering institution
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Infrastructure Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Modern Infrastructure</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                State-of-the-art facilities spread across 10 acres with well-equipped laboratories and modern classrooms.
              </p>
            </div>

            {/* Faculty Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Expert Faculty</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Highly qualified and experienced faculty members dedicated to providing quality education and mentorship.
              </p>
            </div>

            {/* Research Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Research Focus</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Strong emphasis on research, innovation, and consultancy services with contemporary research activities.
              </p>
            </div>

            {/* Industry Interface Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A9.002 9.002 0 0112 21a9.002 9.002 0 01-9-9.745M12 3v9m0 0l3-3m-3 3l-3-3" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Industry Interface</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Extensive industry-academia interactions creating opportunities for practical exposure and placements.
              </p>
            </div>

            {/* Programs Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Diverse Programs</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Offering 5 undergraduate and 2 postgraduate programs affiliated to Savitribai Phule Pune University.
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Prime Location</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Located in Pune's education hub with beautiful landscape of Sahyadri Hills near Parvati Hills.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  )
}

export default About
