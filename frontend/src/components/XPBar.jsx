function XPBar({ value, label = "XP Progress" }) {
  const percent = Math.max(0, Math.min(100, value || 0));

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs text-slate-200">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="xp-shell">
        <div className="xp-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default XPBar;
