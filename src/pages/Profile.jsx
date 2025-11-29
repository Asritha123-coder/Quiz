import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User,
  Mail,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  Edit,
} from "lucide-react";

const API_URL = "http://localhost:3000";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [attemptsRes, catRes, subRes] = await Promise.all([
          axios.get(`${API_URL}/quizAttempts`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/categories`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/subcategories`).catch(() => ({ data: [] })),
        ]);

        const userAttempts = (attemptsRes.data || []).filter(
          (att) => att.userEmail === user?.email || att.userName === user?.name
        );

        setAttempts(userAttempts);
        setCategories(catRes.data || []);
        setSubcategories(subRes.data || []);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAuthenticated, navigate]);

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

  const stats = useMemo(() => {
    if (!attempts.length) {
      return {
        totalAttempts: 0,
        totalScore: 0,
        totalQuestions: 0,
        averageAccuracy: 0,
        bestScore: 0,
        bestAccuracy: 0,
        totalTime: 0,
        averageTime: 0,
      };
    }

    const totalScore = attempts.reduce((sum, att) => sum + (att.score || 0), 0);
    const totalQuestions = attempts.reduce((sum, att) => sum + (att.totalQuestions || 0), 0);
    const totalTime = attempts.reduce((sum, att) => sum + (att.durationSeconds || 0), 0);
    const bestScore = Math.max(...attempts.map((att) => att.score || 0));
    const bestAccuracy = Math.max(
      ...attempts.map((att) => ((att.score || 0) / (att.totalQuestions || 1)) * 100)
    );

    return {
      totalAttempts: attempts.length,
      totalScore,
      totalQuestions,
      averageAccuracy: totalQuestions ? ((totalScore / totalQuestions) * 100).toFixed(1) : "0.0",
      bestScore,
      bestAccuracy: bestAccuracy.toFixed(1),
      totalTime,
      averageTime: Math.round(totalTime / attempts.length),
    };
  }, [attempts]);

  const recentAttempts = useMemo(() => {
    return [...attempts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [attempts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{user?.name || "User"}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={18} />
                  <span>{user?.email || "No email"}</span>
                </div>
                {user?.role === "admin" && (
                  <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                    Administrator
                  </span>
                )}
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg">
              <Edit size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Trophy className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalAttempts}</h3>
            <p className="text-gray-600 font-medium">Total Attempts</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Target className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.averageAccuracy}%</h3>
            <p className="text-gray-600 font-medium">Average Accuracy</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Award className="text-amber-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.bestAccuracy}%</h3>
            <p className="text-gray-600 font-medium">Best Accuracy</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {Math.round(stats.averageTime / 60)}m
            </h3>
            <p className="text-gray-600 font-medium">Avg. Time</p>
          </div>
        </div>

        {/* Performance Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <BarChart3 className="text-blue-600" size={28} />
              Performance Overview
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Best Score</span>
                  <span className="font-semibold">{stats.bestScore} points</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    style={{ width: `${(stats.bestScore / (stats.totalQuestions || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Total Questions Answered</span>
                  <span className="font-semibold">{stats.totalQuestions}</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, (stats.totalQuestions / 100) * 10)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Total Time Spent</span>
                  <span className="font-semibold">{Math.round(stats.totalTime / 60)} minutes</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                    style={{ width: `${Math.min(100, (stats.totalTime / 3600) * 20)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={28} />
              Recent Activity
            </h2>
            {recentAttempts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                <p>No quiz attempts yet.</p>
                <p className="text-sm mt-2">Start taking quizzes to see your activity here!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentAttempts.map((attempt) => {
                  const accuracy = ((attempt.score || 0) / (attempt.totalQuestions || 1)) * 100;
                  return (
                    <div
                      key={attempt.id}
                      className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {categoryLookup[attempt.categoryId] || attempt.categoryId}
                            {attempt.subCategoryId &&
                              subcategoryLookup[attempt.subCategoryId] &&
                              ` • ${subcategoryLookup[attempt.subCategoryId]}`}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">{attempt.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                          <p className="text-sm text-gray-600">{accuracy.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(attempt.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          {Math.round((attempt.durationSeconds || 0) / 60)}m
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quiz History Table */}
        {attempts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-indigo-600" size={28} />
                Complete Quiz History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                      Difficulty
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      Score
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      Accuracy
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attempts
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((attempt) => {
                      const accuracy = ((attempt.score || 0) / (attempt.totalQuestions || 1)) * 100;
                      return (
                        <tr key={attempt.id} className="hover:bg-blue-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(attempt.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {categoryLookup[attempt.categoryId] || attempt.categoryId}
                            {attempt.subCategoryId &&
                              subcategoryLookup[attempt.subCategoryId] &&
                              ` • ${subcategoryLookup[attempt.subCategoryId]}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-purple-100 text-purple-700">
                              {attempt.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
                            {attempt.score}/{attempt.totalQuestions}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                accuracy >= 80
                                  ? "bg-green-100 text-green-700"
                                  : accuracy >= 60
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {accuracy.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                            {Math.round((attempt.durationSeconds || 0) / 60)}m
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;




