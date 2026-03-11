function QuizComponent({ questions, answers, onAnswer }) {
  return (
    <div className="space-y-5">
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="pixel-card">
          <p className="font-medium text-[#facc15]">{qIndex + 1}. {question.question}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, oIndex) => (
              <button
                key={oIndex}
                onClick={() => onAnswer(qIndex, oIndex)}
                className={`rounded-none border-[3px] px-3 py-2 text-left transition ${
                  answers[qIndex] === oIndex
                    ? "border-[#22c55e] bg-[#38bdf8] text-slate-900"
                    : "border-[#22c55e] bg-[#0b1224] hover:bg-[#1f2937]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuizComponent;
