import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const categoryGroups = {
  "General Knowledge": [9],
  "Entertainment": [10, 11, 12, 13, 14, 15, 16],
  "Science": [17, 18, 19],
  "Other Topics": [20, 21, 22, 23],
};

// FIXED COLOR MAP
const pastelMap = {
  9: "bg-blue-100",
  10: "bg-pink-100",
  11: "bg-yellow-100",
  12: "bg-purple-100",
  13: "bg-red-100",
  14: "bg-green-100",
  15: "bg-indigo-100",
  16: "bg-teal-100",
  17: "bg-orange-100",
  18: "bg-rose-100",
  19: "bg-lime-100",
  20: "bg-sky-100",
  21: "bg-violet-100",
  22: "bg-amber-100",
  23: "bg-cyan-100",
};

// IMAGE MAP
const imageMap = {
  9: "/assets/category/gk.png",
  10: "/assets/category/books.png",
  11: "/assets/category/film.png",
  12: "/assets/category/music.png",
  13: "/assets/category/theatre.png",
  14: "/assets/category/tv.png",
  15: "/assets/category/games.png",
  16: "/assets/category/board.png",
  17: "/assets/category/science.png",
  18: "/assets/category/computers.png",
  19: "/assets/category/math.png",
  20: "/assets/category/myth.png",
  21: "/assets/category/sports.png",
  22: "/assets/category/geo.png",
  23: "/assets/category/history.png",
};

const normalizeImageUrl = (url = "") =>
  url.startsWith("hhttps") ? `https${url.slice(6)}` : url;

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [localCategories, setLocalCategories] = useState([]);
  const [localSubcategories, setLocalSubcategories] = useState([]);
  const [customLoading, setCustomLoading] = useState(true);
  const [customError, setCustomError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Motion variants for subtle, polished animations
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const groupVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: "easeOut",
        delay: 0.05 * i,
      },
    }),
  };

  const cardContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    // Slide in from the side with fade
    hidden: { opacity: 0, x: -40 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 22,
      },
    },
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      const [remote, localCats, localSubs] = await Promise.allSettled([
        axios.get("https://opentdb.com/api_category.php"),
        axios.get("http://localhost:3000/categories"),
        axios.get("http://localhost:3000/subcategories"),
      ]);

      if (!active) return;

      if (remote.status === "fulfilled") {
        setCategories(remote.value.data?.trivia_categories || []);
      } else {
        console.error("Failed to load OpenTDB categories:", remote.reason);
        setCategories([]);
      }

      if (localCats.status === "fulfilled") {
        setLocalCategories(localCats.value.data || []);
      } else {
        console.error("Failed to load custom categories:", localCats.reason);
        setLocalCategories([]);
        setCustomError("Custom categories are unavailable right now.");
      }

      if (localSubs.status === "fulfilled") {
        setLocalSubcategories(localSubs.value.data || []);
      } else {
        console.error("Failed to load custom subcategories:", localSubs.reason);
        setLocalSubcategories([]);
        setCustomError("Custom subcategories are unavailable right now.");
      }

      setCustomLoading(false);
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter((cat) => cat.name.toLowerCase().includes(q));
  }, [categories, search]);

  const localCollections = useMemo(() => {
    const q = search.trim().toLowerCase();

    return localCategories
      .map((cat) => {
        const allSubs = localSubcategories.filter(
          (sub) => sub.categoryId === cat.id
        );
        if (!q) return { ...cat, subcategories: allSubs };

        const catMatches = cat.name.toLowerCase().includes(q);
        if (catMatches) return { ...cat, subcategories: allSubs };

        const subsMatching = allSubs.filter((sub) =>
          sub.name.toLowerCase().includes(q)
        );
        if (subsMatching.length) return { ...cat, subcategories: subsMatching };

        return null;
      })
      .filter(Boolean);
  }, [localCategories, localSubcategories, search]);

  // Featured categories (simple pick from filtered list)
  const featuredCategories = useMemo(
    () => filtered.slice(0, 3),
    [filtered]
  );

  return (
    <motion.div
      className="min-h-screen bg-[#F7F3F0]"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sticky Left Sidebar - Fixed Width */}
        <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 w-[260px] h-screen overflow-y-auto bg-white border-r border-gray-200 px-6 py-8 transition-transform duration-300`}>
          {/* Close button for mobile */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("featured-categories")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-between group transition-colors"
            >
              <span className="font-medium text-sm">Featured</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {Object.keys(categoryGroups).map((groupName) => (
              <button
                key={groupName}
                type="button"
                onClick={() => {
                  document
                    .getElementById(`group-${groupName}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-between group transition-colors"
              >
                <span className="font-medium text-sm">{groupName}</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById("community-categories")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-between group transition-colors mt-2"
            >
              <span className="font-medium text-sm">Community Categories</span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-8 lg:px-12 lg:py-12">
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8 relative"
          >
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full p-4 pl-12 pr-4 border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </motion.div>

          {/* Featured Section */}
          {featuredCategories.length > 0 && (
            <section id="featured-categories" className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured</h2>
              </div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                variants={cardContainerVariants}
                initial="hidden"
                animate="visible"
              >
                {featuredCategories.slice(0, 2).map((cat) => (
                  <motion.div
                    key={cat.id}
                    variants={cardVariants}
                    whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                    onClick={() => navigate(`/difficulty/${cat.id}`)}
                    className={`${pastelMap[cat.id]} rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200`}
                  >
                    <div className="aspect-video mb-4 rounded-xl overflow-hidden bg-white/40 flex items-center justify-center">
                      <img
                        src={imageMap[cat.id]}
                        alt={cat.name}
                        className="w-full h-full object-contain p-4"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">Tap to view quizzes</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Multiple difficulty levels</span>
                      <span>•</span>
                      <span>Timed quizzes</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          {/* Category Groups */}
          {Object.keys(categoryGroups).map((groupName, groupIndex) => {
            const groupIds = categoryGroups[groupName];
            const groupCat = filtered.filter((c) => groupIds.includes(c.id));

            if (groupCat.length === 0) return null;

            const expanded = expandedGroups[groupName];
            const shown = expanded ? groupCat : groupCat.slice(0, 3);

            return (
              <motion.section
                key={groupName}
                id={`group-${groupName}`}
                className="mb-16"
                variants={groupVariants}
                initial="hidden"
                animate="visible"
                custom={groupIndex}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {groupName}
                  </h2>
                  {groupCat.length > 3 && (
                    <button
                      onClick={() =>
                        setExpandedGroups({
                          ...expandedGroups,
                          [groupName]: !expanded,
                        })
                      }
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {expanded ? "View less" : "View all"}
                    </button>
                  )}
                </div>

                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                  variants={cardContainerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {shown.map((cat) => (
                    <motion.div
                      key={cat.id}
                      variants={cardVariants}
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                      onClick={() => navigate(`/difficulty/${cat.id}`)}
                      className={`${pastelMap[cat.id]} shadow-md rounded-2xl p-4 transition-all duration-200 hover:shadow-xl cursor-pointer`}
                    >
                      <img
                        src={imageMap[cat.id]}
                        alt={cat.name}
                        className="w-full h-32 object-contain mb-3 rounded-lg bg-white/60"
                      />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-gray-600">Tap to view quizzes</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.section>
            );
          })}

          {/* Community Categories */}
          <section id="community-categories" className="mb-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Community Categories
              </h2>
              {customLoading && (
                <span className="text-sm text-gray-500">Loading...</span>
              )}
              {!customLoading && customError && (
                <span className="text-sm text-red-500">{customError}</span>
              )}
            </div>

            {localCollections.length === 0 && !customLoading ? (
              <p className="text-gray-500">
                {search
                  ? "No custom categories match your search."
                  : "No custom categories found yet. Head to the admin panel to add some!"}
              </p>
            ) : (
              localCollections.map((cat, catIndex) => (
                <motion.div
                  key={cat.id}
                  className="mb-12"
                  variants={groupVariants}
                  initial="hidden"
                  animate="visible"
                  custom={catIndex + 5}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900">
                      {cat.name}
                    </h3>
                  </div>

                  {cat.subcategories.length === 0 ? (
                    <p className="text-gray-500">
                      No subcategories have been created for this category yet.
                    </p>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                      variants={cardContainerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {cat.subcategories.map((sub) => (
                        <motion.div
                          key={sub.id}
                          variants={cardVariants}
                          whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
                          onClick={() =>
                            navigate(`/difficulty/local-${sub.id}`, {
                              state: {
                                customMeta: {
                                  categoryName: cat.name,
                                  subcategoryName: sub.name,
                                  subCategoryId: sub.id,
                                  categoryId: sub.categoryId,
                                },
                              },
                            })
                          }
                          className="shadow-md rounded-2xl p-4 border border-gray-100 cursor-pointer transition-all duration-200 hover:shadow-xl"
                          style={{ backgroundColor: sub.color || "#F9FAFB" }}
                        >
                          {sub.imageUrl ? (
                            <img
                              src={normalizeImageUrl(sub.imageUrl)}
                              alt={sub.name}
                              className="w-full h-32 object-cover mb-3 rounded-lg"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}

                          <h4 className="text-lg font-semibold text-gray-900 mb-1">
                            {sub.name}
                          </h4>
                          <p className="text-sm text-gray-600">Added by your team</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </section>
        </main>
      </div>
    </motion.div>
  );
};

export default Category;
