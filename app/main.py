import json
import os
from functools import partial
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .whoop_client import WhoopClient

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

client = WhoopClient(token=os.environ.get("WHOOP_ACCESS_TOKEN"))

def build_overview(limit: int) -> dict:
    profile = client.get_profile()
    body = client.get_body_measurements()
    cycles = client.get_cycles(limit=limit)
    recoveries = client.get_recoveries(limit=limit)
    sleeps = client.get_sleeps(limit=limit)
    workouts = client.get_workouts(limit=limit)
    return {
        "profile": profile,
        "body": body,
        "cycles": cycles,
        "recoveries": recoveries,
        "sleeps": sleeps,
        "workouts": workouts,
    }


class DashboardHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:  # type: ignore[override]
        parsed = urlparse(self.path)
        if parsed.path == "/api/overview":
            self.handle_overview(parsed)
            return

        if parsed.path == "/":
            self.path = "/static/index.html"

        super().do_GET()

    def handle_overview(self, parsed) -> None:
        query = parse_qs(parsed.query)
        limit_raw = query.get("limit", ["5"])[0]
        try:
            limit = max(1, min(25, int(limit_raw)))
        except ValueError:
            limit = 5

        try:
            payload = build_overview(limit)
            body = json.dumps(payload).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except ValueError as error:
            message = str(error)
            body = json.dumps({"detail": message}).encode("utf-8")
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception as error:  # pragma: no cover - unexpected failures
            message = str(error)
            body = json.dumps({"detail": message}).encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)


def run_server(host: str = "0.0.0.0", port: int = 8000) -> None:
    handler = partial(DashboardHandler, directory=str(BASE_DIR))
    httpd = HTTPServer((host, port), handler)
    print(f"PGAME dashboard running at http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down PGAME dashboard...")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    run_server()
