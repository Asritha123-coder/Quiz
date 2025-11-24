import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

const emptyQuestion = {
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correct: "A",
};

const emptyForm = {
  categoryId: "",
  subCategoryId: "",
  level: "easy",
  questions: [emptyQuestion],
};

const ManageQuestions = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [filter, setFilter] = useState({
    categoryId: "",
    subCategoryId: "",
    level: "",
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [catRes, subRes, questionsRes] = await Promise.all([
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/subcategories`),
        axios.get(`${API_URL}/questions`),
      ]);
      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);
      setQuestionSets(questionsRes.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load questions data", err);
      setError("Unable to load data. Please ensure the JSON server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredSets = useMemo(() => {
    return questionSets.filter((set) => {
      const matchesCategory = filter.categoryId
        ? set.categoryId === filter.categoryId
        : true;
      const matchesSub = filter.subCategoryId
        ? set.subCategoryId === filter.subCategoryId
        : true;
      const matchesLevel = filter.level ? set.level === filter.level : true;
      return matchesCategory && matchesSub && matchesLevel;
    });
  }, [questionSets, filter]);

  const subOptionsFor = (categoryId) =>
    subcategories.filter((sub) => sub.categoryId === categoryId);

  const startEdit = (set) => {
    setEditingId(set.id);
    setForm({
      categoryId: set.categoryId || "",
      subCategoryId: set.subCategoryId || "",
      level: set.level || "easy",
      questions:
        set.questions?.length > 0
          ? set.questions.map((q) => ({
              question: q.question || "",
              optionA: q.optionA || "",
              optionB: q.optionB || "",
              optionC: q.optionC || "",
              optionD: q.optionD || "",
              correct: (q.correct || "A").toUpperCase(),
            }))
          : [emptyQuestion],
    });
    setStatus("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "categoryId" ? { subCategoryId: "" } : {}),
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.questions];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, questions: next };
    });
  };

  const addQuestionRow = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...emptyQuestion }],
    }));
  };

  const removeQuestionRow = (index) => {
    setForm((prev) => {
      if (prev.questions.length === 1) return prev;
      const next = prev.questions.filter((_, idx) => idx !== index);
      return { ...prev, questions: next };
    });
  };

  const saveQuestionSet = async () => {
    if (!form.categoryId || !form.subCategoryId) {
      setStatus("Category and subcategory are required.");
      return;
    }

    const trimmedQuestions = form.questions
      .map((q) => ({
        ...q,
        question: q.question.trim(),
        optionA: q.optionA.trim(),
        optionB: q.optionB.trim(),
        optionC: q.optionC.trim(),
        optionD: q.optionD.trim(),
        correct: (q.correct || "A").toUpperCase(),
      }))
      .filter(
        (q) =>
          q.question &&
          q.optionA &&
          q.optionB &&
          q.optionC &&
          q.optionD &&
          ["A", "B", "C", "D"].includes(q.correct)
      );

    if (!trimmedQuestions.length) {
      setStatus("Add at least one complete MCQ.");
      return;
    }

    try {
      const payload = {
        categoryId: form.categoryId,
        subCategoryId: form.subCategoryId,
        level: form.level,
        questions: trimmedQuestions,
      };
      await axios.put(`${API_URL}/questions/${editingId}`, payload);
      setQuestionSets((prev) =>
        prev.map((set) => (set.id === editingId ? { ...set, ...payload } : set))
      );
      setStatus("Question set updated!");
      cancelEdit();
    } catch (err) {
      console.error("Failed to save questions", err);
      setStatus("Save failed. Try again.");
    }
  };

  const deleteQuestionSet = async (id) => {
    if (!window.confirm("Delete this entire question set?")) return;
    try {
      await axios.delete(`${API_URL}/questions/${id}`);
      setQuestionSets((prev) => prev.filter((set) => set.id !== id));
      setStatus("Question set deleted.");
    } catch (err) {
      console.error("Failed to delete question set", err);
      setStatus("Delete failed. Try again.");
    }
  };

  const categoryLookup = useMemo(() => {
    const map = {};
    categories.forEach((cat) => (map[cat.id] = cat.name));
    return map;
  }, [categories]);

  const subcategoryLookup = useMemo(() => {
    const map = {};
    subcategories.forEach((sub) => (map[sub.id] = sub.name));
    return map;
  }, [subcategories]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-5 mb-8">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-500">
            Manage Question Banks
          </p>
          <h1 className="text-3xl font-bold text-gray-800">
            Fine-tune Every Quiz
          </h1>
          <p className="text-gray-500 text-sm">
            Edit question sets powering your custom quizzes. All changes sync to
            `db.json` via the JSON server.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filter.categoryId}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, categoryId: e.target.value, subCategoryId: "" }))
            }
            className="px-4 py-2 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={filter.subCategoryId}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, subCategoryId: e.target.value }))
            }
            className="px-4 py-2 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-400"
            disabled={!filter.categoryId}
          >
            <option value="">All Subcategories</option>
            {subOptionsFor(filter.categoryId || "").map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          <select
            value={filter.level}
            onChange={(e) =>
              setFilter((prev) => ({ ...prev, level: e.target.value }))
            }
            className="px-4 py-2 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-emerald-400"
          >
            <option value="">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {status && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 transition">
          {status}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filteredSets.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No question sets match the current filters.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSets.map((set) => {
            const isEditing = editingId === set.id;
            const subName = subcategoryLookup[set.subCategoryId] || "—";
            const catName = categoryLookup[set.categoryId] || "—";
            return (
              <div
                key={set.id}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition duration-300"
              >
                <div className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Question Set
                      </p>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {catName} • {subName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Level:{" "}
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs uppercase tracking-wide">
                          {set.level}
                        </span>{" "}
                        | {set.questions?.length || 0} MCQs
                      </p>
                    </div>

                    <div className="flex gap-3">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveQuestionSet}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg shadow hover:bg-emerald-700 transition"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(set)}
                            className="px-4 py-2 text-sm text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-50 transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteQuestionSet(set.id)}
                            className="px-4 py-2 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Category
                          </label>
                          <select
                            value={form.categoryId}
                            onChange={(e) =>
                              handleFormChange("categoryId", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400"
                          >
                            <option value="">Select category</option>
                            {categories.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Subcategory
                          </label>
                          <select
                            value={form.subCategoryId}
                            onChange={(e) =>
                              handleFormChange("subCategoryId", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400"
                          >
                            <option value="">Select subcategory</option>
                            {subOptionsFor(form.categoryId).map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 mb-1 block">
                            Difficulty
                          </label>
                          <select
                            value={form.level}
                            onChange={(e) =>
                              handleFormChange("level", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {form.questions.map((q, idx) => (
                          <div
                            key={idx}
                            className="border border-gray-200 rounded-2xl p-4 shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-semibold text-gray-800">
                                Question {idx + 1}
                              </h4>
                              {form.questions.length > 1 && (
                                <button
                                  onClick={() => removeQuestionRow(idx)}
                                  className="text-sm text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <textarea
                              value={q.question}
                              onChange={(e) =>
                                handleQuestionChange(
                                  idx,
                                  "question",
                                  e.target.value
                                )
                              }
                              className="w-full mb-3 px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400"
                              placeholder="Enter the question prompt"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {["optionA", "optionB", "optionC", "optionD"].map(
                                (optionKey) => (
                                  <div key={optionKey}>
                                    <label className="text-xs uppercase text-gray-400 block mb-1">
                                      {optionKey.toUpperCase()}
                                    </label>
                                    <input
                                      value={q[optionKey]}
                                      onChange={(e) =>
                                        handleQuestionChange(
                                          idx,
                                          optionKey,
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400"
                                      placeholder={`Answer choice ${optionKey.slice(-1)}`}
                                    />
                                  </div>
                                )
                              )}
                            </div>

                            <div className="mt-3">
                              <label className="text-sm text-gray-500 mb-1 block">
                                Correct Option
                              </label>
                              <select
                                value={q.correct}
                                onChange={(e) =>
                                  handleQuestionChange(idx, "correct", e.target.value)
                                }
                                className="px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-400"
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={addQuestionRow}
                          className="w-full py-3 border-2 border-dashed border-emerald-200 rounded-2xl text-emerald-600 font-medium hover:bg-emerald-50 transition"
                        >
                          + Add Another MCQ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageQuestions;
