import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PixelButton from "./PixelButton";

function Hero({ backgroundImage }) {
  const [scrollY, setScrollY] = useState(0);

  const heroImage =
    backgroundImage ||
    "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1800&q=80";

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero-parallax relative flex min-h-[100vh] items-center justify-center overflow-hidden">
      <div
        className="hero-bg-layer"
        style={{
          backgroundImage: `linear-gradient(rgba(2,6,23,0.78), rgba(15,23,42,0.85)), url('${heroImage}')`,
          transform: `translate3d(0, ${scrollY * 0.28}px, 0) scale(1.08)`,
        }}
      />
      <div className="hero-grid-layer" style={{ transform: `translate3d(0, ${scrollY * 0.12}px, 0)` }} />

      <motion.div
        className="absolute h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl"
        style={{ transform: `translate3d(0, ${scrollY * -0.18}px, 0)` }}
        animate={{ y: [0, -25, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
        <h1 className="retro-title text-4xl font-bold drop-shadow-[0_4px_0_rgba(2,6,23,0.85)] sm:text-6xl">
          Learn Anything with AI
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-100 drop-shadow-[0_2px_0_rgba(2,6,23,0.8)]">
          A gamified AI tutor that explains concepts, generates quizzes, and tracks your progress.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/login">
            <PixelButton>Start Learning</PixelButton>
          </Link>
          <Link to="/dashboard">
            <PixelButton>Go to Dashboard</PixelButton>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
