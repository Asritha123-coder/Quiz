// src/pages/Quiz.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------- Helpers -------------------- */

// Decode HTML entities from OpenTDB responses
const decodeHTML = (str) => {
  if (!str) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
};

// Shuffle an array (returns a new array)
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

/* -------------------- Component -------------------- */

const optionLetters = ["A", "B", "C", "D"];

const Quiz = () => {
  const { id, level } = useParams(); // category id and difficulty from route
  const navigate = useNavigate();
  const location = useLocation();
  const isCustom = id?.startsWith("local-");
  const subCategoryId = isCustom ? id.replace("local-", "") : null;

  const TOTAL_TIME = 45; // seconds per question
  const DEBOUNCE_MS = 300; // small delay before fetching (option B)
  const RETRY_ON_429_DELAY = 2000; // retry delay if API returns 429

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [index, setIndex] = useState(0);
  const [options, setOptions] = useState([]);

  const [userAnswers, setUserAnswers] = useState({}); // { qIndex: "answer" }
  const [flagged, setFlagged] = useState({}); // { qIndex: true }

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [isPaused, setIsPaused] = useState(false); // pause/resume timer

  const [finished, setFinished] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [customMeta, setCustomMeta] = useState(
    location.state?.customMeta || null
  );
  const [quizStartTime, setQuizStartTime] = useState(null);
  const { user } = useAuth();
  const API_URL = "http://localhost:3000";

  useEffect(() => {
    if (location.state?.customMeta) {
      setCustomMeta(location.state.customMeta);
    } else if (!isCustom) {
      setCustomMeta(null);
    }
  }, [location.state, isCustom]);

  // useRef to prevent duplicate fetches (and to store last fetched key)
  const fetchedRef = useRef({}); // { key: true }
  const fetchTimerRef = useRef(null);

  /* -------------------- Fetch Questions with debounce + useRef + 429 handling -------------------- */
  useEffect(() => {
    // create a unique key per category/difficulty so we only fetch once per combination
    const key = `${isCustom ? "custom" : "remote"}::${id || "all"}::${
      level || "any"
    }`;

    // clear previous debounce timer if id/level changed quickly
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
      fetchTimerRef.current = null;
    }

    // reset UI states on category/difficulty change
    setQuestions([]);
    setIndex(0);
    setOptions([]);
    setUserAnswers({});
    setFlagged({});
    setFinished(false);
    setErrorMsg("");
    setLoading(true);
    setTimeLeft(TOTAL_TIME);
    setIsPaused(false);

    // debounce to protect against rapid clicks/navigation
    fetchTimerRef.current = setTimeout(() => {
      // if we've already fetched this key during this page lifecycle -> skip
      if (fetchedRef.current[key]) {
        setLoading(false);
        return;
      }
      fetchedRef.current[key] = true; // mark as fetched

      if (isCustom) {
        const fetchCustom = async () => {
          try {
            const questionsRes = await axios.get(
              `http://localhost:3000/questions?subCategoryId=${subCategoryId}&level=${level}`
            );
            const normalized = (questionsRes.data || []).flatMap((entry) => {
              const items = entry.questions || [];
              return items.map((q) => {
                const options = [
                  q.optionA,
                  q.optionB,
                  q.optionC,
                  q.optionD,
                ].filter((opt) => typeof opt === "string" && opt.length);
                const correctLetter = (q.correct || "").trim().toUpperCase();
                const correctIndex = Math.max(
                  0,
                  optionLetters.indexOf(correctLetter)
                );
                const correct_answer =
                  options[correctIndex] ?? options[0] ?? "";
                const incorrect_answers = options.filter(
                  (_, i) => i !== correctIndex
                );
                return {
                  ...q,
                  question: q.question,
                  correct_answer,
                  incorrect_answers,
                  merged: shuffle([correct_answer, ...incorrect_answers]),
                };
              });
            });

            if (!normalized.length) {
              setQuestions([]);
              setLoading(false);
              setErrorMsg("No custom questions available for this level.");
              return;
            }

            setQuestions(normalized);
            setOptions(normalized[0].merged || []);
            setLoading(false);

            if (!customMeta) {
              try {
                const subRes = await axios.get(
                  `http://localhost:3000/subcategories?id=${subCategoryId}`
                );
                const subRecord = subRes.data?.[0];
                if (subRecord) {
                  const enriched = {
                    ...subRecord,
                    subcategoryName:
                      subRecord.subcategoryName || subRecord.name,
                  };
                  setCustomMeta((prev) => ({ ...prev, ...enriched }));
                }
              } catch (metaErr) {
                console.warn("Failed to fetch subcategory meta:", metaErr);
              }
            }
          } catch (err) {
            console.error("Custom questions fetch error:", err);
            setLoading(false);
            setErrorMsg("Failed to load custom questions.");
          }
        };

        fetchCustom();
        return;
      }

      const fetchOnce = async (useRetry = true) => {
        try {
          // Build URL - include difficulty only if provided
          const url = `https://opentdb.com/api.php?amount=10&category=${id}&difficulty=${level}&type=multiple`;
          const res = await axios.get(url, { timeout: 8000 });
          console.log(res);
          // OpenTDB response_codes: 0 success, 1 no results, 2 invalid param, 3 token empty, 4 token not found
          if (!res.data || res.data.response_code !== 0 || !res.data.results.length) {
            // If it's a response_code 1 (no results) or other, try fallback strategies
            // Strategy: try without difficulty -> then fall back to backup JSON
            // But only do these when we actually got a valid response but no results
            // If 429, the request will go to catch block and be retried there.
            console.warn("OpenTDB returned no results or error code:", res.data);
            // Try without difficulty (if difficulty was specified)
            if (level) {
              try {
                const url2 = `https://opentdb.com/api.php?amount=10&category=${id}&type=multiple`;
                const res2 = await axios.get(url2, { timeout: 8000 });
                if (res2.data && res2.data.response_code === 0 && res2.data.results.length) {
                  const data = res2.data.results.map((q) => ({ ...q, merged: shuffle([q.correct_answer, ...q.incorrect_answers]) }));
                  setQuestions(data);
                  setOptions(data[0].merged || []);
                  setLoading(false);
                  return;
                }
              } catch (err2) {
                console.warn("Fallback without difficulty failed:", err2);
              }
            }

            // Final fallback: load local backup (if exists)
            try {
              const backup = await axios.get("/backupQuestions.json", { timeout: 4000 });
              if (backup.data && backup.data.length) {
                // Normalize backup format to mimic OpenTDB
                const data = backup.data.map((q) => ({
                  question: q.question,
                  correct_answer: q.correct_answer,
                  incorrect_answers: q.incorrect_answers,
                  merged: shuffle([q.correct_answer, ...q.incorrect_answers]),
                }));
                setQuestions(data);
                setOptions(data[0].merged || []);
                setLoading(false);
                setErrorMsg("Using local backup questions (API had no data).");
                return;
              }
            } catch (bkErr) {
              console.warn("No backupQuestions.json found or load failed:", bkErr);
            }

            // nothing worked -> set empty
            setQuestions([]);
            setLoading(false);
            setErrorMsg("No questions found for this category/difficulty.");
            return;
          }

          // successful response
          const data = res.data.results.map((q) => ({
            ...q,
            merged: shuffle([q.correct_answer, ...q.incorrect_answers]),
          }));
          setQuestions(data);
          if (data && data[0]) setOptions(data[0].merged || []);
          setLoading(false);
        } catch (err) {
          // Network error or HTTP 429 etc.
          console.error("Fetch questions error:", err);
          const status = err.response ? err.response.status : null;

          // If 429 and allowed to retry once, do that after a delay
          if (status === 429 && useRetry) {
            setErrorMsg("Server rate limit reached. Retrying shortly...");
            setTimeout(() => fetchOnce(false), RETRY_ON_429_DELAY);
            return;
          }

          // Try final fallback to local backup
          try {
            const backup = await axios.get("/backupQuestions.json", { timeout: 4000 });
            if (backup.data && backup.data.length) {
              const data = backup.data.map((q) => ({
                question: q.question,
                correct_answer: q.correct_answer,
                incorrect_answers: q.incorrect_answers,
                merged: shuffle([q.correct_answer, ...q.incorrect_answers]),
              }));
              setQuestions(data);
              setOptions(data[0].merged || []);
              setLoading(false);
              setErrorMsg("Loaded local backup questions (API failed).");
              return;
            }
          } catch (bkErr) {
            console.warn("Backup load failed:", bkErr);
          }

          setLoading(false);
          setErrorMsg("Failed to load quiz. Please try again later.");
        }
      };

      fetchOnce(true);
    }, DEBOUNCE_MS);

    // cleanup timer on unmount or param change
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, level, isCustom, subCategoryId]); // re-run when category or difficulty changes (but protected by fetchedRef+debounce)

  /* -------------------- Options / index effects -------------------- */

  useEffect(() => {
    if (!questions.length) return;
    const q = questions[index];
    if (!q) return;
    const merged = q.merged ? q.merged : shuffle([q.correct_answer, ...q.incorrect_answers]);
    setOptions(merged);
    setTimeLeft(TOTAL_TIME);
    setIsPaused(false);
    
    // Track quiz start time when first question loads
    if (index === 0 && !quizStartTime) {
      setQuizStartTime(Date.now());
    }
  }, [index, questions, quizStartTime]);

  /* -------------------- Timer logic (no auto-advance) -------------------- */

  useEffect(() => {
    if (finished) return;
    if (loading) return;
    if (isPaused) return;

    if (timeLeft <= 0) {
      // Time's up: selection disabled by UI (we don't auto-advance)
      return;
    }

    const t = setTimeout(() => {
      setTimeLeft((s) => s - 1);
    }, 1000);

    return () => clearTimeout(t);
  }, [timeLeft, isPaused, finished, loading]);

  /* -------------------- Derived counts / helpers -------------------- */

  const total = questions.length || 0;
  const answeredCount = useMemo(() => Object.keys(userAnswers).length, [userAnswers]);
  const flaggedCount = useMemo(() => Object.values(flagged).filter(Boolean).length, [flagged]);
  const unansweredCount = Math.max(0, total - answeredCount);
  const progressPercent = total ? Math.round(((index + 1) / total) * 100) : 0;

  const topicLabel = useMemo(() => {
    if (!isCustom) return `Category ${id}`;
    return (
      customMeta?.subcategoryName ||
      customMeta?.name ||
      `Custom ${subCategoryId}`
    );
  }, [isCustom, id, customMeta, subCategoryId]);

  const selectOption = (opt) => {
    if (timeLeft <= 0) return; // cannot select after time ends
    setUserAnswers((prev) => ({ ...prev, [index]: opt }));
  };

  const toggleFlag = (i) => setFlagged((p) => ({ ...p, [i]: !p[i] }));
  const goToQuestion = (i) => setIndex(i);

  const handlePrev = () => { if (index > 0) setIndex((p) => p - 1); };
  const handleNext = () => {
    // If last question -> submit
    if (index + 1 >= total) {
      // Show submit confirmation
      if (window.confirm("Submit quiz now?")) handleSubmit();
      return;
    }
    setIndex((p) => p + 1);
  };

  const calculateScore = () => {
    let s = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q) continue;
      const u = userAnswers[i];
      if (u && u === q.correct_answer) s++;
    }
    return s;
  };

  const handleSubmit = async () => {
    setFinished(true);
    setIsPaused(true);
    
    // Save quiz attempt to db.json
    try {
      const durationSeconds = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0;
      const finalScore = calculateScore();
      const missedQuestions = [];
      
      // Calculate missed questions
      questions.forEach((q, i) => {
        const userAns = userAnswers[i];
        if (!userAns || userAns !== q.correct_answer) {
          missedQuestions.push({
            questionId: `q-${i}`,
            question: decodeHTML(q.question),
          });
        }
      });
      
      const quizAttempt = {
        userName: user?.name || "Guest User",
        userEmail: user?.email || "guest@example.com",
        categoryId: isCustom ? customMeta?.categoryId || subCategoryId : id,
        subCategoryId: isCustom ? subCategoryId : null,
        level: level || "medium",
        score: finalScore,
        totalQuestions: questions.length,
        durationSeconds: durationSeconds,
        date: new Date().toISOString(),
        missedQuestions: missedQuestions,
      };
      
      await axios.post(`${API_URL}/quizAttempts`, quizAttempt);
    } catch (error) {
      console.error("Failed to save quiz attempt:", error);
      // Don't block UI if save fails
    }
  };

  const score = useMemo(() => {
    if (!finished) return 0;
    return calculateScore();
  }, [finished, userAnswers, questions, total]);

  // Export to PDF function
  const exportToPDF = () => {
    if (!finished || !questions.length) return;
    const percentage = Math.round((score / questions.length) * 100);
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quiz Results - TriviaTrek</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e40af; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
            .stat-label { color: #666; font-size: 12px; }
            .question { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
            .correct { background-color: #d1fae5; border-color: #10b981; }
            .incorrect { background-color: #fee2e2; border-color: #ef4444; }
            .answer { margin-top: 10px; padding: 8px; border-radius: 4px; }
            .user-answer { background-color: #fef3c7; }
            .correct-answer { background-color: #d1fae5; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Quiz Results - TriviaTrek</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>User: ${user?.name || "Guest"}</p>
          </div>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value" style="color: #ef4444;">${percentage}%</div>
              <div class="stat-label">SCORE</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #3b82f6;">${score}/${questions.length}</div>
              <div class="stat-label">CORRECT</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #1e40af;">${topicLabel}</div>
              <div class="stat-label">TOPIC</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #9333ea;">${level}</div>
              <div class="stat-label">DIFFICULTY</div>
            </div>
          </div>
          
          <h2>Detailed Results</h2>
          ${questions
            .map((q, i) => {
              const userAns = userAnswers[i];
              const correct = q.correct_answer;
              const isCorrect = userAns === correct;
              return `
                <div class="question ${isCorrect ? "correct" : "incorrect"}">
                  <p><strong>Question ${i + 1}:</strong> ${decodeHTML(q.question)}</p>
                  <div class="answer user-answer">
                    <strong>Your Answer:</strong> ${decodeHTML(userAns || "Not answered")}
                    ${isCorrect ? " ✓" : " ✗"}
                  </div>
                  ${!isCorrect ? `<div class="answer correct-answer"><strong>Correct Answer:</strong> ${decodeHTML(correct)}</div>` : ""}
                </div>
              `;
            })
            .join("")}
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  /* -------------------- Rendering -------------------- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-lg font-medium">Loading quiz...</div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="p-8 text-center text-gray-600">
        {errorMsg ? errorMsg : "No questions found for this category/difficulty."}
      </div>
    );
  }

  // ⭐ FINAL RESULTS PAGE ⭐
if (finished) {
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-2xl rounded-2xl">

      {/* Heading */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gray-800">
            Quiz Complete!
          </h1>
          <p className="text-gray-600">
            Great job! Review your results below.
          </p>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition shadow-lg hover:shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to PDF
        </button>
      </div>

      {/* Score Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">

        <div className="p-4 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <p className="text-3xl font-bold text-red-500">{percentage}%</p>
          <p className="text-gray-500 font-medium text-sm">SCORE</p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <p className="text-3xl font-bold text-blue-500">
            {score}/{questions.length}
          </p>
          <p className="text-gray-500 font-medium text-sm">CORRECT</p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <p className="text-2xl font-bold text-blue-700 capitalize">
            {topicLabel}
          </p>
          <p className="text-gray-500 font-medium text-sm">TOPIC</p>
        </div>

        <div className="p-4 bg-white shadow-md rounded-xl border hover:shadow-lg transition">
          <p className="text-2xl font-bold text-purple-600 capitalize">
            {level}
          </p>
          <p className="text-gray-500 font-medium text-sm">DIFFICULTY</p>
        </div>

      </div>

      {/* Detailed Results */}
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
        Detailed Results
      </h2>

      {questions.map((q, i) => {
        const userAns = userAnswers[i];
        const correct = q.correct_answer;
        const isCorrect = userAns === correct;

        return (
          <div
            key={i}
            className={`
              mb-6 p-5 rounded-xl border shadow-md hover:shadow-lg transition 
              ${isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}
            `}
          >
            {/* Question */}
            <div className="flex justify-between items-start">
              <p className="font-semibold text-lg">
                {i + 1}. {decodeHTML(q.question)}
              </p>

              {/* Correct / Wrong Icon */}
              <div
                className={`text-2xl font-bold ${
                  isCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {isCorrect ? "✓" : "✗"}
              </div>
            </div>

            {/* Your Answer */}
            <p className="mt-3">
              <span className="font-semibold">Your Answer:</span>{" "}
              <span
                className={`px-2 py-1 rounded text-sm ${
                  isCorrect
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {decodeHTML(userAns)}
              </span>
            </p>

            {/* Correct Answer */}
            {!isCorrect && (
              <p className="mt-2">
                <span className="font-semibold">Correct Answer:</span>{" "}
                <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                  {decodeHTML(correct)}
                </span>
              </p>
            )}

            {/* Explanation */}
            <div className="mt-4 p-3 bg-blue-100 border-l-4 border-blue-500 rounded">
              <p className="text-sm text-blue-900">
                <strong>Explanation:</strong> This question does not provide
                explanations from API, but you can add explanations manually in
                your custom quiz mode.
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

  // Normal quiz view
  const q = questions[index];
  const selected = userAnswers[index];
  const timeOver = timeLeft <= 0;
  const nextEnabled = timeOver ? true : Boolean(selected);

  const getPaletteClass = (i) => {
    if (flagged[i]) return "bg-amber-200 border-amber-400";
    if (userAnswers[i]) return "bg-green-200 border-green-400";
    return "bg-gray-100 border-gray-200";
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const optionVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.9 },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const questionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDEBAR - Timer & Navigation */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Timer - Prominent, no borders */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  key={timeLeft}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-6xl font-bold mb-2"
                  style={{
                    color: timeLeft <= 10 ? "#ef4444" : timeLeft <= 20 ? "#f59e0b" : "#3b82f6",
                  }}
                >
                  {timeLeft}
                </motion.div>
                <div className="text-sm text-gray-500 font-medium">seconds</div>
                
                {/* Progress bar */}
                <div className="w-full mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${(timeLeft / TOTAL_TIME) * 100}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="h-full rounded-full"
                    style={{
                      background: timeLeft <= 10 
                        ? "linear-gradient(90deg, #ef4444, #dc2626)" 
                        : timeLeft <= 20 
                        ? "linear-gradient(90deg, #f59e0b, #d97706)" 
                        : "linear-gradient(90deg, #3b82f6, #2563eb)",
                    }}
                  />
                </div>

                <button
                  onClick={() => setIsPaused((p) => !p)}
                  className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {isPaused ? "▶ Resume" : "⏸ Pause"}
                </button>
              </div>
            </motion.div>

            {/* Navigation Numbers */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-3xl shadow-lg p-6"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Question Navigation</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => goToQuestion(i)}
                    className={`h-12 flex items-center justify-center rounded-xl font-semibold text-sm transition-all ${
                      i === index
                        ? "bg-blue-600 text-white shadow-lg scale-110"
                        : getPaletteClass(i)
                    }`}
                    title={`Go to question ${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
              </div>

              {/* Stats */}
              <div className="mt-6 space-y-2 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Answered</span>
                  <span className="font-semibold text-green-600">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unanswered</span>
                  <span className="font-semibold">{unansweredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Flagged</span>
                  <span className="font-semibold text-amber-600">{flaggedCount}</span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (window.confirm("Submit quiz now?")) handleSubmit();
                }}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                Submit Quiz
              </motion.button>
            </motion.div>
          </aside>

          {/* RIGHT SIDE - Question Area */}
          <div className="lg:col-span-9">
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl p-8 min-h-[600px]"
            >
              {/* Question Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm font-semibold text-blue-600"
                  >
                    Question {index + 1} of {total}
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFlag(index)}
                    className={`p-2 rounded-xl transition-all ${
                      flagged[index] 
                        ? "bg-amber-100 text-amber-600" 
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                    title={flagged[index] ? "Unflag question" : "Flag question"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v12l7-4 7 4V5a2 2 0 00-2-2H5z" />
                    </svg>
                  </motion.button>
                </div>
                
                <div className="text-xs text-gray-500 mb-6">
                  <span className="font-medium">{topicLabel}</span> • <span className="font-medium capitalize">{level}</span>
                </div>

                {/* Question Text */}
                <motion.h2
                  variants={questionVariants}
                  initial="hidden"
                  animate="visible"
                  className="text-3xl font-bold text-gray-800 leading-relaxed mb-8"
                >
                  {decodeHTML(q.question)}
                </motion.h2>
              </div>

              {/* Answer Options - Staggered Animation */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 mb-8"
              >
                {options.map((opt, iOpt) => {
                  const isSelected = selected === opt;
                  return (
                    <motion.button
                      key={iOpt}
                      variants={optionVariants}
                      whileHover={{ scale: 1.02, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => selectOption(opt)}
                      disabled={timeOver}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-lg"
                          : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                      } ${timeOver ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <motion.div
                        className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${
                          isSelected
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-600 border-2 border-gray-300"
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {optionLetters[iOpt]}
                      </motion.div>
                      <div className="flex-1 text-lg text-gray-700 font-medium">
                        {decodeHTML(opt)}
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-600"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                <motion.button
                  whileHover={{ scale: 1.05, x: -3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrev}
                  disabled={index === 0}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    index === 0
                      ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "text-gray-700 bg-white border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  ← Previous
                </motion.button>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-200 rounded-full border border-green-300" />
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-gray-100 rounded-full border border-gray-200" />
                    <span>Unanswered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-amber-200 rounded-full border border-amber-300" />
                    <span>Flagged</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05, x: 3 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { if (!nextEnabled) return; handleNext(); }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    nextEnabled
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl"
                      : "text-gray-400 bg-gray-50 cursor-not-allowed"
                  }`}
                >
                  {index + 1 === total ? "Submit Quiz" : "Next →"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
