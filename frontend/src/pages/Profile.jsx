import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PixelButton from "../components/PixelButton";
import PixelCard from "../components/PixelCard";
import RetroBadge from "../components/RetroBadge";
import { useBackgroundMusic } from "../context/BackgroundMusicContext";
import { fetchDashboard, fetchMe } from "../services/api";

function Profile() {
  const navigate = useNavigate();
  const { isMusicEnabled, setMusicEnabled, musicStatus, musicError } = useBackgroundMusic();
  const [profile, setProfile] = useState(null);
  const [lectureProgress, setLectureProgress] = useState([]);

  const onLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("username");
    sessionStorage.removeItem("quizPayload");
    sessionStorage.removeItem("resultPayload");
    navigate("/login");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [meRes, dashboardRes] = await Promise.all([fetchMe(), fetchDashboard()]);
        setProfile(meRes.data);
        setLectureProgress(dashboardRes.data.lecture_progress || []);
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, []);

  const hoursSpent = useMemo(() => {
    const totalMinutes = profile?.total_minutes_spent || 0;
    return (totalMinutes / 60).toFixed(1);
  }, [profile]);

  if (!profile) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="retro-title text-3xl font-bold">Profile</h1>
        <p className="mt-2" style={{ color: "#6b7280" }}>Please login to see your profile details.</p>
        <Link to="/login" className="mt-4 inline-block">
          <PixelButton>Go to Login</PixelButton>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="retro-title text-3xl font-bold">🧢 Profile</h1>
          <p className="mt-2" style={{ color: "#6b7280" }}>Welcome back, {profile.username}!</p>
        </div>
        <PixelButton className="px-4 py-2" onClick={onLogout}>
          Logout
        </PixelButton>
      </div>

      {/* Trainer stat cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PixelCard>
          <p className="pokemon-label">⏱️ Hours Spent</p>
          <p className="retro-title mt-2 text-2xl font-bold">{hoursSpent}</p>
        </PixelCard>
        <PixelCard>
          <p className="pokemon-label">📅 Days Spent</p>
          <p className="retro-title mt-2 text-2xl font-bold">{profile.days_spent || 0}</p>
        </PixelCard>
        <PixelCard>
          <p className="pokemon-label">📝 Quizzes Done</p>
          <p className="retro-title mt-2 text-2xl font-bold">{profile.quizzes_completed || 0}</p>
        </PixelCard>
        <PixelCard>
          <p className="pokemon-label">🔥 Login Streak</p>
          <p className="retro-title mt-2 text-2xl font-bold">{profile.login_streak_days || 0}</p>
        </PixelCard>
      </div>

      {/* Badge case */}
      <PixelCard className="mt-6">
        <h2 className="retro-title text-xl font-semibold">🏅 Badge Case</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(profile.badges || []).length === 0 && (
            <p style={{ color: "#6b7280" }}>No badges yet — complete quizzes to earn them!</p>
          )}
          {(profile.badges || []).map((badge) => <RetroBadge key={badge} text={badge} />)}
        </div>
      </PixelCard>

      {/* Profile Settings */}
      <PixelCard className="mt-6">
        <h2 className="retro-title text-xl font-semibold">⚙️ Profile Settings</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold" style={{ color: "#1f2937" }}>Background Music</p>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              ON: plays only after you press Start Battle · OFF: disabled everywhere
            </p>
            {musicStatus === "idle" && isMusicEnabled && (
              <p className="mt-1 text-xs" style={{ color: "#6b7280" }}>
                Music is ready and will play when a battle starts.
              </p>
            )}
            {musicStatus === "blocked" && (
              <p className="mt-1 text-xs" style={{ color: "#e67e22" }}>
                Browser blocked autoplay. Click anywhere and keep setting ON.
              </p>
            )}
            {musicError && (
              <p className="mt-1 text-xs" style={{ color: "#e74c3c" }}>{musicError}</p>
            )}
          </div>
          <div
            className="inline-flex rounded-lg p-1"
            style={{ border: "2px solid #2d3436", background: "#ffffff" }}
          >
            <button
              type="button"
              onClick={() => setMusicEnabled(true)}
              className="min-w-16 rounded-md px-3 py-1.5 text-sm font-bold transition"
              style={isMusicEnabled ? { background: "#2ecc71", color: "#fff" } : { background: "transparent", color: "#6b7280" }}
            >
              ON
            </button>
            <button
              type="button"
              onClick={() => setMusicEnabled(false)}
              className="min-w-16 rounded-md px-3 py-1.5 text-sm font-bold transition"
              style={!isMusicEnabled ? { background: "#2d3436", color: "#fff" } : { background: "transparent", color: "#6b7280" }}
            >
              OFF
            </button>
          </div>
        </div>
      </PixelCard>

      {/* Dashboard Progress */}
      <PixelCard className="mt-6">
        <h2 className="retro-title text-xl font-semibold">📚 Learning Progress</h2>
        <div className="mt-4 space-y-4">
          {lectureProgress.length === 0 && (
            <p style={{ color: "#6b7280" }}>No progress data yet.</p>
          )}
          {lectureProgress.map((section) => (
            <div key={section.category}>
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold" style={{ color: "#27ae60" }}>{section.category}</p>
                <p style={{ color: "#6b7280" }}>{section.progress_percent}%</p>
              </div>
              <div className="xp-shell mt-1">
                <div className="xp-fill" style={{ width: `${section.progress_percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </PixelCard>
    </main>
  );
}

export default Profile;
