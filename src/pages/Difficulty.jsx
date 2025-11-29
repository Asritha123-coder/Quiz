import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, Target, Award } from "lucide-react";

const defaultLevels = ["easy", "medium", "hard"];

const Difficulty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const isCustom = id?.startsWith("local-");
  const subCategoryId = isCustom ? id.replace("local-", "") : null;

  const [levels, setLevels] = useState(isCustom ? [] : defaultLevels);
  const [loading, setLoading] = useState(isCustom);
  const [error, setError] = useState("");
  const [subInfo, setSubInfo] = useState(
    location.state?.customMeta || null
  );

  useEffect(() => {
    let active = true;

    if (!isCustom) {
      setLevels(defaultLevels);
      setLoading(false);
      setError("");
      return undefined;
    }

    const fetchCustom = async () => {
      setLoading(true);
      setError("");
      try {
        const [subRes, questionsRes] = await Promise.all([
          axios.get(
            `http://localhost:3000/subcategories?id=${subCategoryId}`
          ),
          axios.get(
            `http://localhost:3000/questions?subCategoryId=${subCategoryId}`
          ),
        ]);

        if (!active) return;

        const subRecord = subRes.data?.[0];
        if (subRecord) {
          const enriched = {
            ...subRecord,
            subcategoryName: subRecord.subcategoryName || subRecord.name,
          };
          setSubInfo((prev) => ({ ...enriched, ...prev }));
        }

        const availableLevels = Array.from(
          new Set(
            (questionsRes.data || [])
              .map((entry) => entry.level)
              .filter(Boolean)
              .map((lvl) => lvl.toLowerCase())
          )
        );

        if (!availableLevels.length) {
          setError("No questions available for this subcategory yet.");
        }

        setLevels(availableLevels);
      } catch (err) {
        console.error("Failed to load custom difficulty data:", err);
        setError("Failed to load custom difficulty levels.");
        setLevels([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCustom();

    return () => {
      active = false;
    };
  }, [isCustom, subCategoryId]);

  const pageTitle = useMemo(() => {
    if (!isCustom) return "Select Difficulty";
    return subInfo?.subcategoryName || subInfo?.name || "Custom Subcategory";
  }, [isCustom, subInfo]);

  const description = useMemo(() => {
    if (!isCustom) return "Choose a difficulty level for this trivia category.";
    return subInfo?.categoryName
      ? `${subInfo.categoryName} • ${pageTitle}`
      : "Choose a level available for this custom subcategory.";
  }, [isCustom, subInfo, pageTitle]);

  const selectDifficulty = (level) => {
    if (!level) return;
    navigate(`/quiz/${id}/${level}`, {
      state: isCustom
        ? {
            customMeta: {
              ...subInfo,
              subCategoryId,
            },
          }
        : undefined,
    });
  };

  const getDifficultyIcon = (level) => {
    switch (level) {
      case "easy":
        return <Target className="w-6 h-6" />;
      case "medium":
        return <Zap className="w-6 h-6" />;
      case "hard":
        return <Award className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case "easy":
        return "from-green-400 to-green-600";
      case "medium":
        return "from-yellow-400 to-yellow-600";
      case "hard":
        return "from-red-400 to-red-600";
      default:
        return "from-blue-400 to-blue-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {pageTitle}
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            {description}
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Difficulty Levels */}
        {!loading && !error && levels.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levels.map((level, index) => (
              <motion.button
                key={level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => selectDifficulty(level)}
                className={`bg-gradient-to-br ${getDifficultyColor(level)} text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    {getDifficultyIcon(level)}
                  </div>
                  <h3 className="text-2xl font-bold capitalize">{level}</h3>
                  <p className="text-sm opacity-90 text-center">
                    {level === "easy" && "Perfect for beginners"}
                    {level === "medium" && "Challenge yourself"}
                    {level === "hard" && "Test your expertise"}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        )}

        {/* No Levels Available */}
        {!loading && !error && !levels.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center text-gray-500"
          >
            <p className="text-lg">No difficulty levels available.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Difficulty;
