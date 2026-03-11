def build_agents():
    try:
        import importlib

        Agent = importlib.import_module("crewai").Agent
    except Exception:
        return {
            "concept_tutor": None,
            "quiz_generator": None,
            "quiz_evaluator": None,
            "gamification": None,
        }

    concept_tutor = Agent(
        role="ConceptTutorAgent",
        goal="Explain topics clearly for students.",
        backstory="An educator who breaks complex topics into easy explanations.",
        verbose=False,
        allow_delegation=False,
    )

    quiz_generator = Agent(
        role="QuizGeneratorAgent",
        goal="Generate high-quality multiple-choice questions.",
        backstory="An assessment expert focused on balanced and accurate quizzes.",
        verbose=False,
        allow_delegation=False,
    )

    quiz_evaluator = Agent(
        role="QuizEvaluatorAgent",
        goal="Check answers and calculate score with explanations.",
        backstory="A meticulous evaluator who identifies misconceptions.",
        verbose=False,
        allow_delegation=False,
    )

    gamification = Agent(
        role="GamificationAgent",
        goal="Update XP, levels and badges.",
        backstory="A progression designer that rewards learning consistency.",
        verbose=False,
        allow_delegation=False,
    )

    return {
        "concept_tutor": concept_tutor,
        "quiz_generator": quiz_generator,
        "quiz_evaluator": quiz_evaluator,
        "gamification": gamification,
    }
