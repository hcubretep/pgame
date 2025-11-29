import os
from typing import Any, Dict, Optional

import requests


class WhoopClient:
    """Minimal client for the WHOOP developer API."""

    def __init__(self, token: Optional[str], base_url: str = "https://api.prod.whoop.com/developer") -> None:
        self.token = token
        self.base_url = base_url.rstrip("/")

    def _headers(self) -> Dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"}

    def _get(self, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.token:
            raise ValueError("Missing WHOOP access token. Set WHOOP_ACCESS_TOKEN in your environment.")

        url = f"{self.base_url}{path}"
        response = requests.get(url, headers=self._headers(), params=params, timeout=20)
        response.raise_for_status()
        return response.json()

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
