# PGAME

PGAME is a minimal FastAPI-powered dashboard that surfaces a user's WHOOP data in the browser. It pulls the most recent profile, body metrics, cycles, recoveries, sleeps, and workouts via the WHOOP developer API and renders them on a single page.

## Setup
1. Create a WHOOP developer access token with scopes for `read:profile`, `read:body_measurement`, `read:cycles`, `read:recovery`, `read:sleep`, and `read:workout`.
2. Export the token before running the server:
   ```bash
   export WHOOP_ACCESS_TOKEN="your_token_here"
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   If you prefer to use the included npm scripts for running the server, install Node packages as well:
   ```bash
   npm install
   ```
4. Launch the FastAPI app:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Or start it via the npm dev script (requires `uvicorn` in your Python environment):
   ```bash
   npm run dev
   ```
5. Open the dashboard preview at http://localhost:8000.

If you're in a cloud dev environment (e.g., Codespaces), forward port **8000** and copy the forwarded URL to share a preview lin
k.

## Notes
- The `/api/overview` endpoint fetches the latest WHOOP entities (limited to 5 items each by default) and feeds them to the static UI in `static/index.html`.
- Errors returned by WHOOP are surfaced back to the frontend so you can see authentication or rate-limit issues immediately.
