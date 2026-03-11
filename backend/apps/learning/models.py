from django.conf import settings
from django.db import models


class TopicProgress(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="topic_progress")
    category = models.CharField(max_length=255)
    topic_title = models.CharField(max_length=255)
    explained = models.BooleanField(default=False)
    chatted = models.BooleanField(default=False)
    quiz_completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "category", "topic_title")
        ordering = ["category", "topic_title"]

    def __str__(self):
        return f"{self.user.username} - {self.category} - {self.topic_title}"


class BattleProgress(models.Model):
    SUBJECT_CHOICES = [
        ("dsa", "Data Structures and Algorithms"),
        ("databases", "Databases"),
        ("mathematics", "Mathematics for Computer Science"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="battle_progress")
    subject = models.CharField(max_length=32, choices=SUBJECT_CHOICES)
    roadmap = models.JSONField(default=list, blank=True)
    unlocked_index = models.PositiveIntegerField(default=0)
    mastered_concepts = models.JSONField(default=list, blank=True)
    xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "subject")
        ordering = ["subject"]

    def __str__(self):
        return f"{self.user.username} - {self.subject}"


class BattleSession(models.Model):
    STATUS_CHOICES = [
        ("active", "Active"),
        ("won", "Won"),
        ("lost", "Lost"),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="battle_sessions")
    subject = models.CharField(max_length=32)
    concept = models.CharField(max_length=255)
    player_hp = models.PositiveIntegerField(default=100)
    enemy_hp = models.PositiveIntegerField(default=100)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default="active")
    current_question = models.JSONField(default=dict, blank=True)
    asked_questions = models.JSONField(default=list, blank=True)
    turns = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} vs {self.concept} ({self.status})"
