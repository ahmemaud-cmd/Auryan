Deploying Orian (quick guide)

Recommended host: Render (easy WebSockets support and free plan for small projects).

Steps (Render):
1. Create GitHub repo and push the project (main branch).
   - git init
   - git add .
   - git commit -m "initial"
   - git remote add origin <your-github-repo-url>
   - git push -u origin main

2. Create a new Web Service on Render and connect your GitHub repository.
   - Branch: main
   - Build command: npm install
   - Start command: npm start
   - (Optional) Set node version via Render settings to match package.json engines.

3. After deploy completes Render will provide an HTTPS URL. Verify health:
   - GET https://your-service.onrender.com/health -> should return 'ok'

Environment variables (set these in Render / Fly / platform):
- GOOGLE_CLIENT_ID — OAuth client id from Google Cloud Console
- GOOGLE_CLIENT_SECRET — OAuth client secret
- GOOGLE_CALLBACK_URL — optional fully qualified callback URL (defaults to /auth/google/callback)
- FACEBOOK_CLIENT_ID — Facebook App ID (if using Facebook OAuth)
- FACEBOOK_CLIENT_SECRET — Facebook App Secret
- FACEBOOK_CALLBACK_URL — optional callback url for Facebook
- SESSION_SECRET — session secret (set a strong random value)

Database (production):
- We recommend provisioning a managed Postgres database (Render, ElephantSQL, or similar) for production persistence. For quick testing we use SQLite (`data/db.sqlite`) which is created automatically.
- If using Postgres, set `DATABASE_URL` and I will adapt the code to use Postgres instead of SQLite.

Note: After setting env vars, redeploy so they take effect. If you test locally, create a `.env` file with those values for local testing (do not commit `.env` to the repo).
4. Test multiplayer: open the URL in two devices/tabs, join two players and verify movement and chair interactions.

Notes & Prod tips:
- If you want a custom domain, add it in Render and configure DNS (A/CNAME) per Render instructions.
- To change who is admin by character number, edit `admin-config.json` and redeploy.
- For Fly.io or Docker-based deploys, a Dockerfile can be added — ask me if you prefer that flow.

If you want, I can prepare a GitHub-ready commit and give you the exact push commands or a small PR you can apply.
