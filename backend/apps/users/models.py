from django.conf import settings
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    points = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    quizzes_completed = models.PositiveIntegerField(default=0)
    accuracy = models.FloatField(default=0.0)
    learning_streak = models.PositiveIntegerField(default=0)
    login_streak_days = models.PositiveIntegerField(default=0)
    last_login_date = models.DateField(null=True, blank=True)
    days_spent = models.PositiveIntegerField(default=0)
    total_minutes_spent = models.PositiveIntegerField(default=0)
    badges = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"
