from django.urls import path

from apps.users.views import LoginView, MeView, SignupView, TrackActivityView

urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("login", LoginView.as_view(), name="login"),
    path("me", MeView.as_view(), name="me"),
    path("track-activity", TrackActivityView.as_view(), name="track-activity"),
]
