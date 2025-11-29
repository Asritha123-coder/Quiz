import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import rocketGif from "../assets/rocket.gif";

export default function QuizLoader() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Keep your existing navigation; adjust if you later need id/level params
      navigate("/quiz");
    }, 3000); // 3 sec

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-900">
      {/* Soft glow background circle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative flex flex-col items-center justify-center"
      >
        <div className="absolute -inset-20 rounded-full bg-indigo-500/20 blur-3xl" />

        {/* Rocket GIF with floating + subtle spin animation */}
        <motion.img
          src={rocketGif}
          alt="Loading quiz..."
          className="w-56 h-56 relative drop-shadow-[0_20px_40px_rgba(15,23,42,0.8)]"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{
            opacity: 1,
            y: [0, -18, 0],
            rotate: [-2, 2, -2],
            scale: 1,
          }}
          transition={{
            opacity: { duration: 0.5, ease: "easeOut" },
            y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          }}
        />

        {/* Loading text */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <p className="text-slate-100 text-xl font-semibold tracking-wide">
            Preparing your quiz journey...
          </p>
          <p className="text-slate-400 text-sm mt-1">
            Launching in just a moment
          </p>

          {/* Simple loading bar */}
          <div className="mt-4 w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 via-sky-400 to-violet-400"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 1.4,
                ease: "linear",
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
