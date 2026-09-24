import os
import sys
import urllib.parse

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from backend.api.main import app as fastapi_app


class VercelPathCorrectionMiddleware:
    """
    ASGI middleware that corrects the request path on Vercel Serverless.

    When Vercel rewrites /api/(.*) -> /api/index.py, ASGI scope['path']
    often arrives as '/api/index.py'. This middleware reads Vercel's
    'x-matched-path' or 'x-now-route-matches' / 'x-forwarded-uri' headers
    to restore the original intended path (e.g., '/api/forecast').
    """

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get("type") == "http":
            path = scope.get("path", "")
            headers = dict(scope.get("headers", []))

            # 1. Check for x-matched-path (standard Vercel header)
            matched_path = headers.get(b"x-matched-path", b"").decode("utf-8", errors="ignore")

            # 2. Check for x-forwarded-uri or x-original-uri
            if not matched_path:
                matched_path = headers.get(b"x-forwarded-uri", b"").decode("utf-8", errors="ignore")
            if not matched_path:
                matched_path = headers.get(b"x-original-uri", b"").decode("utf-8", errors="ignore")

            # 3. Check for x-now-route-matches (e.g. 1=forecast or 1=market%2Flatest)
            if not matched_path:
                route_matches = headers.get(b"x-now-route-matches", b"").decode("utf-8", errors="ignore")
                if route_matches:
                    parsed = urllib.parse.parse_qs(route_matches)
                    if "1" in parsed and parsed["1"]:
                        match_val = urllib.parse.unquote(parsed["1"][0])
                        matched_path = f"/api/{match_val}" if not match_val.startswith("/") else match_val

            # If the current ASGI path is /api/index.py (or prefix) and we resolved the real route
            if path in ("/api/index.py", "/api/index.py/", "/api/index", "api/index.py", "/api", "/api/"):
                if matched_path:
                    clean_path = matched_path.split("?")[0]
                    if clean_path not in ("/api/index.py", "/api/index.py/", "/api", "/api/"):
                        scope["path"] = clean_path
            elif path.startswith("/api/index.py/"):
                scope["path"] = path[len("/api/index.py"):]

        await self.app(scope, receive, send)


app = VercelPathCorrectionMiddleware(fastapi_app)
