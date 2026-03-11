from django.contrib.auth.models import User
from rest_framework import serializers

from apps.users.models import UserProfile


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["username", "email", "password"]

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )
        UserProfile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "points",
            "level",
            "quizzes_completed",
            "accuracy",
            "learning_streak",
            "login_streak_days",
            "last_login_date",
            "days_spent",
            "total_minutes_spent",
            "badges",
        ]
