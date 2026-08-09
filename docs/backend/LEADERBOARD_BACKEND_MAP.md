# 🎮 Leaderboard & Game Integration — Backend Map

> **Source of truth:** Every claim in this document was verified against the actual implementation files listed in parentheses. Do not edit this document without re-reading those files.
>
> **Supersedes:** `docs/backend/leaderboard_summary.md` — that file is deprecated; see note at the bottom.

---

## 📋 Changelog

### Pass 5 — 2026-08-09 (End-to-End Trace & Verification against Test Database)

**Scope:** Verified the complete end-to-end integration chain (profile upsert -> game login -> score submit -> leaderboard fetch) with a real integration run against the dev/test database. All 4 hops passed cleanly and cleanup was fully verified using a temporary script (now deleted).

---

### Pass 4 — 2026-08-09 (Profile Bridge implementation — Unblocking Game Integration)

**Scope:** Built the complete Profile Bridge feature (`/api/game/profile`) allowing any authenticated website user (Google OAuth or email/password) to create and manage their linked `GameUser` credentials.

| Component | Change / Implementation Details |
|-----------|---------------------------------|
| **Database Model** | Extended `GameUserModel` in [`src/lib/database/models/gameUser.model.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/database/models/gameUser.model.ts) with `websiteUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true }`. Updated `IGameUser` and `GameUserCreateType` in [`domain.types.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/types/domain.types.ts). |
| **Types & Error Codes** | Added `GAME_USERNAME_TAKEN` to `ESECs` enum in [`service.types.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/types/service.types.ts). Defined `SDIn.GameProfile` and `SDOut.GameProfile` types. |
| **Handler Wiring** | Mapped `ESECs.GAME_USERNAME_TAKEN` to `FailedResponseCodeEnum.CONFLICT` (409) in [`src/lib/handler.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/handler.ts). |
| **Validators** | Added `upsertProfile` (`username`, `password`) and `getProfile` schemas to [`game.validator.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/validators/game.validator.ts). |
| **Service Layer** | Created [`src/lib/services/gameProfile.service.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/services/gameProfile.service.ts) implementing `upsert` (creates or updates `GameUser`, pulling email from session's `User` record) and `get` (returns link status and `username`). |
| **API Route** | Created [`src/app/api/game/profile/route.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/app/api/game/profile/route.ts) exporting `POST` and `GET` handlers with `requireAuth: true`. |

**Files created/modified:**
- `next/src/lib/database/models/gameUser.model.ts` (modified)
- `next/src/lib/types/domain.types.ts` (modified)
- `next/src/lib/types/service.types.ts` (modified)
- `next/src/lib/handler.ts` (modified)
- `next/src/lib/validators/game.validator.ts` (modified)
- `next/src/lib/services/gameProfile.service.ts` (new)
- `next/src/app/api/game/profile/route.ts` (new)
- `LEADERBOARD_BACKEND_MAP.md` (updated)

---

### Pass 3 — 2026-08-09 (core service reuse audit + deep gap analysis)

**Scope:** Verified core service reuse in game code. Found and documented a critical blocking gap (no GameUser creation path). Audited leaderboard caching and rate-limiting.

| Check | Result |
|-------|--------|
| `hash.core.service.ts` reuse in `gameAuth.service.ts` | **✅ Correct.** Calls `verifyStringAndHash` (line 31). No direct `bcrypt` usage. |
| `jwt.core.service.ts` reuse in game services | **✅ Correct.** `gameAuth.service.ts` calls `generateJWToken` (line 40) with `customSecretKey`. `score.service.ts` calls `validateJWToken` (line 19) with `customSecretKey`. No hand-rolled JWT. |
| `email.core.service.ts` reuse | **N/A.** Game feature has no email path. |
| `otp.core.service.ts` reuse | **N/A.** Game feature has no OTP path. |
| `gameUserRepository.insert` called anywhere | **Not found — critical blocker.** `gameusers` collection will always be empty. Login is unreachable. |
| `export const revalidate` in `/api/game/score/route.ts` | **Not found.** No leaderboard caching exists. |
| `ESECs.TOO_MANY_REQUESTS` triggered in game code paths | **Not found.** Only triggered in `auth.service.ts` line 344 (OTP resend). Game routes are unprotected by rate limiting. |

**Files changed this pass:** None (no refactoring needed — core services were already used correctly).

---

### Pass 2 — 2026-08-09 (env var audit & .env.example fix)

**Scope:** Verified that the `GAME_SECRET` rename (from `GAME_SECRET_SALT`) was actually present in source code — not just in docs.

| Check | Result |
|-------|--------|
| `GAME_SECRET_SALT` anywhere in `src/` | **Not found.** Zero occurrences. Source already used `GAME_SECRET`. |
| `GAME_SECRET` in `score.service.ts` | **Confirmed** — line 29: `process.env.GAME_SECRET ?? ""` |
| `GAME_SECRET` in `secret.ts` | **Confirmed** — line 22: `process.env.GAME_SECRET ?? getEnvVariable("GAME_SECRET", true)` |
| `.env.local` hardcoded anywhere | **Not found.** Standard Next.js auto-loading applies. |
| `GAME_SECRET` in `.env.example` | **Was missing — now fixed.** Entry added with explanatory comment. |

**Files changed this pass:**
- `next/.env.example` — Added `GAME_SECRET = "<YOUR_GAME_SECRET>"` with comment explaining dual usage.
- `LEADERBOARD_BACKEND_MAP.md` — Added this Changelog; Known Gaps table updated.

> **Action required from you:** In your live `.env`, ensure the key is named exactly `GAME_SECRET` (not `GAME_SECRET_SALT`). No source code changes were needed.

---

## 🚨 Known Gaps / Not Yet Implemented

Ordered by severity.

| Severity | Gap | Evidence | Impact |
|----------|-----|----------|--------|
| ✅ **Fixed** | ~~**No GameUser creation path exists**~~ | ✅ **Fixed in Pass 4, Verified in Pass 5.** Created `POST /api/game/profile` endpoint which allows any authenticated user to create or update their linked `GameUser` record. | Real integration run against test DB successfully proved all 4 hops (Profile -> Login -> Submit Score -> Fetch Leaderboard) work cleanly. Verified using a temporary script (now deleted) with full cleanup. |
| ✅ **Fixed** | ~~**Profile Bridge is not implemented**~~ | ✅ **Fixed in Pass 4.** Google-OAuth or email/password users visit `/profile` on the website and submit username + password to set up their `GameUser` credentials. Email is attached server-side from session. | All website users can now play games. |
| ✅ **Fixed** | ~~**Unique username enforcement**~~ | ✅ **Fixed in Pass 4.** `gameProfile.service.ts` checks username availability prior to insert/update and returns `ESECs.GAME_USERNAME_TAKEN` (409 Conflict) if taken. | Duplicate username attempts yield clean 409 responses. |
| 🟡 **Medium** | **`target=my_scores` is accepted but ignored** | `score.service.ts → get()` (line 78) calls `scoreRepository.getTopScores(data.gameId)` unconditionally — `data.target` is never read. The validator (`game.validator.ts` line 18) accepts `"leaderboard"` and `"my_scores"` as valid enum values but the service makes no distinction. | Sending `?target=my_scores` returns the same global top-10 as `?target=leaderboard`. The feature is silently broken — no error is returned. |
| 🟡 **Medium** | **No leaderboard caching** | `export const revalidate` is not present in `src/app/api/game/score/route.ts` or anywhere in `src/`. No `unstable_cache`, `cache()`, or HTTP cache headers are set. | Every `GET /api/game/score` hits MongoDB directly. Under concurrent website traffic, this creates per-request DB queries. `idea.md` Section 3 explicitly recommends `revalidate = 10`. |
| 🟡 **Medium** | **Rate limiting not applied to game routes** | `ESECs.TOO_MANY_REQUESTS` is only returned by `auth.service.ts` line 344 (OTP resend abuse detection). Neither `gameAuth.service.ts` nor `score.service.ts` contains any rate-limiting logic or returns this code. | `POST /api/game/login` and `POST /api/game/score` are open to brute-force and score-spam attacks with no server-side throttling. |
| ✅ **Fixed** | ~~`GAME_SECRET` not in `.env.example`~~ | Fixed in Pass 2. `GAME_SECRET = "<YOUR_GAME_SECRET>"` added to `.env.example`. | — |

---

---

## 📡 For the Website / Frontend Developer

This section covers everything needed to **display leaderboard data** and build the **`/profile` Game Credential Setup UI** on the website.

### Response Envelope (all endpoints, site-wide)

Verified against [`src/lib/utils/responseHandler.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/utils/responseHandler.ts):

```
{ action: true,  data: <object> }                          // 2xx success
{ action: false, message: string, errors?: string[] }      // 4xx client error
{ action: null }                                           // 5xx server error
```

- `data` is **only present** when `action === true`.
- `message` and `errors` are **only present** when `action === false`.
- `errors` entries follow the format `"fieldPath$ error message"` (e.g. `"gameId$ Required"`).

---

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

---

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

> ⚠️ `leaderboard_summary.md` documented a `{ status: "success", statusCode, data }` shape — **that shape does not exist in the codebase and was never returned by any endpoint.** The correct shape is `{ action, data }` as shown above.

---

### Endpoint: Fetch Leaderboard

**`GET /api/game/score?target=leaderboard&gameId=<gameId>`**

Verified against: [`src/app/api/game/score/route.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/app/api/game/score/route.ts), [`src/lib/services/score.service.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/services/score.service.ts), [`src/lib/database/repos/score.repo.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/database/repos/score.repo.ts)

- **Authentication Required:** None (`requireAuth: false`).
- **Data source:** URL query parameters (no JSON body).

**Query Parameters** — validated by [`src/lib/validators/game.validator.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/validators/game.validator.ts) `getScore` schema:

| Param | Type | Allowed Values | Required |
|-------|------|----------------|----------|
| `target` | `string` | `"leaderboard"` or `"my_scores"` | Yes |
| `gameId` | `string` | Trimmed, max 255 chars | Yes |

> ⚠️ **`target=my_scores` is accepted by the validator but the service ignores it.** Both values return the same result: the global top-10 leaderboard for `gameId`. See the Known Gaps section above.

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

---

### TypeScript Type for the Response `data` Array

From [`src/lib/types/service.types.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/types/service.types.ts) — `SDOut.GameScore.Get`:

```typescript
type SDOut.GameScore.Get = {
  _id: string;
  player: {
    _id: string;
    username: string;
  };
  gameId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}[];
```

---

---

## 🎮 For the Game Client Developer

This section covers everything needed to **authenticate a player and submit scores** from an itch.io / WebGL game.

### Why cookies don't work (and why `gameToken` exists)

Games on itch.io run inside a cross-origin `<iframe>`. Modern browsers block third-party HTTP-only cookies in iframes. The standard website session cookie cannot reach the game.

**Solution:** `POST /api/game/login` returns an explicit `gameToken` string in the JSON body. Store it in JavaScript memory and attach it to every score-submission request body.

---

### Environment Variable

The following variable must be set in `.env` (server-side only — never expose it to the client):

```env
# Used for BOTH JWT signing/verification (gameAuth.service.ts via getGameSecretKey())
# AND SHA-256 anti-cheat signature calculation (score.service.ts line 29).
GAME_SECRET="your_shared_secret_key_here"
```

Verified: `score.service.ts` reads `process.env.GAME_SECRET` directly (line 29). `gameAuth.service.ts` uses `getGameSecretKey()` from `src/lib/utils/secret.ts`, which also reads `process.env.GAME_SECRET` (line 22 of `secret.ts`). Both use the same variable — there is no separate `GAME_SECRET_SALT`.

---

### Step 1 — Login: `POST /api/game/login`

Verified against: [`src/app/api/game/login/route.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/app/api/game/login/route.ts), [`src/lib/services/gameAuth.service.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/services/gameAuth.service.ts)

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

---

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

---

### Step 3 — Submit Score: `POST /api/game/score`

Verified against: [`src/app/api/game/score/route.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/app/api/game/score/route.ts), [`src/lib/services/score.service.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/services/score.service.ts)

- **Authentication Required:** None (`requireAuth: false`). The `gameToken` in the body replaces a session cookie.
- **Headers:** `Content-Type: application/json`

**Request Body** — validated by `gameValidator.createScore`:

| Field | Type | Rules | Required |
|-------|------|-------|----------|
| `gameId` | `string` | Trimmed, max 255 chars. Must match the `gameId` used for leaderboard queries. | Yes |
| `score` | `number` | Integer. | Yes |
| `timestamp` | `number` | Positive integer. Unix ms (`Date.now()`). Must match the value used in the signature. | Yes |
| `gameToken` | `string` | Trimmed, max 4095 chars. The JWT returned from login. | Yes |
| `signature` | `string` | Trimmed, max 255 chars. The hex SHA-256 computed in Step 2. | Yes |

```json
{
  "gameId": "space-runner",
  "score": 1500,
  "timestamp": 1723165200000,
  "gameToken": "eyJhbGciOiJIUzI1Ni...",
  "signature": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

**What the server does (verified, in order):**
1. Decodes and verifies `gameToken` using `GAME_SECRET`. Extracts `_id` (player's ObjectId hex).
2. Reconstructs the signature as `SHA256("${decoded._id}:${score}:${timestamp}:${GAME_SECRET}")`.
3. Compares reconstructed signature to submitted `signature`. Rejects with `403` if mismatch.
4. Queries the DB for an existing score with `{ player: playerId, gameId }`.
   - If **no record** exists: inserts a new document.
   - If a record exists and `submittedScore > existingScore`: updates the record.
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
  "errors": ["score$ Expected number, received string"]
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

### `GameUser` — [`src/lib/database/models/gameUser.model.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/database/models/gameUser.model.ts)

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

### `Score` — [`src/lib/database/models/score.model.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/database/models/score.model.ts)

- **Mongoose model name:** `"Score"` → collection `scores`

| Field | Type | Constraints |
|-------|------|-------------|
| `player` | `ObjectId` | ref: `'GameUser'`, required |
| `gameId` | `String` | required, trim |
| `score` | `Number` | required |
| `createdAt` | `Date` | auto |
| `updatedAt` | `Date` | auto |

**One record per `(player, gameId)` pair** (enforced in service logic, not a DB index — there is no unique compound index on these fields in the schema).

---

## 🛡️ Error Code Map (Game-specific additions)

Verified against [`src/lib/handler.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/handler.ts) `serviceErrorCodeHandler` switch statement and [`src/lib/types/service.types.ts`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/next/src/lib/types/service.types.ts) `ESECs` enum:

| HTTP Status | ESECs Code | Trigger |
|-------------|-----------|---------|
| `401 Unauthorized` | `INVALID_GAME_TOKEN` | `gameToken` JWT decode/verify failed |
| `403 Forbidden` | `INVALID_SCORE_SIGNATURE` | SHA-256 signature mismatch |

Both codes are confirmed present in `ESECs` (lines 43–44 of `service.types.ts`) and confirmed wired in `handler.ts` (lines 179, 184).

---

## ✅ Build Status

- **TypeScript:** `npx tsc --noEmit` — 0 errors.
- **Next.js production build:** `npm run build` — passed. Routes `/api/game/login` (ƒ) and `/api/game/score` (ƒ) compiled successfully.

---

## 🗑️ Deprecated: `docs/backend/leaderboard_summary.md`

That file has been superseded by this document. It contains two factual errors:
1. It documents a `{ status: "success", statusCode, data }` response envelope — **this shape is never returned by the codebase**.
2. It references `GAME_SECRET_SALT` as the environment variable name — **the actual variable is `GAME_SECRET`**.

Do not use `leaderboard_summary.md` as a reference. It is retained only as a historical artifact.
