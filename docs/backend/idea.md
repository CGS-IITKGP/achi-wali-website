# 💡 System Architecture & Feature Specification (`IDEA.md`)

## 1. Executive Summary & Vision

The goal of this project is to integrate an itch.io WebGL/HTML5 game with a Next.js full-stack website backend. 

**The End Goal:**
1. A player opens the game on itch.io and logs in using their website account credentials (Email or Username + Password).
2. The game verifies the user with the backend and holds a temporary session token in memory.
3. When the game ends, the game securely signs and submits the player's score to the backend.
4. The backend verifies the anti-cheat signature, updates the user's high score, and immediately serves it to a live Leaderboard UI on the website.

---

## 2. Key Architectural Decisions

### A. Token-Based Auth for the Game (Explicit JWT)
* **The Constraint:** Games hosted on itch.io run inside cross-origin `iframe`s (`https://v6p9d9t4.ssl.hwcdn.net`). Modern web browsers aggressively block third-party HTTP-only session cookies inside `iframe`s.
* **The Solution:** The game bypasses browser cookies entirely. The game login route (`POST /api/game/login`) hands back an explicit `gameToken` string in the JSON payload. The game holds this token in local memory and sends it in the request body for score submission.

### B. Anti-Cheat Score Signing (SHA-256)
* **The Constraint:** Malicious users can inspect network traffic and send fake `POST` requests (e.g., `{ "score": 999999 }`) using Postman.
* **The Solution:** The game constructs a hash signature before making the request:
  $$\text{signature} = \text{SHA256}(\text{userId} + \text{":"} + \text{score} + \text{":"} + \text{timestamp} + \text{":"} + \text{GAME\_SECRET\_SALT})$$
* The backend recalculates this hash using its server-side `GAME_SECRET_SALT`. If the calculated hash does not match `data.signature`, the backend rejects the request with a `403 Forbidden`.

### C. High-Score Replacement Rule
* When a score is submitted, the backend queries existing scores for that `user` and `gameId`.
* If a score already exists and `newScore > existingScore`, the record is updated.
* If `newScore <= existingScore`, the backend safely ignores the update while returning a `200 OK` success response to the game so the client doesn't crash.

### D. Authentication Strategy (Username/Email + Password)
* The game will allow users to log in using either their **Email OR a Unique Username**, alongside their **Password**. 
* **The Unique Username Rule:** Every user must have a unique username. If a player tries to claim a username that is already taken during registration or profile setup, the backend will reject it and prompt them to choose another (or automatically append a random string/number to make it unique).
* **The Google OAuth Edge Case:** Users who created their accounts via Google OAuth currently have their email logged, but do not have a password or a custom username. 
* **The Solution (The Profile Bridge):** The website will feature a `/profile` page. If a Google-authenticated user attempts to log into the game and fails, the game will provide a clickable link redirecting them to this `/profile` page on the website. Here, they can establish a unique username and set a password. Once set, they can use either their Google email or their new username to log into the game.

---

## 3. Security & Scalability (The 2,000 Concurrent Player Scenario)

To ensure the backend remains secure and performant under heavy load, the following safeguards are built into the architecture:

* **Game Processing is Client-Side:** WebGL/HTML5 games execute entirely on the player's local hardware. The Next.js backend remains completely idle during gameplay, only receiving requests at Login (~100ms) and Game Over (~100ms).
* **Defeating Fake Scores:** The SHA-256 signature ensures that without the `GAME_SECRET_SALT`, forged Postman requests are instantly rejected with `403 Forbidden`.
* **Defeating Score Overwrites:** The backend service layer strictly evaluates `newScore > existingScore` before allowing database updates, preventing malicious users from intentionally lowering legitimate high scores.
* **Database Connection Pooling:** Vercel serverless functions utilize the `global.mongooseCache` check in `db.ts` to reuse active connections. This ensures the backend stays well below MongoDB Atlas connection limits (e.g., the 500 connection limit on M0 clusters).
* **DDoS & Spam Protection:** Rate limiting (returning HTTP `429 Too Many Requests`) is mapped in the error handler via `ESECs.TOO_MANY_REQUESTS`[cite: 4].
* **Leaderboard Polling Optimization:** To prevent the website frontend from self-DDoS-ing the database when thousands of users view the leaderboard simultaneously, the `GET /api/game/score` endpoint should implement caching (e.g., Next.js `export const revalidate = 10;`) to serve cached responses from the Edge network.

---

## 4. End-to-End Workflow

```text
[ITCH.IO GAME]                                 [NEXT.JS BACKEND]                              [WEBSITE FRONTEND]
      │                                               │                                               │
      ├────── 1. POST /api/game/login ───────────────►│                                               │
      │       (Email/Username + Password)             │ (Verifies credentials via hash.core.service)  │
      │◄───── 2. Returns gameToken + userId ──────────┤                                               │
      │       [OR Fails -> Shows Link to /profile]    │                                               │
      │                                               │                                               │
      │ ─── [Plays Game & Earns Score] ───            │                                               │
      │                                               │                                               │
      ├────── 3. POST /api/game/score ───────────────►│                                               │
      │       (score, timestamp, token, signature)    │ (Verifies token & SHA256 signature)           │
      │                                               │ (Updates DB if new high score)                │
      │◄───── 4. Returns 200 OK ──────────────────────┤                                               │
      │                                               │                                               │
      │                                               │◄───── 5. GET /api/game/score?target=... ──────┤
      │                                               │       (Polls or fetches top 10 scores)        │
      │                                               │────── 6. Returns Leaderboard Data ───────────►│