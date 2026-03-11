import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

function HamburgerIcon({ open }) {
  return (
    <span className="flex flex-col justify-center gap-[5px] w-6 h-6">
      <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
      <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
      <span className={`block h-0.5 w-full bg-current transition-all duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
    </span>
  );
}

function RetroNavbar({ isHomePage = false, isLoginPage = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const closeMenu = () => setMenuOpen(false);

  const navLinks = [
    { to: "/battle", label: "Battle" },
    { to: "/learning", label: "Learning" },
    { to: "/quiz", label: "Quiz" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  return (
    <header
      className={`retro-navbar top-0 z-50 border-[var(--retro-border)] ${isHomePage
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
            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3 text-sm">
              {navLinks.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `retro-nav-link ${isActive ? "retro-nav-active" : ""}`}
                >
                  {label}
                </NavLink>
              ))}
              <Link to="/profile" className="pixel-button px-3 py-1 text-xs">
                Profile
              </Link>
            </div>

            {/* Hamburger (mobile) */}
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

      {/* Mobile dropdown */}
      {!isLoginPage && menuOpen && (
        <div className="md:hidden border-t-4 border-[var(--retro-border)] bg-[var(--retro-panel)] px-4 pb-4 pt-3 flex flex-col gap-2">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              style={({ isActive }) => ({
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "0.65rem",
                padding: "12px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                letterSpacing: "0.05em",
                background: isActive ? "#2ecc71" : "#f0fff4",
                color: isActive ? "#ffffff" : "#1a5c36",
                border: `2px solid ${isActive ? "#27ae60" : "#c8e6c9"}`,
                fontWeight: 700,
                display: "block",
              })}
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/profile"
            onClick={closeMenu}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "0.65rem",
              padding: "12px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              letterSpacing: "0.05em",
              background: "#f1c40f",
              color: "#1a5c36",
              border: "2px solid #d4ac0d",
              fontWeight: 700,
              display: "block",
              marginTop: "4px",
            }}
          >
            Profile
          </Link>
        </div>
      )}
    </header>
  );
}

export default RetroNavbar;
