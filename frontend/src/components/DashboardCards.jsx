function StatCard({ label, value }) {
  return (
    <div className="pixel-card">
      <p className="text-[10px] uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--retro-success)]">{value}</p>
    </div>
  );
}

function DashboardCards({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Points" value={stats.points ?? 0} />
      <StatCard label="Level" value={stats.level ?? 1} />
      <StatCard label="Quizzes Completed" value={stats.quizzes_completed ?? 0} />
      <StatCard label="Accuracy" value={`${stats.accuracy ?? 0}%`} />
    </div>
  );
}

export default DashboardCards;
