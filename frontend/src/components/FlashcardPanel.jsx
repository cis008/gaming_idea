function FlashcardPanel({ flashcards = [], index = 0, flipped = false, onFlip, onPrev, onNext }) {
  const card = flashcards[index];

  if (!card) {
    return (
      <div className="pixel-card">
        <p className="text-sm text-slate-400">Pick a concept to load flashcards.</p>
      </div>
    );
  }

  return (
    <div className="pixel-card min-h-[230px]">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Flashcard {index + 1}/{flashcards.length}</span>
        <button onClick={onFlip} className="pixel-button px-2 py-1 text-[10px]">Flip</button>
      </div>

      {!flipped ? (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-slate-400">Front</p>
          <p className="mt-2 text-lg font-semibold text-slate-100">{card.front}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2 text-sm text-slate-200">
          <p><span className="font-semibold text-cyan-300">Explanation:</span> {card.explanation}</p>
          <p><span className="font-semibold text-cyan-300">Example:</span> {card.example}</p>
          <p><span className="font-semibold text-cyan-300">Takeaway:</span> {card.takeaway}</p>
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
