# PGAME

PGAME is a minimal Python-powered dashboard that surfaces a user's WHOOP data in the browser. It pulls the most recent profile, body metrics, cycles, recoveries, sleeps, and workouts via the WHOOP developer API and renders them on a single page.

## Setup
1. Create a WHOOP developer access token with scopes for `read:profile`, `read:body_measurement`, `read:cycles`, `read:recovery`, `read:sleep`, and `read:workout`.
2. Export the token before running the server:
   ```bash
   export WHOOP_ACCESS_TOKEN="your_token_here"
   ```
3. Install Node packages (for the npm runner):
   ```bash
   npm install
   ```
4. Launch the app:
   ```bash
   npm run dev
   ```
   This starts a lightweight HTTP server on port 8000 without needing any external Python dependencies.
5. Open the dashboard preview at http://localhost:8000.

If you're in a cloud dev environment (e.g., Codespaces), forward port **8000** and copy the forwarded URL to share a preview link.

## Notes
- The `/api/overview` endpoint fetches the latest WHOOP entities (limited to 5 items each by default) and feeds them to the static UI in `static/index.html`.
- Errors returned by WHOOP are surfaced back to the frontend so you can see authentication or rate-limit issues immediately.
