import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-10">

          {/* Company */}
          <div>
            <h2 className="text-2xl font-bold text-purple-500">
              JobPortal
            </h2>
            <p className="mt-4 text-gray-400">
              Connecting talented professionals with top companies
              across the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Home</li>
              <li>Browse Jobs</li>
              <li>Companies</li>
              <li>About Us</li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Job Categories</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Software Developer</li>
              <li>UI/UX Designer</li>
              <li>Data Scientist</li>
              <li>Digital Marketing</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Subscribe
            </h3>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter Email"
                className="w-full px-4 py-2 rounded-l-md text-black"
              />
              <button className="bg-purple-600 px-4 rounded-r-md">
                Join
              </button>
            </div>
          </div>

        </div>

        <hr className="my-8 border-gray-800" />

        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500">
          <p>© 2026 JobPortal. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span>Privacy Policy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;