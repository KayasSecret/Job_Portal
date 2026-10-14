import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Button } from "./ui/button";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code2,
  Server,
  Layers,
  BarChart3,
  Palette,
  KanbanSquare,
  Sparkles,
  Terminal,
  Cpu,
  ShieldAlert,
  Boxes,
  Cloud,
  CheckCircle,
  Database,
  Compass,
} from "lucide-react";

const CATEGORIES = [
  { name: "Frontend Developer", icon: Code2, count: "1.2k+ jobs", gradient: "from-blue-500 to-cyan-500" },
  { name: "Backend Developer", icon: Server, count: "850+ jobs", gradient: "from-purple-500 to-indigo-600" },
  { name: "Full Stack Developer", icon: Layers, count: "1.5k+ jobs", gradient: "from-pink-500 to-rose-600" },
  { name: "AI Engineer", icon: Cpu, count: "420+ jobs", gradient: "from-amber-500 to-orange-600" },
  { name: "Data Scientist", icon: BarChart3, count: "600+ jobs", gradient: "from-emerald-500 to-teal-600" },
  { name: "UX/UI Designer", icon: Palette, count: "510+ jobs", gradient: "from-fuchsia-500 to-purple-600" },
  { name: "DevOps Engineer", icon: Cloud, count: "480+ jobs", gradient: "from-cyan-500 to-blue-600" },
  { name: "Product Manager", icon: KanbanSquare, count: "390+ jobs", gradient: "from-violet-500 to-purple-700" },
  { name: "React Developer", icon: Code2, count: "920+ jobs", gradient: "from-sky-500 to-indigo-500" },
  { name: "Node Developer", icon: Database, count: "640+ jobs", gradient: "from-emerald-600 to-green-500" },
  { name: "Cloud Engineer", icon: Cloud, count: "530+ jobs", gradient: "from-blue-600 to-indigo-700" },
  { name: "Cyber Security", icon: ShieldAlert, count: "290+ jobs", gradient: "from-red-500 to-amber-600" },
];

const CategoryCarausel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/browse");
  };

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200 text-[#6A38C2] text-xs font-semibold mb-3">
              <Compass size={14} />
              <span>Explore Roles & Specializations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
              Trending <span className="bg-gradient-to-r from-[#6A38C2] to-[#EC4899] bg-clip-text text-transparent">Job Categories</span>
            </h2>
            <p className="text-sm text-gray-500 mt-1 max-w-lg">
              Explore hyper-growth domains with active hiring across tech hubs and remote-friendly companies.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/browse")}
            className="text-xs sm:text-sm font-semibold text-[#6A38C2] hover:text-[#5B21B6] hover:underline flex items-center gap-1.5 self-start md:self-end"
          >
            <span>View All Categories</span>
            <span>&rarr;</span>
          </button>
        </div>

        {/* Category Carousel Slider */}
        <div className="relative px-2">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {CATEGORIES.map((cat, index) => {
                const IconComponent = cat.icon;

                return (
                  <CarouselItem
                    key={index}
                    className="pl-3 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <motion.div
                      whileHover={{ y: -6, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => searchJobHandler(cat.name)}
                      className="group p-5 rounded-3xl bg-white border border-purple-100/90 shadow-sm hover:shadow-[0_15px_35px_-5px_rgba(106,56,194,0.18)] transition-all cursor-pointer flex flex-col justify-between h-44 relative overflow-hidden"
                    >
                      {/* Ambient hover glow inside card */}
                      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-purple-100/50 blur-xl group-hover:scale-150 transition-transform duration-500" />

                      <div className="relative z-10 flex items-center justify-between">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}
                        >
                          <IconComponent size={22} />
                        </div>
                        <span className="text-[11px] font-semibold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                          {cat.count}
                        </span>
                      </div>

                      <div className="relative z-10 mt-auto">
                        <h3 className="font-bold text-gray-900 group-hover:text-[#6A38C2] transition-colors text-base line-clamp-1">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Explore active roles</p>
                      </div>
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <div className="hidden sm:block">
              <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white border-purple-200 shadow-md text-gray-700 hover:text-[#6A38C2] hover:bg-purple-50" />
              <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white border-purple-200 shadow-md text-gray-700 hover:text-[#6A38C2] hover:bg-purple-50" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default CategoryCarausel;