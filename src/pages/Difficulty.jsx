import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";

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

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold text-center mb-2">{pageTitle}</h1>
      <p className="text-center text-gray-500 mb-6">{description}</p>

      {loading && (
        <div className="text-center text-gray-500 py-6">Loading levels...</div>
      )}

      {!loading && error && (
        <div className="text-center text-red-500 py-4">{error}</div>
      )}

      {!loading &&
        !error &&
        levels.map((level) => (
          <button
            key={level}
            onClick={() => selectDifficulty(level)}
            className="w-full p-3 mb-3 bg-indigo-100 hover:bg-indigo-200 rounded-lg capitalize"
          >
            {level}
          </button>
        ))}

      {!loading && !error && !levels.length && (
        <p className="text-center text-gray-500">
          No difficulty levels available.
        </p>
      )}
    </div>
  );
};

export default Difficulty;
