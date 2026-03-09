import React, { useState } from "react";

const PublicContact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message sent successfully!");
  };

  return (
    <div className="bg-gray-100">

      {/* TOP BANNER */}
      <div
        className="w-full h-56 flex items-center justify-center text-white text-4xl font-bold"
        style={{
          background:
            "linear-gradient(90deg,#4b0018,#8c0020,#4b0018)"
        }}
      >
        Contact Us
      </div>

      {/* MAIN SECTION */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12">

        {/* LEFT SIDE */}
        <div>
          <p className="text-red-600 font-semibold">Get in Touch</p>

          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Contact Us
          </h2>

          <div className="w-24 h-1 bg-red-600 mb-8"></div>

          {/* ADDRESS */}
          <div className="flex gap-4 mb-6">
            <svg
              className="w-6 h-6 text-gray-700 mt-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657A8 8 0 1117.657 16.657z"
              />
            </svg>

            <p className="text-gray-700 leading-relaxed">
              A.B.M.S.PARISHAD <br />
              ANANTRAO PAWAR COLLEGE OF ENGINEERING & RESEARCH <br />
              S. No. 103, Shahu College Road, Parvati <br />
              Pune – 411009
            </p>
          </div>

          {/* PHONE */}
          <div className="flex gap-4 mb-4">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.49a1 1 0 01-.5 1.21L8 10.5a11 11 0 005.5 5.5l1.13-2.26a1 1 0 011.21-.5l4.49 1.5A1 1 0 0121 16.72V20a2 2 0 01-2 2h-1C9.72 22 2 14.28 2 5V5z"
              />
            </svg>

            <p className="text-gray-700">
              020-24218901 <br />
              020-24218959
            </p>
          </div>

          {/* EMAIL */}
          <div className="flex gap-4">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 12H8m8 4H8m8-8H8m12-4H4"
              />
            </svg>

            <p className="text-blue-700 font-medium">
              abmspcoe@yahoo.com
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="bg-white p-8 rounded-lg shadow">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME */}
            <div>
              <label className="block font-medium mb-2">
                Name *
              </label>

              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block font-medium mb-2">
                Email *
              </label>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* MOBILE */}
            <div>
              <label className="block font-medium mb-2">
                Mobile No.*
              </label>

              <input
                type="tel"
                name="phone"
                placeholder="Mobile Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block font-medium mb-2">
                Message
              </label>

              <textarea
                name="message"
                placeholder="Message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 font-semibold"
            >
              SEND MESSAGE
            </button>

          </form>
        </div>

      </div>
{/* LOCATION MAP SECTION */}
<div className="max-w-7xl mx-auto px-6 py-12">
  <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">
    Our Location
  </h2>

  <div className="w-24 h-1 bg-red-600 mx-auto mb-8"></div>

  <div className="bg-white rounded-lg shadow-lg overflow-hidden">

    <iframe
      src="https://www.google.com/maps?q=Anantrao+Pawar+College+of+Engineering+and+Research+Pune&output=embed"
      width="100%"
      height="450"
      style={{ border: 0 }}
      loading="lazy"
      allowFullScreen
      referrerPolicy="no-referrer-when-downgrade"
      title="APCOER Pune Location"
    />

  </div>
</div>
    </div>
  );
};

export default PublicContact;