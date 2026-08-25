# Migration Prompts — v1 (password-based game login) → v2 (token-based, code-exchange login)

> **How to use this file (read this part yourself, don't paste it to the agent):**
> Send ONE phase at a time to the coding agent, in a separate message each time, in
> order (0, 1, 2, 3, 4, 5). Do not paste multiple phases together — the agent (Gemini
> Flash in Antigravity) has a small context window and will lose track or skip steps
> if given too much at once, even within a single phase. Each phase below is written
> to be fully self-contained — it restates whatever context it needs rather than
> assuming the agent remembers earlier phases, since it likely won't.
>
> You have full read/write access to the codebase. Make the changes, run the checks,
> and move on — do not stop to ask questions or wait for confirmation before acting.
> Report what you did AFTER doing it, not before. Do not run `git add` or `git push`
> at any point — that happens manually, after all phases are done, by a human.
>
> Reference docs for this whole migration (LEADERBOARD_BACKEND_MAP.md, idea.md,
> MIGRATION_PLAN.md, and this file) live in the repo at `achi-waliwebsite/prompts/`. Skim them
> once at the start of EACH phase for context, even if you looked at them in an
> earlier phase — do not rely on memory of a previous phase's reading.

---

## Phase 0 — Orientation only. Make ZERO code changes in this phase.

```
This is a multi-phase migration. This is Phase 0 of 6 (0 through 5). Do not write
or edit any code in this phase — this phase is read-only investigation.

Read these reference files, all located in achi-waliwebsite/prompts/:
- LEADERBOARD_BACKEND_MAP.md — the current, already-working, already-verified
  state of the game backend (as of 2026-08-10). It includes GET /api/game/list,
  a scoreStr field alongside score, and a 3-second rate-limit cooldown. Treat
  everything described in this file as ALREADY BUILT AND WORKING unless a later
  phase explicitly tells you to change it.
- idea.md — the TARGET architecture this migration is moving toward. Key point:
  password-based game login is being replaced with a redirect-based login where
  the game never handles a password or a raw username directly — it only ever
  receives a short-lived, single-use code from the website, which it exchanges
  for a signed token. The token (not a username string) is what proves identity
  for every action after that, including score submission.
- MIGRATION_PLAN.md — the file-by-file task breakdown for this migration.

Also open and read the real, current implementation (not just the docs) of:
- next/src/app/api/auth/google/callback/route.ts (or find it if the path
  differs — search for the Google OAuth callback route)
Confirm: does this route redirect to a FIXED URL read from an environment
variable (e.g. GOOGLE_OAUTH_SUCCESSFUL_REDIRECT), with no way to pass extra
query parameters or state through the Google login round-trip? This matters
for Phase 4 later.

After reading everything above, write a short summary (a few sentences) covering:
1. What currently exists for game login (the password-based flow) that will be
   REMOVED.
2. What currently exists (score submission, leaderboard, game list, rate
   limiting) that must NOT be touched by this migration.
3. What is NEW and needs to be built (the code-exchange mechanism).
4. Whether the Google OAuth callback redirects to a fixed URL as described above.

Do not make any file changes in this phase. Just report the summary.
```

---

## Phase 1 — Delete the password-based login. No new files in this phase.

```
This is Phase 1 of 6 in an ongoing migration (game login is moving from
password-based to a token/code-exchange system). If you have not already read
achi-waliwebsite/prompts/LEADERBOARD_BACKEND_MAP.md, idea.md, and MIGRATION_PLAN.md, skim
them now before starting — they explain the full context. In this phase, only
DELETE and TRIM existing password-related code. Do not create any new files —
that happens in a later phase.

Do exactly this:
1. Delete next/src/app/api/game/login/route.ts entirely.
2. Delete next/src/lib/services/gameAuth.service.ts entirely. Before deleting,
   search the whole codebase for anywhere this file is imported (check
   next/src/lib/handler.ts and any route files) and remove those import lines
   and any code that calls into it.
3. In next/src/lib/validators/game.validator.ts, remove only the `login`
   validation schema. Leave every other schema in that file (createScore,
   getScore, etc.) completely untouched.
4. In next/src/lib/database/models/gameUser.model.ts, remove the
   `passwordHash` field from the schema.
5. In next/src/lib/types/domain.types.ts, remove any `passwordHash`-related
   field from IGameUser and GameUserCreateType (or equivalent type names —
   search for "passwordHash" across the types file to find all occurrences).
6. Search the codebase for ESECs.INVALID_CREDENTIALS. If it is used ONLY by
   the game login you just deleted, remove it from the ESECs enum and from
   handler.ts's error mapping. If it is ALSO used anywhere else (for example
   the main website's own separate login system, if one exists), leave it
   completely alone and do not remove it — only remove the game-specific
   usage of it.

Explicitly do NOT modify these files in this phase — they are unrelated and
already correct: score.service.ts, score.repo.ts, any game list service or
route, the GET handler for /api/game/score, anything related to a scoreStr
field, response caching, or rate-limit fields on GameUser.

After making these changes, run `npx tsc --noEmit` and then `npm run build`.
It is EXPECTED that this will show errors related to gameProfile.service.ts
and its route file, because those still reference the old password-based
shape — that gets fixed in the next phase, so those specific errors are fine
to see right now. Report the full error output and confirm whether the ONLY
errors are related to gameProfile.service.ts / the profile route, or whether
there are OTHER unexpected errors — if there are unexpected errors elsewhere,
stop and report them clearly instead of trying to fix them yourself.
```

---

## Phase 2 — Repurpose the profile endpoint. Remove password, keep username logic.

```
This is Phase 2 of 6 in an ongoing migration (game login is moving from
password-based to a token/code-exchange system). Phase 1, completed just
before this one, already deleted the password-based login route and service.
If you have not already read achi-waliwebsite/prompts/LEADERBOARD_BACKEND_MAP.md, idea.md,
and MIGRATION_PLAN.md, skim them now — they explain the full context.

The existing "game profile" feature lets a logged-in website user set a game
username. In v1 it also collected a password; that is being removed in this
phase. The username-uniqueness-checking logic (rejecting a username someone
else already has, returning a 409 Conflict) is NOT being removed — keep that
exactly as it currently works.

Do exactly this:
1. In next/src/lib/services/gameProfile.service.ts, find the function that
   creates or updates a game profile (likely named something like `upsert`).
   Remove `password` from its input type/parameters entirely. Remove any code
   that hashes or stores a password. Keep everything else in this function
   the same, including the username-uniqueness check and the 409 error it
   returns when a username is already taken.
2. In next/src/app/api/game/profile/route.ts (or wherever this route
   currently lives — search for it if the path differs), and in its
   corresponding Zod validator schema (in game.validator.ts), remove the
   `password` field from request body validation. Keep the `username` field
   validation exactly as it is.
3. Do NOT rename this route or change its URL path in this phase — leave it
   at whatever path it currently uses. A path rename is a separate decision
   for later, not part of this phase.
4. Leave the GET (status-check) endpoint for checking whether a profile
   already exists completely alone — it doesn't reference password at all
   and needs no changes.

After making these changes, run `npx tsc --noEmit` and then `npm run build`.
Both should now pass with zero errors, including the gameProfile-related
errors that were expected (and explained) in Phase 1. Report the full output.
If there are still errors, report them clearly — do not guess-fix anything
outside the scope of this phase.
```

---

## Phase 3 — Build the new code-exchange mechanism. New files only, nothing deleted.

```
This is Phase 3 of 6 in an ongoing migration (game login is moving from
password-based to a token/code-exchange system). Phases 1 and 2 already
removed all password-related code. If you have not already read
achi-waliwebsite/prompts/LEADERBOARD_BACKEND_MAP.md, idea.md, and MIGRATION_PLAN.md, skim
them now — they explain the full context, especially idea.md's Section 6
which describes the exact data model for what you're building in this phase.

The goal: the game will receive a short-lived, single-use, random code (NOT
a username, NOT a password) from the website after a real login. The game
sends that code to the backend once, and gets back a signed token in
exchange. That token is what the game uses for everything after — including
score submission, which already works and is not being touched here.

Do exactly this:

1. Create next/src/lib/database/models/gameAuthCode.model.ts — a new
   Mongoose model with these fields:
   - code: String, required, unique, indexed
   - gameUserId: ObjectId, ref: 'GameUser', required
   - gameId: String, required
   - used: Boolean, default false
   - expiresAt: Date, required
   Add a MongoDB TTL index so expired documents are automatically deleted:
   schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
   Follow the same file structure/conventions as the existing
   next/src/lib/database/models/gameUser.model.ts for consistency (imports,
   export style, hot-reload guard pattern if one is used there).

2. Create next/src/lib/database/repos/gameAuthCode.repo.ts — a new
   repository, following the exact same class structure and conventions as
   next/src/lib/database/repos/gameUser.repo.ts (extend the same
   GenericRepository base class, use the same ensureDbConnection() pattern
   if that repo uses one). It needs two methods:
   - create(gameUserId, gameId): generates a random code with high entropy
     (32 random bytes, base64url-encoded — use Node's built-in `crypto`
     module, not a new dependency), sets expiresAt to 60 seconds from now,
     and inserts the document. Returns the created document (or at least
     the code string).
   - findValidAndConsume(code): looks up a document matching
     { code, used: false, expiresAt: { $gt: new Date() } } and atomically
     marks it used in the SAME database operation, using Mongoose's
     findOneAndUpdate with { $set: { used: true } }. This MUST be a single
     atomic call, not a separate find() followed by a separate update() —
     doing it in two steps would allow the same code to be used twice if two
     requests arrive at nearly the same time. Return the matched document,
     or null if nothing matched.

3. Create next/src/lib/services/gameSession.service.ts — a new domain
   service, following the same file structure/conventions as
   next/src/lib/services/score.service.ts (or gameProfile.service.ts).
   It needs one function, `exchange`, which:
   - Accepts { gameAuthCode: string }
   - Calls gameAuthCodeRepository.findValidAndConsume(gameAuthCode)
   - If nothing was found (code missing, expired, or already used), returns
     an error using the EXISTING ESECs.INVALID_GAME_TOKEN error code — do
     NOT create a new error code for this, reuse this existing one, since it
     already means "your credential to access the game is invalid."
   - If found, looks up the linked GameUser record (via gameUserId on the
     consumed code document).
   - Generates a gameToken by calling jwt.core.service.ts's
     generateJWToken function. Find how the OLD gameAuth.service.ts (which
     you deleted in Phase 1 — check git history or the MIGRATION_PLAN.md
     description of it if you can't find it in the working tree anymore)
     used to call this function with a customSecretKey argument sourced
     from getGameSecretKey() in next/src/lib/utils/secret.ts. Use the exact
     same pattern — same secret source, same JWT payload shape (should
     include at least the player's id and username), so that the token this
     new function produces is indistinguishable in shape from what the old
     login endpoint used to produce. You can also check
     next/src/lib/services/score.service.ts, which verifies these tokens
     and will show you the exact expected shape.
   - Returns { userId, username, gameToken } — this exact shape, matching
     what the old (now-deleted) login endpoint used to return, so that
     nothing downstream needs to change.

4. Create next/src/app/api/game/session/exchange/route.ts — a new API
   route. Follow the same conventions as next/src/app/api/game/score/route.ts
   for how routes in this app are structured (createHandler wrapper, etc.).
   This should be a POST route with requireAuth: false (it doesn't need a
   website session cookie — its security comes from the code itself being
   short-lived and single-use, not from a login check). Wire it to call
   gameSessionServices.exchange with the request body.

After making these changes, run `npx tsc --noEmit` and then `npm run build`.
Report the full output and confirm pass or fail. If there are errors, report
them clearly rather than guessing at fixes outside this phase's scope.
```

---

## Phase 4 — Build the website's `/game-auth` redirect/login page.

```
This is Phase 4 of 6 in an ongoing migration (game login is moving from
password-based to a token/code-exchange system). Phase 3, completed just
before this one, built the backend code-exchange mechanism
(gameAuthCode model/repo, gameSession.service.ts, and
POST /api/game/session/exchange). If you have not already read
achi-waliwebsite/prompts/LEADERBOARD_BACKEND_MAP.md, idea.md, and MIGRATION_PLAN.md, skim
them now — they explain the full context.

The remaining piece: a website page that a player lands on when they try to
play a game without being logged in yet (or without having set a game
username yet). This page is what actually generates the short-lived code
from Phase 3 and sends the player back into the game with it.

Important constraint confirmed in Phase 0: the existing Google OAuth login
callback (search for it under next/src/app/api/auth/google/ or similar if
the exact path isn't obvious) redirects to a FIXED URL from an environment
variable, with no support for passing extra data like a game ID through the
Google login round-trip. Do NOT modify that Google OAuth callback route
directly — it's shared by every website login, not just game players, and
changing it risks breaking normal website login. Instead, work around this
using a same-origin cookie (this works fine because both the pre-login page
and the post-login page are on our own domain — the iframe/cookie problem
this whole migration deals with only applies to the itch.io-embedded game
page, not to normal navigation on our own website).

Do exactly this:

1. Create a new page in this Next.js app's page router for a route at
   /game-auth (exact file path depends on this app's router setup — look at
   how an existing simple page, like the /profile page if the old one still
   exists as reference, or any other top-level page, is structured, and
   match that convention. Likely next/src/app/game-auth/page.tsx).

2. On page load, read two query string parameters: `gameId` and `returnTo`.

3. Check if there is an active website login session (use whatever
   session-check mechanism other authenticated pages on this site already
   use — look at how the existing /profile page or dashboard page checks
   for a logged-in session, and match that exact pattern).

4. If NOT logged in: before sending the user to the existing Google login
   entry point, set a short-lived cookie (readable by client-side JS is
   fine, since this never leaves our own domain) storing the gameId and
   returnTo values as JSON or as two separate cookies. Then redirect to the
   existing Google OAuth login entry point. After Google login completes and
   the user lands back on the fixed redirect URL from the env var, that
   landing page (or a small piece of logic added to it) should check for
   this cookie — if present, read the gameId/returnTo values from it, delete
   the cookie, and continue the flow described in step 5 below (you may need
   to redirect from the fixed landing page back to /game-auth with the
   gameId/returnTo now restored as query parameters, to keep the rest of the
   logic in one place).

5. Once a session exists (whether they just logged in or already had one):
   call the existing profile status-check endpoint (GET /api/game/profile,
   or wherever Phase 2 left it) to see if this website user already has a
   linked game username.
   - If NOT linked yet: show a simple form with a single username text
     input. On submit, call the existing POST /api/game/profile endpoint
     (which after Phase 2 no longer needs a password) to create the link.
     Handle a 409 response (username already taken) by showing that error
     next to the input and letting them try a different username — do not
     let this crash the page.
   - If already linked: skip straight to step 6.

6. Once linked, call POST /api/game/session/exchange is NOT what generates
   the code — the exchange endpoint is what the GAME calls later, using the
   code. This page/step needs to directly call
   gameAuthCodeRepository.create(gameUserId, gameId) (either via a small new
   server action, or a new minimal internal API route if this app's
   conventions require an API route rather than a direct server-side call
   from a page — match whatever pattern this app already uses for
   authenticated server-side actions triggered from a page) to generate a
   fresh code tied to this GameUser and the gameId from step 2.

7. Redirect the browser to `${returnTo}?gameAuthCode=${code}` (the `returnTo`
   value from step 2, with the newly generated code appended as a query
   parameter). This sends the player back into the actual game (likely an
   itch.io embed URL), which will then read `gameAuthCode` from its own page
   URL and call POST /api/game/session/exchange itself to get a real
   gameToken — that part is the game client's job, not something to build
   here on the website side.

After finishing, write a short report explaining exactly which approach you
used for carrying gameId/returnTo through the Google login redirect (cookie
name, what it stores, where it gets read and cleared) since this is the one
part of this migration with no existing pattern in the codebase to copy from
— be specific so this can be reviewed.

Run `npx tsc --noEmit` and then `npm run build`. Report the full output and
confirm pass or fail.
```

---

## Phase 5 — Verify everything end-to-end, then update the docs. No shortcuts here.

```
This is Phase 5 of 6, the final phase, in an ongoing migration (game login
moved from password-based to a token/code-exchange system across Phases
1 through 4). If you have not already read achi-waliwebsite/prompts/LEADERBOARD_BACKEND_MAP.md,
idea.md, and MIGRATION_PLAN.md, skim them now.

Part A — Real integration test, not just a type-check.

Write a temporary script at scripts/tmp-migration-check.ts. Follow the exact
same safety pattern used in an earlier verification pass for this project
(if you have access to git history, look for a prior temporary script named
something like tmp-e2e-check.ts for the pattern to copy — direct service
calls, not HTTP requests):
- Connect to the database using this project's existing connection helper
  (the same one every service already uses).
- Before writing ANYTHING, check the connected database name. If it is not
  literally "test", abort immediately with a clear error message and do not
  create any data. Never run this against a database that isn't named "test".
- Create one throwaway fake GameUser record directly (with a clearly fake
  username like "migration_test_<timestamp>").
- Use the new gameAuthCode repository's create() function to generate a code
  for that fake GameUser and a fake gameId like "migration-test-game".
- Call gameSessionServices.exchange({ gameAuthCode: <that code> }) and
  confirm it returns a valid gameToken. Print the result.
- Call gameSessionServices.exchange AGAIN with the exact same code. Confirm
  this second call now FAILS (this proves a code cannot be used twice —
  this is a critical security property, not optional). Print the result.
- Using the gameToken from the first successful exchange, call the EXISTING
  (unmodified) scoreServices.create function to submit a test score, and
  then scoreServices.get to confirm it appears in the leaderboard for that
  gameId. This proves the new login mechanism produces a token that still
  works correctly with the untouched score-submission system. Print both
  results.
- In a finally block, delete the fake GameUser record, the gameAuthCode
  document (if it still exists), and the Score document created during the
  test. Re-query for all three afterward and print "VERIFIED DELETED" or
  "STILL EXISTS" for each one explicitly — do not just trust that the
  delete calls succeeded silently.

Run this script (check package.json or prior usage for the exact command,
likely something like `npx tsx --env-file=.env scripts/tmp-migration-check.ts`).
Report the FULL raw output, not a summary. After confirming everything
passed and all three "VERIFIED DELETED" lines are present, delete
scripts/tmp-migration-check.ts — it must not remain in the repository.

Part B — Update the documentation.

In achi-waliwebsite/prompts/LEADERBOARD_BACKEND_MAP.md, update the "🎮 Game Client
Developer" section: replace the description of the old password-based login
(POST /api/game/login with identifier + password) with the new flow — the
game receives a gameAuthCode via its page URL (appended by the website after
a successful login+username-setup), and calls
POST /api/game/session/exchange with { gameAuthCode } to receive
{ userId, username, gameToken }. Leave the anti-cheat signature computation
and score submission steps in that document completely unchanged — only the
login/authentication step is being rewritten. Add a dated changelog entry at
the top of the document briefly describing this migration.

After finishing, run `npx tsc --noEmit` and `npm run build` one final time
and report the full output. This is the last phase — after this, a human
will manually review the full diff, stage files, commit, and push. Do not
run any git commands yourself in this phase.
```