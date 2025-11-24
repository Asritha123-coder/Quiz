
import { useEffect, useState } from "react";
import axios from "axios";

const AddQuestions = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const[selectedlevel,setlevel]=useState("");
  const [questionCount, setQuestionCount] = useState(1);
  const [questions, setQuestions] = useState([]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      alert("Failed to load categories");
    }
  };

  // Fetch Subcategories
  const fetchSubcategories = async (categoryId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/subcategories?categoryId=${categoryId}`
      );
      setSubcategories(res.data);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      alert("Failed to load subcategories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // When category changes → load its subcategories
  useEffect(() => {
    if (selectedCategory) fetchSubcategories(selectedCategory);
  }, [selectedCategory]);

  // Generate empty question fields
  const handleCountChange = (e) => {
    const value = Number(e.target.value);
    setQuestionCount(value);

    const qn = Array.from({ length: value }, () => ({
      question: "",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correct: "",
    }));

    setQuestions(qn);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCategory || !selectedSubCategory) {
      alert("Please select category and subcategory");
      return;
    }

    try {
      await axios.post("http://localhost:3000/questions", {
        categoryId: selectedCategory,
        subCategoryId: selectedSubCategory,
        level:selectedlevel,
        questions,
      });

      alert("Questions Added Successfully!");
    } catch (error) {
      console.error("Error adding questions:", error);
      alert("Failed to add questions");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl border p-6">

        {/* Header */}
        <h1 className="text-2xl font-bold mb-3">Add Questions</h1>
        <p className="text-gray-600 mb-5">
          Choose category, subcategory and enter quiz questions.
        </p>

        {/* Category Selector */}
        <div className="mb-4">
          <label className="font-medium">Category</label>
          <select
            className="w-full p-3 border rounded-lg mt-1"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Subcategory Selector */}
        <div className="mb-4">
          <label className="font-medium">Subcategory</label>
          <select
            className="w-full p-3 border rounded-lg mt-1"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
          >
            <option value="">Select Subcategory</option>
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
         <div className="mb-4">
          <label className="font-medium">Difficulty level</label>
          <select
            className="w-full p-3 border rounded-lg mt-1"
            value={selectedlevel}
            onChange={(e) => setlevel(e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value ="medium">Medium</option>
            <option value="difficult">Difficult</option>
          </select>
        </div>

        {/* No. of Questions */}
        <div className="mb-6">
          <label className="font-medium">No. of Questions</label>
          <input
            type="number"
            min="1"
            className="w-full p-3 mt-1 border rounded-lg"
            value={questionCount}
            onChange={handleCountChange}
          />
        </div>

        {/* Dynamic Question Forms */}
        {questions.map((q, index) => (
          <div
            key={index}
            className="border p-4 rounded-xl mb-4 bg-gray-50 shadow-sm"
          >
            <h2 className="font-semibold mb-3">Question {index + 1}</h2>

            <input
              className="w-full p-3 border rounded-lg mb-3"
              placeholder="Enter question"
              onChange={(e) =>
                handleQuestionChange(index, "question", e.target.value)
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <input
                className="p-3 border rounded-lg"
                placeholder="Option A"
                onChange={(e) =>
                  handleQuestionChange(index, "optionA", e.target.value)
                }
              />
              <input
                className="p-3 border rounded-lg"
                placeholder="Option B"
                onChange={(e) =>
                  handleQuestionChange(index, "optionB", e.target.value)
                }
              />
              <input
                className="p-3 border rounded-lg"
                placeholder="Option C"
                onChange={(e) =>
                  handleQuestionChange(index, "optionC", e.target.value)
                }
              />
              <input
                className="p-3 border rounded-lg"
                placeholder="Option D"
                onChange={(e) =>
                  handleQuestionChange(index, "optionD", e.target.value)
                }
              />
            </div>

            <select
              className="mt-3 p-3 border rounded-lg w-full"
              onChange={(e) =>
                handleQuestionChange(index, "correct", e.target.value)
              }
            >
              <option value="">Correct Answer</option>
              <option value="A">Option A</option>
              <option value="B">Option B</option>
              <option value="C">Option C</option>
              <option value="D">Option D</option>
            </select>
          </div>
        ))}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow"
        >
          Submit Questions
        </button>
      </div>
    </div>
  );
};

export default AddQuestions;
