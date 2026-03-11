from rest_framework.response import Response
from rest_framework.views import APIView

from apps.learning.progress import get_topic_progress_payload
from apps.quiz.models import QuizAttempt
from apps.users.models import UserProfile
from apps.users.serializers import ProfileSerializer


class DashboardView(APIView):
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        recent_attempts = QuizAttempt.objects.filter(user=request.user)[:5]

        return Response(
            {
                "stats": ProfileSerializer(profile).data,
                "lecture_progress": get_topic_progress_payload(request.user).get("sections", []),
                "login_streak_days": profile.login_streak_days,
                "recent_quizzes": [
                    {
                        "id": item.id,
                        "topic": item.topic,
                        "score": item.score,
                        "total": item.total,
                        "accuracy": item.accuracy,
                        "created_at": item.created_at,
                    }
                    for item in recent_attempts
                ],
            }
        )


class ProgressView(APIView):
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        next_level_target = 50
        if profile.level == 2:
            next_level_target = 100
        elif profile.level >= 3:
            next_level_target = 200

        progress_percent = min(100, round((profile.points / next_level_target) * 100, 2)) if next_level_target else 100

        return Response(
            {
                "points": profile.points,
                "level": profile.level,
                "next_level_target": next_level_target,
                "progress_percent": progress_percent,
                "badges": profile.badges,
                "streak": profile.learning_streak,
            }
        )
