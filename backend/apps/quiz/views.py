from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ai_agents.service import AIOrchestratorService
from apps.gamification.services import GamificationService
from apps.learning.progress import mark_topic_progress
from apps.quiz.models import QuizAttempt


class GenerateQuizView(APIView):
    def post(self, request):
        topic = request.data.get("topic", "").strip()
        explanation = request.data.get("explanation", {})

        if not topic:
            return Response({"detail": "Topic is required."}, status=status.HTTP_400_BAD_REQUEST)

        ai_service = AIOrchestratorService()
        quiz = ai_service.generate_quiz(topic, explanation)

        return Response({"topic": topic, "questions": [q.model_dump() for q in quiz.questions]})


class SubmitQuizView(APIView):
    def post(self, request):
        topic = request.data.get("topic", "").strip()
        category = request.data.get("category", "").strip()
        questions = request.data.get("questions", [])
        user_answers = request.data.get("user_answers", [])

        if not topic or not questions:
            return Response(
                {"detail": "Both topic and questions are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        ai_service = AIOrchestratorService()
        evaluation = ai_service.evaluate_quiz(questions, user_answers)

        accuracy = round((evaluation.score / evaluation.total) * 100, 2) if evaluation.total else 0.0
        attempt = QuizAttempt.objects.create(
            user=request.user,
            topic=topic,
            questions=questions,
            user_answers=user_answers,
            score=evaluation.score,
            total=evaluation.total,
            accuracy=accuracy,
            mistakes=evaluation.mistakes,
        )

        gamification = GamificationService().update_after_quiz(request.user, attempt)
        mark_topic_progress(request.user, topic=topic, action="quiz_completed", category=category)

        return Response(
            {
                "attempt_id": attempt.id,
                "result": evaluation.model_dump(),
                "accuracy": accuracy,
                "gamification": gamification,
            }
        )
