import { useEffect, useMemo, useState } from "react";
import BattleArena from "../components/BattleArena";
import FlashcardPanel from "../components/FlashcardPanel";
import PlayerStats from "../components/PlayerStats";
import { useBackgroundMusic } from "../context/BackgroundMusicContext";
import {
  fetchBattleFlashcards,
  generateBattleRoadmap,
  nextBattleQuestion,
  startBattle,
  submitBattleAnswer,
} from "../services/api";

const subjects = [
  { value: "dsa", label: "Data Structures and Algorithms" },
  { value: "databases", label: "Databases" },
  { value: "mathematics", label: "Mathematics for Computer Science" },
];

function Learn() {
  const { setBattleMusicActive, startBattleMusic } = useBackgroundMusic();
  const [subject, setSubject] = useState("dsa");
  const [roadmap, setRoadmap] = useState([]);
  const [battleProgress, setBattleProgress] = useState({ xp: 0, level: 1, unlocked_index: 0, mastered_concepts: [] });
  const [concept, setConcept] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [battleStatus, setBattleStatus] = useState("active");
  const [maxQuestions, setMaxQuestions] = useState(4);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(0);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const masteredConcepts = useMemo(() => new Set(battleProgress.mastered_concepts || []), [battleProgress]);

  useEffect(
    () => () => {
      setBattleMusicActive(false);
    },
    [setBattleMusicActive]
  );

  const loadRoadmap = async () => {
    setLoading(true);
    setFeedback("");
    try {
      const response = await generateBattleRoadmap({ subject });
      setRoadmap(response.data.roadmap || []);
      setBattleProgress(response.data.progress || { xp: 0, level: 1, unlocked_index: 0, mastered_concepts: [] });
      setConcept("");
      setFlashcards([]);
      setSessionId(null);
      setQuestion("");
      setOptions([]);
      setSelectedOption(null);
      setPlayerHp(100);
      setEnemyHp(100);
      setBattleStatus("active");
      setCurrentQuestionNumber(0);
      setMaxQuestions(4);
      setBattleMusicActive(false);
    } catch (error) {
      setFeedback(error.response?.data?.detail || "Could not generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const selectConcept = async (selectedConcept) => {
    setConcept(selectedConcept);
    setSessionId(null);
    setQuestion("");
    setOptions([]);
    setSelectedOption(null);
    setBattleStatus("active");
    setCurrentQuestionNumber(0);
    setMaxQuestions(4);
    setFeedback("");
    setFlashcardIndex(0);
    setFlipped(false);
    setBattleMusicActive(false);

    try {
      const response = await fetchBattleFlashcards({ subject, concept: selectedConcept });
      setFlashcards(response.data.flashcards || []);
    } catch (error) {
      setFeedback(error.response?.data?.detail || "Could not load flashcards.");
      setFlashcards([]);
    }
  };

  const beginBattle = async () => {
    if (!concept) return;
    startBattleMusic();
    setLoading(true);
    setFeedback("");
    try {
      const startResponse = await startBattle({ subject, concept });
      const newSessionId = startResponse.data.session_id;
      setSessionId(newSessionId);
      setPlayerHp(startResponse.data.player_hp ?? 100);
      setEnemyHp(startResponse.data.enemy_hp ?? 100);
      setBattleStatus(startResponse.data.status || "active");
      setMaxQuestions(startResponse.data.max_questions ?? 4);

      const questionResponse = await nextBattleQuestion({ session_id: newSessionId });
      setQuestion(questionResponse.data.question || "");
      setOptions(questionResponse.data.options || []);
      setCurrentQuestionNumber((questionResponse.data.turns ?? 0) + 1);
      setSelectedOption(null);
    } catch (error) {
      setBattleMusicActive(false);
      setFeedback(error.response?.data?.detail || "Could not start battle.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!sessionId || selectedOption === null) return;
    setLoading(true);
    setFeedback("");
    try {
      const response = await submitBattleAnswer({ session_id: sessionId, selected_option: selectedOption });
      const payload = response.data;
      setPlayerHp(payload.player_hp ?? 0);
      setEnemyHp(payload.enemy_hp ?? 0);
      setBattleStatus(payload.status || "active");
      setMaxQuestions(payload.max_questions ?? 4);
      setBattleProgress(payload.battle_progress || battleProgress);

      setFeedback(
        `${payload.result === "correct" ? "✅ Correct!" : "❌ Wrong."} ${payload.explanation} ` +
          `Enemy -${payload.damage?.enemy ?? 0}, Player -${payload.damage?.player ?? 0}, XP +${payload.xp_gain ?? 0}`
      );

      setSelectedOption(null);

      if (payload.status === "active") {
        const questionResponse = await nextBattleQuestion({ session_id: sessionId });
        setQuestion(questionResponse.data.question || "");
        setOptions(questionResponse.data.options || []);
        setCurrentQuestionNumber((questionResponse.data.turns ?? payload.turns ?? 0) + 1);
      } else {
        setBattleMusicActive(false);
        setCurrentQuestionNumber(payload.turns ?? currentQuestionNumber);
        setQuestion("");
        setOptions([]);
      }
    } catch (error) {
      setFeedback(error.response?.data?.detail || "Could not submit answer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 pb-24">
      <h1 className="retro-title text-3xl font-bold">Battle Mode</h1>
      <p className="mt-2 text-slate-700">
        Enter retro battles to master core CS concepts with flashcards, quizzes, and AI-generated challenges.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="pixel-card lg:col-span-1">
          <p className="text-xs uppercase tracking-wide text-slate-600">1) Choose Subject</p>
          <div className="mt-3 space-y-2">
            {subjects.map((item) => (
              <button
                key={item.value}
                onClick={() => setSubject(item.value)}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  subject === item.value
                    ? "border-cyan-500 bg-cyan-200 text-slate-900"
                    : "border-slate-400 bg-slate-100 text-slate-700 hover:border-cyan-500 hover:bg-cyan-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button onClick={loadRoadmap} className="pixel-button mt-4 w-full" disabled={loading}>
            Generate Roadmap
          </button>
        </div>

        <div className="pixel-card lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-slate-600">2) Concept Roadmap</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {roadmap.length === 0 && <p className="text-sm text-slate-600">Generate a roadmap to begin.</p>}
            {roadmap.map((item, index) => {
              const isLocked = index > (battleProgress.unlocked_index ?? 0);
              const isMastered = masteredConcepts.has(item);
              return (
                <button
                  key={item}
                  onClick={() => !isLocked && selectConcept(item)}
                  disabled={isLocked}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                    isMastered
                      ? "border-emerald-500 bg-emerald-100 text-emerald-900"
                      : isLocked
                        ? "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-400"
                        : "border-cyan-400 bg-cyan-50 text-slate-800 hover:border-cyan-500 hover:bg-cyan-100"
                  }`}
                >
                  {index + 1}. {item} {isMastered ? "• Mastered" : isLocked ? "• Locked" : ""}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <PlayerStats
          xp={battleProgress.xp || 0}
          level={battleProgress.level || 1}
          masteredCount={(battleProgress.mastered_concepts || []).length}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-600">3) Flashcards</p>
          <FlashcardPanel
            flashcards={flashcards}
            index={flashcardIndex}
            flipped={flipped}
            onFlip={() => setFlipped((prev) => !prev)}
            onPrev={() => {
              setFlashcardIndex((prev) => Math.max(0, prev - 1));
              setFlipped(false);
            }}
            onNext={() => {
              setFlashcardIndex((prev) => Math.min((flashcards.length || 1) - 1, prev + 1));
              setFlipped(false);
            }}
          />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-600">4) Battle Arena</p>
          {sessionId && battleStatus === "active" && (
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Question {Math.min(currentQuestionNumber, maxQuestions)}/{maxQuestions}
            </p>
          )}
          <div className="mb-3 flex gap-2">
            <button onClick={beginBattle} disabled={!concept || loading} className="pixel-button">
              Start Battle
            </button>
          </div>
          <BattleArena
            concept={concept}
            status={battleStatus}
            playerHp={playerHp}
            enemyHp={enemyHp}
            question={question}
            options={options}
            selectedOption={selectedOption}
            onSelectOption={setSelectedOption}
            onSubmitAnswer={submitAnswer}
            canSubmit={!loading && selectedOption !== null && battleStatus === "active"}
          />
        </div>
      </div>

      {feedback && <div className="reward-panel mt-6">{feedback}</div>}
    </main>
  );
}

export default Learn;
