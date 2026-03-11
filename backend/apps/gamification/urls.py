from django.urls import path

from apps.gamification.views import DashboardView, ProgressView

urlpatterns = [
    path("dashboard", DashboardView.as_view(), name="dashboard"),
    path("progress", ProgressView.as_view(), name="progress"),
]
