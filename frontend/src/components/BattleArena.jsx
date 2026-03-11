function BattleArena({ concept, status, playerHp, enemyHp, question, options, selectedOption, onSelectOption, onSubmitAnswer, canSubmit }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        {/* Enemy concept card */}
        <div className="pixel-card">
          <p className="pokemon-label">Enemy Concept</p>
          <p className="mt-2 text-base font-bold" style={{ color: "#2d3436" }}>
            {concept || "—"}
          </p>
          {status !== "active" && (
            <p
              className="mt-2 text-sm font-bold"
              style={{ color: status === "won" ? "#2ecc71" : "#e74c3c" }}
            >
              {status === "won" ? "🏆 VICTORY!" : status === "lost" ? "💀 DEFEATED!" : status.toUpperCase()}
            </p>
          )}
        </div>
        {/* HP bars */}
        <div className="pixel-card">
          <div className="space-y-3">
            {/* Player HP */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold" style={{ color: "#1f2937" }}>
                <span>🧢 Trainer HP</span>
                <span>{playerHp}/100</span>
              </div>
              <div className="xp-shell">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, playerHp))}%`,
                    background: "#2ecc71",
                    boxShadow: "0 0 8px rgba(46,204,113,0.5)",
                    borderRadius: "inherit",
                  }}
                />
              </div>
            </div>
            {/* Enemy HP */}
            <div>
              <div className="mb-1 flex items-center justify-between text-xs font-semibold" style={{ color: "#1f2937" }}>
                <span>⚔️ Enemy HP</span>
                <span>{enemyHp}/100</span>
              </div>
              <div className="xp-shell">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${Math.max(0, Math.min(100, enemyHp))}%`,
                    background: "#e74c3c",
                    boxShadow: "0 0 8px rgba(231,76,60,0.5)",
                    borderRadius: "inherit",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question + Answers */}
      <div className="pixel-card">
        <p className="pokemon-label">Battle Question</p>
        <p className="mt-3 text-base font-semibold leading-relaxed" style={{ color: "#1f2937" }}>
          {question || "Start battle to receive a question."}
        </p>
        {options.length > 0 && (
          <div className="mt-4 space-y-2">
            {options.map((option, i) => (
              <button
                key={i}
                onClick={() => onSelectOption(i)}
                className={`w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold transition ${selectedOption === i
                    ? "border-[#2ecc71] bg-[#d4edda] text-[#1f2937]"
                    : "border-[#2d3436] bg-white text-[#1f2937] hover:border-[#2ecc71] hover:bg-[#f0fff4]"
                  }`}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            ))}
            <button
              onClick={onSubmitAnswer}
              disabled={!canSubmit}
              className="pixel-button mt-3 w-full"
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BattleArena;
