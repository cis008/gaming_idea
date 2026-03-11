import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const themeOptions = [
  { value: "gameboy", label: "HUD A" },
  { value: "mario", label: "HUD B" },
  { value: "neon", label: "HUD C" },
];

function HamburgerIcon({ open }) {
  return (
    <span className="flex flex-col justify-center gap-[5px] w-6 h-6">
      <span
        className={`block h-0.5 w-full bg-current transition-all duration-300 ${
          open ? "translate-y-[7px] rotate-45" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-full bg-current transition-all duration-300 ${
          open ? "opacity-0" : ""
        }`}
      />
      <span
        className={`block h-0.5 w-full bg-current transition-all duration-300 ${
          open ? "-translate-y-[7px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

function RetroNavbar({
  theme,
  onThemeChange,
  heroBackground,
  onHeroBackgroundChange,
  backgroundOptions = [],
  isHomePage = false,
  isLoginPage = false,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`retro-navbar top-0 z-50 border-[var(--retro-border)] ${
        isHomePage
          ? "home-navbar fixed left-0 right-0 border-b-0 bg-transparent"
          : "sticky border-b-4 bg-[var(--retro-panel)]"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          onClick={closeMenu}
          className="retro-brand brand-glow text-base font-bold tracking-wide text-[var(--retro-accent-yellow)] sm:text-lg"
        >
          AI Study Companion
        </Link>

        {!isLoginPage && (
          <>
            {/* ── Desktop nav (md and up) ── */}
            <div className="hidden md:flex items-center gap-2 text-sm lg:gap-3">
              <NavLink to="/battle" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>
                Battle
              </NavLink>
              <NavLink to="/learning" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>
                Learning
              </NavLink>
              <NavLink to="/quiz" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>
                Quiz
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}>
                Dashboard
              </NavLink>
              <select
                value={theme}
                onChange={(event) => onThemeChange?.(event.target.value)}
                className="pixel-input max-w-[90px] px-2 py-1 text-xs"
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
                className="pixel-input max-w-[110px] px-2 py-1 text-xs"
                aria-label="Hero Background"
              >
                {backgroundOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Link to="/profile" className="pixel-button px-3 py-1 text-xs">
                Profile
              </Link>
            </div>

            {/* ── Hamburger button (below md) ── */}
            <button
              className="md:hidden p-2 text-[var(--retro-accent-yellow)]"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          </>
        )}
      </nav>

      {/* ── Mobile dropdown (below md) ── */}
      {!isLoginPage && menuOpen && (
        <div className="md:hidden border-t-4 border-[var(--retro-border)] bg-[var(--retro-panel)] px-4 pb-4 pt-3 space-y-1">
          <NavLink
            to="/battle"
            onClick={closeMenu}
            className={({ isActive }) =>
              `retro-nav-link block w-full py-2 text-sm ${isActive ? "retro-nav-active" : ""}`
            }
          >
            Battle Mode
          </NavLink>
          <NavLink
            to="/learning"
            onClick={closeMenu}
            className={({ isActive }) =>
              `retro-nav-link block w-full py-2 text-sm ${isActive ? "retro-nav-active" : ""}`
            }
          >
            Learning
          </NavLink>
          <NavLink
            to="/quiz"
            onClick={closeMenu}
            className={({ isActive }) =>
              `retro-nav-link block w-full py-2 text-sm ${isActive ? "retro-nav-active" : ""}`
            }
          >
            Quiz
          </NavLink>
          <NavLink
            to="/dashboard"
            onClick={closeMenu}
            className={({ isActive }) =>
              `retro-nav-link block w-full py-2 text-sm ${isActive ? "retro-nav-active" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            onClick={closeMenu}
            className={({ isActive }) =>
              `retro-nav-link block w-full py-2 text-sm ${isActive ? "retro-nav-active" : ""}`
            }
          >
            Profile
          </NavLink>
          <div className="flex flex-wrap gap-2 pt-2">
            <select
              value={theme}
              onChange={(event) => onThemeChange?.(event.target.value)}
              className="pixel-input flex-1 min-w-[100px] px-2 py-1 text-sm"
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
              className="pixel-input flex-1 min-w-[120px] px-2 py-1 text-sm"
              aria-label="Hero Background"
            >
              {backgroundOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
}

export default RetroNavbar;
