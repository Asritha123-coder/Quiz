import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/categories`);
      setCategories(res.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to load categories", err);
      setError("Unable to load categories. Please check your JSON server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(query));
  }, [categories, search]);

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setNameInput(cat.name);
    setStatus("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNameInput("");
  };

  const saveCategory = async () => {
    if (!nameInput.trim()) {
      setStatus("Name cannot be empty.");
      return;
    }
    try {
      await axios.patch(`${API_URL}/categories/${editingId}`, {
        name: nameInput.trim(),
      });
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === editingId ? { ...cat, name: nameInput.trim() } : cat
        )
      );
      setStatus("Category updated!");
      cancelEdit();
    } catch (err) {
      console.error("Update failed", err);
      setStatus("Failed to update. Try again.");
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      setStatus("Category deleted.");
    } catch (err) {
      console.error("Delete failed", err);
      setStatus("Failed to delete. Try again.");
    }
  };

  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-purple-500">
            Manage Categories
          </p>
          <h1 className="text-3xl font-bold text-gray-800">
            Curate Your Library
          </h1>
          <p className="text-gray-500 text-sm">
            Update or remove custom categories stored in `db.json`.
          </p>
        </div>

        <input
          type="search"
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72 px-4 py-2 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-purple-400 transition"
        />
      </div>

      {status && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 transition">
          {status}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          No categories found. Try a different search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((cat) => {
            const isEditing = editingId === cat.id;
            return (
              <div
                key={cat.id}
                className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 blur-xl transition" />

                <div className="relative">
                  <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
                    Category ID
                  </p>
                  <p className="text-sm font-semibold text-gray-700 mb-4 truncate">
                    {cat.id}
                  </p>

                  {isEditing ? (
                    <input
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-purple-400 outline-none"
                      placeholder="Category name"
                    />
                  ) : (
                    <h3 className="text-xl font-bold text-gray-900">
                      {cat.name}
                    </h3>
                  )}

                  <div className="mt-6 flex gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={saveCategory}
                          className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg shadow hover:bg-purple-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="flex-1 px-3 py-2 text-sm text-purple-600 border border-purple-100 rounded-lg hover:bg-purple-50 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="px-3 py-2 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition"
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

export default ManageCategories;
