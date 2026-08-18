# 🎮 Game & Leaderboard Integration — Team Handoff & Implementation Guide

> This document combines the product vision (`idea.md`) with the **verified, working backend contract** (`LEADERBOARD_BACKEND_MAP.md`) into one place. The backend is fully built, tested end-to-end, and pushed to `bug_fixes`. Your job is to build the three pieces described below **against this contract exactly as written** — you do not need to touch any backend code.

> **Last updated:** 2026-08-10 — Added `GET /api/game/list` endpoint; corrected rate-limit cooldown 60 s → 3 s; documented `unstable_cache` fix; leaderboard frontend wired to real backend; **reverted `score` to `number` and added `scoreStr` as `string`** for dual payload.

---

## 1. The Big Picture (what we're building and why)

A game hosted on **itch.io** (WebGL/HTML5) needs to let players log in with their existing website account, play, and submit their score to a live leaderboard shown on the website.

The tricky part: itch.io embeds games in a cross-origin `<iframe>`, and browsers block the normal website login cookie inside iframes. So the game **cannot** use the website's regular session — it needs its own separate, explicit login step that hands back a token it can hold in memory.

That's why there are two *separate* identity systems at play here, and it's important each of you understands both:

| | Website login | Game login |
|---|---|---|
| How you log in | Google OAuth (or email/password) | Username/Email + a **separate password** set specifically for the game |
| What proves you're logged in | An HTTP-only session **cookie**, invisible to JS | An explicit **`gameToken`** string, held in JS memory |
| Where it's used | Every normal website page/dashboard | Only inside the itch.io game client |
| Database record | `User` collection | `GameUser` collection (separate, but linked) |

A `GameUser` record only gets created when someone visits the website's **`/profile`** page and sets a game username + password for the first time. **Nobody can log into the game until this has happened at least once for their account.** This is the one hard dependency between your three pieces of work — see the Sequencing section at the end.

---

## 2. The End-to-End Flow

```
[Website]                          [Backend]                         [itch.io Game]
   │                                    │                                   │
   │  1. User logs in with Google  ────►│                                   │
   │  (existing, already works)         │                                   │
   │                                    │                                   │
   │  2. User visits /profile,          │                                   │
   │     sets game username+password ──►│  Creates GameUser record         │
   │                                    │  linked to their website account │
   │                                    │                                   │
   │                                    │◄──── 3. Game: POST /api/game/login
   │                                    │       (username/email + password) │
   │                                    │──── Returns gameToken + userId ──►│
   │                                    │                                   │
   │                                    │              [Player plays game] │
   │                                    │                                   │
   │                                    │◄──── 4. Game: POST /api/game/score
   │                                    │      (score, timestamp, token,   │
   │                                    │       anti-cheat signature)       │
   │                                    │  Verifies signature, updates      │
   │                                    │  high score if it's higher        │
   │                                    │──── Returns 200 OK ───────────────►│
   │                                    │                                   │
   │  5. GET /api/game/score           │                                   │
   │     (leaderboard) ────────────────►│                                   │
   │◄──── Top 10 scores ────────────────│                                   │
```

---

## 3. Response Envelope — every endpoint, no exceptions

All three of you need this. Every single API response, success or failure, follows this exact shape:

```
{ action: true,  data: <object> }                      // success
{ action: false, message: string, errors?: string[] }  // client error (bad input, auth, conflict, etc.)
{ action: null }                                        // server error (rare — treat as "something broke, retry or show a generic error")
```

- `data` only exists when `action === true`.
- `message` only exists when `action === false`. This is the human-readable error to show the user.
- `errors` only exists when `action === false` **and** it was a validation failure (missing/malformed field). Format: `"fieldName$ what's wrong"`, e.g. `"gameId$ Required"`.

**Rule of thumb for your UI code:** always check `response.action` first. `true` → use `.data`. `false` → show `.message` (and map `.errors` to specific form fields if present). `null` → show a generic "something went wrong, try again" message.

---

## 4. 👤 Task 1 — Profile Developer (Website)

**Deliverable:** A `/profile` page (or section of an existing settings page) where any logged-in website user (admin, member, or guest — all roles allowed) can set up or change their game username and password.

### What the user needs to enter
Just two fields:
- **Username** — text input, trimmed, max 255 characters. This is what they'll use to log into the game (along with the password, and later can also use their Google email to log in instead).
- **Password** — text input (masked), max 255 characters. This is a **new, separate password just for the game** — it has nothing to do with their website Google login. Make this clear in your UI copy so users don't confuse it with a website password (they don't have one, since they log into the website via Google).

You do **not** need to collect their email — the backend pulls it automatically from their logged-in website session, so it can't be spoofed.

### Step 1 — On page load: check if they already have a profile

```
GET /api/game/profile
Auth: requires the normal website session cookie (send withCredentials: true, same as every other authenticated call on this site)
```

**If not set up yet:**
```json
{ "action": true, "data": { "linked": false } }
```
→ Show an empty form: "Set up your game profile" with username + password inputs.

**If already set up:**
```json
{ "action": true, "data": { "linked": true, "username": "playerone" } }
```
→ Show their current username, and a form to change username/password if they want (same POST endpoint handles updates).

### Step 2 — On form submit: create or update

```
POST /api/game/profile
Auth: same website session cookie
Body: { "username": "playerone", "password": "PlayerPassword123" }
```

This single endpoint handles **both** first-time creation and later updates — you don't need separate logic for "new" vs "edit," just always POST whatever's in the form.

**Success:**
```json
{ "action": true, "data": { "message": "Game profile created successfully." } }
```
(or `"...updated successfully."` if they already had one — just show the message, no need to branch your UI on the exact wording)

**Username already taken by someone else:**
```json
{ "action": false, "message": "That username is already taken." }
```
→ This is a `409 Conflict`. **This is already fully handled by the backend** — you don't need to build any uniqueness-checking logic yourself. Just catch `action === false` and show `response.message` next to the username field. No client-side workaround needed for this.

**Not logged in:**
```json
{ "action": false, "message": "Authentication required." }
```
→ Shouldn't normally happen if the page correctly requires login to view, but handle it gracefully (redirect to login) just in case their session expired mid-edit.

### Checklist for this task
- [ ] Page/section only visible to logged-in users (any role)
- [ ] On load: GET status, render "empty" vs "already set up" state
- [ ] Form with username + password, clear copy that this is separate from their website login
- [ ] POST on submit, handles both create and update via the same call
- [ ] Shows the 409 "username taken" error inline on the username field
- [ ] Shows a generic error state for `action: null`

---

## 5. 🏆 Task 2 — Leaderboard Developer (Website)

**Deliverable:** A leaderboard UI on the website showing the top scores for a given game, live/near-live.

### Fetching the list of available games

Before rendering the game search bar and selection tabs, fetch the list of game IDs that actually have scores in the database:

```
GET /api/game/list
Auth: none required — public endpoint
```

**Response:**
```json
{ "action": true, "data": ["space-runner", "possessed", "cookie-runner"] }
```

- `data` is a `string[]` of distinct `gameId` values — only games that have at least one score in the database.
- Returns `[]` (empty array, not an error) if no scores have been submitted yet.
- Use this to populate the search dropdown and the game tab buttons dynamically. **Do not use a hardcoded mock array** — this endpoint is the source of truth for which games are active.

### Fetching the leaderboard

```
GET /api/game/score?target=leaderboard&gameId=<gameId>
Auth: none required — this is a public endpoint
```

`gameId` is a string identifier for a specific game (e.g. `"space-runner"`) — confirm the exact value to use with the game client developer, since it must match exactly what the game sends when submitting scores.

**Response:**
```json
{
  "action": true,
  "data": [
    {
      "_id": "64f8a999bc4567890abcdef9",
      "player": { "_id": "64f8a123bc4567890abcdef1", "username": "playerone" },
      "gameId": "space-runner",
      "score": 1500,
      "createdAt": "2026-08-09T01:23:42.000Z",
      "updatedAt": "2026-08-09T01:23:42.000Z"
    }
  ]
}
```

- `data` is an array, already sorted highest-score-first, **capped at 10 entries**. You don't need to sort or slice it client-side.
- Only `player.username` is exposed — no email, no other personal info. Safe to display directly.
- This response may be served from a short (10-second) server-side cache — if you're polling for "live" updates, polling more often than every ~10 seconds won't get you fresher data, so a 10–15 second poll interval is reasonable.

### Optional: "My Score" view

If you want a "your personal best" widget (separate from the top-10 board), there's a second mode:
```
GET /api/game/score?target=my_scores&gameId=<gameId>&gameToken=<token>
```

This requires a `gameToken` — the same token issued by game login. **In practice, this only applies if the website itself ever runs the game in-browser and holds a token, or if you build a feature where a user pastes/links their game session.** For the standard case (itch.io game separate from the website), you likely won't use this mode — it's primarily for the game client's own use if it wants to check the player's rank. Confirm with the game developer whether this is needed on the website side at all before building it.

When used, it returns **0 or 1 items** (the requesting player's own score, if they have one) instead of the top 10.

### Error handling
```json
// bad target/gameId
{ "action": false, "message": "Bad Request.", "errors": ["target$ Invalid enum value..."] }

// server error
{ "action": null }
```

### Checklist for this task
- [ ] On mount: `GET /api/game/list` to fetch active game IDs; populate search bar and tabs from this live list
- [ ] Handles empty game list gracefully ("No games have scores yet.")
- [ ] Leaderboard component fetching `target=leaderboard&gameId=<gameId>`
- [ ] Renders `player.username` + `score`, already sorted, max 10 rows
- [ ] Polling (if live updates wanted) at a sensible interval (10–15s), respecting the server cache
- [ ] Handles empty leaderboard (empty array) gracefully — "No scores yet, be the first to play!"
- [ ] Generic error state for `action: null` or validation errors

---

## 6. 🎮 Task 3 — Game Client Developer (itch.io / Unity / WebGL)

**Deliverable:** In-game login screen and score submission, talking to the backend from inside the itch.io iframe.

### Get the shared secret first
You'll be given a `GAME_SECRET` value out-of-band (not in any doc, ask directly) — this is required for Step 2 below. Keep it embedded in the game build; it's meant to be known only by the game and the server.

### Step 1 — Login screen

```
POST /api/game/login
Headers: Content-Type: application/json
Body: { "identifier": "playerone", "password": "PlayerPassword123" }
```

`identifier` can be **either** the username the player set on `/profile`, **or** their Google account email — both work interchangeably, since the backend checks both fields.

**Success:**
```json
{
  "action": true,
  "data": {
    "userId": "64f8a123bc4567890abcdef1",
    "username": "playerone",
    "gameToken": "eyJhbGciOiJIUzI1Ni..."
  }
}
```
Store all three of `userId`, `username`, and `gameToken` in memory (not localStorage/cookies — just in-memory JS/game state). You need `userId` and `gameToken` again for Step 3.

**Failure — wrong credentials or no profile set up yet:**
```json
{ "action": false, "message": "Invalid credentials." }
```
This is the **same error** whether the account doesn't exist at all, or exists but the password's wrong — the backend doesn't distinguish, for security reasons. **Recommended UX:** on this error, show a message like *"Login failed. If this is your first time playing, set up your game profile on the website first: [link to /profile]."* This directly implements the "Profile Bridge" flow from the original spec — a failed login is expected for anyone who hasn't visited `/profile` yet, not a bug.

### Step 2 — Before submitting a score, compute the anti-cheat signature

```javascript
async function computeSignature(userId, score, timestamp, gameSecret) {
  const message = `${userId}:${score}:${timestamp}:${gameSecret}`;
  const encoded = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}
```

- `score` — the **integer** score used for sorting and ranking.
- `scoreStr` — a **string** in any format your game uses (e.g. `"1500"`, `"14m 43s"`, `"200pts"`, `"Level 7 - 42 kills"`). The backend stores exactly what you send and the frontend displays it.
- `timestamp` — `Date.now()` (milliseconds) — **compute this once and reuse the exact same value in both the signature and the request body.** A mismatch here is the #1 cause of signature failures.
- `gameSecret` — the shared `GAME_SECRET` value.

### Step 3 — Submit the score

```
POST /api/game/score
Headers: Content-Type: application/json
Body:
{
  "gameId": "space-runner",
  "score": 1500,
  "scoreStr": "1500",
  "timestamp": 1723165200000,
  "gameToken": "eyJhbGciOiJIUzI1Ni...",
  "signature": "<computed in Step 2>"
}
```

`gameId` must exactly match the string the leaderboard developer uses when fetching — agree on this value together.

**Success:**
```json
{ "action": true, "data": {} }
```
This is returned **whether or not the score actually changed anything** — if the submitted numeric score isn't strictly higher than the player's existing best, the server silently ignores the write but still tells you "success" so your game doesn't need special-case error handling for "you didn't beat your high score." Just show a normal "score submitted" confirmation either way.

**Token expired/invalid (`401`):**
```json
{ "action": false, "message": "Invalid or expired game session." }
```
→ Send the player back to the login screen.

**Signature mismatch (`403`):**
```json
{ "action": false, "message": "Anti-cheat signature validation failed." }
```
→ This means a bug in your signature computation (usually a timestamp mismatch), not a real cheat attempt during normal testing. Double-check you're using the exact same `timestamp` value in both the hash and the body.

### Rate limiting — updated
Both login and score submission are rate-limited server-side with a **3-second** cooldown per player (previously 60 seconds, reduced 2026-08-10 for better UX). If you fire requests back-to-back faster than that during testing, you will get `429 Too Many Requests` — this is expected. In normal gameplay (one login at session start, one score submit at game-over) the limit is completely invisible to the player.

### Checklist for this task
- [ ] Login screen using `identifier` (username or email) + password
- [ ] On login failure, direct the player to `/profile` on the website
- [ ] Store `userId`, `username`, `gameToken` in memory only
- [ ] Correct signature computation with the exact SHA-256 formula above, same timestamp reused in both signature and body
- [ ] Score submission on game-over, showing a generic "submitted" confirmation regardless of whether it was a new high score
- [ ] Handles 401 (re-login) and 403 (check signature logic) distinctly
- [ ] Test requests spaced at least **3 seconds apart** to avoid triggering the rate limit

---

## 7. Sequencing — who's blocked by whom

- **Profile Developer** can start immediately — no dependency on anyone else.
- **Leaderboard Developer** can start immediately and build/test against the documented response shape, but won't see *real* data until at least one score has been submitted by the Game Client (can coordinate a manual test score via the profile+login+submit flow together, or just build against the documented JSON shape using mock data first).
- **Game Client Developer** can build the login/submit screens and UI immediately, but **cannot get a successful real login** until at least one `GameUser` exists — which only happens after someone has used the Profile Developer's `/profile` page at least once. **Recommendation:** as soon as the Profile page has a working POST (even before it's fully polished), have that person set up one test game profile so the Game Client Developer can start testing real logins in parallel rather than waiting for the whole feature to be "done."

---

## 8. Known Limitations

None. All previously known gaps (`target=my_scores` filtering, leaderboard caching, rate limiting) have been implemented, verified, and are live on `bug_fixes`.

---

## 9. Questions? Who to ask

If anything in this doc doesn't match what you're actually seeing from the API, don't guess — flag it. The backend contract described here was verified line-by-line against the actual source code and tested end-to-end, so a mismatch likely means either a miscommunication on `gameId` naming, an environment/deployment issue, or something that changed after this doc was written.

---

## 10. Change Log

| Date | Who | Change |
|------|-----|--------|
| 2026-08-10 | Backend | **New endpoint** `GET /api/game/list` — returns distinct active game IDs from the Score collection |
| 2026-08-10 | Backend | **Rate-limit cooldown** reduced from 60 s → **3 s** for both `POST /api/game/login` and `POST /api/game/score` |
| 2026-08-10 | Backend | **`unstable_cache` fix** — leaderboard `GET` was throwing 500 due to BSON ObjectId serialization; fixed in `score.service.ts` |
| 2026-08-10 | Frontend | **Leaderboard UI** wired to real backend; game search bar and tabs now driven by `GET /api/game/list` instead of hardcoded mock |
| 2026-08-10 | Backend + Frontend | **`score` reverted to `number`, `scoreStr` added as `string`** — supports numerical ranking while accepting any format (`"1500"`, `"14m 43s"`, `"200pts"`); high-score comparison restored |
