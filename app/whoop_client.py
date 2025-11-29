import json
from typing import Any, Dict, Optional
from urllib import error, parse, request


class WhoopClient:
    """Minimal client for the WHOOP developer API using urllib."""

    def __init__(self, token: Optional[str], base_url: str = "https://api.prod.whoop.com/developer") -> None:
        self.token = token
        self.base_url = base_url.rstrip("/")

    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}

    def _get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.token:
            raise ValueError("Missing WHOOP access token. Set WHOOP_ACCESS_TOKEN in your environment.")

        url = f"{self.base_url}{path}"
        if params:
            query = parse.urlencode(params)
            url = f"{url}?{query}"

        req = request.Request(url, headers=self._headers())
        try:
            with request.urlopen(req, timeout=20) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body)
        except error.HTTPError as http_error:
            status = http_error.code
            raise ValueError(f"WHOOP API request failed with status {status}: {http_error.reason}") from http_error

    def get_profile(self) -> Dict[str, Any]:
        return self._get("/v2/user/profile/basic")

    def get_body_measurements(self) -> Dict[str, Any]:
        return self._get("/v2/user/measurement/body")

    def get_cycles(self, limit: int = 5) -> Dict[str, Any]:
        return self._get("/v2/cycle", params={"limit": limit})

    def get_recoveries(self, limit: int = 5) -> Dict[str, Any]:
        return self._get("/v2/recovery", params={"limit": limit})

    def get_sleeps(self, limit: int = 5) -> Dict[str, Any]:
        return self._get("/v2/activity/sleep", params={"limit": limit})

    def get_workouts(self, limit: int = 5) -> Dict[str, Any]:
        return self._get("/v2/activity/workout", params={"limit": limit})
