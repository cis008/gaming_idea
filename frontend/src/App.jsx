import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

// Redirects to /login if no authToken in localStorage
function PrivateRoute({ children }) {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" replace />;
}

import FloatingChatbot from "./components/FloatingChatbot";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Learn from "./pages/Learn";
import Login from "./pages/Login";
import PrerecordedLectures from "./pages/PrerecordedLectures";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import Result from "./pages/Result";
import { useBackgroundMusic } from "./context/BackgroundMusicContext";
import { trackActivity } from "./services/api";

const heroBackgroundOptions = [
  {
    value: "space",
    label: "Space",
    image:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=80",
  },
  {
    value: "cyber-city",
    label: "Cyber City",
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1800&q=80",
  },
  {
    value: "arcade",
    label: "Arcade",
    image:
      "https://images.unsplash.com/photo-1511882150382-421056c89033?auto=format&fit=crop&w=1800&q=80",
  },
  {
    value: "retro-grid",
    label: "Retro Grid",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=80",
  },
  {
    value: "neon-night",
    label: "Neon Night",
    image:
      "https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&w=1800&q=80",
  },
  {
    value: "pixel-planet",
    label: "Pixel Planet",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1800&q=80",
  },
];

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isLoginPage = location.pathname === "/login";
  const isBattleRoute = location.pathname === "/battle" || location.pathname === "/mentor" || location.pathname === "/learn";
  const shouldHideChatbot = isBattleRoute || location.pathname === "/quiz";
  const { setBattleMusicActive } = useBackgroundMusic();
  const [theme, setTheme] = useState(() => localStorage.getItem("retroTheme") || "gameboy");
  const [heroBackground, setHeroBackground] = useState(() => localStorage.getItem("heroBackground") || "space");

  useEffect(() => {
    localStorage.setItem("retroTheme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("heroBackground", heroBackground);
  }, [heroBackground]);

  const selectedBackground =
    heroBackgroundOptions.find((option) => option.value === heroBackground) || heroBackgroundOptions[0];

  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("authToken");
      if (!token || document.hidden) return;
      trackActivity({ minutes: 1 }).catch(() => { });
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isBattleRoute) {
      setBattleMusicActive(false);
    }
  }, [location.pathname, setBattleMusicActive]);

  return (
    <div className={`app-shell retro-screen theme-${theme} min-h-screen`}>

      <Navbar
        theme={theme}
        onThemeChange={setTheme}
        heroBackground={heroBackground}
        onHeroBackgroundChange={setHeroBackground}
        backgroundOptions={heroBackgroundOptions}
        isHomePage={isHomePage}
        isLoginPage={isLoginPage}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/battle" element={<PrivateRoute><Learn /></PrivateRoute>} />
        <Route path="/mentor" element={<PrivateRoute><Learn /></PrivateRoute>} />
        <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
        <Route path="/learning" element={<PrivateRoute><PrerecordedLectures /></PrivateRoute>} />
        <Route path="/prerecorded" element={<PrivateRoute><PrerecordedLectures /></PrivateRoute>} />
        <Route path="/quiz" element={<PrivateRoute><Quiz /></PrivateRoute>} />
        <Route path="/result" element={<PrivateRoute><Result /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!shouldHideChatbot && <FloatingChatbot />}
    </div>
  );
}

export default App;
