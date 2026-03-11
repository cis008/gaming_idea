function Bar({ label, value, barColor }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold" style={{ color: "#1f2937" }}>
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="xp-shell">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${Math.max(0, Math.min(100, value))}%`,
            background: barColor,
            boxShadow: `0 0 8px ${barColor}80`,
            borderRadius: "inherit",
          }}
        />
      </div>
    </div>
  );
}

function HealthBars({ playerHp = 100, enemyHp = 100 }) {
  return (
    <div className="space-y-3">
      <Bar label="🧢 Trainer HP" value={playerHp} barColor="#2ecc71" />
      <Bar label="⚔️ Enemy HP" value={enemyHp} barColor="#e74c3c" />
    </div>
  );
}

export default HealthBars;
