import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { setSearchedQuery } from "@/redux/jobSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Code2,
  Server,
  Layers,
  Cpu,
  BarChart3,
  GitBranch,
  ShieldAlert,
  Cloud,
  Palette,
  Smartphone,
  CheckCircle2,
  PieChart,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

const CATEGORIES = [
  {
    name: "Frontend Developer",
    icon: Code2,
    gradient: "from-blue-500 via-indigo-500 to-cyan-500",
    keywords: ["frontend", "front-end", "react", "vue", "angular", "javascript", "typescript", "ui dev"],
    badgeFallback: "High Demand",
  },
  {
    name: "Backend Developer",
    icon: Server,
    gradient: "from-purple-600 via-indigo-600 to-violet-600",
    keywords: ["backend", "back-end", "node", "express", "django", "spring", "java", "golang", "python"],
    badgeFallback: "Actively Hiring",
  },
  {
    name: "Full Stack Developer",
    icon: Layers,
    gradient: "from-pink-500 via-rose-500 to-purple-600",
    keywords: ["fullstack", "full stack", "full-stack", "mern", "mean", "web developer"],
    badgeFallback: "Popular",
  },
  {
    name: "AI Engineer",
    icon: Cpu,
    gradient: "from-amber-500 via-orange-500 to-purple-600",
    keywords: ["ai", "artificial intelligence", "machine learning", "ml", "llm", "neural", "deep learning"],
    badgeFallback: "Trending ⚡",
  },
  {
    name: "Data Scientist",
    icon: BarChart3,
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    keywords: ["data science", "data scientist", "nlp", "statistics", "pandas", "pytorch"],
    badgeFallback: "Top Paid",
  },
  {
    name: "DevOps Engineer",
    icon: GitBranch,
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    keywords: ["devops", "ci/cd", "kubernetes", "docker", "jenkins", "terraform", "helm"],
    badgeFallback: "Critical Role",
  },
  {
    name: "Cybersecurity Engineer",
    icon: ShieldAlert,
    gradient: "from-red-500 via-rose-600 to-purple-700",
    keywords: ["cybersecurity", "cyber security", "security", "infosec", "penetration", "soc"],
    badgeFallback: "High Priority",
  },
  {
    name: "Cloud Engineer",
    icon: Cloud,
    gradient: "from-sky-500 via-blue-600 to-indigo-700",
    keywords: ["cloud", "aws", "azure", "gcp", "cloud engineer", "cloud architecture"],
    badgeFallback: "In Demand",
  },
  {
    name: "UI/UX Designer",
    icon: Palette,
    gradient: "from-fuchsia-500 via-pink-600 to-purple-600",
    keywords: ["ui/ux", "ui ux", "ux", "designer", "product design", "figma", "user experience"],
    badgeFallback: "Creative",
  },
  {
    name: "Mobile App Developer",
    icon: Smartphone,
    gradient: "from-orange-500 via-amber-600 to-pink-600",
    keywords: ["mobile", "android", "ios", "react native", "flutter", "swift", "kotlin"],
    badgeFallback: "Featured",
  },
  {
    name: "QA Engineer",
    icon: CheckCircle2,
    gradient: "from-teal-500 via-emerald-600 to-green-600",
    keywords: ["qa", "quality assurance", "test", "testing", "automation", "selenium", "cypress"],
    badgeFallback: "Essential",
  },
  {
    name: "Data Analyst",
    icon: PieChart,
    gradient: "from-indigo-500 via-purple-600 to-blue-600",
    keywords: ["analyst", "data analyst", "business analyst", "sql", "tableau", "power bi", "bi"],
    badgeFallback: "Growing",
  },
];

// Interactive 3D Tilt Card Component
const CategoryCard = ({ cat, realCount, onClick, prefersReducedMotion }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["6deg", "-6deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-6deg", "6deg"]);

  const handleMouseMove = (e) => {
    if (prefersReducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const IconComponent = cat.icon;

  return (
    <motion.div
      style={
        prefersReducedMotion
          ? {}
          : {
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="group relative p-5 rounded-2xl bg-white/85 backdrop-blur-xl border border-purple-100/90 shadow-[0_8px_24px_-6px_rgba(106,56,194,0.08)] hover:shadow-[0_20px_40px_-8px_rgba(106,56,194,0.22)] hover:border-purple-300 transition-all duration-300 cursor-pointer flex flex-col justify-between h-44 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#6A38C2] select-none"
    >
      {/* Animated Gradient Border Glow on Hover */}
      <div className="absolute inset-0 rounded-2xl p-[1.5px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-0">
        <div className="w-full h-full bg-white/95 rounded-[15px]" />
      </div>

      {/* Ambient hover glow inside card */}
      <div className="pointer-events-none absolute -top-12 -right-12 w-28 h-28 rounded-full bg-purple-200/50 blur-2xl group-hover:scale-150 transition-transform duration-500" />

      {/* Top Row: Icon + Real Job Count Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.gradient} flex items-center justify-center text-white shadow-md shadow-purple-900/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
        >
          <IconComponent size={22} />
        </div>

        {realCount !== null && realCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#6A38C2] bg-purple-50/90 px-2.5 py-1 rounded-full border border-purple-200/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {realCount} {realCount === 1 ? "Role" : "Roles"}
            </span>
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-purple-700/80 bg-purple-50/70 px-2.5 py-1 rounded-full border border-purple-100">
            {cat.badgeFallback}
          </span>
        )}
      </div>

      {/* Bottom Info: Role Name + CTA arrow */}
      <div className="relative z-10 mt-auto">
        <h3 className="font-extrabold text-slate-900 group-hover:text-[#6A38C2] transition-colors text-base tracking-tight line-clamp-1">
          {cat.name}
        </h3>
        <p className="text-xs text-slate-400 mt-1 flex items-center justify-between font-medium group-hover:text-purple-600 transition-colors">
          <span>Explore openings</span>
          <ArrowRight
            size={14}
            className="text-purple-400 group-hover:text-[#6A38C2] group-hover:translate-x-1 transition-all"
          />
        </p>
      </div>
    </motion.div>
  );
};

const CategoryCarausel = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { allJobs = [] } = useSelector((store) => store.job);

  const [api, setApi] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [autoplayActive, setAutoplayActive] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Calculate real job count per category from actual jobs in store
  const realCountsMap = useMemo(() => {
    if (!allJobs || allJobs.length === 0) return {};
    const map = {};

    CATEGORIES.forEach((cat) => {
      const matchCount = allJobs.filter((job) => {
        const text = `${job?.title || ""} ${job?.description || ""} ${job?.jobType || ""}`.toLowerCase();
        return cat.keywords.some((kw) => text.includes(kw.toLowerCase()));
      }).length;
      map[cat.name] = matchCount;
    });

    return map;
  }, [allJobs]);

  // Sync Embla scroll snaps and selected index
  const onSelect = useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    setSelectedIndex(api.selectedScrollSnap());

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  // Autoplay functionality with hover, focus, and reduced motion pauses
  useEffect(() => {
    if (!api || !autoplayActive || isHovered || isFocused || prefersReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      api.scrollNext();
    }, 3200);

    return () => clearInterval(timer);
  }, [api, autoplayActive, isHovered, isFocused, prefersReducedMotion]);

  const searchJobHandler = (categoryName) => {
    dispatch(setSearchedQuery(categoryName));
    navigate("/jobs");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Background Radial Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-purple-200/20 blur-[130px]"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100/80 border border-purple-200 text-[#6A38C2] text-xs font-semibold mb-2.5">
              <Compass size={13} className="text-[#6A38C2]" />
              <span>Explore Roles & Specializations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Trending{" "}
              <span className="bg-gradient-to-r from-[#6A38C2] via-purple-600 to-[#EC4899] bg-clip-text text-transparent">
                Job Categories
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Explore 12 hyper-growth tech domains actively hiring verified candidates across startups and enterprises.
            </p>
          </div>

          {/* Header Controls: Autoplay toggle, Prev/Next arrows, View All */}
          <div className="flex items-center gap-3 self-start md:self-end">
            {/* Autoplay Pause/Play Button */}
            <button
              type="button"
              onClick={() => setAutoplayActive((prev) => !prev)}
              aria-label={autoplayActive ? "Pause auto-slide" : "Play auto-slide"}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 hover:text-[#6A38C2] border border-purple-100 text-xs font-semibold shadow-2xs backdrop-blur-md transition-all cursor-pointer"
            >
              {autoplayActive && !isHovered && !isFocused ? (
                <>
                  <Pause size={12} className="text-[#6A38C2]" />
                  <span className="hidden sm:inline">Auto</span>
                </>
              ) : (
                <>
                  <Play size={12} className="text-purple-400" />
                  <span className="hidden sm:inline">Paused</span>
                </>
              )}
            </button>

            {/* Custom Arrow Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => api?.scrollPrev()}
                aria-label="Previous categories"
                className="w-9 h-9 rounded-xl bg-white/90 hover:bg-purple-50 text-slate-700 hover:text-[#6A38C2] border border-purple-200/90 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => api?.scrollNext()}
                aria-label="Next categories"
                className="w-9 h-9 rounded-xl bg-white/90 hover:bg-purple-50 text-slate-700 hover:text-[#6A38C2] border border-purple-200/90 shadow-2xs flex items-center justify-center transition-all cursor-pointer active:scale-95"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View All Roles Button */}
            <button
              type="button"
              onClick={() => {
                dispatch(setSearchedQuery(""));
                navigate("/jobs");
              }}
              className="px-4 py-2 rounded-xl bg-[#6A38C2] hover:bg-[#5B21B6] text-white text-xs font-bold shadow-md shadow-purple-900/15 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>All Jobs</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Carousel Container with Hover and Focus Capture for Autoplay Pause */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsFocused(true)}
          onBlurCapture={() => setIsFocused(false)}
          className="relative px-0.5"
        >
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-4">
              {CATEGORIES.map((cat, index) => {
                const realCount = realCountsMap[cat.name] ?? null;

                return (
                  <CarouselItem
                    key={cat.name}
                    className="pl-3 sm:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
                    >
                      <CategoryCard
                        cat={cat}
                        realCount={realCount}
                        onClick={() => searchJobHandler(cat.name)}
                        prefersReducedMotion={prefersReducedMotion}
                      />
                    </motion.div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* In-viewport shadcn controls (Hidden on smaller screens, accessible for keyboard) */}
            <div className="hidden xl:block pointer-events-none">
              <CarouselPrevious className="pointer-events-auto absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md border-purple-200/90 shadow-lg text-slate-700 hover:text-[#6A38C2] hover:bg-purple-50 cursor-pointer transition-all" />
              <CarouselNext className="pointer-events-auto absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-md border-purple-200/90 shadow-lg text-slate-700 hover:text-[#6A38C2] hover:bg-purple-50 cursor-pointer transition-all" />
            </div>
          </Carousel>
        </div>

        {/* Pagination & Progress Indicators */}
        {scrollSnaps.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {scrollSnaps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Go to slide group ${idx + 1}`}
                onClick={() => api?.scrollTo(idx)}
                className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                  selectedIndex === idx
                    ? "w-8 bg-gradient-to-r from-[#6A38C2] to-[#EC4899] shadow-sm shadow-purple-500/30"
                    : "w-2 bg-purple-200/80 hover:bg-purple-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryCarausel;