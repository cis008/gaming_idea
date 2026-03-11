import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PixelButton from "./PixelButton";
import FlappyBirdBackground from "./FlappyBirdBackground";

const FEATURES = [
  { icon: "⚔️", title: "Battle Mode", desc: "Fight concept bosses in real-time AI battles", to: "/battle" },
  { icon: "📖", title: "Learn", desc: "Flashcards, explanations & study chat", to: "/learning" },
  { icon: "📝", title: "Quiz", desc: "Test your knowledge with AI-generated quizzes", to: "/quiz" },
  { icon: "📊", title: "Dashboard", desc: "Track XP, levels, badges & mastery progress", to: "/dashboard" },
];

function Hero() {
  return (
    <div className="relative overflow-hidden" style={{ background: "#e8f5e9" }}>
      {/* ── Hero viewport ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Flappy Bird fills the full hero */}
        <FlappyBirdBackground />

        {/* Subtle radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 35%, rgba(39,174,96,0.28) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero text block */}
        <div className="relative z-10 mx-auto max-w-2xl px-4 text-center">
          <p
            className="mb-5 inline-block rounded-full border-2 border-[#f1c40f] px-5 py-1"
            style={{
              background: "rgba(241,196,15,0.18)",
              color: "#f1c40f",
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "0.52rem",
              letterSpacing: "0.12em",
              textShadow: "1px 1px 0 rgba(0,0,0,0.35)",
            }}
          >
            🌿 POKÉMON STUDY COMPANION
          </p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              color: "#1a5c36",
              textShadow: "3px 3px 0 rgba(255,255,255,0.7), 0 6px 24px rgba(46,204,113,0.35)",
              lineHeight: 1.55,
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
            }}
          >
            Learn with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-5 max-w-lg text-base font-semibold"
            style={{ color: "#1f2937", textShadow: "0 1px 8px rgba(255,255,255,0.9)" }}
          >
            A gamified AI tutor that explains concepts, generates quizzes, and tracks your progress.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/login"><PixelButton>▶ Start Learning</PixelButton></Link>
            <Link to="/dashboard"><PixelButton>Go to Dashboard</PixelButton></Link>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          style={{ color: "#27ae60", fontFamily: "'Press Start 2P', monospace", fontSize: "0.6rem" }}
        >
          ▼ scroll
        </motion.div>
      </section>

      {/* ── Feature cards below the fold ── */}
      <section
        className="relative z-10 px-4 py-16"
        style={{ background: "linear-gradient(to bottom, #e8f5e9, #f0fff4)" }}
      >
        <p
          className="mb-10 text-center"
          style={{
            fontFamily: "'Press Start 2P', monospace",
            color: "#1a5c36",
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
          }}
        >
          ✨ CHOOSE YOUR PATH
        </p>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon, title, desc, to }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(46,204,113,0.25)" }}
              className="pixel-card flex flex-col items-center gap-3 text-center cursor-pointer"
              onClick={() => (window.location.href = to)}
            >
              <span style={{ fontSize: "2.4rem" }}>{icon}</span>
              <h3
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  color: "#1a5c36",
                  fontSize: "0.65rem",
                  lineHeight: 1.6,
                }}
              >
                {title}
              </h3>
              <p className="text-sm" style={{ color: "#6b7280" }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Hero;
