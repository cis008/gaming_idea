function EnemyConceptCard({ concept, status }) {
  return (
    <div className="pixel-card">
      <p className="text-xs uppercase tracking-wider text-slate-400">Concept Challenge</p>
      <h3 className="retro-title mt-2 text-2xl font-bold">{concept || "Unknown Concept"}</h3>
      <p className="mt-2 text-sm text-slate-300">
        {status === "won"
          ? "Concept defeated. Mastery unlocked."
          : status === "lost"
            ? "You were defeated. Retry to master this concept."
            : "Battle in progress. Answer correctly to damage the enemy."}
      </p>
    </div>
  );
}

export default EnemyConceptCard;
