import React from "react"
import { Link } from "react-router-dom"

const PublicMentorAStudent = () => {
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
        <h1 className="text-5xl font-bold">Mentor a student</h1>
      </div>

      {/* CONTENT */}
<div className="max-w-6xl mx-auto px-6 py-10 text-gray-700 leading-relaxed">

<p className="mb-8 text-lg">
We provide you with a platform that enables mentees to interact with alumni as well as industry experts.
Students can post queries that can be answered by mentors or directly connect with a particular mentor
for personalized guidance. Mentors can review and respond to the queries based on their expertise and
professional experience.
</p>

<h2 className="text-3xl font-bold text-red-700 mb-4">
MENTORSHIP PROGRAM
</h2>

<p className="mb-6">
<b>Alumni Mentorship Program (AMP)</b> provides students a unique opportunity to connect with the
institution’s alumni network and build strong relationships with professionals. Students receive
guidance and advice related to academic growth, career planning, professional development,
and real-world industry experience. This communication channel helps build a strong and
supportive network between alumni and students.
</p>

<h3 className="font-semibold text-lg mb-3">
AI-Based Mentor Recommendation
</h3>

<p className="mb-6">
Our platform uses an <b>AI-based mentor recommendation system</b> to help students find the most
relevant mentors. The system analyzes different factors such as student interests, skills,
career goals, academic background, and mentor expertise. Based on this analysis, the platform
suggests the best mentors who can guide the student effectively.
</p>

<ul className="list-disc pl-6 space-y-2 mb-6">
<li>AI matches students with mentors having similar career paths.</li>
<li>Skill and interest-based mentor suggestions.</li>
<li>Personalized mentorship recommendations.</li>
<li>Improves mentor-mentee compatibility.</li>
<li>Helps students quickly connect with the right mentor.</li>
</ul>

<h3 className="font-semibold text-lg mb-3">
Features and goals of the program
</h3>

<ul className="list-disc pl-6 space-y-2 mb-6">
<li>Strong and secure communication platform for alumni and students.</li>
<li>AI-powered mentor matching system.</li>
<li>Continuous engagement between alumni and students.</li>
<li>Career guidance from experienced professionals.</li>
<li>Access to internship and job opportunities through alumni networks.</li>
<li>Professional networking and knowledge sharing.</li>
</ul>

<h3 className="font-semibold text-lg mb-3">
Expectations from Alumni Mentors
</h3>

<ul className="list-disc pl-6 space-y-2 mb-6">
<li>Provide career advice and professional guidance.</li>
<li>Share industry knowledge and real-world experiences.</li>
<li>Help students understand career opportunities.</li>
<li>Encourage students to develop professional skills.</li>
<li>Provide constructive feedback and suggestions.</li>
</ul>

<h3 className="font-semibold text-lg mb-3">
Students are expected to
</h3>

<ul className="list-disc pl-6 space-y-2 mb-6">
<li>Take a proactive role in building the mentoring relationship.</li>
<li>Clearly communicate career goals and expectations.</li>
<li>Respect mentor’s time and maintain professionalism.</li>
<li>Prepare questions before mentorship discussions.</li>
<li>Apply mentor guidance to improve career development.</li>
</ul>

<h3 className="font-semibold text-lg mb-3">
Students should not
</h3>

<ul className="list-disc pl-6 space-y-2 mb-10">
<li>Behave in an unprofessional manner.</li>
<li>Ask mentors for financial support.</li>
<li>Pressure mentors for job placement.</li>
<li>Contact mentors at inappropriate times.</li>
<li>Share private mentoring discussions publicly.</li>
</ul>

<div className="text-center">
<Link
to="/login"
className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded font-semibold"
>
Login to Mentorship Program
</Link>
</div>

</div>
    </div>
  )
}

export default PublicMentorAStudent