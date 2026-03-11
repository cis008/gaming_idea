from django.contrib import admin
from django.urls import include, path
from config.views import SPAFallbackView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.learning.urls")),
    path("api/", include("apps.quiz.urls")),
    path("api/", include("apps.gamification.urls")),
]

# Serve frontend (must be last as catch-all)
urlpatterns += [
    path("", SPAFallbackView.as_view(), name="spa-home"),
    path("<path:path>", SPAFallbackView.as_view(), name="spa-catchall"),
]
