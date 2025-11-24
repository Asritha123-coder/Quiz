import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Activity,
  BarChart3,
  Clock4,
  Layers,
  ListChecks,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

const API_URL = "http://localhost:3000";

const StatCard = ({ icon, label, value, subLabel, accent }) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 p-5 transition hover:-translate-y-0.5 hover:shadow-lg`}
  >
    <div
      className="absolute inset-0 opacity-10"
      style={{
        background: `radial-gradient(circle at top right, ${accent}, transparent 60%)`,
      }}
    />
    <div className="relative flex items-center gap-4">
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center text-white"
        style={{ backgroundColor: accent }}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subLabel && <p className="text-xs text-gray-400 mt-1">{subLabel}</p>}
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        console.error("Dashboard fetch failed", err);
        if (mounted) {
          setError("Unable to load dashboard data. Is json-server running?");
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

  const totalCategories = categories.length;
  const totalQuestions = useMemo(
    () =>
      questionSets.reduce(
        (sum, set) => sum + (Array.isArray(set.questions) ? set.questions.length : 0),
        0
      ),
    [questionSets]
  );
  const totalQuizzesTaken = attempts.length;
  const totalActiveUsers = useMemo(
    () => new Set(attempts.map((att) => att.userEmail || att.userName)).size,
    [attempts]
  );
  const avgAccuracy = useMemo(() => {
    if (!attempts.length) return 0;
    const total = attempts.reduce(
      (sum, att) => sum + ((att.score || 0) / (att.totalQuestions || 1)) * 100,
      0
    );
    return Math.round(total / attempts.length);
  }, [attempts]);
  const averageDuration = useMemo(() => {
    if (!attempts.length) return 0;
    const total = attempts.reduce((sum, att) => sum + (att.durationSeconds || 0), 0);
    return Math.round(total / attempts.length);
  }, [attempts]);

  const recentActivity = useMemo(() => {
    return [...attempts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [attempts]);

  const levelDistribution = useMemo(() => {
    const base = { easy: 0, medium: 0, hard: 0 };
    attempts.forEach((att) => {
      const key = att.level?.toLowerCase();
      if (!key) return;
      base[key] = (base[key] || 0) + 1;
    });
    return base;
  }, [attempts]);

  const questionCoverage = useMemo(() => {
    return categories
      .map((cat) => {
        const questionCount = questionSets
          .filter((set) => set.categoryId === cat.id)
          .reduce(
            (sum, set) => sum + (Array.isArray(set.questions) ? set.questions.length : 0),
            0
          );
        const attemptCount = attempts.filter((att) => att.categoryId === cat.id).length;
        return {
          id: cat.id,
          name: cat.name,
          questionCount,
          attemptCount,
        };
      })
      .sort((a, b) => b.questionCount - a.questionCount)
      .slice(0, 4);
  }, [categories, questionSets, attempts]);

  const topPerformers = useMemo(() => {
    return [...attempts]
      .sort((a, b) => {
        const aAcc = (a.score || 0) / (a.totalQuestions || 1);
        const bAcc = (b.score || 0) / (b.totalQuestions || 1);
        return bAcc - aAcc;
      })
      .slice(0, 3);
  }, [attempts]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
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
        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Overview</p>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          Quiz Command Center <Sparkles size={24} className="text-indigo-500" />
        </h1>
        <p className="text-gray-500 max-w-2xl">
          Stay on top of everything happening inside your trivia universe — categories,
          question banks, quiz attempts, and learner momentum update in real time from
          `db.json`.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          icon={<Layers size={22} />}
          label="Total Categories"
          value={totalCategories}
          subLabel="Synced from JSON server"
          accent="#6366F1"
        />
        <StatCard
          icon={<ListChecks size={22} />}
          label="Question Inventory"
          value={totalQuestions}
          subLabel={`${questionSets.length} question sets`}
          accent="#10B981"
        />
        <StatCard
          icon={<Trophy size={22} />}
          label="Quizzes Taken"
          value={totalQuizzesTaken}
          subLabel={`${totalActiveUsers} unique players`}
          accent="#F97316"
        />
        <StatCard
          icon={<BarChart3 size={22} />}
          label="Avg. Accuracy"
          value={`${avgAccuracy}%`}
          subLabel={`Avg. time ${averageDuration}s`}
          accent="#EC4899"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Level Distribution
            </h2>
            <span className="text-xs text-gray-400 uppercase">Past {attempts.length} attempts</span>
          </div>
          <div className="space-y-4">
            {["easy", "medium", "hard"].map((level) => {
              const count = levelDistribution[level] || 0;
              const percent = attempts.length ? Math.round((count / attempts.length) * 100) : 0;
              const colors = {
                easy: "from-emerald-400 to-emerald-600",
                medium: "from-amber-400 to-amber-600",
                hard: "from-rose-400 to-rose-600",
              };
              return (
                <div key={level}>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
                    <span className="capitalize">{level}</span>
                    <span>{count} attempts</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r ${colors[level]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              Recent Activity <Activity size={18} className="text-indigo-500" />
            </h2>
            <span className="text-xs text-gray-400 uppercase">Live feed</span>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-gray-400">No quiz attempts recorded yet.</p>
            ) : (
              recentActivity.map((entry) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-semibold">
                    {entry.userName?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {entry.userName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Scored {entry.score}/{entry.totalQuestions} • {entry.level} •{" "}
                      {new Date(entry.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Question Coverage
            <ListChecks size={18} className="text-emerald-500" />
          </h2>
          <div className="space-y-4">
            {questionCoverage.length === 0 ? (
              <p className="text-sm text-gray-400">No question data yet.</p>
            ) : (
              questionCoverage.map((item) => (
                <div key={item.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.questionCount} questions • {item.attemptCount} attempts
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-indigo-600">
                        {item.questionCount ? Math.max(1, item.questionCount) * 10 : 0} pts
                      </span>
                      <p className="text-xs text-gray-400">Question weight</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-indigo-400 to-cyan-400"
                      style={{
                        width: `${Math.min(100, item.questionCount * 10)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Top Performers <Trophy size={18} className="text-amber-500" />
          </h2>
          <div className="space-y-4">
            {topPerformers.length === 0 ? (
              <p className="text-sm text-gray-400">No quiz attempts to rank yet.</p>
            ) : (
              topPerformers.map((player, index) => {
                const accuracy = ((player.score / player.totalQuestions) * 100).toFixed(1);
                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-semibold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{player.userName}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {player.level} • {new Date(player.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">{accuracy}%</p>
                      <p className="text-xs text-gray-500">
                        {player.score}/{player.totalQuestions}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase text-gray-400">Average Session</p>
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mt-2">
            {averageDuration || 0}s <Clock4 size={20} className="text-gray-400" />
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Learners spend about {Math.round((averageDuration || 0) / 60)} minutes per quiz.
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase text-gray-400">Active Users</p>
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mt-2">
            {totalActiveUsers} <Users size={20} className="text-gray-400" />
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Unique learners submitting attempts across all categories.
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <p className="text-xs uppercase text-gray-400">Momentum Score</p>
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2 mt-2">
            {(avgAccuracy + totalQuizzesTaken) || 0}
            <Activity size={20} className="text-gray-400" />
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Composite metric blending accuracy and quiz volume.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
