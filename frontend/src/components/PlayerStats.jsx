function PlayerStats({ xp = 0, level = 1, masteredCount = 0 }) {
  return (
    <div className="pixel-card">
      <p className="pokemon-label">Trainer Status</p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="pokemon-label">⚡ Level</p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{ color: "#3498db", fontFamily: "'Press Start 2P', monospace", fontSize: "1.25rem" }}
          >
            {level}
          </p>
        </div>
        <div>
          <p className="pokemon-label">✨ XP</p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{ color: "#2ecc71", fontFamily: "'Press Start 2P', monospace", fontSize: "1.25rem" }}
          >
            {xp}
          </p>
        </div>
        <div>
          <p className="pokemon-label">🌟 Mastered</p>
          <p
            className="mt-1 text-2xl font-bold"
            style={{ color: "#f1c40f", fontFamily: "'Press Start 2P', monospace", fontSize: "1.25rem" }}
          >
            {masteredCount}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PlayerStats;
