function PlayerStats({ xp = 0, level = 1, masteredCount = 0 }) {
  return (
    <div className="pixel-card">
      <p className="text-xs uppercase tracking-wider text-slate-400">Player Stats</p>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-[10px] text-slate-400">Level</p>
          <p className="text-xl font-bold text-[var(--retro-accent-blue)]">{level}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">XP</p>
          <p className="text-xl font-bold text-[var(--retro-accent-blue)]">{xp}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400">Mastered</p>
          <p className="text-xl font-bold text-[var(--retro-accent-blue)]">{masteredCount}</p>
        </div>
      </div>
    </div>
  );
}

export default PlayerStats;
