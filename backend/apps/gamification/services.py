from apps.quiz.models import QuizAttempt
from apps.users.models import UserProfile


class GamificationService:
    LEVEL_THRESHOLDS = [
        (4, 200),
        (3, 100),
        (2, 50),
        (1, 0),
    ]

    XP_PER_CORRECT = 10

    def _level_for_points(self, points: int) -> int:
        for level, threshold in self.LEVEL_THRESHOLDS:
            if points >= threshold:
                return level
        return 1

    def update_after_quiz(self, user, attempt: QuizAttempt):
        profile, _ = UserProfile.objects.get_or_create(user=user)

        xp_gained = attempt.score * self.XP_PER_CORRECT
        old_level = profile.level

        profile.points += xp_gained
        profile.level = self._level_for_points(profile.points)

        total_attempts = QuizAttempt.objects.filter(user=user).count()
        profile.quizzes_completed = total_attempts

        attempts = QuizAttempt.objects.filter(user=user)
        total_correct = sum(item.score for item in attempts)
        total_questions = sum(item.total for item in attempts)
        profile.accuracy = round((total_correct / total_questions) * 100, 2) if total_questions else 0.0

        if total_attempts == 1 and "First Quiz" not in profile.badges:
            profile.badges.append("First Quiz")

        if attempt.score == attempt.total and attempt.total > 0 and "Perfect Score" not in profile.badges:
            profile.badges.append("Perfect Score")

        if total_attempts >= 5 and "5 Quiz Streak" not in profile.badges:
            profile.badges.append("5 Quiz Streak")
            profile.learning_streak = max(profile.learning_streak, 5)
        else:
            profile.learning_streak = min(total_attempts, 5)

        profile.save()

        return {
            "xp_gained": xp_gained,
            "points": profile.points,
            "previous_level": old_level,
            "new_level": profile.level,
            "level_up": profile.level > old_level,
            "badges": profile.badges,
        }
