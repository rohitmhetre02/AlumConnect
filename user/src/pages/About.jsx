import React from 'react'

const About = () => {
  return (
    <div className="font-sans bg-gray-50">
      {/* HERO SECTION - Same as Home */}
      <section className="relative h-[75vh] overflow-hidden">
        {/* SLIDE 1 */}
        <div className="absolute inset-0 opacity-100">
          {/* Background Image */}
          <img
            src="/images/college-building.webp"
            alt="College"
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* CONTENT */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-4xl px-10 md:px-20 text-left">

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                About APCOER
              </h1>

              <p className="text-lg md:text-xl text-white mb-8">
                Excellence in Engineering Education & Research Since 2012
              </p>

              <button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition transform hover:scale-105 shadow-xl">
                Explore More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT CONTENT */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              About Anantrao Pawar College of Engineering and Research
            </h2>
            
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-4">
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
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* VISION */}
            <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Vision</h3>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-lg">
                Committed to comprehensive development of students through quality technical education.
              </p>
            </div>

            {/* MISSION */}
            <div className="bg-green-50 rounded-lg p-8 border border-green-100">
              <div className="flex items-center mb-6">
                <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-green-900">Mission</h3>
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

      
    </div>
  )
}

export default About
