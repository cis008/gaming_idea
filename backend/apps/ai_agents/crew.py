from apps.ai_agents.agents import build_agents
from apps.ai_agents.tasks import concept_task, quiz_task


def run_learning_crew(topic: str):
    try:
        agents = build_agents()
    except Exception:
        return {"raw": "CrewAI agents unavailable"}

    try:
        import importlib

        crewai_module = importlib.import_module("crewai")
        Crew = crewai_module.Crew
        Process = crewai_module.Process
    except Exception:
        return {"raw": "CrewAI not available"}

    if not agents.get("concept_tutor") or not agents.get("quiz_generator"):
        return {"raw": "CrewAI agents unavailable"}

    try:
        c_task = concept_task(topic, agents["concept_tutor"])
        q_task = quiz_task(topic, "", agents["quiz_generator"])
    except Exception:
        return {"raw": "CrewAI tasks unavailable"}

    if not c_task or not q_task:
        return {"raw": "CrewAI tasks unavailable"}

    try:
        crew = Crew(
            agents=[agents["concept_tutor"], agents["quiz_generator"]],
            tasks=[c_task, q_task],
            process=Process.sequential,
            verbose=False,
        )
        result = crew.kickoff()
        return {"raw": str(result)}
    except Exception:
        return {"raw": "CrewAI execution failed"}


def run_quiz_generation_crew(topic: str, context: str = ""):
    try:
        agents = build_agents()
    except Exception:
        return {"raw": "CrewAI agents unavailable"}

    try:
        import importlib

        crewai_module = importlib.import_module("crewai")
        Crew = crewai_module.Crew
        Process = crewai_module.Process
    except Exception:
        return {"raw": "CrewAI not available"}

    if not agents.get("quiz_generator"):
        return {"raw": "CrewAI quiz task unavailable"}

    try:
        q_task = quiz_task(topic, context, agents["quiz_generator"])
    except Exception:
        return {"raw": "CrewAI quiz task unavailable"}

    if not q_task:
        return {"raw": "CrewAI quiz task unavailable"}

    try:
        crew = Crew(
            agents=[agents["quiz_generator"]],
            tasks=[q_task],
            process=Process.sequential,
            verbose=False,
        )
        result = crew.kickoff()
        return {"raw": str(result)}
    except Exception:
        return {"raw": "CrewAI execution failed"}
