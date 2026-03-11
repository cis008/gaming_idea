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
        <div className="md:hidden border-t-4 border-[var(--retro-border)] bg-[var(--retro-panel)] px-4 pb-4 pt-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMenu}
              className={({ isActive }) =>
                `retro-nav-link block w-full py-2 text-sm ${isActive ? "retro-nav-active" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            onClick={closeMenu}
            className={({ isActive }) =>
              `retro-nav-link block w-full py-2 text-sm ${isActive ? "retro-nav-active" : ""}`
            }
          >
            Profile
          </NavLink>
        </div>
      )}
    </header>
  );
}

export default RetroNavbar;
