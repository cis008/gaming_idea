import { useEffect, useState } from "react";
import PixelCard from "../components/PixelCard";
import DashboardCards from "../components/DashboardCards";
import ProgressBar from "../components/ProgressBar";
import RetroBadge from "../components/RetroBadge";
import { fetchDashboard, fetchProgress } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({});
  const [progress, setProgress] = useState({ progress_percent: 0, badges: [] });
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [lectureProgress, setLectureProgress] = useState([]);
  const [loginStreakDays, setLoginStreakDays] = useState(0);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [dashboardRes, progressRes] = await Promise.all([fetchDashboard(), fetchProgress()]);
        setStats(dashboardRes.data.stats || {});
        setRecentQuizzes(dashboardRes.data.recent_quizzes || []);
        setLectureProgress(dashboardRes.data.lecture_progress || []);
        setLoginStreakDays(dashboardRes.data.login_streak_days || 0);
        setProgress(progressRes.data || {});
      } catch {
        setStats({ points: 0, level: 1, quizzes_completed: 0, accuracy: 0, learning_streak: 0, badges: [] });
      }
    };

    loadDashboard();
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {/* Page header — Trainer Status screen */}
      <div className="mb-2 flex items-center gap-3">
        <span className="text-2xl">🏟️</span>
        <h1 className="retro-title text-3xl font-bold">Dashboard</h1>
      </div>
      <p className="mt-1" style={{ color: "#6b7280" }}>
        Track your points, level, streak, and quiz performance.
      </p>

      {/* Stat cards */}
      <div className="mt-6">
        <DashboardCards stats={stats} />
      </div>

      {/* Overall progress + badges */}
      <PixelCard className="mt-6">
        <h2 className="retro-title text-lg font-semibold">📈 Overall Progress</h2>
        <div className="mt-3">
          <ProgressBar value={progress.progress_percent} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(progress.badges || []).map((badge) => (
            <RetroBadge key={badge} text={badge} />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
          <p style={{ color: "#1f2937" }}>
            <span style={{ color: "#27ae60", fontWeight: 700 }}>🔥 Streak:</span> {progress.streak || 0}
          </p>
          <p style={{ color: "#1f2937" }}>
            <span style={{ color: "#3498db", fontWeight: 700 }}>📅 Login Days:</span> {loginStreakDays}
          </p>
          <p style={{ color: "#1f2937" }}>
            <span style={{ color: "#f1c40f", fontWeight: 700 }}>📝 Quizzes:</span> {stats.quizzes_completed || 0}
          </p>
        </div>
      </PixelCard>

      {/* Section progress */}
      <PixelCard className="mt-6">
        <h2 className="retro-title text-xl font-semibold">📚 Section Progress</h2>
        <div className="mt-4 space-y-4">
          {lectureProgress.length === 0 && (
            <p style={{ color: "#6b7280" }}>No section progress yet.</p>
          )}
          {lectureProgress.map((section) => (
            <div key={section.category}>
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold" style={{ color: "#1f2937" }}>{section.category}</p>
                <p style={{ color: "#6b7280" }}>
                  {section.completed_topics}/{section.total_topics} ({section.progress_percent}%)
                </p>
              </div>
              <div className="xp-shell mt-1">
                <div className="xp-fill" style={{ width: `${section.progress_percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </PixelCard>

      {/* Recent quizzes */}
      <PixelCard className="mt-6">
        <h2 className="retro-title text-xl font-semibold">📝 Recent Quizzes</h2>
        <div className="mt-4 space-y-2">
          {recentQuizzes.length === 0 && (
            <p style={{ color: "#6b7280" }}>No quizzes yet.</p>
          )}
          {recentQuizzes.map((quiz) => (
            <div key={quiz.id} className="pixel-card text-sm">
              <p className="font-semibold" style={{ color: "#1f2937" }}>{quiz.topic}</p>
              <p style={{ color: "#6b7280" }}>
                Score: {quiz.score}/{quiz.total} • Accuracy: {quiz.accuracy}%
              </p>
            </div>
          ))}
        </div>
      </PixelCard>
    </main>
  );
}

export default Dashboard;
