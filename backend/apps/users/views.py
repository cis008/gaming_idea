from datetime import timedelta

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import UserProfile
from apps.users.serializers import LoginSerializer, ProfileSerializer, SignupSerializer


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.last_login_date = timezone.localdate()
        profile.login_streak_days = 1
        profile.days_spent = max(profile.days_spent, 1)
        profile.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )
        if not user:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)

        profile, _ = UserProfile.objects.get_or_create(user=user)
        today = timezone.localdate()
        yesterday = today - timedelta(days=1)

        if profile.last_login_date == today:
            pass
        elif profile.last_login_date == yesterday:
            profile.login_streak_days += 1
            profile.days_spent += 1
        else:
            profile.login_streak_days = 1
            profile.days_spent += 1

        if profile.days_spent == 0:
            profile.days_spent = 1

        profile.last_login_date = today
        profile.save()

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "username": user.username})


class MeView(APIView):
    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        return Response({"username": request.user.username, **ProfileSerializer(profile).data})


class TrackActivityView(APIView):
    def post(self, request):
        minutes = request.data.get("minutes", 0)
        try:
            minutes = int(minutes)
        except (TypeError, ValueError):
            minutes = 0

        minutes = max(0, min(minutes, 10))

        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.total_minutes_spent += minutes
        profile.save()

        return Response({"total_minutes_spent": profile.total_minutes_spent})
