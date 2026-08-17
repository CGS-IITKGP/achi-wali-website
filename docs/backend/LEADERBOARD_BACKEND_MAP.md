# 🎮 Leaderboard & Game Integration — Backend Map

> **Source of truth:** Every claim in this document was verified against the actual implementation files listed in parentheses. Do not edit this document without re-reading those files.

> **Last updated:** 2026-08-10 — Added `GET /api/game/list` endpoint; corrected rate-limit cooldown from 60 s → 3 s; documented `unstable_cache` serialization fix in `score.service.ts`; **reverted `score` to `number` and added `scoreStr` as `string`** for dual payload.

**Who reads what:**
- **👤 Profile Developer** — Read if you are building the website UI for users to check, create, or update their Game Profile credentials (`GET` / `POST /api/game/profile`).
- **🏆 Leaderboard Developer** — Read if you are building the website UI to fetch and display the leaderboard (`GET /api/game/score`, `GET /api/game/list`).
- **🎮 Game Client Developer** — Read if you are building the actual game in Unity/WebGL and need to authenticate players and submit scores.

---

## 👤 Profile Developer

This section covers the endpoints for building the **`/profile` Game Credential Setup UI** on the website.

### Response Envelope (all endpoints, site-wide)

Verified against `src/lib/utils/responseHandler.ts`:

```
{ action: true,  data: <object> }                          // 2xx success
{ action: false, message: string, errors?: string[] }      // 4xx client error
{ action: null }                                           // 5xx server error
```

- `data` is **only present** when `action === true`.
- `message` and `errors` are **only present** when `action === false`.
- `errors` entries follow the format `"fieldPath$ error message"` (e.g. `"gameId$ Required"`).

### Endpoint: Check Game Profile Status (`GET /api/game/profile`)

- **Description:** Checks whether the currently logged-in website user has set up their Game credentials.
- **Authentication Required:** `True` — active website session cookie required (`withCredentials: true`).

**Success Response (Not Linked Yet):**

```json
{
  "action": true,
  "data": {
    "linked": false
  }
}
```

**Success Response (Already Linked):**

```json
{
  "action": true,
  "data": {
    "linked": true,
    "username": "playerone"
  }
}
```

### Endpoint: Create or Update Game Profile (`POST /api/game/profile`)

- **Description:** Creates a new `GameUser` linked to the active website account (or updates username/password if already linked). Email is pulled from the website session server-side (cannot be spoofed).
- **Authentication Required:** `True` — active website session cookie required (`withCredentials: true`).

**Request Body:**

| Field | Type | Rules | Required |
|-------|------|-------|----------|
| `username` | `string` | Trimmed, max 255 chars. Unique across all game players. | Yes |
| `password` | `string` | Max 255 chars. Plaintext password for game login. | Yes |

```json
{
  "username": "playerone",
  "password": "PlayerPassword123"
}
```

**Success Response (`200 OK`):**

```json
{
  "action": true,
  "data": {
    "message": "Game profile created successfully."
  }
}
```
*(Or `"Game profile updated successfully."` if updating an existing profile).*

**Error Response — Username Taken (`409 Conflict`):**

```json
{
  "action": false,
  "message": "That username is already taken."
}
```

**Error Response — Unauthorized (`401 Unauthorized`):**

```json
{
  "action": false,
  "message": "Authentication required."
}
```

---

## 🏆 Leaderboard Developer

This section covers fetching and displaying leaderboard data on the website.

### Response Envelope (all endpoints, site-wide)

Verified against `src/lib/utils/responseHandler.ts`:

```
{ action: true,  data: <object> }                          // 2xx success
{ action: false, message: string, errors?: string[] }      // 4xx client error
{ action: null }                                           // 5xx server error
```

- `data` is **only present** when `action === true`.
- `message` and `errors` are **only present** when `action === false`.
- `errors` entries follow the format `"fieldPath$ error message"` (e.g. `"gameId$ Required"`).

### Endpoint: Fetch Active Game List

**`GET /api/game/list`**

Verified against: `src/app/api/game/list/route.ts`, `src/lib/services/gameList.service.ts`, `src/lib/database/repos/score.repo.ts`

- **Authentication Required:** None (`requireAuth: false`).
- **Query Parameters:** None.
- **Purpose:** Returns an array of every distinct `gameId` string that has at least one score record in the `Score` collection. Use this to dynamically populate the game search bar and selector tabs in the leaderboard UI — so only games with real data are shown, not a hardcoded mock list.

**Success Response (`200 OK`):**

```json
{
  "action": true,
  "data": ["space-runner", "possessed", "cookie-runner"]
}
```

- `data` is a plain `string[]` of distinct `gameId` values. Order is not guaranteed — sort client-side if needed.
- Returns an empty array `[]` (not an error) if no scores have been submitted yet.

**TypeScript type for the response `data` field:**

```typescript
type SDOut.GameList.Get = string[];
```

**Server Error (`500 Internal Server Error`):**

```json
{ "action": null }
```

---

### Endpoint: Fetch Leaderboard

**`GET /api/game/score?target=leaderboard&gameId=<gameId>`**

Verified against: `src/app/api/game/score/route.ts`, `src/lib/services/score.service.ts`, `src/lib/database/repos/score.repo.ts`

- **Authentication Required:** None (`requireAuth: false`).
- **Data source:** URL query parameters (no JSON body).

**Query Parameters** — validated by `src/lib/validators/game.validator.ts` `getScore` schema:

| Param | Type | Allowed Values | Required |
|-------|------|----------------|----------|
| `target` | `string` | `"leaderboard"` or `"my_scores"` | Yes |
| `gameId` | `string` | Trimmed, max 255 chars | Yes |
| `gameToken` | `string` | The JWT from login | **Yes** if `target=my_scores`, optional otherwise |

> ℹ️ **Behavior Notes:**
> - When `target=my_scores`, the endpoint uses the `gameToken` to return only the requesting player's score for that `gameId`. The `data` array will contain either `0` or `1` items (not the top 10).
> - When `target=leaderboard`, the global top-10 leaderboard is returned. This response may be served from a short **10-second cache**.

**Success Response (`200 OK`):**

```json
{
  "action": true,
  "data": [
    {
      "_id": "64f8a999bc4567890abcdef9",
      "player": {
        "_id": "64f8a123bc4567890abcdef1",
        "username": "playerone"
      },
      "gameId": "space-runner",
      "score": 1500,
      "createdAt": "2026-08-09T01:23:42.000Z",
      "updatedAt": "2026-08-09T01:23:42.000Z"
    }
  ]
}
```

- `data` is an array sorted by `score` descending, capped at **10 entries** (hardcoded default in `score.repo.ts → getTopScores(gameId, limit = 10)`).
- `player` is populated: only `_id` (hex string) and `username` are returned. No email, no other fields.
- `_id` values are hex strings (`.toHexString()` called in the service).
- `createdAt` / `updatedAt` are `Date` objects serialised to ISO-8601 strings.

**Validation Error (`400 Bad Request`):**

```json
{
  "action": false,
  "message": "Bad Request.",
  "errors": ["target$ Invalid enum value. Expected 'leaderboard' | 'my_scores', received 'bad'"]
}
```

**Server Error (`500 Internal Server Error`):**

```json
{
  "action": null
}
```

### TypeScript Type for the Response `data` Array

From `src/lib/types/service.types.ts` — `SDOut.GameScore.Get`:

```typescript
type SDOut.GameScore.Get = {
  _id: string;
  player: {
    _id: string;
    username: string;
  };
  gameId: string;
  score: number;   // Used for numerical sorting and ranking
  scoreStr: string; // Free-form string matching what the game submitted
  createdAt: Date;
  updatedAt: Date;
}[];
```

> 🐛 **`unstable_cache` serialization fix (2026-08-10):** The leaderboard `GET` was returning `500` because `unstable_cache` cannot serialize BSON `ObjectId` instances. Fixed in `src/lib/services/score.service.ts` by moving the `.toHexString()` formatting step **inside** the cached function so only plain strings/numbers reach the Next.js serializer.

---

## 🎮 Game Client Developer

This section covers everything needed to **authenticate a player and submit scores** from an itch.io / WebGL game.

### Response Envelope (all endpoints, site-wide)

Verified against `src/lib/utils/responseHandler.ts`:

```
{ action: true,  data: <object> }                          // 2xx success
{ action: false, message: string, errors?: string[] }      // 4xx client error
{ action: null }                                           // 5xx server error
```

- `data` is **only present** when `action === true`.
- `message` and `errors` are **only present** when `action === false`.
- `errors` entries follow the format `"fieldPath$ error message"` (e.g. `"gameId$ Required"`).

### Why cookies don't work (and why `gameToken` exists)

Games on itch.io run inside a cross-origin `<iframe>`. Modern browsers block third-party HTTP-only cookies in iframes. The standard website session cookie cannot reach the game.

**Solution:** `POST /api/game/login` returns an explicit `gameToken` string in the JSON body. Store it in JavaScript memory and attach it to every score-submission request body.

### Environment Variable

The following variable must be set in `.env` (server-side only — never expose it to the client):

```env
# Used for BOTH JWT signing/verification (gameAuth.service.ts via getGameSecretKey())
# AND SHA-256 anti-cheat signature calculation (score.service.ts line 29).
GAME_SECRET="your_shared_secret_key_here"
```

Verified: `score.service.ts` reads `process.env.GAME_SECRET` directly (line 29). `gameAuth.service.ts` uses `getGameSecretKey()` from `src/lib/utils/secret.ts`, which also reads `process.env.GAME_SECRET` (line 22 of `secret.ts`). Both use the same variable.

### Step 1 — Login: `POST /api/game/login`

Verified against: `src/app/api/game/login/route.ts`, `src/lib/services/gameAuth.service.ts`

- **Authentication Required:** None (`requireAuth: false`).
- **Headers:** `Content-Type: application/json`

**Request Body** — validated by `gameValidator.login`:

| Field | Type | Rules | Required |
|-------|------|-------|----------|
| `identifier` | `string` | Trimmed, max 255 chars. Matches against `username` OR `email` (both lowercased before lookup). | Yes |
| `password` | `string` | Max 255 chars. | Yes |

```json
{
  "identifier": "playerone",
  "password": "PlayerPassword123"
}
```

**Success Response (`200 OK`):**

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

Store `data.userId`, `data.username`, and `data.gameToken` in memory. You will need all three for score submission.

**Error Response — Invalid Credentials (`401 Unauthorized`):**

```json
{
  "action": false,
  "message": "Invalid credentials."
}
```

Returned when:
- No `GameUser` record matches the `identifier` (neither `username` nor `email`).
- A matching record exists but `passwordHash` is missing.
- The password does not match the stored hash.

**Validation Error (`400 Bad Request`):**

```json
{
  "action": false,
  "message": "Bad Request.",
  "errors": ["identifier$ Required"]
}
```

**Server Error (`500 Internal Server Error`):**

```json
{
  "action": null
}
```

### Step 2 — Compute the Anti-Cheat Signature

Before submitting a score, compute a SHA-256 HMAC of the payload using the shared `GAME_SECRET`. The exact formula, verified against `score.service.ts` lines 29–35:

```
message  = `${userId}:${score}:${timestamp}:${GAME_SECRET}`
signature = SHA256(message)  →  hex-encoded, lowercase
```

- `userId` — the hex string returned in `data.userId` from the login response.
- `score` — the integer score to submit.
- `timestamp` — a Unix epoch in **milliseconds** (JavaScript `Date.now()`).
- `GAME_SECRET` — the shared secret known to both the game binary and the server.

**WebGL / JavaScript implementation:**

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

### Step 3 — Submit Score: `POST /api/game/score`

Verified against: `src/app/api/game/score/route.ts`, `src/lib/services/score.service.ts`

- **Authentication Required:** None (`requireAuth: false`). The `gameToken` in the body replaces a session cookie.
- **Headers:** `Content-Type: application/json`

**Request Body** — validated by `gameValidator.createScore`:

| Field | Type | Rules | Required |
|-------|------|-------|----------|
| `gameId` | `string` | Trimmed, max 255 chars. Must match the `gameId` used for leaderboard queries. | Yes |
| `score` | `number` | Integer. Used for high-score comparison (`submittedScore > existingScore`). | Yes |
| `scoreStr` | `string` | Trimmed, max 255 chars. **Free-form** — formatted string (e.g. `"1500"`, `"14m 43s"`, `"200pts"`). | Yes |
| `timestamp` | `number` | Positive integer. Unix ms (`Date.now()`). Must match the value used in the signature. | Yes |
| `gameToken` | `string` | Trimmed, max 4095 chars. The JWT returned from login. | Yes |
| `signature` | `string` | Trimmed, max 255 chars. The hex SHA-256 computed in Step 2. | Yes |

```json
{
  "gameId": "space-runner",
  "score": 1500,
  "scoreStr": "1500",
  "timestamp": 1723165200000,
  "gameToken": "eyJhbGciOiJIUzI1Ni...",
  "signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

**What the server does (verified, in order):**
1. Decodes and verifies `gameToken` using `GAME_SECRET`. Extracts `_id` (player's ObjectId hex).
2. Reconstructs the signature as `SHA256("${decoded._id}:${score}:${timestamp}:${GAME_SECRET}")`.
3. Compares reconstructed signature to submitted `signature`. Rejects with `403` if mismatch.
4. **Rate limit check** — queries `GameUser.lastAttemptAt`. If the last attempt was less than **3 seconds** ago, rejects with `429`. Otherwise stamps `lastAttemptAt = now()`.
5. Queries the DB for an existing score with `{ player: playerId, gameId }`.
   - If **no record** exists: inserts a new document.
   - If a record exists and `submittedScore > existingScore`: updates the record with both the new numeric `score` and formatted `scoreStr`.
   - If a record exists and `submittedScore <= existingScore`: **no DB write**, returns success silently.

**Success Response (`200 OK`):**

```json
{
  "action": true,
  "data": {}
}
```

**Error — Invalid / Expired Token (`401 Unauthorized`):**

```json
{
  "action": false,
  "message": "Invalid or expired game session."
}
```

Cause: `gameToken` is missing, malformed, expired, or signed with the wrong secret.

**Error — Signature Mismatch (`403 Forbidden`):**

```json
{
  "action": false,
  "message": "Anti-cheat signature validation failed."
}
```

Cause: The reconstructed SHA-256 does not match the submitted `signature`. Most common cause: the `timestamp` used in the signature computation differs from the `timestamp` field in the request body, or the wrong `userId` was used.

**Validation Error (`400 Bad Request`):**

```json
{
  "action": false,
  "message": "Bad Request.",
  "errors": ["score$ Required"]
}
```

**Server Error (`500 Internal Server Error`):**

```json
{
  "action": null
}
```

---

## 🗄️ Database Models (Verified)

### `GameUser` — `src/lib/database/models/gameUser.model.ts`

- **Mongoose model name:** `"GameUser"` → collection `gameusers`
- **Linked to the website `User` via `websiteUserId`, but the game's role permissions are completely unaffected by this link.**

| Field | Type | Constraints |
|-------|------|-------------|
| `username` | `String` | required, unique, lowercase, trim |
| `email` | `String` | required, lowercase, trim |
| `passwordHash` | `String` | required |
| `websiteUserId` | `ObjectId` | ref: `'User'`, required, unique |
| `createdAt` | `Date` | auto (timestamps: true) |
| `updatedAt` | `Date` | auto (timestamps: true) |

### `Score` — `src/lib/database/models/score.model.ts`

- **Mongoose model name:** `"Score"` → collection `scores`

| Field | Type | Constraints |
|-------|------|-------------|
| `player` | `ObjectId` | ref: `'GameUser'`, required |
| `gameId` | `String` | required, trim |
| `score` | `Number` | required |
| `scoreStr` | `String` | required, trim. Free-form — any value the game submits (e.g. `"1500"`, `"14m 43s"`, `"200pts"`). |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

**One record per `(player, gameId)` pair** (enforced in service logic). When a new score is submitted for an existing pair, the server checks if the submitted numeric `score` is strictly greater than the existing numeric `score`. If it is, both `score` and `scoreStr` are updated.

---

## 🛡️ Error Code Map (Game-specific additions)

Verified against `src/lib/handler.ts` `serviceErrorCodeHandler` switch statement and `src/lib/types/service.types.ts` `ESECs` enum:

| HTTP Status | ESECs Code | Trigger |
|-------------|-----------|---------|
| `401 Unauthorized` | `INVALID_GAME_TOKEN` | `gameToken` JWT decode/verify failed |
| `403 Forbidden` | `INVALID_SCORE_SIGNATURE` | SHA-256 signature mismatch |
| `429 Too Many Requests` | `TOO_MANY_REQUESTS` | Login or score submission within the **3-second** cooldown window |

All three codes are confirmed present in `ESECs` and wired in `handler.ts`.

> ⏱️ **Rate-limit cooldown: 3 seconds** (down from the original 60 seconds). Changed in `src/lib/services/gameAuth.service.ts` and `src/lib/services/score.service.ts` on 2026-08-10 to improve UX for legitimate players. The server stamps `GameUser.lastAttemptAt` on every login and every score submission; the next request is blocked only if it arrives within 3 s of the previous one. This is sufficient to stop bot brute-forcing without impacting normal players.

---

## ⚠️ Known Limitations — Not Yet Implemented

No known limitations at this time.

---

## 📝 Change Log

| Date | Change | Files |
|------|--------|-------|
| 2026-08-10 | **New endpoint** `GET /api/game/list` — returns distinct game IDs with scores | `route.ts`, `gameList.service.ts`, `score.repo.ts` |
| 2026-08-10 | **Rate-limit cooldown reduced** from 60 s → **3 s** for both login and score submission | `gameAuth.service.ts`, `score.service.ts` |
| 2026-08-10 | **`unstable_cache` serialization fix** — leaderboard GET was returning 500; formatting moved inside cached function | `score.service.ts` |
| 2026-08-10 | **Leaderboard frontend wired** to real backend; GAMES mock replaced with live `GET /api/game/list` fetch | `Leaderboard.tsx` |
| 2026-08-10 | **`score` reverted to `number`, `scoreStr` added as `string`** — supports numerical ranking while accepting any format (`"1500"`, `"14m 43s"`, `"200pts"`); high-score comparison restored | `score.model.ts`, `game.validator.ts`, `score.service.ts`, `service.types.ts`, `domain.types.ts`, `PodiumCard.tsx`, `formatValue.ts` |
