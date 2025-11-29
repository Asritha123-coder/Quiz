import React from "react";

import Navbar from "./components/navbar";
import Login from "./pages/login";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";

import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Category from "./pages/Category";
import Difficulty from "./pages/Difficulty";
import Leaderboard from "./pages/Leaderboard";
import About from "./pages/About";
import Profile from "./pages/Profile";
import QuizLoader from "./pages/QuizLoader";
import AdminLayout from "./admin/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ADMIN PAGES
import AdminDashboard from "./admin/pages/AdminDashboard";
import AddCategory from "./admin/pages/AddCategory";
import AddSubCategory from "./admin/pages/AddSubCategory";
import AddQuestions from "./admin/pages/AddQuestions";
import ManageCategories from "./admin/pages/ManageCategories";
import ManageSubCategories from "./admin/pages/ManageSubCategories";
import ManageQuestions from "./admin/pages/ManageQuestions";
import AdminAnalytics from "./admin/pages/AdminAnalytics";

function AppWrapper() {
  const location = useLocation();

  // detect admin route
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div>
      {/* USER NAVBAR ONLY */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* USER ROUTES */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/Category" element={<Category />} />
        <Route path="/Difficulty/:id" element={<Difficulty />} />
        <Route path="/quiz-loading" element={<QuizLoader />} />
        <Route path="/quiz/:id/:level" element={<Quiz />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />

        {/* ADMIN ROUTES - Protected */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="add-subcategory" element={<AddSubCategory />} />
          <Route path="add-questions" element={<AddQuestions />} />
          <Route path="manage-categories" element={<ManageCategories />} />
          <Route path="manage-subcategories" element={<ManageSubCategories />} />
          <Route path="manage-questions" element={<ManageQuestions />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}
