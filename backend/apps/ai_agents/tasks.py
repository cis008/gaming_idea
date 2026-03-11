def concept_task(topic: str, agent):
    try:
        import importlib

        Task = importlib.import_module("crewai").Task
    except Exception:
        return None

    return Task(
        description=(
            f"Explain the topic '{topic}' for students. Include concept_summary, simple_explanation, "
            "example, and key_points."
        ),
        expected_output="Structured explanation suitable for beginner learners.",
        agent=agent,
    )


def quiz_task(topic: str, context: str, agent):
    try:
        import importlib

        Task = importlib.import_module("crewai").Task
    except Exception:
        return None

    return Task(
        description=(
            f"Create 3-5 MCQ questions on '{topic}' using this context: {context}. "
            "Each question should have exactly 4 options and one correct answer."
        ),
        expected_output="A structured MCQ quiz with explanations.",
        agent=agent,
    )
