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
  const rewardHeadline = gamification.level_up ? "CONCEPT CAPTURED • LEVEL UP" : "CONCEPT CAPTURED • XP GAINED";

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="retro-title text-3xl font-bold">Quiz Result</h1>
      <p className="mt-2 text-slate-300">Score and detailed feedback for your submission.</p>

      <div className="pixel-card mt-6">
        <p className="text-xl font-semibold">
          Score: {result.score}/{result.total}
        </p>
        <p className="mt-2 text-slate-300">Correct answers: {result.correct_answers.length}</p>

        {result.mistakes.length > 0 && (
          <div className="mt-4 space-y-2">
            <h2 className="text-lg font-semibold text-[var(--retro-accent-yellow)]">Explanation for Mistakes</h2>
            {result.mistakes.map((mistake) => (
              <div key={mistake.question_index} className="rounded-none border-2 border-[var(--retro-accent-red)] bg-[#1a0c0c] p-3 text-sm">
                <p>Question #{mistake.question_index + 1}</p>
                <p className="text-slate-300">{mistake.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="reward-panel mt-6"
      >
        <p className="text-base font-semibold">{rewardHeadline}</p>
        <p className="mt-3 text-sm">+{gamification.xp_gained} XP</p>
        <p className="mt-1 text-sm">TOTAL POINTS: {gamification.points}</p>
        {gamification.level_up && <p className="mt-1 text-sm">NEW BADGE EARNED: LEVEL {gamification.new_level}</p>}
      </motion.div>

      <div className="mt-6 flex gap-3">
        <Link to="/learning" className="pixel-button">
          Learn More
        </Link>
        <Link to="/dashboard" className="pixel-button-secondary">
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}

export default Result;
