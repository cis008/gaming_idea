import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PixelButton from "../components/PixelButton";
import QuizComponent from "../components/QuizComponent";
import { submitQuiz } from "../services/api";

function Quiz() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("quizPayload");
    if (!raw) {
      navigate("/learning");
      return;
    }
    const parsed = JSON.parse(raw);
    setTopic(parsed.topic);
    setCategory(parsed.category || "");
    setQuestions(parsed.questions || []);
    setAnswers(new Array((parsed.questions || []).length).fill(null));
  }, [navigate]);

  const onAnswer = (questionIndex, optionIndex) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[questionIndex] = optionIndex;
      return next;
    });
  };

  const onSubmit = async () => {
    setSubmitError("");
    try {
      const response = await submitQuiz({
        topic,
        category,
        questions,
        user_answers: answers,
      });

      sessionStorage.setItem("resultPayload", JSON.stringify(response.data));
      navigate("/result");
    } catch (error) {
      if (error.response?.status === 401) {
        setSubmitError("Your session expired. Please login again.");
      } else {
        setSubmitError(error.response?.data?.detail || "Quiz submission failed. Please try again.");
      }
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="retro-title text-3xl font-bold">Quiz: {topic || "Topic"}</h1>
      <p className="mt-2 text-slate-300">Answer all MCQs and submit to get your score and XP update.</p>

      <div className="mt-6">
        <QuizComponent questions={questions} answers={answers} onAnswer={onAnswer} />
      </div>

      {questions.length > 0 && (
        <div className="mt-6">
          <PixelButton onClick={onSubmit}>Submit Quiz</PixelButton>
          {submitError && <p className="mt-3 text-sm text-rose-300">{submitError}</p>}
        </div>
      )}
    </main>
  );
}

export default Quiz;
