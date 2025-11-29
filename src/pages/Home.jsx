import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Play,
  Trophy,
  BookOpen,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Triviatrek Features section config ----------

const featureItems = [
  {
    id: 0,
    title: "Get instant feedback",
    description:
      "Collect real-time responses from every player so you can see exactly how your quiz is landing, slide by slide.",
    mockupVariant: "feedback",
  },
  {
    id: 1,
    title: "Test your knowledge",
    description:
      "Run focused question rounds that highlight strengths, expose gaps, and turn every session into a learning checkpoint.",
    mockupVariant: "knowledge",
  },
  {
    id: 2,
    title: "Spark curiosity",
    description:
      "Mix categories, difficulty levels, and motion to keep people leaning in, thinking ahead, and wanting the next question.",
    mockupVariant: "curiosity",
  },
  {
    id: 3,
    title: "Make smart choices",
    description:
      "Use quiz data and answer trends to guide decisions—what to revisit, where to go deeper, and how to improve your content.",
    mockupVariant: "choices",
  },
  {
    id: 4,
    title: "Create memorable moments",
    description:
      "Blend timing, visuals, and friendly competition so each quiz feels like a polished experience, not just another form.",
    mockupVariant: "memorable",
  },
];

const FeaturesIcon = ({ id, isActive }) => {
  const stroke = isActive ? "#4E6AFE" : "#111827";
  const commonProps = {
    fill: "none",
    stroke,
    strokeWidth: 1.6,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "w-7 h-7 flex-shrink-0",
  };

  switch (id) {
    case 0:
      // chat bubble + check
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M5 19l-1.5 2.5A.8.8 0 0 0 4.2 23L7 21h8a4 4 0 0 0 4-4v-5a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v5" />
          <path d="M10 11.5l1.7 1.7L15.5 9.5" />
        </svg>
      );
    case 1:
      // checklist / board
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M9 3h6" />
          <path d="M8 10h4" />
          <path d="M8 14h6" />
          <path d="M6 10.5l-1.2 1.2" />
        </svg>
      );
    case 2:
      // spark
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M12 3v4" />
          <path d="M12 17v4" />
          <path d="M4.9 6.4l2.8 2" />
          <path d="M16.3 15.6l2.8 2" />
          <path d="M3 12h4" />
          <path d="M17 12h4" />
          <path d="M4.9 17.6l2.8-2" />
          <path d="M16.3 8.4l2.8-2" />
          <circle cx="12" cy="12" r="2.8" />
        </svg>
      );
    case 3:
      // decision arrows
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M12 3v7" />
          <path d="M7 21h4v-7.5L6 9" />
          <path d="M17 21h-4v-7.5L18 9" />
          <path d="M9 4l3-2 3 2" />
        </svg>
      );
    case 4:
      // picture frame
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <circle cx="9" cy="11" r="1.6" />
          <path d="M5.5 18l3.2-3.2a1.4 1.4 0 0 1 2 0L14 18l2.4-2.4a1.4 1.4 0 0 1 2 0L19.5 18" />
        </svg>
      );
    default:
      return null;
  }
};

const FeaturesMockupContent = ({ variant }) => {
  switch (variant) {
    case "feedback":
      return (
        <div className="space-y-6">
          <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
          <div className="space-y-4">
            {[7.2, 6.4, 6.8].map((score, idx) => (
              <div key={idx} className="space-y-2">
                <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                <div className="relative h-6 rounded-full bg-slate-100 overflow-hidden">
                  <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-indigo-200 via-sky-200 to-indigo-100 opacity-70" />
                  <div
                    className="absolute inset-y-1 left-1 rounded-full bg-blue-600 text-[10px] px-2 flex items-center justify-center text-white shadow-sm"
                    style={{ width: `${14 + idx * 6}%` }}
                  >
                    {score.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "knowledge":
      return (
        <div className="space-y-5">
          <div className="h-4 w-2/3 bg-slate-100 rounded-full" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-2"
              >
                <div className="h-3 w-3/4 bg-slate-200 rounded-full" />
                <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
                <div className="h-2 w-2/3 bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      );
    case "curiosity":
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-10 bg-purple-100 rounded-full" />
            <div className="h-3 w-24 bg-slate-100 rounded-full" />
          </div>
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex-1 h-32 rounded-3xl bg-gradient-to-t from-indigo-100 via-slate-50 to-white border border-slate-100"
              />
            ))}
          </div>
        </div>
      );
    case "choices":
      return (
        <div className="space-y-5">
          <div className="h-4 w-1/2 bg-slate-100 rounded-full" />
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-slate-200 rounded-full" />
                  <div className="h-2 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-6 px-3 rounded-full bg-blue-600/10 text-[10px] text-blue-700 flex items-center">
                  Recommended
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case "memorable":
    default:
      return (
        <div className="space-y-6">
          <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
          <div className="rounded-3xl bg-gradient-to-r from-indigo-100 via-sky-100 to-rose-100 h-40 flex items-center justify-center border border-slate-100">
            <div className="space-y-3 text-center">
              <div className="h-3 w-32 mx-auto bg-white/70 rounded-full" />
              <div className="h-2 w-24 mx-auto bg-white/70 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>Start</span>
            <span>Unforgettable finish</span>
          </div>
        </div>
      );
  }
};

const featuresListVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const featuresItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const featuresMockupVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ categories: 0, quizzes: 0, users: 0 });
  const [activeFeatureId, setActiveFeatureId] = useState(0);
  const activeIndex = activeFeatureId;

  const toggleIndex = (id) => {
    // Keep exactly one item open at a time
    if (id === activeIndex) {
      return;
    }
    setActiveFeatureId(id);
  };

  // Framer Motion variants for the "Why We Choose TrivakTrek" section
  const whyContainerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const whyLeftVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const whyRightVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.1 },
    },
  };

  // Slides data for "Why We Choose TrivakTrek"
  const slides = [
    {
      id: 0,
      heading: "TURN QUESTIONS INTO EXPERIENCES",
      description:
        "Turn presentations into interactive journeys that keep your players engaged from the very first question. TrivakTrek blends clean design, smart timing, and playful motion to make every quiz session feel polished and memorable.",
    },
    {
      id: 1,
      heading: "DESIGNED FOR REAL PARTICIPANTS",
      description:
        "From mobile to desktop, every screen feels intuitive and distraction‑free. Players see clear controls, responsive layouts, and smooth feedback that makes answering questions feel effortless.",
    },
    {
      id: 2,
      heading: "BUILT TO KEEP ENERGY HIGH",
      description:
        "Subtle animations, fast loading, and focused visuals keep momentum through every round. You control the pace with timers, navigation, and motion that supports—not overwhelms—the experience.",
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Auto-play logic for slides (every 5 seconds when not paused)
  useEffect(() => {
    if (isPaused) return undefined;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, slides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          axios.get("http://localhost:3000/categories").catch(() => ({ data: [] })),
          axios.get("http://localhost:3000/subcategories").catch(() => ({ data: [] })),
        ]);
        setCategories(subRes.data?.slice(0, 6) || []);
        setStats({
          categories: catRes.data?.length || 0,
          quizzes: subRes.data?.length || 0,
          users: 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-4">
              <Sparkles className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Welcome to TriviaTrek</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Test Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Knowledge
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Challenge yourself with thousands of questions across multiple categories.
              Learn, compete, and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link
                to="/Category"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                <Play className="group-hover:scale-110 transition-transform" size={24} />
                Start Quiz
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/Category"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-gray-200"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Triviatrek Features Section (Mentimeter-inspired) */}
      <section className="py-20 px-4 bg-[#F7F3F0]">
        <div className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT – Features list */}
          <motion.div
            variants={featuresListVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="space-y-6"
          >
            {featureItems.map((feature) => {
              const isActive = feature.id === activeIndex;
              return (
                <motion.button
                  key={feature.id}
                  type="button"
                  onClick={() => toggleIndex(feature.id)}
                  variants={featuresItemVariants}
                  whileHover={{ scale: 1.03 }}
                  className={`w-full text-left flex items-start gap-4 py-4 px-3 rounded-2xl transition-colors border-t first:border-t-0 border-slate-200/60 ${
                    isActive ? "bg-white/80 shadow-md" : "bg-transparent"
                  }`}
                >
                  <div className="mt-1">
                    <FeaturesIcon id={feature.id} isActive={isActive} />
                  </div>
                  <div className="flex-1 border-b border-slate-200/60 pb-4 last:border-b-0">
                    <motion.h3
                      whileHover={{ scale: 1.03 }}
                      className={`text-lg md:text-xl font-semibold transition-colors ${
                        isActive ? "text-[#4E6AFE]" : "text-gray-900"
                      }`}
                    >
                      {feature.title}
                    </motion.h3>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <p className="mt-2 text-sm md:text-base text-gray-600 leading-relaxed">
                            {feature.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* RIGHT – Device mockup */}
          <motion.div
            variants={featuresMockupVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-xl">
              {/* Rounded background container */}
              <div className="absolute -inset-6 bg-[#F7F3F0] rounded-[2.5rem] shadow-[0_32px_70px_rgba(15,23,42,0.12)]" />

              {/* Device frame */}
              <div className="relative bg-white rounded-[2.2rem] border-[6px] border-black/85 overflow-hidden px-6 py-6 md:px-8 md:py-8">
                {/* Simple top bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                    <span className="w-2 h-2 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-2 w-16 rounded-full bg-slate-100" />
                </div>

                {/* Mockup content – animated per active feature */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featureItems.find((f) => f.id === activeFeatureId)?.mockupVariant}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="min-h-[180px] md:min-h-[220px]"
                  >
                    <FeaturesMockupContent
                      variant={
                        featureItems.find((f) => f.id === activeFeatureId)
                          ?.mockupVariant || "feedback"
                      }
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <BookOpen className="text-blue-600" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.categories}</h3>
              <p className="text-gray-600 font-medium">Categories</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Play className="text-purple-600" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.quizzes}</h3>
              <p className="text-gray-600 font-medium">Quizzes Available</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Trophy className="text-amber-600" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.users}+</h3>
              <p className="text-gray-600 font-medium">Active Players</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Choose TrivakTrek - Mentimeter-style Section */}
      <section className="py-20 px-4 bg-[#f7f1ea]">
        <motion.div
          className="container mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          variants={whyContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* LEFT SIDE – Steps + Text */}
          <motion.div
            key={currentSlide}
            variants={whyLeftVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-10"
          >
            <div className="flex items-start gap-8">
              {/* Vertical index line */}
              <div className="relative flex flex-col items-center">
                <div className="h-2" />
                <div className="flex flex-col items-center gap-8">
                  {slides.map((slide, index) => {
                    const isActive = index === currentSlide;
                    const label = String(index + 1).padStart(2, "0");
                    return (
                      <div
                        key={slide.id}
                        className="flex flex-col items-center gap-2"
                      >
                        <span
                          className={`text-3xl font-semibold leading-none ${
                            isActive
                              ? "text-blue-600"
                              : "text-slate-700/70"
                          }`}
                        >
                          {label}
                        </span>
                        <div className="w-px h-16 last:h-10 bg-slate-400/40" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text block */}
              <div className="flex-1">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
                  {slides[currentSlide].heading}
                </h2>
                <p className="text-base md:text-lg text-gray-700 max-w-xl leading-relaxed">
                  {slides[currentSlide].description}
                </p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE – Device mockups */}
          <motion.div
            key={`devices-${currentSlide}`}
            variants={whyRightVariants}
            initial="hidden"
            animate="visible"
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-xl">
              {/* Soft background halo */}
              <div className="absolute -inset-6 bg-white/60 rounded-[2.5rem] shadow-[0_40px_80px_rgba(15,23,42,0.12)]" />

              {/* Laptop / host screen */}
              <div className="relative bg-white rounded-[2.2rem] border border-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.16)] p-6 md:p-8">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-2 w-20 rounded-full bg-slate-100" />
                </div>

                {/* Main content area */}
                <div className="space-y-6">
                  <div className="h-4 w-3/4 bg-slate-100 rounded-full" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded-full" />

                  <div className="mt-6 grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2 h-40 md:h-48 rounded-3xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center">
                      <div className="space-y-3 text-center">
                        <div className="h-8 w-24 mx-auto bg-slate-100 rounded-full" />
                        <div className="h-3 w-32 mx-auto bg-slate-100 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-slate-100 rounded-full" />
                      <div className="h-3 w-3/4 bg-slate-100 rounded-full" />
                      <div className="h-3 w-2/3 bg-slate-100 rounded-full" />
                      <div className="h-3 w-4/5 bg-slate-100 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone / participant screen */}
              <div className="absolute -left-2 -bottom-6 md:-left-10 md:-bottom-10 w-32 sm:w-40 md:w-44">
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.18)] px-4 pt-5 pb-6 flex flex-col items-center gap-3">
                  <div className="w-16 h-1.5 rounded-full bg-slate-200 mb-1" />
                  <div className="w-full space-y-3">
                    <div className="h-3 w-3/4 bg-slate-100 rounded-full mx-auto" />
                    <div className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50" />
                    <div className="h-2 w-2/3 bg-slate-100 rounded-full mx-auto" />
                    <button className="mt-2 w-full py-2 rounded-full bg-blue-600 text-white text-xs font-semibold">
                      Submit
                    </button>
                  </div>
                  <div className="mt-1 w-10 h-1 rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Slide controls */}
        <div className="container mx-auto max-w-6xl mt-10 flex items-center gap-4">
          <button
            onClick={togglePause}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-800 text-sm font-semibold"
          >
            {isPaused ? "▶" : "Ⅱ"}
          </button>
          <button
            onClick={prevSlide}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-md border border-gray-200 text-gray-700"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white shadow-md"
          >
            →
          </button>
        </div>
      </section>

      {/* Popular Quizzes Section */}
      {categories.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Popular Quizzes
              </h2>
              <p className="text-xl text-gray-600">Try these trending categories</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((sub, index) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/Difficulty/local-${sub.id}`, {
                    state: {
                      customMeta: {
                        categoryName: "Popular",
                        subcategoryName: sub.name,
                        subCategoryId: sub.id,
                        categoryId: sub.categoryId,
                      },
                    },
                  })}
                  className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {sub.imageUrl && (
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                      <img
                        src={sub.imageUrl}
                        alt={sub.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{sub.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">Click to start quiz</p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                    Start Quiz
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/Category"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                View All Categories
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of players testing their knowledge every day
            </p>
            <Link
              to="/Category"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Play size={24} />
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Home;
