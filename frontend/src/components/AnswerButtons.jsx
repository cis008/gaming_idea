function AnswerButtons({ options = [], selectedOption, onSelect, onSubmit, disabled }) {
  return (
    <div className="space-y-3">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
            selectedOption === idx
              ? "border-cyan-500 bg-cyan-200 text-slate-900"
              : "border-slate-500 bg-slate-100 text-slate-800 hover:border-cyan-500 hover:bg-cyan-50"
          }`}
        >
          {option}
        </button>
      ))}
      <button onClick={onSubmit} disabled={disabled} className="pixel-button w-full disabled:opacity-60">
        Confirm Attack
      </button>
    </div>
  );
}

export default AnswerButtons;
