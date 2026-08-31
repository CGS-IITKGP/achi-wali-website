# 💡 System Architecture & Feature Specification (`idea.md`) — v2

> **This replaces the v1 password-based design.** The core problem with v1: it invented a *second, separate password* just for the game, which is weaker than the website's real identity system (Google OAuth) and adds an attack surface (a phishable password) for no real benefit. v2 removes the game password entirely and anchors identity in Google Auth, using a short-lived, single-use code to bridge across the iframe boundary — the same pattern OAuth itself uses ("authorization code grant"), adapted for itch.io's cross-origin iframe restriction.

---

## 1. Executive Summary & Vision

A player interacts with an itch.io-hosted WebGL/HTML5 game and a live leaderboard on our website. The game and the website are two separate origins; the game runs inside a cross-origin `<iframe>`, which blocks the normal website session cookie from ever reaching it.

**v2 End Goal:**
1. A player who isn't yet linked to a game identity is walked, once, through a Google-authenticated sign-in and a one-time username pick — never a password.
2. A player who's already linked gets into the game with zero extra steps, whether they arrive via the game link directly or via a "Play" button on the website.
3. The game receives a short-lived session (`gameToken`), never sees or handles a password, and submits scores exactly as before (SHA-256 anti-cheat signature — this part is untouched and already verified working).
4. The leaderboard, score-submission, and high-score-replacement logic are **completely unchanged** from the current, already-shipped, already-tested backend. This rewrite only touches *how a player gets a `gameToken`* — not what happens after they have one.

---

## 2. What's being replaced vs. what's staying

| | v1 (old) | v2 (new) |
|---|---|---|
| Identity source | A separate password, set once on `/profile` | Google OAuth only (the same login the website already uses) |
| First-time setup | Username **+ password** | Username **only** |
| Game login | `POST /api/game/login` with `identifier` + `password` | Game redirects out of the iframe to the website; website hands back a one-time code; game exchanges the code for a `gameToken` |
| Score submission | SHA-256 signature, unchanged | **Unchanged** |
| Leaderboard fetch | GET with caching, `my_scores` mode | **Unchanged** |
| Rate limiting | DB-backed, per player | **Unchanged** |

If you're the coding agent implementing this: **do not touch** `score.service.ts`, the leaderboard `GET` logic, the signature formula, or the rate-limiting fields — none of that is affected by this change. See `MIGRATION_PLAN.md` for the exact file-by-file list.

---

## 3. The Two Problems This Design Answers

### Problem A — "Fake User"
Anyone could type any username/password combo at the old login form, or a phishing clone of the game could harvest a typed password. **Fixed by v2:** there is no password to phish anymore. The only way to obtain a `gameToken` is to complete a real Google login on our real domain and receive a one-time code from our server — an attacker has nothing to steal that's reusable, since the code is single-use and expires in ~60 seconds.

### Problem B — "Fake Game"
A cloned or forged game client could call our API directly (e.g. via Postman) pretending to be the legitimate game.

**Honest assessment:** this problem cannot be fully solved for a browser-hosted, unprivileged WebGL/JS client, no matter how the architecture is designed. Anything shipped inside the game bundle — including a shared secret — can be extracted by anyone who opens devtools or downloads the build from itch.io. A standard HTTPS/TLS handshake (as sketched) authenticates the *connection to our server*, not *which piece of client code initiated it*; it does not distinguish a real game client from a forged one making the same HTTPS request. True client attestation would require the game's logic to run server-side (the client just renders), which is a much larger redesign and out of scope here.

**What v2 does instead — raising the bar, not claiming it's solved:**
1. A forged game client cannot get a valid `gameToken` at all without first sending a real user through a real Google login on our real domain — this alone eliminates the old flow's easiest attack (a fake login form phishing a password directly).
2. The one-time `gameAuthCode` is single-use and short-TTL, so even if intercepted, it's worthless within ~60 seconds and after first use.
3. Score submission keeps its existing SHA-256 anti-cheat signature (unchanged), which still blocks naive score-forging without the shared secret embedded in the legitimate build.
4. **Recommended follow-up hardening (not blocking, worth a future pass):** validate the `Origin`/`Referer` header on `/api/game/*` requests server-side, rejecting anything not from the expected itch.io iframe origin or our own domain. This is spoofable by a sufficiently motivated attacker forging headers outside a real browser, but blocks casual abuse for free and costs little to add.

---

## 4. The New Flow

### Flow 1 — Player opens the game directly on itch.io (never been to our website game-wise)

```
[itch.io Game]                          [Our Website]                        [Player's Browser]
      │                                        │                                     │
      │  1. Game checks memory for a           │                                     │
      │     gameToken — none found              │                                     │
      │                                        │                                     │
      │  2. Game shows "Login to Play".         │                                     │
      │     On click, TOP-LEVEL redirect        │                                     │
      │     (breaks out of the iframe —         │                                     │
      │     this is a full navigation, so it    │                                     │
      │     is NOT blocked like cookies are) ──────────────────────────────────────►  │
      │     to:                                │                                     │
      │     /game-auth?gameId=<id>              │                                     │
      │       &returnTo=<itch.io game URL>      │                                     │
      │                                        │                                     │
      │                                        │◄──────── 3. Not logged in? Show     │
      │                                        │    "Continue with Google."          │
      │                                        │    gameId/returnTo carried through   │
      │                                        │    the OAuth redirect via a state    │
      │                                        │    parameter.                        │
      │                                        │                                     │
      │                                        │  4. Now logged in. Check: does      │
      │                                        │     this website User already        │
      │                                        │     have a linked GameUser?          │
      │                                        │                                     │
      │                                        │     NOT linked (first time):         │
      │                                        │     prompt for a unique in-game      │
      │                                        │     username. No password. Create    │
      │                                        │     the GameUser record.             │
      │                                        │                                     │
      │                                        │     Already linked: skip straight    │
      │                                        │     through.                         │
      │                                        │                                     │
      │                                        │  5. Generate a short-lived,          │
      │                                        │     single-use gameAuthCode          │
      │                                        │     (~60s TTL), tied to this         │
      │                                        │     GameUser's id.                   │
      │                                        │                                     │
      │                                        │  6. Redirect back to returnTo,       │
      │                                        │     appending the code:              │
      │                                        │     <itch.io game URL>               │
      │                                        │       ?gameAuthCode=<code>    ─────────────────►│
      │                                        │                                     │
      │◄────────────────────────────────────────────────────────────────────────────  │
      │  7. Game reloads with gameAuthCode      │                                     │
      │     in the URL. Calls:                 │                                     │
      │     POST /api/game/session/exchange     │                                     │
      │     { gameAuthCode }              ─────►│                                     │
      │                                        │  8. Validates code (exists, not     │
      │                                        │     expired, not already used —      │
      │                                        │     marks it used immediately).      │
      │◄──── Returns { userId, username,        │                                     │
      │       gameToken } ─────────────────────│                                     │
      │                                        │                                     │
      │  9. Store gameToken in memory. Play.    │                                     │
```

### Flow 2 — Player is already on our website, clicks "Play"

Same underlying mechanism, shorter path since they're already authenticated:

1. Website already knows they're logged in and whether they have a linked `GameUser`.
2. If not linked yet: same one-time username prompt, but inline on the website (a small modal/step) — no redirect needed, they're already here.
3. Once linked, clicking "Play" generates the same kind of `gameAuthCode` server-side and opens the itch.io game URL with `?gameAuthCode=<code>` appended.
4. Game exchanges the code exactly as in Flow 1, step 7.

Both entry points converge on the same code-exchange mechanism — one implementation, two doors in.

### Flow 3 — Score submission (unchanged)

Exactly as already built and verified: game computes `SHA256(userId:score:timestamp:GAME_SECRET)`, submits to `POST /api/game/score` with the `gameToken`, backend verifies the token and signature, applies the high-score-replace rule, rate-limits repeated attempts. **Nothing here changes.**

### Flow 4 — Leaderboard fetch (unchanged)

Exactly as already built and verified: `GET /api/game/score?target=leaderboard&gameId=<id>` (public, cached ~10s) or `target=my_scores&gameToken=<token>` (scoped to the requesting player). **Nothing here changes.**

---

## 5. New / Changed API Surface

| Endpoint | Status | Notes |
|---|---|---|
| `GET /game-auth` | **New** — website page, not an API route | Handles the redirect landing, Google Auth (if needed), username setup (if first time), and issues the `gameAuthCode` redirect back to the game. |
| `POST /api/game/link` | **New** — replaces old `POST /api/game/profile` | Authenticated (website session). Body: `{ username }` only — no password. Creates or reads the `GameUser` link for the current website user. Keeps the same unique-username `409 Conflict` handling as before. |
| `GET /api/game/link/status` | **New** — replaces old `GET /api/game/profile` | Authenticated. Returns `{ linked: boolean, username?: string }`. |
| `POST /api/game/session/exchange` | **New** | Public endpoint (no session cookie, no signature) — protected instead by the code's own short TTL and single-use property. Body: `{ gameAuthCode }`. Returns `{ userId, username, gameToken }` — same shape the old login response used, so nothing downstream needs to change. |
| `POST /api/game/login` | **Removed** | Password-based login no longer exists. |
| `POST /api/game/profile` | **Removed** | Replaced by `/api/game/link` above. |
| `POST /api/game/score` | **Unchanged** | |
| `GET /api/game/score` | **Unchanged** | |

---

## 6. Data Model Changes

### `GameUser` — modified
- **Remove:** `passwordHash` (no longer needed — there is no password).
- **Keep:** `username` (unique, lowercase, trim), `email`, `websiteUserId` (ref: `User`, required, unique), `lastAttemptAt` (used by rate limiting, unrelated to this change — keep as-is).

### `GameAuthCode` — new
A short-lived, single-use code bridging the redirect.

| Field | Type | Notes |
|---|---|---|
| `code` | `String` | Random, unique, indexed. Generate with sufficient entropy (e.g. 32 bytes, base64url) — this is the only thing standing between "logged in" and "not," so it must not be guessable. |
| `gameUserId` | `ObjectId` (ref: `GameUser`) | Who this code belongs to. |
| `gameId` | `String` | Which game this code is for (in case a player has multiple games in future). |
| `used` | `Boolean`, default `false` | Set `true` the instant it's exchanged — before returning the `gameToken`, not after, to avoid a race where the same code is exchanged twice concurrently. |
| `expiresAt` | `Date` | ~60 seconds from creation. Add a MongoDB TTL index on this field so expired codes are auto-purged — no manual cleanup job needed. |

---

## 7. Security & Scalability Notes (carried over from v1, still true)

- Game processing stays entirely client-side; the backend is only touched at auth (once per session) and score submission (once per game-over).
- Anti-cheat signature and high-score-replace logic are unchanged and already hardened.
- Connection pooling (`global.mongooseCache`) and rate limiting are unchanged.
- Leaderboard read caching (~10s) is unchanged.
- **New consideration:** the `gameAuthCode` collection should be small and self-cleaning via the TTL index — codes live for seconds, not indefinitely, so this adds negligible load.

---

## 8. Open Assumptions (flag these back if wrong)

- "CGS" from the whiteboard is treated here as the `/game-auth` website page (a "game sign-in gateway") — if it meant something more specific (a separate service, a specific existing page name), let me know and I'll adjust the naming throughout.
- The redirect-back URL is assumed to be the itch.io game's own page URL with a query param appended (`?gameAuthCode=...`) — confirm this is how itch.io allows the game iframe to read its own page's query string on load (it should, since that's just the embedding page's URL, not a cookie).
- Google's `state` parameter (or equivalent) is assumed to be the mechanism for carrying `gameId`/`returnTo` through the existing Google OAuth flow untouched — the existing website OAuth integration should already support a `state` passthrough; if not, this needs a small addition there.