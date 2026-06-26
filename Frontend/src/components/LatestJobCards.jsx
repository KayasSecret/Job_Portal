import React from "react";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaMapMarkerAlt,
  FaBookmark,
  FaBolt,
} from "react-icons/fa";

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -12 }}
      onClick={() => navigate(`/description/${job._id}`)}
      className="
      group
      relative
      overflow-hidden
      rounded-[28px]
      bg-white
      border
      border-purple-100
      shadow-xl
      cursor-pointer
      transition-all
      duration-500
      hover:shadow-[0_25px_70px_rgba(124,58,237,0.30)]
      "
    >
      {/* Animated Gradient Border */}

      <div
        className="
        absolute
        inset-0
        rounded-[28px]
        p-[1px]
        bg-gradient-to-r
        from-purple-500
        via-fuchsia-500
        to-violet-500
        opacity-0
        group-hover:opacity-100
        transition-all
        duration-500
        "
      >
        <div className="w-full h-full bg-white rounded-[27px]" />
      </div>

      {/* Glow */}

      <div
        className="
        absolute
        -top-24
        -right-24
        w-52
        h-52
        rounded-full
        bg-purple-400/20
        blur-[80px]
        opacity-0
        group-hover:opacity-100
        transition-all
        duration-500
        "
      />

      {/* Shine */}

      <div
        className="
        absolute
        top-0
        -left-40
        w-28
        h-full
        rotate-12
        bg-white/40
        blur-xl
        group-hover:left-[140%]
        duration-1000
        transition-all
        "
      />

      <div className="relative p-6">

        {/* Top */}

        <div className="flex justify-between items-start">

          <div className="flex gap-4">

            {/* Company Logo */}

            <div
              className="
              w-16
              h-16
              rounded-2xl
              bg-gradient-to-br
              from-purple-600
              via-violet-500
              to-pink-500
              flex
              items-center
              justify-center
              text-white
              text-2xl
              font-bold
              shadow-xl
              group-hover:scale-110
              transition-all
              duration-500
              "
            >
              {job?.company?.name?.charAt(0)}
            </div>

            <div>

              <h2
                className="
                text-xl
                font-bold
                text-gray-900
                group-hover:text-purple-700
                transition
                "
              >
                {job?.company?.name}
              </h2>

              <div className="flex items-center gap-2 mt-2 text-gray-500">

                <FaMapMarkerAlt className="text-purple-600" />

                <span>India</span>

              </div>

            </div>

          </div>

          {/* Bookmark */}

          <button
            className="
            w-11
            h-11
            rounded-xl
            bg-purple-50
            flex
            items-center
            justify-center
            text-purple-700
            hover:bg-purple-600
            hover:text-white
            transition-all
            duration-300
            "
          >
            <FaBookmark />
          </button>

        </div>

        {/* Featured */}

        <div className="mt-6 inline-flex">

          <div
            className="
            flex
            items-center
            gap-2
            px-4
            py-2
            rounded-full
            bg-gradient-to-r
            from-yellow-400
            to-orange-400
            text-white
            text-sm
            font-semibold
            shadow-lg
            "
          >
            <FaBolt />

            Featured Job

          </div>

        </div>

        {/* Job Title */}

        <h1
          className="
          mt-6
          text-2xl
          font-bold
          text-gray-900
          group-hover:text-purple-700
          transition-all
          "
        >
          {job?.title}
        </h1>

        {/* Description */}

        <p className="mt-4 text-gray-600 leading-7 line-clamp-3">
          {job?.description}
        </p>

        {/* ================= BADGES ================= */}

        <div className="flex flex-wrap gap-3 mt-6">

          <Badge
            className="
            px-4
            py-2
            rounded-full
            bg-gradient-to-r
            from-blue-500
            to-cyan-500
            text-white
            font-semibold
            shadow-md
            hover:scale-105
            transition-all
            "
          >
            {job?.position} Openings
          </Badge>

          <Badge
            className="
            px-4
            py-2
            rounded-full
            bg-gradient-to-r
            from-orange-500
            to-red-500
            text-white
            font-semibold
            shadow-md
            hover:scale-105
            transition-all
            "
          >
            {job?.jobType}
          </Badge>

          <Badge
            className="
            px-4
            py-2
            rounded-full
            bg-gradient-to-r
            from-purple-600
            to-pink-500
            text-white
            font-semibold
            shadow-md
            hover:scale-105
            transition-all
            "
          >
            💰 {job?.salary} LPA
          </Badge>

        </div>

        {/* Divider */}

        <div className="my-7 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>

        {/* Bottom */}

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm text-gray-500">
              Hiring Now
            </p>

            <h3 className="font-bold text-xl text-purple-700">
              Apply Today
            </h3>

          </div>

          <motion.button
            whileHover={{
              scale: 1.08,
              x: 5,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="
            group/button
            px-6
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-purple-600
            via-violet-600
            to-fuchsia-600
            text-white
            font-semibold
            shadow-xl
            flex
            items-center
            gap-3
            "
          >

            View Job

            <FaArrowRight
              className="
              group-hover/button:translate-x-2
              transition-all
              duration-300
              "
            />

          </motion.button>

        </div>

      </div>

    </motion.div>
  );
};

export default LatestJobCards;