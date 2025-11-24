import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  ClipboardList,
  Filter,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
} from "lucide-react";

const API_URL = "http://localhost:3000";

const SectionCard = ({ title, icon, children, action }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const AdminAnalytics = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [catRes, subRes, questionRes, attemptRes] = await Promise.all([
          axios.get(`${API_URL}/categories`),
          axios.get(`${API_URL}/subcategories`),
          axios.get(`${API_URL}/questions`),
          axios.get(`${API_URL}/quizAttempts`),
        ]);

        if (!mounted) return;
        setCategories(catRes.data || []);
        setSubcategories(subRes.data || []);
        setQuestionSets(questionRes.data || []);
        setAttempts(attemptRes.data || []);
        setError("");
      } catch (err) {
        console.error("Analytics fetch failed", err);
        if (mounted) {
          setError("Unable to load analytics data. Ensure json-server is online.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
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
    if (levelFilter === "all") return attempts;
    return attempts.filter((att) => att.level === levelFilter);
  }, [attempts, levelFilter]);

  const resultsTable = useMemo(() => {
    return [...filteredAttempts].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredAttempts]);

  const quizWiseReport = useMemo(() => {
    const map = {};
    filteredAttempts.forEach((att) => {
      const key = `${att.categoryId}-${att.subCategoryId}`;
      if (!map[key]) {
        map[key] = {
          key,
          categoryId: att.categoryId,
          subCategoryId: att.subCategoryId,
          attempts: 0,
          totalScore: 0,
          totalQuestions: 0,
        };
      }
      map[key].attempts += 1;
      map[key].totalScore += att.score || 0;
      map[key].totalQuestions += att.totalQuestions || 0;
    });
    return Object.values(map).map((row) => ({
      ...row,
      categoryName: categoryLookup[row.categoryId] || row.categoryId,
      subcategoryName: subcategoryLookup[row.subCategoryId] || row.subCategoryId,
      avgScore: row.attempts ? (row.totalScore / row.attempts).toFixed(1) : "0.0",
    }));
  }, [filteredAttempts, categoryLookup, subcategoryLookup]);

  const userWiseReport = useMemo(() => {
    const map = {};
    filteredAttempts.forEach((att) => {
      const key = att.userEmail || att.userName;
      if (!map[key]) {
        map[key] = {
          userName: att.userName,
          userEmail: att.userEmail,
          attempts: 0,
          totalScore: 0,
          totalQuestions: 0,
          bestScore: 0,
        };
      }
      map[key].attempts += 1;
      map[key].totalScore += att.score || 0;
      map[key].totalQuestions += att.totalQuestions || 0;
      map[key].bestScore = Math.max(map[key].bestScore, att.score || 0);
    });
    return Object.values(map).map((user) => ({
      ...user,
      accuracy: user.totalQuestions
        ? ((user.totalScore / user.totalQuestions) * 100).toFixed(1)
        : "0.0",
    }));
  }, [filteredAttempts]);

  const difficultyAnalytics = useMemo(() => {
    const map = {};
    attempts.forEach((att) => {
      const level = att.level || "unknown";
      if (!map[level]) {
        map[level] = { attempts: 0, avgScore: 0, totalScore: 0 };
      }
      map[level].attempts += 1;
      map[level].totalScore += att.score || 0;
    });
    Object.keys(map).forEach((level) => {
      map[level].avgScore = map[level].attempts
        ? (map[level].totalScore / map[level].attempts).toFixed(1)
        : "0.0";
    });
    return map;
  }, [attempts]);

  const mostMissedQuestions = useMemo(() => {
    const map = {};
    attempts.forEach((att) => {
      (att.missedQuestions || []).forEach((q) => {
        const key = q.questionId || q.question;
        if (!map[key]) {
          map[key] = { ...q, misses: 0 };
        }
        map[key].misses += 1;
      });
    });
    return Object.values(map)
      .sort((a, b) => b.misses - a.misses)
      .slice(0, 5);
  }, [attempts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-2xl text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
          Results / Analytics
        </p>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Insight Hub <TrendingUp size={28} className="text-emerald-500" />
        </h1>
        <p className="text-gray-500 max-w-3xl">
          Drill into every quiz attempt captured inside `db.json`. Slice by difficulty,
          surface trends, and keep tabs on the toughest questions with live data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="View Results"
          icon={<ClipboardList size={20} className="text-indigo-500" />}
          action={
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter size={16} />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">All levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 uppercase text-xs tracking-wide">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Quiz</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {resultsTable.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      No attempts for this filter.
                    </td>
                  </tr>
                ) : (
                  resultsTable.map((row) => (
                    <tr key={row.id} className="border-t border-gray-100">
                      <td className="py-3">
                        <div className="font-semibold text-gray-800">{row.userName}</div>
                        <div className="text-xs text-gray-500">{row.userEmail}</div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {categoryLookup[row.categoryId] || row.categoryId} •{" "}
                        {subcategoryLookup[row.subCategoryId] || row.subCategoryId}
                      </td>
                      <td className="py-3 font-semibold text-gray-900">
                        {row.score}/{row.totalQuestions}
                      </td>
                      <td className="py-3 capitalize">{row.level}</td>
                      <td className="py-3 text-xs text-gray-500">
                        {new Date(row.date).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          title="Quiz-wise report"
          icon={<BarChart3 size={20} className="text-cyan-500" />}
        >
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
            {quizWiseReport.length === 0 ? (
              <p className="text-sm text-gray-400">No quiz data available.</p>
            ) : (
              quizWiseReport.map((row) => (
                <div key={row.key} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{row.subcategoryName}</p>
                      <p className="text-xs uppercase text-gray-400">{row.categoryName}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {row.attempts} attempts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <p>Avg Score: {row.avgScore}</p>
                    <p>Total Questions: {row.totalQuestions}</p>
                  </div>
                  <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                      style={{
                        width: `${Math.min(100, row.avgScore * 10)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="User-wise report"
          icon={<Users size={20} className="text-amber-500" />}
        >
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
            {userWiseReport.length === 0 ? (
              <p className="text-sm text-gray-400">No user attempts yet.</p>
            ) : (
              userWiseReport.map((user) => (
                <div key={user.userEmail || user.userName} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{user.userName}</p>
                      <p className="text-xs text-gray-500">{user.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase text-gray-400">Accuracy</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {user.accuracy}%
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                    <p>Attempts: {user.attempts}</p>
                    <p>Best Score: {user.bestScore}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Difficulty-wise analytics"
          icon={<PieChart size={20} className="text-rose-500" />}
        >
          <div className="space-y-4">
            {Object.keys(difficultyAnalytics).length === 0 ? (
              <p className="text-sm text-gray-400">No difficulty data recorded.</p>
            ) : (
              Object.entries(difficultyAnalytics).map(([level, data]) => (
                <div key={level} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 capitalize">{level}</p>
                    <p className="text-xs text-gray-500">{data.attempts} attempts</p>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Avg Score: <span className="font-semibold text-gray-800">{data.avgScore}</span>
                  </p>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-rose-400 to-amber-400"
                      style={{ width: `${Math.min(100, data.avgScore * 10)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Most missed questions"
        icon={<LineChart size={20} className="text-purple-500" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mostMissedQuestions.length === 0 ? (
            <p className="text-sm text-gray-400 col-span-full">
              No missed question data yet.
            </p>
          ) : (
            mostMissedQuestions.map((question) => (
              <div key={question.questionId || question.question} className="border border-gray-100 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-3">{question.question}</p>
                <p className="text-xs text-gray-400 uppercase">Misses</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {question.misses}
                </p>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default AdminAnalytics;



