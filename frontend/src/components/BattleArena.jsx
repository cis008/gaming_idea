import AnswerButtons from "./AnswerButtons";
import EnemyConceptCard from "./EnemyConceptCard";
import HealthBars from "./HealthBars";

function BattleArena({ concept, status, playerHp, enemyHp, question, options, selectedOption, onSelectOption, onSubmitAnswer, canSubmit }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4">
        <EnemyConceptCard concept={concept} status={status} />
        <div className="pixel-card">
          <HealthBars playerHp={playerHp} enemyHp={enemyHp} />
        </div>
      </div>

      <div className="pixel-card">
        <p className="text-xs uppercase tracking-wide text-slate-400">Battle Question</p>
        <p className="mt-2 text-lg font-semibold text-slate-100">{question || "Start battle to receive a question."}</p>
        {options.length > 0 && (
          <div className="mt-4">
            <AnswerButtons
              options={options}
              selectedOption={selectedOption}
              onSelect={onSelectOption}
              onSubmit={onSubmitAnswer}
              disabled={!canSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BattleArena;
