function QuizComponent({ questions, answers, onAnswer }) {
  return (
    <div className="space-y-5">
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="pixel-card">
          {/* Question text */}
          <p className="font-semibold" style={{ color: "#1f2937" }}>
            {qIndex + 1}. {question.question}
          </p>

          {/* Answer options grid */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, oIndex) => (
              <button
                key={oIndex}
                onClick={() => onAnswer(qIndex, oIndex)}
                className="rounded-lg border-2 px-3 py-2 text-left text-sm font-semibold transition"
                style={
                  answers[qIndex] === oIndex
                    ? {
                      borderColor: "#2ecc71",
                      background: "#d4edda",
                      color: "#1a5c36",
                    }
                    : {
                      borderColor: "#2d3436",
                      background: "#f9fafb",
                      color: "#1f2937",
                    }
                }
                onMouseEnter={(e) => {
                  if (answers[qIndex] !== oIndex) {
                    e.currentTarget.style.borderColor = "#2ecc71";
                    e.currentTarget.style.background = "#f0fff4";
                  }
                }}
                onMouseLeave={(e) => {
                  if (answers[qIndex] !== oIndex) {
                    e.currentTarget.style.borderColor = "#2d3436";
                    e.currentTarget.style.background = "#f9fafb";
                  }
                }}
              >
                {String.fromCharCode(65 + oIndex)}. {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default QuizComponent;
