from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("learning", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="BattleProgress",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "subject",
                    models.CharField(
                        choices=[
                            ("dsa", "Data Structures and Algorithms"),
                            ("databases", "Databases"),
                            ("mathematics", "Mathematics for Computer Science"),
                        ],
                        max_length=32,
                    ),
                ),
                ("roadmap", models.JSONField(blank=True, default=list)),
                ("unlocked_index", models.PositiveIntegerField(default=0)),
                ("mastered_concepts", models.JSONField(blank=True, default=list)),
                ("xp", models.PositiveIntegerField(default=0)),
                ("level", models.PositiveIntegerField(default=1)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="battle_progress",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["subject"], "unique_together": {("user", "subject")}},
        ),
        migrations.CreateModel(
            name="BattleSession",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("subject", models.CharField(max_length=32)),
                ("concept", models.CharField(max_length=255)),
                ("player_hp", models.PositiveIntegerField(default=100)),
                ("enemy_hp", models.PositiveIntegerField(default=100)),
                (
                    "status",
                    models.CharField(
                        choices=[("active", "Active"), ("won", "Won"), ("lost", "Lost")],
                        default="active",
                        max_length=16,
                    ),
                ),
                ("current_question", models.JSONField(blank=True, default=dict)),
                ("turns", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="battle_sessions",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={"ordering": ["-updated_at"]},
        ),
    ]
