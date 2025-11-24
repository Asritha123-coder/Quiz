import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6">
      <h1 className="text-3xl font-bold mb-4">Explore</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search categories..."
        className="w-full p-3 mb-6 border rounded-xl shadow-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {Object.keys(categoryGroups).map((groupName) => {
        const groupIds = categoryGroups[groupName];
        const groupCat = filtered.filter((c) => groupIds.includes(c.id));

        if (groupCat.length === 0) return null;

        const expanded = expandedGroups[groupName];
        const shown = expanded ? groupCat : groupCat.slice(0, 3);

        return (
          <div key={groupName} className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{groupName}</h2>

              {groupCat.length > 3 && (
                <button
                  onClick={() =>
                    setExpandedGroups({
                      ...expandedGroups,
                      [groupName]: !expanded,
                    })
                  }
                  className="text-purple-600 hover:underline"
                >
                  {expanded ? "View Less" : "View All"}
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {shown.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(`/difficulty/${cat.id}`)}
                  className={`${pastelMap[cat.id]} shadow-md rounded-xl p-4 transition hover:shadow-xl hover:-translate-y-1 cursor-pointer`}
                >
                  {/* Image */}
                  <img
                    src={imageMap[cat.id]}
                    alt={cat.name}
                    className="w-full h-32 object-contain mb-3 rounded-lg"
                  />

                  {/* Title */}
                  <h3 className="text-lg font-semibold">{cat.name}</h3>
                  <p className="text-gray-600 text-sm">Tap to view quizzes</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Community Categories</h2>
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
          localCollections.map((cat) => (
            <div key={cat.id} className="mb-10">
              <h3 className="text-xl font-semibold mb-4">{cat.name}</h3>

              {cat.subcategories.length === 0 ? (
                <p className="text-gray-500">
                  No subcategories have been created for this category yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
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
                      className="shadow-md rounded-xl p-4 border border-gray-100 cursor-pointer transition hover:shadow-lg"
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

                      <h4 className="text-lg font-semibold">{sub.name}</h4>
                      <p className="text-gray-600 text-sm">
                        Added by your team
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Category;
