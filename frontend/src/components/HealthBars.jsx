function Bar({ label, value, colorClass }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>{value}/100</span>
      </div>
      <div className="xp-shell">
        <div className={`h-full transition-all duration-500 ${colorClass}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

function HealthBars({ playerHp = 100, enemyHp = 100 }) {
  return (
    <div className="space-y-3">
      <Bar label="Player HP" value={playerHp} colorClass="bg-emerald-400" />
      <Bar label="Enemy HP" value={enemyHp} colorClass="bg-fuchsia-400" />
    </div>
  );
}

export default HealthBars;
