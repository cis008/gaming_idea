from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.learning.urls")),
    path("api/", include("apps.quiz.urls")),
    path("api/", include("apps.gamification.urls")),
]
