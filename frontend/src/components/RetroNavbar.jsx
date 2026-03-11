import { Link, NavLink } from "react-router-dom";

const themeOptions = [
  { value: "gameboy", label: "HUD A" },
  { value: "mario", label: "HUD B" },
  { value: "neon", label: "HUD C" },
];

function RetroNavbar({
  theme,
  onThemeChange,
  heroBackground,
  onHeroBackgroundChange,
  backgroundOptions = [],
  isHomePage = false,
  isLoginPage = false,
}) {
  return (
    <header
      className={`retro-navbar top-0 z-50 border-[var(--retro-border)] ${
        isHomePage
          ? "home-navbar fixed left-0 right-0 border-b-0 bg-transparent"
          : "sticky border-b-4 bg-[var(--retro-panel)]"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="retro-brand brand-glow text-base font-bold tracking-wide text-[var(--retro-accent-yellow)] sm:text-lg">
          AI Study Companion
        </Link>
        {!isLoginPage && (
          <div className="flex items-center gap-2 text-sm sm:gap-3 sm:text-base">
            <NavLink to="/battle" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>Battle Mode</NavLink>
            <NavLink to="/learning" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>Learning</NavLink>
            <NavLink to="/quiz" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>Quiz</NavLink>
            <NavLink to="/dashboard" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>Dashboard</NavLink>
            <select
              value={theme}
              onChange={(event) => onThemeChange?.(event.target.value)}
              className="pixel-input max-w-[96px] px-2 py-1 text-sm"
              aria-label="Retro Theme"
            >
              {themeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={heroBackground}
              onChange={(event) => onHeroBackgroundChange?.(event.target.value)}
              className="pixel-input max-w-[126px] px-2 py-1 text-sm"
              aria-label="Hero Background"
            >
              {backgroundOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Link to="/profile" className="pixel-button px-3 py-1">Profile</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default RetroNavbar;
