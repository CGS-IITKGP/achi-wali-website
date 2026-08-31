# Migration & Feature Summary — Login, Leaderboard, & Minigame Updates

> **Tracks progress across the code-exchange login migration, score-submission refactoring, and minigame features.**

---

## Phase 0 to 5 — Game Login Migration (Password → Code-Exchange) ✅

### What Was Built
1. **Game Login System Overhaul**: Removed legacy password-based login entirely. Game authentication now uses a short-lived single-use code exchanged for a JWT `gameToken`.
2. **`GameAuthCode` Model & Repository**: Random 32-byte codes are generated with a 60-second MongoDB TTL index (`expiresAt`). Consumption uses an atomic `findOneAndUpdate` operation.
3. **Google OAuth State Preservation**: Added cookie-based state-checking logic (`game_auth_pending` with a 300s TTL) so that standard Google logins can redirect back to `/game-auth` with the correct context.
4. **`/game-auth` Landing Page**: Acts as the user setup and linking interface, prompting the user for a game username if not set, and auto-linking the account before redirecting back to the game.

### Verification
- Full typecheck and Next.js builds compiled without warnings or errors.
- Verified e2e redirect flows from game link → web callback → game redirect.

---

## Feature — Leaderboard Append-Only History & Seed Tracking ✅

### Changes Made
1. **Append-Only Writes**: Modified the write path to simplify score submissions. Every validated submission is always inserted as a new document instead of using the previous lookup-and-conditionally-overwrite/add logic.
2. **Procedural Seed Tracking**: Added the `seed` field (required string, max 255 chars) to the `Score` model, request validator, and API response representations.
3. **Read-Time High Scores**: Rewrote the leaderboard query in `score.repo.ts` to use a MongoDB aggregation pipeline that groups entries by player, takes the maximum score, retrieves the associated fields (such as `seed` and `createdAt`), sorts descending, and matches the player username using a `$lookup` join.
4. **My Score Query**: Updated `getMyScore` to sort and limit by 1 to retrieve the highest score for a single player.

### Verification
- Connects only to the database named "test" and executes the E2E verification workflow.
- Submits three scores for a single player: 100, 500, and 300 with unique seed names.
- Verifies that all 3 rows exist in the database (proving append-only history).
- Verifies that both the leaderboard and personal score retrievals return only a single entry reflecting the max score (500) and its correct seed.
- Cleans up and deletes all test records upon completion.

---

## Feature — Minigame System Integration ✅

### Changes Made
1. **Schema & Validator Updates**: Added `isMinigame` (optional boolean, defaults to `false` in schema) to the `Project` model, Zod validation schemas (POST/PATCH), and TypeScript types.
2. **Dashboard UI Toggle**: Added a styled checkbox for "Is this an interactive Minigame?" in both the Create and Update project modals in the member dashboard, binding the state to POST/PATCH request payloads.
3. **Games Catalog Restructuring**:
   - Filtered the game gallery list into `miniGames` and `regularGames`.
   - Rendered a dedicated "Mini Games" section between the Carousel/Gallery and the "Complete Collection" catalog.
   - Designed a clean empty state card to show if no mini-games exist.
   - Updated the "Complete Collection" catalog to only map over `regularGames`.
4. **Floating Overlay Leaderboard**:
   - Wired the Trophy button in the game iframe header.
   - Embedded a slide-out glassmorphic leaderboard panel inside the full-screen game overlay portal, loading and displaying ranking data for the currently playing game on demand.

---

## Cumulative Files Modified

| Component | Action | File |
|-----------|--------|------|
| **Core Types** | MODIFIED | `next/src/lib/types/domain.types.ts` |
| **Core Types** | MODIFIED | `next/src/lib/types/service.types.ts` |
| **Validators** | MODIFIED | `next/src/lib/validators/game.validator.ts` |
| **Validators** | MODIFIED | `next/src/lib/validators/project.validator.ts` |
| **Database Models** | MODIFIED | `next/src/lib/database/models/gameUser.model.ts` |
| **Database Models** | MODIFIED | `next/src/lib/database/models/score.model.ts` |
| **Database Models** | MODIFIED | `next/src/lib/database/models/project.model.ts` |
| **Database Models** | NEW | `next/src/lib/database/models/gameAuthCode.model.ts` |
| **Database Repos** | MODIFIED | `next/src/lib/database/repos/score.repo.ts` |
| **Database Repos** | NEW | `next/src/lib/database/repos/gameAuthCode.repo.ts` |
| **Backend Services** | DELETED | `next/src/lib/services/gameAuth.service.ts` |
| **Backend Services** | MODIFIED | `next/src/lib/services/gameProfile.service.ts` |
| **Backend Services** | MODIFIED | `next/src/lib/services/score.service.ts` |
| **Backend Services** | NEW | `next/src/lib/services/gameSession.service.ts` |
| **API Endpoints** | DELETED | `next/src/app/api/game/login/route.ts` |
| **API Endpoints** | NEW | `next/src/app/api/game/session/exchange/route.ts` |
| **API Endpoints** | NEW | `next/src/app/api/game/session/generate-code/route.ts` |
| **Frontend Setup** | NEW | `next/src/app/game-auth/page.tsx` |
| **Frontend Setup** | MODIFIED | `next/src/app/auth/sign-in/LoginClient.tsx` |
| **Frontend Types** | MODIFIED | `next/src/app/types/domain.types.ts` |
| **Frontend Pages** | MODIFIED | `next/src/app/dashboard/page.tsx` |
| **Frontend Pages** | MODIFIED | `next/src/app/games/page.tsx` |
| **Frontend Pages** | MODIFIED | `next/src/app/games/component/GameClient.tsx` |
| **Documentation** | MODIFIED | `prompts/LEADERBOARD_BACKEND_MAP.md` |
