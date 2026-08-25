# 🔧 Migration Plan — v1 (password-based) → v2 (Google-Auth code exchange)

> **Read `idea.md` (v2) first** — this document is the file-level "how" for the architecture described there. **Read `LEADERBOARD_BACKEND_MAP.md`** for the parts of the backend that are already correct, verified, and must NOT be touched.
>
> This is a coding-agent task list. Work through it section by section. Do not skip the "Verify before touching" steps — several files below are shared with logic that must be preserved exactly.

---

## 0. Before touching anything

Read these files in full and confirm you understand them before making any change:
- `docs/backend/idea.md` (v2) — the target architecture.
- `docs/backend/LEADERBOARD_BACKEND_MAP.md` — the current, verified, working contract. Everything under its "🏆 Leaderboard Developer" section and the score-submission half of "🎮 Game Client Developer" (signature formula, high-score-replace rule, rate limiting) is **out of scope for this migration** and must not change.
- `next/src/lib/services/gameAuth.service.ts` — this is being replaced, not edited incrementally. Understand its current shape before deleting it.
- `next/src/lib/services/gameProfile.service.ts` — same, being replaced.
- `next/src/lib/services/score.service.ts` — **do not touch.** Confirm it only imports things that still exist after this migration (it should — it doesn't depend on password logic at all).

---

## 1. Delete

- `next/src/app/api/game/login/route.ts` — the password-based login endpoint no longer exists.
- `next/src/lib/services/gameAuth.service.ts` — replaced by the code-exchange service (Section 3 below). Before deleting, check `handler.ts` and any route file for references and remove them too.
- Remove the `login` schema from `next/src/lib/validators/game.validator.ts` (keep the file — `createScore` and `getScore` schemas still live here and are unchanged).
- Remove `passwordHash` from `next/src/lib/database/models/gameUser.model.ts`.
- Remove any `IGameUser`/`GameUserCreateType` fields in `next/src/lib/types/domain.types.ts` that reference a password.
- Remove `ESECs.INVALID_CREDENTIALS` handling **only if** it was solely used by the old password login — grep for other usages first (the main website's own email/password login, if it has one, likely uses this same code; do not remove it if so, only remove the game-specific usage).

## 2. Rename / repurpose

- `next/src/app/api/game/profile/route.ts` → keep the file, but:
  - Rename the underlying service calls from `gameProfile.service.ts`'s password-aware `upsert`/`get` to the new no-password versions (Section 3).
  - Update the route path if you're formally renaming it to `/api/game/link` per `idea.md` Section 5 — confirm with whoever owns the frontend routing before renaming, since this is a breaking path change for anyone already integrating against the old name.
- `next/src/lib/services/gameProfile.service.ts` → keep the file, strip the `password` field entirely from its `upsert()` input and stop hashing/storing it. Keep the username-uniqueness-check-and-409 logic exactly as it is — that part is unaffected by removing the password.

## 3. Add — new files

### `next/src/lib/database/models/gameAuthCode.model.ts` (new)
Per `idea.md` Section 6's `GameAuthCode` table. Use a MongoDB TTL index on `expiresAt` (`schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })` — Mongoose pattern for auto-expiring documents at an absolute timestamp; check how other TTL/expiring documents are handled elsewhere in this codebase, if any, and match that convention).

### `next/src/lib/database/repos/gameAuthCode.repo.ts` (new)
Extend the existing `GenericRepository` pattern (match `gameUser.repo.ts` / `score.repo.ts` style). Needs at minimum: `create(gameUserId, gameId)` (generates the random code, sets `expiresAt` ~60s out), and `findValidAndConsume(code)` (atomic find-and-mark-used — use `findOneAndUpdate` with `{ code, used: false, expiresAt: { $gt: new Date() } }` as the filter and `{ $set: { used: true } }` as the update, returning the pre-update or post-update document depending on what the service needs — this atomicity is what prevents a race condition on double-exchange, so do not implement this as a separate find-then-update).

### `next/src/lib/services/gameSession.service.ts` (new — replaces `gameAuth.service.ts`)
Implements:
- `exchange(data: { gameAuthCode: string })` — calls `gameAuthCodeRepository.findValidAndConsume`, returns `ESECs.INVALID_GAME_TOKEN`-style error (or a new dedicated code — your call, but reuse an existing pattern rather than inventing a fourth error taxonomy) if not found/expired/already used. On success, looks up the associated `GameUser`, generates a `gameToken` via `jwt.core.service.ts`'s `generateJWToken` with the **same `customSecretKey` pattern already used** (do not re-derive this differently — `getGameSecretKey()` from `secret.ts` is the existing, correct source). Returns `{ userId, username, gameToken }` — same shape the old login response used, so `score.service.ts` and the leaderboard `my_scores` mode need zero changes.

### `next/src/app/api/game/session/exchange/route.ts` (new)
`POST`, `requireAuth: false` (protected by the code's own properties, not a session). Wires to `gameSessionServices.exchange`.

### The `/game-auth` website page (new, framework-appropriate location — likely `next/src/app/game-auth/page.tsx` or similar; confirm against how other standalone pages in this app's router are structured)
Server behavior needed:
1. Read `gameId` and `returnTo` from the query string.
2. If no website session: trigger the existing Google OAuth flow, passing `gameId`/`returnTo` through its `state` parameter (confirm the existing OAuth integration supports a `state` passthrough — see `idea.md` Section 8's open assumption on this).
3. Once authenticated: call the (possibly renamed) link-status check. If not linked, render a one-field username form and call the link-creation endpoint (still needs the 409-username-taken handling, same as before — this part of the UI logic doesn't change from the original `/profile` page work).
4. Once linked: server-generates a `gameAuthCode` via the new repo, then redirects to `${returnTo}?gameAuthCode=${code}`.

## 4. Explicitly unchanged — do not touch

- `next/src/lib/services/score.service.ts` (login/create/get logic, signature verification, high-score-replace rule, rate limiting via `GameUser.lastAttemptAt`).
- `next/src/lib/database/repos/score.repo.ts`.
- `next/src/app/api/game/score/route.ts`.
- `next/src/lib/utils/secret.ts` (`getGameSecretKey()` / `GAME_SECRET` env var — still used, just now only for `gameToken` signing at exchange-time and score-signature verification, never for a login password).
- `next/src/lib/services/core/jwt.core.service.ts` (already correctly supports `customSecretKey` — reuse, don't modify).
- The leaderboard `GET` caching (`unstable_cache`) and `my_scores` gameToken-scoping logic.

## 5. Verification checklist before calling this done

- [ ] `npx tsc --noEmit` and `npm run build` pass.
- [ ] A fresh test: simulate the full Flow 1 from `idea.md` — hit `/game-auth?gameId=test&returnTo=<url>` unauthenticated, complete Google login (or mock the session for a script-based test, matching the pattern used in the earlier `tmp-e2e-check.ts` verification script — direct service calls, dedicated test DB, full cleanup afterward, never against production), set a username, confirm a `gameAuthCode` is issued and the redirect URL is correct.
- [ ] Exchange that code via `POST /api/game/session/exchange` — confirm a valid `gameToken` comes back, and confirm calling exchange a **second time with the same code** correctly fails (proves the single-use guarantee is real, not just documented).
- [ ] Confirm the returned `gameToken` still works against the **unchanged** `POST /api/game/score` and `GET /api/game/score` exactly as before — this is the regression check that proves the migration didn't break anything downstream.
- [ ] Update `docs/backend/LEADERBOARD_BACKEND_MAP.md`'s "🎮 Game Client Developer" section to describe the new auth flow (Steps 1–2 change; score submission Steps stay identical) — do not let this doc go stale the way the original password-based one did before it was caught.