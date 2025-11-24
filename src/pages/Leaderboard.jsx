import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Trophy, Medal, Award, TrendingUp, Clock, Target } from "lucide-react";

const API_URL = "http://localhost:3000";

const Leaderboard = () => {
  const [attempts, setAttempts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ level: "all", category: "all" });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [attemptsRes, catRes, subRes] = await Promise.all([
          axios.get(`${API_URL}/quizAttempts`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/categories`).catch(() => ({ data: [] })),
          axios.get(`${API_URL}/subcategories`).catch(() => ({ data: [] })),
        ]);

        setAttempts(attemptsRes.data || []);
        setCategories(catRes.data || []);
        setSubcategories(subRes.data || []);
        setError("");
      } catch (err) {
        console.error("Error fetching leaderboard data:", err);
        setError("Unable to load leaderboard data. Please ensure JSON server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const filteredAttempts = useMemo(() => {
    let filtered = [...attempts];

    if (filter.level !== "all") {
      filtered = filtered.filter((att) => att.level === filter.level);
    }

    if (filter.category !== "all") {
      filtered = filtered.filter((att) => att.categoryId === filter.category);
    }

    return filtered;
  }, [attempts, filter]);

  // Calculate leaderboard rankings
  const leaderboardData = useMemo(() => {
    const userMap = {};

    filteredAttempts.forEach((attempt) => {
      const key = attempt.userEmail || attempt.userName;
      if (!userMap[key]) {
        userMap[key] = {
          userName: attempt.userName,
          userEmail: attempt.userEmail,
          totalAttempts: 0,
          totalScore: 0,
          totalQuestions: 0,
          bestScore: 0,
          bestAccuracy: 0,
          totalDuration: 0,
          recentDate: null,
        };
      }

      const user = userMap[key];
      user.totalAttempts += 1;
      user.totalScore += attempt.score || 0;
      user.totalQuestions += attempt.totalQuestions || 0;
      user.bestScore = Math.max(user.bestScore, attempt.score || 0);
      user.totalDuration += attempt.durationSeconds || 0;

      const accuracy = ((attempt.score || 0) / (attempt.totalQuestions || 1)) * 100;
      user.bestAccuracy = Math.max(user.bestAccuracy, accuracy);

      if (!user.recentDate || new Date(attempt.date) > new Date(user.recentDate)) {
        user.recentDate = attempt.date;
      }
    });

    return Object.values(userMap)
      .map((user) => ({
        ...user,
        averageAccuracy: user.totalQuestions
          ? ((user.totalScore / user.totalQuestions) * 100).toFixed(1)
          : "0.0",
        averageDuration: user.totalAttempts
          ? Math.round(user.totalDuration / user.totalAttempts)
          : 0,
      }))
      .sort((a, b) => {
        // Sort by best accuracy, then by total attempts
        const accDiff = parseFloat(b.bestAccuracy) - parseFloat(a.bestAccuracy);
        if (accDiff !== 0) return accDiff;
        return b.totalAttempts - a.totalAttempts;
      });
  }, [filteredAttempts]);

  const recentAttempts = useMemo(() => {
    return [...filteredAttempts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [filteredAttempts]);

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Award className="text-amber-600" size={24} />;
    return <span className="text-gray-500 font-bold">#{rank}</span>;
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-500 to-amber-700";
    return "bg-gradient-to-r from-blue-500 to-indigo-600";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <Trophy className="text-yellow-500" size={48} />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">Leaderboard</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Compete with players worldwide and see how you rank!
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Difficulty
              </label>
              <select
                value={filter.level}
                onChange={(e) => setFilter({ ...filter, level: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {leaderboardData.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 0, 2].map((idx) => {
              const player = leaderboardData[idx];
              if (!player) return null;
              const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
              return (
                <div
                  key={player.userEmail || player.userName}
                  className={`relative rounded-2xl shadow-xl p-6 text-center transform transition-all hover:scale-105 ${
                    rank === 1
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white md:-mt-8"
                      : rank === 2
                      ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                      : "bg-gradient-to-br from-amber-500 to-amber-700 text-white"
                  }`}
                >
                  <div className="absolute top-4 right-4">
                    {getRankIcon(rank)}
                  </div>
                  <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold">
                    {player.userName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{player.userName}</h3>
                  <p className="text-sm opacity-90 mb-4">{player.userEmail}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Target size={18} />
                      <span className="text-2xl font-bold">{player.bestAccuracy.toFixed(1)}%</span>
                    </div>
                    <p className="text-sm opacity-90">Best Accuracy</p>
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <TrendingUp size={16} />
                      <span>{player.totalAttempts} attempts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={28} />
              Full Rankings
            </h2>
            <p className="text-gray-600 mt-1">
              {leaderboardData.length} {leaderboardData.length === 1 ? "player" : "players"} ranked
            </p>
          </div>

          {leaderboardData.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">No quiz attempts found for the selected filters.</p>
              <p className="text-sm mt-2">Try a different filter or complete some quizzes!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Best Accuracy
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Best Score
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Avg Accuracy
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Avg Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leaderboardData.map((player, index) => {
                    const rank = index + 1;
                    return (
                      <tr
                        key={player.userEmail || player.userName}
                        className="hover:bg-blue-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {rank <= 3 ? (
                              getRankIcon(rank)
                            ) : (
                              <span className="text-gray-500 font-semibold">#{rank}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{player.userName}</div>
                            <div className="text-sm text-gray-500">{player.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                            <Target size={14} />
                            {player.bestAccuracy.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {player.bestScore}/{player.totalQuestions > 0 ? Math.round(player.totalQuestions / player.totalAttempts) : 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-700">{player.averageAccuracy}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-700 font-medium">{player.totalAttempts}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Clock size={14} />
                            <span>{player.averageDuration}s</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        {recentAttempts.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="text-purple-600" size={28} />
                Recent Quiz Attempts
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentAttempts.map((attempt) => {
                  const accuracy = ((attempt.score || 0) / (attempt.totalQuestions || 1)) * 100;
                  return (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                          {attempt.userName?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{attempt.userName}</div>
                          <div className="text-sm text-gray-600">
                            {categoryLookup[attempt.categoryId] || attempt.categoryId}
                            {attempt.subCategoryId && subcategoryLookup[attempt.subCategoryId] && (
                              <> • {subcategoryLookup[attempt.subCategoryId]}</>
                            )}
                            {" • "}
                            <span className="capitalize">{attempt.level}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {attempt.score}/{attempt.totalQuestions}
                          </div>
                          <div className="text-sm text-gray-600">{accuracy.toFixed(1)}%</div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(attempt.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;

