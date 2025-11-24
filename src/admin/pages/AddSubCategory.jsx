import { useEffect, useState } from "react";
import axios from "axios";

const AddSubCategory = () => {
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    imageUrl: "",
    color: "#F0F9FF",
  });

  // Fetch categories for dropdown
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const localRes = await axios.get("http://localhost:3000/categories");

      setCategories(localRes.data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  fetchCategories();
}, []);

    

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter a subcategory name.");
      return;
    }

    if (!form.categoryId) {
      alert("Please select a category.");
      return;
    }

    if (!form.imageUrl.trim()) {
      alert("Please provide an image URL.");
      return;
    }

    try {
      setSubmitting(true);

      await axios.post("http://localhost:3000/subcategories", form);

      alert("Subcategory added successfully!");

      setForm({
        name: "",
        categoryId: "",
        imageUrl: "",
        color: "#F0F9FF",
      });
    } catch (err) {
      alert("Failed to add subcategory. Ensure server is running.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">

        {/* Header */}
        <div className="px-6 py-5 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h1 className="text-2xl font-bold">Add Subcategory</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create a subcategory under an existing category.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">

            {/* Subcategory Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subcategory Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="e.g., World History"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Select Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category
              </label>
              <select
  name="categoryId"
  value={form.categoryId}
  onChange={handleChange}
  className="w-full p-3 border rounded-lg"
>
  <option value="">Select a Category</option>

  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>

            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                placeholder="https://example.com/image.png"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="h-10 w-16 border rounded"
                />
                <input
                  type="text"
                  name="color"
                  value={form.color}
                  placeholder="#F0F9FF"
                  onChange={handleChange}
                  className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Subcategory"}
            </button>
          </form>

          {/* Live Preview */}
          <div>
            <div className="text-sm text-gray-700 font-medium mb-2">
              Live Preview
            </div>

            <div
              className="rounded-xl shadow-md border overflow-hidden transition"
              style={{ backgroundColor: form.color }}
            >
              <div className="p-4">

                {/* Image */}
                <div className="w-full h-32 bg-white/50 rounded-lg flex items-center justify-center overflow-hidden mb-3">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt={"preview"}
                      className="max-h-24 object-contain"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <span className="text-sm text-gray-600">Image Preview</span>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold">
                  {form.name || "Subcategory Name"}
                </h3>

                {/* Category Label */}
                <p className="text-gray-700 text-sm mt-1">
                  {form.categoryId
                    ? `Belongs to: ${
                        categories.find((c) => c.id == form.categoryId)?.name
                      }`
                    : "No category selected"}
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddSubCategory;
