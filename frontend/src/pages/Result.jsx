import { motion } from "framer-motion";
import { useMemo } from "react";
import { Link, Navigate } from "react-router-dom";

function Result() {
  const payload = useMemo(() => {
    const raw = sessionStorage.getItem("resultPayload");
    return raw ? JSON.parse(raw) : null;
  }, []);

  if (!payload) {
    return <Navigate to="/learning" replace />;
  }

  const { result, gamification } = payload;
  const rewardHeadline = gamification.level_up
    ? "🏆 CONCEPT CAPTURED • LEVEL UP!"
    : "✅ CONCEPT CAPTURED • XP GAINED";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏆</span>
        <h1 className="retro-title text-3xl font-bold">Quiz Result</h1>
      </div>
      <p className="mt-2" style={{ color: "#6b7280" }}>
        Score and detailed feedback for your submission.
      </p>

      {/* Score card */}
      <div className="pixel-card mt-6">
        <p className="text-2xl font-bold" style={{ color: "#2ecc71", fontFamily: "'Press Start 2P', monospace", fontSize: "1.3rem" }}>
          {result.score}/{result.total}
        </p>
        <p className="mt-2" style={{ color: "#6b7280" }}>
          Correct answers: {result.correct_answers.length}
        </p>

        {result.mistakes.length > 0 && (
          <div className="mt-5 space-y-2">
            <h2 className="font-bold" style={{ color: "#f1c40f", fontFamily: "'Press Start 2P', monospace", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
              Explanation for Mistakes
            </h2>
            {result.mistakes.map((mistake) => (
              <div
                key={mistake.question_index}
                className="rounded-lg border-2 p-3 text-sm"
                style={{ borderColor: "#e74c3c", background: "#fff5f5" }}
              >
                <p className="font-semibold" style={{ color: "#e74c3c" }}>
                  Question #{mistake.question_index + 1}
                </p>
                <p className="mt-1" style={{ color: "#1f2937" }}>{mistake.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reward panel */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="reward-panel mt-6"
      >
        <p className="text-base font-semibold">{rewardHeadline}</p>
        <p className="mt-3 text-sm">+{gamification.xp_gained} XP</p>
        <p className="mt-1 text-sm">TOTAL POINTS: {gamification.points}</p>
        {gamification.level_up && (
          <p className="mt-1 text-sm">🌟 NEW BADGE EARNED: LEVEL {gamification.new_level}</p>
        )}
      </motion.div>

      {/* Navigation buttons */}
      <div className="mt-6 flex gap-3">
        <Link to="/learning" className="pixel-button">
          Learn More
        </Link>
        <Link to="/dashboard" className="pixel-button-secondary">
          Dashboard
        </Link>
      </div>
    </main>
  );
}

export default Result;
