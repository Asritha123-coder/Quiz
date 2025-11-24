import React, { useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Plus, Loader } from "lucide-react";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!name.trim()) {
      setMessage("Category name is required");
      setMessageType("error");
      return;
    }

    if (name.trim().length < 3) {
      setMessage("Category name must be at least 3 characters long");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:3000/categories", { name: name.trim() });
      setMessage("Category added successfully!");
      setMessageType("success");
      setName("");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      console.error(error);
      setMessage(error.response?.data?.message || "Error adding category. Please try again.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Category</h1>
        <p className="text-gray-600">Create a new category for organizing quizzes</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              messageType === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle size={20} className="flex-shrink-0" />
            ) : (
              <XCircle size={20} className="flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="categoryName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Category Name
            </label>
            <input
              id="categoryName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (message) {
                  setMessage("");
                  setMessageType("");
                }
              }}
              placeholder="e.g., Science, History, Sports"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder-gray-400"
              required
              disabled={loading}
              minLength={3}
            />
            <p className="mt-2 text-xs text-gray-500">
              Enter a descriptive name for your category (minimum 3 characters)
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Category
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setName("");
                setMessage("");
                setMessageType("");
              }}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Categories help organize your quizzes. Make sure to use clear, 
          descriptive names that users will easily understand.
        </p>
      </div>
    </div>
  );
};

export default AddCategory;
