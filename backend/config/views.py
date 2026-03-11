import os
from django.http import FileResponse
from django.views import View


class SPAFallbackView(View):
    """Serve React SPA index.html for all non-API routes"""

    def get(self, request, *args, **kwargs):
        frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend_dist")
        index_path = os.path.join(frontend_dir, "index.html")

        if os.path.exists(index_path):
            return FileResponse(open(index_path, "rb"), content_type="text/html")

        return FileResponse(b"Frontend not found", status=404)
