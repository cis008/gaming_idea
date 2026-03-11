const badgeNameMap = {
  "First Quiz": "Starter Trainer",
  "5 Quiz Streak": "Knowledge Champion",
  "Perfect Score": "Quiz Master",
};

const badgeColourMap = {
  "Starter Trainer": "green",
  "Concept Catcher": "green",
  "Quiz Master": "gold",
  "Knowledge Champion": "gold",
  "Elite Learner": "blue",
  "5 Quiz Streak": "gold",
};

const badgeIconMap = {
  "gold": "🏅",
  "green": "🌿",
  "blue": "💎",
};

function RetroBadge({ text }) {
  const label = badgeNameMap[text] || text;
  const colour = badgeColourMap[label] || "green";
  const icon = badgeIconMap[colour];
  return (
    <span className="retro-badge" data-badge={colour}>
      {icon} {label}
    </span>
  );
}

export default RetroBadge;
