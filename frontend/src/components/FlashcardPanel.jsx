function FlashcardPanel({ flashcards = [], index = 0, flipped = false, onFlip, onPrev, onNext }) {
  const card = flashcards[index];

  if (!card) {
    return (
      <div className="dialogue-box">
        <p className="text-sm" style={{ color: "#6b7280" }}>Pick a concept to load flashcards.</p>
      </div>
    );
  }

  return (
    <div className="dialogue-box min-h-[230px]">
      <div className="flex items-center justify-between" style={{ marginBottom: "0.75rem" }}>
        <span className="pokemon-label">
          Card {index + 1}/{flashcards.length}
        </span>
        <button onClick={onFlip} className="pixel-button px-2 py-1 text-[10px]">Flip</button>
      </div>

      {!flipped ? (
        <div className="mt-4">
          <p className="pokemon-label">Question</p>
          <p className="mt-3 text-base font-semibold leading-relaxed" style={{ color: "#1f2937" }}>
            {card.front}
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3 text-sm" style={{ color: "#1f2937" }}>
          <p>
            <span className="font-bold" style={{ color: "#27ae60" }}>Explanation: </span>
            {card.explanation}
          </p>
          <p>
            <span className="font-bold" style={{ color: "#3498db" }}>Example: </span>
            {card.example}
          </p>
          <p>
            <span className="font-bold" style={{ color: "#f1c40f" }}>Takeaway: </span>
            {card.takeaway}
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-2">
        <button onClick={onPrev} className="pixel-button px-3 py-1 text-[10px]" disabled={index === 0}>Prev</button>
        <button onClick={onNext} className="pixel-button px-3 py-1 text-[10px]" disabled={index >= flashcards.length - 1}>Next</button>
      </div>
    </div>
  );
}

export default FlashcardPanel;
