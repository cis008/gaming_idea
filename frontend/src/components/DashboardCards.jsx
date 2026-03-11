function StatCard({ icon, label, value }) {
  return (
    <div className="pixel-card text-center">
      <p className="text-2xl">{icon}</p>
      <p className="pokemon-label mt-2">{label}</p>
      <p className="mt-2 text-2xl font-bold" style={{ color: "#2ecc71", fontFamily: "'Press Start 2P', monospace" }}>
        {value}
      </p>
    </div>
  );
}

function DashboardCards({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard icon="⭐" label="Points" value={stats.points ?? 0} />
      <StatCard icon="🏆" label="Level" value={stats.level ?? 1} />
      <StatCard icon="📝" label="Quizzes Done" value={stats.quizzes_completed ?? 0} />
      <StatCard icon="🎯" label="Accuracy" value={`${stats.accuracy ?? 0}%`} />
    </div>
  );
}

export default DashboardCards;
