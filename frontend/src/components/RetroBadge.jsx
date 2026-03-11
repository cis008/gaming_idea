const badgeNameMap = {
  "First Quiz": "Starter Trainer",
  "5 Quiz Streak": "Knowledge Champion",
  "Perfect Score": "Quiz Master",
};

function RetroBadge({ text }) {
  const label = badgeNameMap[text] || text;
  return <span className="retro-badge">{label}</span>;
}

export default RetroBadge;
