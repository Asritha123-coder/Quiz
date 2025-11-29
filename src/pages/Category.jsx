import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Sidebar from "../components/Sidebar";
import CategoryCard from "../components/CategoryCard";

const categoryGroups = {
  "General Knowledge": [9],
  "Entertainment": [10, 11, 12, 13, 14, 15, 16],
  "Science": [17, 18, 19],
  "Other Topics": [20, 21, 22, 23],
};

// Pastel color map with exact hex values matching Mentimeter
const pastelColorMap = {
  9: "#e8f1ff",   // blue
  10: "#fde8f3",  // pink
  11: "#fff9cc",  // yellow
  12: "#f0e8ff",  // purple
  13: "#e8f1ff",  // blue
  14: "#fde8f3",  // pink
  15: "#fff9cc",  // yellow
  16: "#f0e8ff",  // purple
  17: "#e8f1ff",  // blue
  18: "#fde8f3",  // pink
  19: "#fff9cc",  // yellow
  20: "#f0e8ff",  // purple
  21: "#e8f1ff",  // blue
  22: "#fde8f3",  // pink
  23: "#fff9cc",  // yellow
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
  const [expandedGroups, setExpandedGroups] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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
    return categories;
  }, [categories]);

  const localCollections = useMemo(() => {
    return localCategories
      .map((cat) => {
        const allSubs = localSubcategories.filter(
          (sub) => sub.categoryId === cat.id
        );
        return { ...cat, subcategories: allSubs };
      })
      .filter(Boolean);
  }, [localCategories, localSubcategories]);

  // Featured categories
  const featuredCategories = useMemo(
    () => filtered.slice(0, 2),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6 text-gray-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#e8f1ff] py-20 md:py-24">
        {/* Curved Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Light Blue Left Shape */}
          <div className="absolute -left-32 -top-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl"></div>
          <div className="absolute left-0 top-0 w-80 h-80 bg-blue-300/30 rounded-full blur-2xl"></div>
          
          {/* Pink Right Shape */}
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-pink-200/40 rounded-full blur-3xl"></div>
          <div className="absolute right-0 top-0 w-80 h-80 bg-pink-300/30 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Free and engaging presentation templates
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto"
          >
            Browse our collection of templates and find the perfect one for you
          </motion.p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex gap-14">
        {/* Sticky Sidebar */}
        <Sidebar
          categoryGroups={categoryGroups}
          categories={categories}
          onNavigate={navigate}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="px-6 py-16 lg:px-12 lg:py-16 max-w-7xl">
            {/* Featured Section */}
            {featuredCategories.length > 0 && (
              <section id="featured-categories" className="mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 tracking-tight">
                  Featured
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredCategories.map((cat, index) => (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => navigate(`/difficulty/${cat.id}`)}
                      className="rounded-2xl p-4 cursor-pointer drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                      style={{ backgroundColor: pastelColorMap[cat.id] || "#e8f1ff" }}
                    >
                      {/* Image container */}
                      <div className="aspect-video mb-3 rounded-xl overflow-hidden bg-white/60 flex items-center justify-center">
                        {imageMap[cat.id] ? (
                          <img
                            src={imageMap[cat.id]}
                            alt={cat.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100/50 flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-medium">Image</span>
                          </div>
                        )}
                      </div>

                      {/* Category name */}
                      <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                        {cat.name}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs text-gray-600 mb-2 font-normal">
                        Tap to view quizzes
                      </p>

                      {/* Metadata row */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <span>Multiple difficulty levels</span>
                        <span className="text-gray-300">•</span>
                        <span>Timed quizzes</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Category Groups */}
            {Object.keys(categoryGroups).map((groupName, groupIndex) => {
              const groupIds = categoryGroups[groupName];
              const groupCat = filtered.filter((c) => groupIds.includes(c.id));

              if (groupCat.length === 0) return null;

              const expanded = expandedGroups[groupName];
              const shown = expanded ? groupCat : groupCat.slice(0, 4);

              return (
                <motion.section
                  key={groupName}
                  id={`group-${groupName}`}
                  className="mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: 0.05 * groupIndex,
                  }}
                >
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                      {groupName}
                    </h2>
                    {groupCat.length > 4 && (
                      <button
                        onClick={() =>
                          setExpandedGroups({
                            ...expandedGroups,
                            [groupName]: !expanded,
                          })
                        }
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
                      >
                        {expanded ? "View less" : "View all"}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {shown.map((cat, index) => (
                      <motion.div
                        key={cat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate(`/difficulty/${cat.id}`)}
                        className="rounded-2xl p-4 cursor-pointer drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                        style={{ backgroundColor: pastelColorMap[cat.id] || "#e8f1ff" }}
                      >
                        {/* Image container */}
                        <div className="aspect-video mb-3 rounded-xl overflow-hidden bg-white/60 flex items-center justify-center">
                          {imageMap[cat.id] ? (
                            <img
                              src={imageMap[cat.id]}
                              alt={cat.name}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100/50 flex items-center justify-center">
                              <span className="text-gray-400 text-xs font-medium">Image</span>
                            </div>
                          )}
                        </div>

                        {/* Category name */}
                        <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                          {cat.name}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-xs text-gray-600 mb-2 font-normal">
                          Tap to view quizzes
                        </p>

                        {/* Metadata row */}
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <span>Multiple difficulty levels</span>
                          <span className="text-gray-300">•</span>
                          <span>Timed quizzes</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              );
            })}

            {/* Community Categories */}
            <section id="community-categories" className="mb-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
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
                <p className="text-gray-500 text-base">
                  No custom categories found yet. Head to the admin panel to add some!
                </p>
              ) : (
                localCollections.map((cat, catIndex) => (
                  <motion.div
                    key={cat.id}
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                      delay: 0.05 * (catIndex + 5),
                    }}
                  >
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                        {cat.name}
                      </h3>
                    </div>

                    {cat.subcategories.length === 0 ? (
                      <p className="text-gray-500 text-base">
                        No subcategories have been created for this category yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {cat.subcategories.map((sub, index) => (
                          <motion.div
                            key={sub.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ scale: 1.05 }}
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
                            className="rounded-2xl p-4 cursor-pointer drop-shadow-md hover:drop-shadow-lg transition-all duration-300"
                            style={{ backgroundColor: sub.color || "#F9FAFB" }}
                          >
                            {sub.imageUrl ? (
                              <div className="aspect-video mb-3 rounded-xl overflow-hidden bg-white/60 flex items-center justify-center">
                                <img
                                  src={normalizeImageUrl(sub.imageUrl)}
                                  alt={sub.name}
                                  className="w-full h-full object-contain p-2"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="aspect-video mb-3 rounded-xl bg-gray-100/50 flex items-center justify-center">
                                <span className="text-gray-400 text-xs font-medium">Image</span>
                              </div>
                            )}

                            <h4 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                              {sub.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2 font-normal">
                              Tap to view quizzes
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                              <span>Multiple difficulty levels</span>
                              <span className="text-gray-300">•</span>
                              <span>Timed quizzes</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Category;
