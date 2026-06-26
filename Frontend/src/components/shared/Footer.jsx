import React from "react";
import {
  BriefcaseBusiness,
  ArrowRight,
  Send,
  Sparkles,
} from "lucide-react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden mt-28">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50 to-violet-100"></div>

      {/* Purple Glow */}
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-500/20 rounded-full blur-[130px]"></div>

      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-fuchsia-400/20 rounded-full blur-[150px]"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">

        {/* ================= CTA SECTION ================= */}

        <div
          className="
          relative
          overflow-hidden
          rounded-[35px]
          bg-gradient-to-r
          from-purple-700
          via-violet-600
          to-fuchsia-600
          p-10
          md:p-14
          shadow-[0_25px_60px_rgba(139,92,246,0.35)]
          "
        >

          {/* Decorative Circles */}

          <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-white/10"></div>

          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white/10 blur-xl"></div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">

            {/* LEFT */}

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 bg-white/15 px-5 py-2 rounded-full backdrop-blur-lg">

                <Sparkles size={18} />

                <span className="text-sm font-medium">
                  AI Powered Career Platform
                </span>

              </div>

              <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white leading-tight">

                Your Dream Career
                <br />

                Starts With

                <span className="text-yellow-300"> Hire Nest.</span>

              </h2>

              <p className="mt-6 text-purple-100 text-lg leading-8">

                Explore thousands of verified jobs, connect with top recruiters,
                build your professional profile, and take the next big step in
                your career journey.

              </p>

            </div>

            {/* RIGHT */}

            <div className="flex flex-col sm:flex-row gap-5">

              <Link to="/browse">
                <button
                  className=" 
                    px-8
                    py-4
                    rounded-2xl
                    bg-white
                    text-purple-700
                    font-semibold
                    shadow-xl
                    hover:scale-105
                    transition-all
                    duration-300
                    flex
                    items-center
                    gap-2
                    cursor-pointer">
                  Browse Jobs
                  <ArrowRight size={18} />
                </button>
              </Link>

            </div>

          </div>

        </div>

        {/* ================= STATS ================= */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14">

          <div
            className="
            rounded-3xl
            bg-white/70
            backdrop-blur-xl
            border
            border-purple-100
            p-8
            text-center
            hover:-translate-y-2
            transition-all
            duration-300
            shadow-lg
            "
          >

            <h3 className="text-4xl font-bold text-purple-700">
              40K+
            </h3>

            <p className="mt-3 text-gray-600">
              Active Jobs
            </p>

          </div>

          <div
            className="
            rounded-3xl
            bg-white/70
            backdrop-blur-xl
            border
            border-purple-100
            p-8
            text-center
            hover:-translate-y-2
            transition-all
            duration-300
            shadow-lg
            "
          >

            <h3 className="text-4xl font-bold text-purple-700">
              1,500+
            </h3>

            <p className="mt-3 text-gray-600">
              Hiring Companies
            </p>

          </div>

          <div
            className="
            rounded-3xl
            bg-white/70
            backdrop-blur-xl
            border
            border-purple-100
            p-8
            text-center
            hover:-translate-y-2
            transition-all
            duration-300
            shadow-lg
            "
          >

            <h3 className="text-4xl font-bold text-purple-700">
              98%
            </h3>

            <p className="mt-3 text-gray-600">
              Successful Placements
            </p>

          </div>

          <div
            className="
            rounded-3xl
            bg-white/70
            backdrop-blur-xl
            border
            border-purple-100
            p-8
            text-center
            hover:-translate-y-2
            transition-all
            duration-300
            shadow-lg
            "
          >

            <h3 className="text-4xl font-bold text-purple-700">
              24/7
            </h3>

            <p className="mt-3 text-gray-600">
              Career Support
            </p>

          </div>

        </div>

        {/* ================= MAIN FOOTER ================= */}

        <div
          className="
          mt-16
          rounded-[35px]
          bg-white/70
          backdrop-blur-2xl
          border
          border-purple-200
          shadow-[0_20px_60px_rgba(139,92,246,0.15)]
          p-10
          md:p-14
          "
        >

          <div className="grid lg:grid-cols-5 md:grid-cols-2 gap-10">

            {/* ================= LOGO ================= */}

            <div className="lg:col-span-2">

              <div className="flex items-center gap-3">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-fuchsia-500 flex items-center justify-center shadow-lg">

                  <BriefcaseBusiness className="text-white" size={28} />

                </div>

                <div>

                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-700 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                    Hire Nest
                  </h2>

                  <p className="text-sm text-gray-500">
                    AI Powered Hiring Platform
                  </p>

                </div>

              </div>

              <p className="mt-6 text-gray-600 leading-8">

                Hire Nest helps professionals connect with the world's
                leading companies through intelligent job matching,
                verified recruiters, AI-powered recommendations,
                resume optimization, and career growth opportunities.

              </p>

              <div className="flex gap-4 mt-8">

                <a
                  href="#"
                  className="
                  w-12
                  h-12
                  rounded-xl
                  bg-purple-100
                  flex
                  items-center
                  justify-center
                  text-purple-700
                  hover:bg-purple-600
                  hover:text-white
                  transition-all
                  duration-300
                  hover:scale-110
                  "
                >
                  <FaFacebookF />
                </a>

                <a
                  href="#"
                  className="
                  w-12
                  h-12
                  rounded-xl
                  bg-purple-100
                  flex
                  items-center
                  justify-center
                  text-purple-700
                  hover:bg-sky-500
                  hover:text-white
                  transition-all
                  duration-300
                  hover:scale-110
                  "
                >
                  <FaTwitter />
                </a>

                <a
                  href="#"
                  className="
                  w-12
                  h-12
                  rounded-xl
                  bg-purple-100
                  flex
                  items-center
                  justify-center
                  text-purple-700
                  hover:bg-pink-500
                  hover:text-white
                  transition-all
                  duration-300
                  hover:scale-110
                  "
                >
                  <FaInstagram />
                </a>

                <a
                  href="#"
                  className="
                  w-12
                  h-12
                  rounded-xl
                  bg-purple-100
                  flex
                  items-center
                  justify-center
                  text-purple-700
                  hover:bg-blue-700
                  hover:text-white
                  transition-all
                  duration-300
                  hover:scale-110
                  "
                >
                  <FaLinkedinIn />
                </a>

                <a
                  href="#"
                  className="
                  w-12
                  h-12
                  rounded-xl
                  bg-purple-100
                  flex
                  items-center
                  justify-center
                  text-purple-700
                  hover:bg-gray-900
                  hover:text-white
                  transition-all
                  duration-300
                  hover:scale-110
                  "
                >
                  <FaGithub />
                </a>

              </div>

            </div>

            {/* ================= QUICK LINKS ================= */}

            <div>

              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Quick Links
              </h3>

              <ul className="space-y-4 text-gray-600">

                <li
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="hover:text-purple-600 hover:translate-x-2 transition-all cursor-pointer">
                  Home
                </li>

                <li className="hover:text-purple-600 hover:translate-x-2 transition-all cursor-pointer">
                  <Link to="/browse">Browse</Link>
                </li>

                <li className="hover:text-purple-600 hover:translate-x-2 transition-all cursor-pointer">
                  <Link to="/jobs">Companies</Link>
                </li>

                <li className="hover:text-purple-600 hover:translate-x-2 transition-all cursor-pointer">
                  <Link to="/savedjobs">Saved Jobs</Link>
                </li>

                <li className="hover:text-purple-600 hover:translate-x-2 transition-all cursor-pointer">
                  <Link to="/events">Tech Events</Link>
                </li>

                <li
                  onClick={() =>
                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    })
                  }
                  className="hover:text-purple-600 hover:translate-x-2 transition-all cursor-pointer">
                  About Us
                </li>

              </ul>

            </div>

            {/* ================= JOB CATEGORIES ================= */}

            <div>

              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Categories
              </h3>

              <ul className="space-y-4 text-gray-600">

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Software Engineering
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  UI / UX Design
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Data Science
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  DevOps
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Artificial Intelligence
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Cyber Security
                </li>

              </ul>

            </div>

            {/* ================= RESOURCES ================= */}

            <div>

              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Resources
              </h3>

              <ul className="space-y-4 text-gray-600">

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Resume Builder
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Interview Preparation
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Career Advice
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Salary Guide
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Help Center
                </li>

                <li className="hover:text-purple-600 transition cursor-pointer">
                  Contact Support
                </li>

              </ul>

            </div>

          </div>

          {/* ================= NEWSLETTER ================= */}

          <div className="mt-16">

            <div
              className="
              rounded-3xl
              bg-gradient-to-r
              from-purple-600
              via-violet-600
              to-fuchsia-600
              p-8
              md:p-10
              flex
              flex-col
              lg:flex-row
              items-center
              justify-between
              gap-8
              "
            >

              <div>

                <h2 className="text-3xl font-bold text-white">
                  Subscribe to our Newsletter
                </h2>

                <p className="mt-3 text-purple-100 max-w-xl">

                  Stay updated with the latest job openings, career tips,
                  interview guides and hiring trends directly in your inbox.

                </p>

              </div>

              <div className="flex w-full lg:w-auto gap-3">

                <input
                  type="email"
                  placeholder="Enter your email..."
                  className="
                  flex-1
                  lg:w-80
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  bg-white
                  text-gray-700
                  shadow-lg
                  "
                />

                <button
                  className="
                  rounded-2xl
                  bg-black
                  text-white
                  px-7
                  py-4
                  hover:scale-105
                  transition-all
                  duration-300
                  flex
                  items-center
                  gap-2
                  "
                >
                  Subscribe
                  <Send size={18} />
                </button>

              </div>

            </div>

          </div>

          {/* Divider */}

          <div className="my-12 border-t border-purple-200"></div>

          {/* Bottom */}

          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

            <div>

              <h3 className="text-lg font-semibold text-gray-800">
                © 2026 Hire Nest
              </h3>

              <p className="text-gray-500 mt-1">
                Built with ❤️ for developers, students & recruiters.
              </p>

            </div>

            <div className="flex flex-wrap gap-8 text-gray-600">

              <span className="hover:text-purple-600 cursor-pointer transition">
                Privacy Policy
              </span>

              <span className="hover:text-purple-600 cursor-pointer transition">
                Terms of Service
              </span>

              <span className="hover:text-purple-600 cursor-pointer transition">
                Cookies
              </span>

              <span className="hover:text-purple-600 cursor-pointer transition">
                Contact
              </span>

            </div>

          </div>

        </div>

      </div>

    </footer>
  );
};

export default Footer;