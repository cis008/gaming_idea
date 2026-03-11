function AnswerButtons({ options = [], selectedOption, onSelect, onSubmit, disabled }) {
  return (
    <div className="space-y-3">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className="w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold transition"
          style={
            selectedOption === idx
              ? { borderColor: "#2ecc71", background: "#d4edda", color: "#1a5c36" }
              : { borderColor: "#2d3436", background: "#f9fafb", color: "#1f2937" }
          }
          onMouseEnter={(e) => {
            if (selectedOption !== idx) {
              e.currentTarget.style.borderColor = "#2ecc71";
              e.currentTarget.style.background = "#f0fff4";
            }
          }}
          onMouseLeave={(e) => {
            if (selectedOption !== idx) {
              e.currentTarget.style.borderColor = "#2d3436";
              e.currentTarget.style.background = "#f9fafb";
            }
          }}
        >
          {option}
        </button>
      ))}
      <button onClick={onSubmit} disabled={disabled} className="pixel-button w-full disabled:opacity-60">
        ⚔️ Confirm Attack
      </button>
    </div>
  );
}

export default AnswerButtons;
