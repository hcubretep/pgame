from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import requests

from .whoop_client import WhoopClient

BASE_DIR = Path(__file__).resolve().parent.parent
static_dir = BASE_DIR / "static"

app = FastAPI(title="PGAME - WHOOP Dashboard", version="0.1.0")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

client = WhoopClient(token=None)


@app.on_event("startup")
def load_token() -> None:
    from os import environ

    client.token = environ.get("WHOOP_ACCESS_TOKEN")


@app.get("/api/overview")
def overview(limit: int = 5) -> Dict[str, Any]:
    try:
        profile = client.get_profile()
        body = client.get_body_measurements()
        cycles = client.get_cycles(limit=limit)
        recoveries = client.get_recoveries(limit=limit)
        sleeps = client.get_sleeps(limit=limit)
        workouts = client.get_workouts(limit=limit)
    except ValueError as missing_token:
        raise HTTPException(status_code=500, detail=str(missing_token))
    except requests.HTTPError as http_error:
        status = http_error.response.status_code if http_error.response else 500
        raise HTTPException(status_code=status, detail=str(http_error))

    return {
        "profile": profile,
        "body": body,
        "cycles": cycles,
        "recoveries": recoveries,
        "sleeps": sleeps,
        "workouts": workouts,
    }


@app.get("/")
def root() -> FileResponse:
    index_path = static_dir / "index.html"
    return FileResponse(index_path)
