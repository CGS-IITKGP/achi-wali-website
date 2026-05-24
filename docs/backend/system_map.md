# Backend System Map

This document summarizes the backend architecture as implemented in the Next.js app router.

## High-level architecture

- Next.js app router provides API routes under `next/src/app/api/**`.
- Route handlers call a shared handler factory in `next/src/lib/handler.ts`.
- Input is validated with Zod schemas in `next/src/lib/validators/**`.
- Business logic is implemented in services in `next/src/lib/services/**`.
- Data access is via Mongoose models and repository classes in `next/src/lib/database/**`.
- Responses are normalized by `ResponseHandler` in `next/src/lib/utils/responseHandler.ts`.

## Request lifecycle

1. API route handler runs (e.g. `GET /api/project`).
2. `createHandler` (aka the default export from `lib/handler.ts`) performs:
   - Session extraction when `requireAuth` is true.
   - JSON body parsing for POST/PUT/PATCH/DELETE.
   - `dataUnifier` merge for query params or URL params.
   - Zod validation using the schema passed from validator files.
3. The service executes and returns `{ success, data }` or `{ success: false, errorCode }`.
4. `ResponseHandler` maps success/failure to a consistent JSON shape and status code.

## API route map

Auth

- `POST /api/auth/sign-in` -> `authService.signIn` (sets session cookie)
- `POST /api/auth/sign-out` -> `authService.signOut` (overwrites session cookie)
- `POST /api/auth/sign-up` -> `authService.signUp` (request, resend, verify) (deprecated)
- `PATCH /api/auth/change-password` -> `authService.changePassword`
- `GET /api/auth/me` -> `authService.me`
- `POST /api/auth/refresh-session` -> `authService.refreshSession` (force-dynamic)
- `GET /api/auth/google` -> redirect to Google OAuth
- `GET /api/auth/google/callback` -> `authService.googleOAuth` (sets cookie, redirects)

Blog

- `GET /api/blog` -> `blogService.get` (target=all or my)
- `POST /api/blog` -> `blogService.create`
- `PATCH /api/blog/:id` -> `blogService.update`
- `DELETE /api/blog/:id` -> `blogService.remove`
- `GET /api/blog/view/:slug` -> `blogService.get` (target=by_slug)

Project

- `GET /api/project` -> `projectService.get` (target + portfolio)
- `POST /api/project` -> `projectService.create`
- `PATCH /api/project/:id` -> `projectService.update`
- `DELETE /api/project/:id` -> `projectService.remove`

Team

- `GET /api/team` -> `teamService.get` (target=all|all_as_list)
- `POST /api/team` -> `teamService.create`
- `GET /api/team/:id` -> `teamService.get` (target=one)
- `PATCH /api/team/:id` -> `teamService.update`
- `DELETE /api/team/:id` -> `teamService.remove`

User

- `GET /api/user` -> `userService.get` (target=all|public_all|public_single)
- `PATCH /api/user` -> `userService.update`
- `DELETE /api/user` -> `userService.remove`
- `PATCH /api/user/assign` -> `userService.updateAssignment`
- `PATCH /api/user/team` -> `userService.updateTeam`

Featured

- `GET /api/featured` -> `featuredService.get` (target=blog|game|graphics|rnd|highlight|all_as_list)
- `POST /api/featured` -> `featuredService.create`
- `DELETE /api/featured/:id` -> `featuredService.remove`

Media

- `GET /api/media` -> `mediaService.get`
- `POST /api/media` -> `mediaService.create`
- `POST /api/media/sign` -> `mediaService.sign`
- `DELETE /api/media/:id` -> `mediaService.remove` (force-dynamic)

Misc

- `GET /api/misc/health` -> DB + SMTP health probe

## Database layer

- Mongoose connection cached globally via `global.mongooseCache`.
- `connectToDatabase()` initializes on first use and reuses the promise.
- `withSession()` wraps operations in a transaction and provides a `ClientSession`.
- Collections/models:
  - User, Team, Project, Blog, Featured, Media, SignUpRequest
- Repositories wrap common CRUD and add export-specific queries.

## Authentication

- Sessions use a JWT stored in a `session` cookie.
- JWT is generated and verified with `jose` and `BACKEND_JWT_SECRET_KEY`.
- `authService.extractSession()` reads the cookie, validates the token, and fetches the user.
- Role checks are done in service layers (ADMIN, MEMBER, etc).
- Route access control uses the Next middleware entrypoint implemented in `next/src/proxy.ts`.
- OTP-based sign-up uses a `SignUpRequest` collection with TTL index on `expiresAt` (deprecated path).

## Utilities

- `ResponseHandler` standardizes JSON responses and cookie/redirect handling.
- `envVariable` enforces a `BACKEND_` prefix for server environment variables.
- `cookieOptions.jwt` uses `BACKEND_HTTPS_ENFORCED` to decide `secure`.
- `cloudinary` helper configures Cloudinary client.
- `email` helper configures Nodemailer SMTP and can verify connection.
- `logger` uses `BACKEND_LOG_LEVEL` to filter logs.

## Environment variables (observed)

BACKEND_MONGODB_CONNECTION_URI
BACKEND_JWT_SECRET_KEY
BACKEND_HTTPS_ENFORCED
BACKEND_LOG_LEVEL
BACKEND_SMTP_HOST
BACKEND_SMTP_PORT
BACKEND_SMTP_USERNAME
BACKEND_SMTP_PASSWORD
BACKEND_SMTP_FROM
BACKEND_CLOUDINARY_CLOUD_NAME
BACKEND_CLOUDINARY_API_KEY
BACKEND_CLOUDINARY_API_SECRET
BACKEND_GOOGLE_OAUTH_CLIENT_ID
BACKEND_GOOGLE_OAUTH_CLIENT_SECRET
BACKEND_GOOGLE_OAUTH_REDIRECT_URI
BACKEND_GOOGLE_OAUTH_SUCCESSFUL_REDIRECT

Public (used in auth redirect):
NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID
NEXT_PUBLIC_GOOGLE_OAUTH_REDIRECT_URI

## Notes and deprecations

- The email/password sign-up flow under `POST /api/auth/sign-up` is deprecated. Google OAuth is the supported path.
- Team cover image fields are no longer used and have been removed from the model/service.
- Team member changes are handled via the user endpoints (not a team members endpoint).
- `PATCH /api/user/team` accepts a nullable `teamId` to unassign a user from a team.
- Use `createHandler` for all new routes; the older `createServiceOnlyHandler` name is legacy.
