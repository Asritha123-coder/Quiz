import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

const emptyForm = {
  name: "",
  categoryId: "",
  imageUrl: "",
  color: "#F3F4F6",
};

const ManageSubCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/subcategories`),
      ]);
      setCategories(catRes.data || []);
      setSubcategories(subRes.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load subcategory data", err);
      setError("Unable to load data. Ensure JSON server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const startEdit = (sub) => {
    setEditingId(sub.id);
    setForm({
      name: sub.name || "",
      categoryId: sub.categoryId || "",
      imageUrl: sub.imageUrl || "",
      color: sub.color || "#F3F4F6",
    });
    setStatus("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveSub = async () => {
    if (!form.name.trim() || !form.categoryId) {
      setStatus("Name and category are required.");
      return;
    }

    try {
      await axios.patch(`${API_URL}/subcategories/${editingId}`, {
        ...form,
        name: form.name.trim(),
      });
      setSubcategories((prev) =>
        prev.map((sub) =>
          sub.id === editingId ? { ...sub, ...form, name: form.name.trim() } : sub
        )
      );
      setStatus("Subcategory updated!");
      cancelEdit();
    } catch (err) {
      console.error("Failed to update subcategory", err);
      setStatus("Save failed. Try again.");
    }
  };

  const deleteSub = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await axios.delete(`${API_URL}/subcategories/${id}`);
      setSubcategories((prev) => prev.filter((sub) => sub.id !== id));
      setStatus("Subcategory deleted.");
    } catch (err) {
      console.error("Delete failed", err);
      setStatus("Delete failed. Try again.");
    }
  };

  const categoryLookup = useMemo(() => {
    const map = {};
    categories.forEach((cat) => {
      map[cat.id] = cat.name;
    });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subcategories;
    return subcategories.filter((sub) => {
      const matchesName = sub.name?.toLowerCase().includes(q);
      const matchesCategory = categoryLookup[sub.categoryId]
        ?.toLowerCase()
        .includes(q);
      return matchesName || matchesCategory;
    });
  }, [subcategories, search, categoryLookup]);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-pink-500">
            Manage Subcategories
          </p>
          <h1 className="text-3xl font-bold text-gray-800">
            Organize Nested Topics
          </h1>
          <p className="text-gray-500 text-sm">
            Update metadata (name, category, imagery, color) for every custom
            subcategory.
          </p>
        </div>

        <input
          type="search"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-80 px-4 py-2 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-pink-400 transition"
        />
      </div>

      {status && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-pink-50 text-pink-700 border border-pink-100 transition">
          {status}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No subcategories found.
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((sub) => {
            const isEditing = editingId === sub.id;
            return (
              <div
                key={sub.id}
                className="relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition duration-300"
              >
                <div
                  className="absolute inset-y-0 left-0 w-1.5 rounded-l-2xl"
                  style={{ backgroundColor: sub.color || "#F472B6" }}
                />
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {sub.imageUrl && (
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className="h-full w-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-400">
                          Subcategory
                        </p>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {isEditing ? (
                            <input
                              value={form.name}
                              onChange={(e) =>
                                handleChange("name", e.target.value)
                              }
                              className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-pink-400"
                              placeholder="Subcategory name"
                            />
                          ) : (
                            sub.name
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Category:{" "}
                          <span className="font-medium text-gray-700">
                            {isEditing ? (
                              <select
                                value={form.categoryId}
                                onChange={(e) =>
                                  handleChange("categoryId", e.target.value)
                                }
                                className="mt-2 w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-pink-400"
                              >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              categoryLookup[sub.categoryId] || "—"
                            )}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      <p>ID: {sub.id}</p>
                      <p>Color: {sub.color || "—"}</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">
                          Image URL
                        </label>
                        <input
                          value={form.imageUrl}
                          onChange={(e) =>
                            handleChange("imageUrl", e.target.value)
                          }
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-pink-400"
                          placeholder="https://example.com/image.png"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-500 mb-1 block">
                          Accent Color
                        </label>
                        <input
                          type="color"
                          value={form.color || "#F3F4F6"}
                          onChange={(e) => handleChange("color", e.target.value)}
                          className="w-full h-11 rounded-xl border border-gray-200 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveSub}
                          className="px-4 py-2 bg-pink-600 text-white text-sm rounded-lg shadow hover:bg-pink-700 transition"
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
                          onClick={() => startEdit(sub)}
                          className="px-4 py-2 text-sm text-pink-600 border border-pink-100 rounded-lg hover:bg-pink-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSub(sub.id)}
                          className="px-4 py-2 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageSubCategories;
