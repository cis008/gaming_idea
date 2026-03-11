function EnemyConceptCard({ concept, status }) {
  return (
    <div className="pixel-card">
      <p className="pokemon-label">Concept Challenge</p>
      <h3 className="retro-title mt-2 text-xl font-bold">{concept || "Unknown Concept"}</h3>
      <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>
        {status === "won"
          ? "✅ Concept defeated. Mastery unlocked!"
          : status === "lost"
            ? "💀 You were defeated. Retry to master this concept."
            : "⚔️ Battle in progress. Answer correctly to damage the enemy."}
      </p>
    </div>
  );
}

export default EnemyConceptCard;
