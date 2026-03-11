from django.conf import settings
from django.db import models


class QuizAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="quiz_attempts")
    topic = models.CharField(max_length=255)
    questions = models.JSONField(default=list)
    user_answers = models.JSONField(default=list)
    score = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    mistakes = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.topic} ({self.score}/{self.total})"
