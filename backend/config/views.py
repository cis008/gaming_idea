import os
from django.http import FileResponse, HttpResponse
from django.views import View
from django.views.static import serve


class SPAFallbackView(View):
    """Serve React SPA and assets"""

    def get(self, request, *args, **kwargs):
        frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend_dist")
        path = request.path.lstrip("/")

        # Try to serve the requested file directly
        file_path = os.path.join(frontend_dir, path)

        if os.path.isfile(file_path):
            # Determine content type
            if file_path.endswith(".js"):
                content_type = "application/javascript"
            elif file_path.endswith(".css"):
                content_type = "text/css"
            elif file_path.endswith(".json"):
                content_type = "application/json"
            elif file_path.endswith(".png"):
                content_type = "image/png"
            elif file_path.endswith(".jpg") or file_path.endswith(".jpeg"):
                content_type = "image/jpeg"
            elif file_path.endswith(".svg"):
                content_type = "image/svg+xml"
            elif file_path.endswith(".mp3"):
                content_type = "audio/mpeg"
            elif file_path.endswith(".html"):
                content_type = "text/html"
            else:
                content_type = "application/octet-stream"

            with open(file_path, "rb") as f:
                return HttpResponse(f.read(), content_type=content_type)

        # Serve index.html for SPA fallback
        index_path = os.path.join(frontend_dir, "index.html")
        if os.path.exists(index_path):
            with open(index_path, "rb") as f:
                return HttpResponse(f.read(), content_type="text/html")

        return HttpResponse(b"Frontend not found", status=404)

