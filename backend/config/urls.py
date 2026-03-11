from django.contrib import admin
from django.urls import include, path
from django.views.static import serve
from django.conf import settings
from config.views import SPAFallbackView
import os

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.users.urls")),
    path("api/", include("apps.learning.urls")),
    path("api/", include("apps.quiz.urls")),
    path("api/", include("apps.gamification.urls")),
]

# Serve frontend assets
frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend_dist")
urlpatterns += [
    path("assets/<path:path>", serve, {"document_root": os.path.join(frontend_dir, "assets")}),
]

# SPA fallback - serve index.html for all non-API routes
urlpatterns += [
    path("", SPAFallbackView.as_view(), name="spa-home"),
    path("<path:path>", SPAFallbackView.as_view(), name="spa-fallback"),
]
