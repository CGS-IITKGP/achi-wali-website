# 📘 API Documentation

> **Base URL:** `/api`
>
> **Generated from:** `src/app/api/**/route.ts` and `src/lib/validators/*.validator.ts`
>
> **Response Handler:** `src/lib/utils/responseHandler.ts`

---

## Table of Contents

- [Response Envelope Convention](#response-envelope-convention)
- [Authentication](#authentication)
- **Auth**
  - [GET /api/auth/me](#get-apiauthme)
  - [POST /api/auth/sign-in](#post-apiauthsign-in)
  - [POST /api/auth/sign-up](#post-apiauthsign-up)
  - [POST /api/auth/sign-out](#post-apiauthsign-out)
  - [POST /api/auth/refresh-session](#post-apiauthrefresh-session)
  - [PATCH /api/auth/change-password](#patch-apiauthchange-password)
  - [GET /api/auth/google](#get-apiauthgoogle)
  - [GET /api/auth/google/callback](#get-apiauthgooglecallback)
- **Blog**
  - [GET /api/blog](#get-apiblog)
  - [POST /api/blog](#post-apiblog)
  - [GET /api/blog/view/:slug](#get-apiblogviewslug)
  - [PATCH /api/blog/:_id](#patch-apiblog_id)
  - [DELETE /api/blog/:_id](#delete-apiblog_id)
- **Project**
  - [GET /api/project](#get-apiproject)
  - [POST /api/project](#post-apiproject)
  - [PATCH /api/project/:_id](#patch-apiproject_id)
  - [DELETE /api/project/:_id](#delete-apiproject_id)
- **Team**
  - [GET /api/team](#get-apiteam)
  - [POST /api/team](#post-apiteam)
  - [GET /api/team/:_id](#get-apiteam_id)
  - [PATCH /api/team/:_id](#patch-apiteam_id)
  - [DELETE /api/team/:_id](#delete-apiteam_id)
- **User**
  - [GET /api/user](#get-apiuser)
  - [PATCH /api/user](#patch-apiuser)
  - [DELETE /api/user](#delete-apiuser)
  - [PATCH /api/user/assign](#patch-apiuserassign)
  - [PATCH /api/user/team](#patch-apiuserteam)
- **Featured**
  - [GET /api/featured](#get-apifeatured)
  - [POST /api/featured](#post-apifeatured)
  - [DELETE /api/featured/:_id](#delete-apifeatured_id)
- **Media**
  - [GET /api/media](#get-apimedia)
  - [POST /api/media](#post-apimedia)
  - [POST /api/media/sign](#post-apimediasign)
  - [DELETE /api/media/:id](#delete-apimediaid)
- **Misc**
  - [GET /api/misc/health](#get-apimischealth)
- **Game** 
  - [POST /api/game/login](#post-apigamelogin)
  - [POST /api/game/score](#post-apigamescore)
  - [GET /api/game/score](#get-apigamescore)
  - [GET /api/game/list](#get-apigamelist)
  - [GET /api/game/profile](#get-apigameprofile)
  - [POST /api/game/profile](#post-apigameprofile)

---

## Response Envelope Convention

Every response from the `createHandler` pipeline follows this envelope:

| Field     | Type              | Description                                                                 |
|-----------|-------------------|-----------------------------------------------------------------------------|
| `action`  | `true \| false \| null` | `true` = success, `false` = client error, `null` = server failure      |
| `data`    | `object`          | Present only when `action` is `true`.                                       |
| `message` | `string`          | Present only when `action` is `false`. Human-readable error description.    |
| `errors`  | `string[]`        | Present only when `action` is `false` and Zod validation errors occurred. Each string follows the format `fieldPath$ error message`. |

> **Validator reference:** `src/lib/validators/core.validator.ts`
> Validation errors are formatted as `path$ message` — e.g. `"email$ Invalid email"`.

---

## Authentication

Authentication is session-based using HTTP-only JWT cookies.

- The cookie name is defined in `src/lib/config/constants.ts` as `SESSION_COOKIE_NAME`.
- Clients must send requests with `withCredentials: true` so the browser attaches the session cookie.
- When `requireAuth: true`, the handler calls `authService.extractSession(req)` and returns `401 Unauthorized` if no valid session is found.

---

## Auth

---

### `GET` /api/auth/me

- **Description:** Returns the currently authenticated user's profile data from the session token.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `authValidator.me` → `z.object({})` *(no body required)*
- **Expected JSON Body Fields:** *None.*
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "John Doe",
        "email": "john@example.com",
        "profileImgUrl": "https://res.cloudinary.com/...",
        "phoneNumber": "+919876543210",
        "links": [
          { "text": "GitHub", "url": "https://github.com/johndoe" }
        ],
        "teamId": "665f1a2b3c4d5e6f7a8b9c0e",
        "designation": "SENIOR",
        "roles": ["MEMBER", "ADMIN"]
      }
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):** Sent if the session cookie is missing or the JWT is invalid/expired.

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/auth/sign-in

- **Description:** Authenticates a user with email and password. On success, sets an HTTP-only JWT session cookie.
- **Authentication Required:** `False`
- **Validator Schema:** `authValidator.signIn` — see `src/lib/validators/auth.validator.ts`
- **Expected JSON Body Fields:**

  | Field      | Type     | Rules                        | Required |
  |------------|----------|------------------------------|----------|
  | `email`    | `string` | Valid email, max 255 chars, lowercased | Yes |
  | `password` | `string` | Max 255 chars                | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):** A session cookie (`Set-Cookie` header) is set. Body contains no user data.

    ```json
    {
      "action": true,
      "data": {}
    }
    ```

  - **Validation Error ( `400 Bad Request` ):** Sent if fields are missing or malformed.

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["email$ Invalid email", "password$ Required"]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):** Sent if credentials don't match any user.

    ```json
    {
      "action": false,
      "message": "Invalid credentials."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/auth/sign-up

- **Description:** Handles multi-step sign-up: requesting an account (sends OTP), resending OTP, or verifying OTP. The `target` field controls the action.
- **Authentication Required:** `False`
- **Validator Schema:** `authValidator.signUp` — see `src/lib/validators/auth.validator.ts`
- **Expected JSON Body Fields:**

  | Field      | Type     | Rules                                                    | Required                                           |
  |------------|----------|----------------------------------------------------------|----------------------------------------------------|
  | `target`   | `string` | Enum: `"request"`, `"resend_otp"`, `"verify"`            | Yes                                                |
  | `email`    | `string` | Valid email, max 255 chars, lowercased                   | Yes                                                |
  | `name`     | `string` | Max 255 chars, trimmed                                   | Required when `target` = `"request"`               |
  | `password` | `string` | Max 255 chars                                            | Optional                                           |
  | `otp`      | `string` | Exactly 6 digits (`/^\d{6}$/`)                           | Required when `target` = `"resend_otp"` or `"verify"` |

  > **Refinement:** A cross-field `.refine()` ensures `name` is present for `"request"` and `otp` is present for `"resend_otp"` / `"verify"`.

- **Expected Responses:**

  - **Success ( `200 OK` ):** Action completed (OTP sent, or account verified).

    ```json
    {
      "action": true,
      "data": {
        "message": "OTP sent to your email."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):** Sent if required fields for the target action are missing or invalid.

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["name, otp$ Missing required fields based on action type"]
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if the email is already registered.

    ```json
    {
      "action": false,
      "message": "Email is already taken."
    }
    ```

  - **Not Found Error ( `404 Not Found` ):** Sent if a sign-up request for the email doesn't exist (e.g. during OTP verification).

    ```json
    {
      "action": false,
      "message": "Sign-up request not found."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/auth/sign-out

- **Description:** Signs the user out by clearing/overwriting the session cookie. Despite `requireAuth: false` in the handler config, the service internally handles the session.
- **Authentication Required:** `False` (handler-level), but the session cookie is expected for a meaningful sign-out.
- **Validator Schema:** `authValidator.signOut` → `z.object({})` *(no body required)*
- **Expected JSON Body Fields:** *Empty object `{}` required (POST body must be valid JSON).*
- **Expected Responses:**

  - **Success ( `200 OK` ):** The session cookie is overwritten/cleared via `Set-Cookie` header.

    ```json
    {
      "action": true,
      "data": {}
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/auth/refresh-session

- **Description:** Refreshes the current JWT session. Issues a new session cookie with an updated expiry.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `authValidator.refreshSession` → `z.object({})` *(no body required)*
- **Expected JSON Body Fields:** *Empty object `{}` required (POST body must be valid JSON).*
- **Expected Responses:**

  - **Success ( `200 OK` ):** A fresh session cookie (`Set-Cookie` header) is set. Body contains no user data.

    ```json
    {
      "action": true,
      "data": {}
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):** Sent if the session cookie is missing, expired, or invalid.

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `PATCH` /api/auth/change-password

- **Description:** Updates the authenticated user's account password securely.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `authValidator.changePassword` — see `src/lib/validators/auth.validator.ts`
- **Expected JSON Body Fields:**

  | Field         | Type     | Rules          | Required |
  |---------------|----------|----------------|----------|
  | `password`    | `string` | Max 255 chars — The user's current password to verify identity. | Yes |
  | `newPassword` | `string` | Max 255 chars — The new password they want to set. | Yes |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "Password updated successfully."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):** Sent if the passwords don't meet length criteria or fields are missing.

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["newPassword$ String must contain at most 255 character(s)"]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):** Sent if the user isn't logged in, or if their `password` doesn't match what's in the database.

    ```json
    {
      "action": false,
      "message": "Unauthorized access or incorrect current password."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `GET` /api/auth/google

- **Description:** Initiates Google OAuth 2.0 flow. Redirects the client to Google's consent screen. This is **not** a `createHandler` route — it directly builds a Google auth URL and performs a `302 redirect`.
- **Authentication Required:** `False`
- **Expected Inputs:** *None.* Simply navigate the browser to this URL.
- **Expected Responses:**

  - **Success ( `302 Redirect` ):** Redirects to `https://accounts.google.com/o/oauth2/v2/auth` with the configured `client_id`, `redirect_uri`, `scope=openid email profile`, `response_type=code`, and `access_type=offline`.

  - **Server Error ( `500 Internal Server Error` ):** May occur if environment variables are not set.

    ```json
    {
      "action": null
    }
    ```

---

### `GET` /api/auth/google/callback

- **Description:** Handles the Google OAuth callback. Receives `code` and `scope` from Google's redirect, exchanges them for user info, and creates/authenticates the user. Sets a session cookie and redirects to the configured success page.
- **Authentication Required:** `False`
- **Validator Schema:** `authValidator.googleOAuth` — see `src/lib/validators/auth.validator.ts`
- **Data Unifier:** Extracts `code` and `scope` from URL query parameters.
- **Expected Query Params:**

  | Param  | Type     | Rules                                | Required |
  |--------|----------|--------------------------------------|----------|
  | `code`  | `string` | Trimmed, max 4095 chars (longString) | Yes      |
  | `scope` | `string` | Trimmed, max 4095 chars (longString) | Yes      |

- **Expected Responses:**

  - **Success ( `302 Redirect` ):** Sets a session cookie (`Set-Cookie` header) and redirects to the URL defined by the `GOOGLE_OAUTH_SUCCESSFUL_REDIRECT` environment variable. No JSON body is returned.

  - **Validation Error ( `400 Bad Request` ):** Sent if `code` or `scope` query params are missing.

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["code$ Required", "scope$ Required"]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):** Sent if the OAuth exchange with Google fails.

    ```json
    {
      "action": false,
      "message": "Google OAuth authentication failed."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## Blog

---

### `GET` /api/blog

- **Description:** Retrieves a list of blogs. The `target` query param controls the retrieval mode: all public blogs or only the authenticated user's blogs.
- **Authentication Required:** `False` (handler-level). However, if `target=my`, the service may internally require a session.
- **Validator Schema:** `blogValidator.get` — see `src/lib/validators/blog.validator.ts`
- **Data Unifier:** Extracts `target` from URL query parameters. Defaults to `"all"` if not provided or not `"my"`.
- **Expected Query Params:**

  | Param    | Type     | Allowed Values                               | Required |
  |----------|----------|----------------------------------------------|----------|
  | `target` | `string` | `"all"`, `"all_as_list"`, `"my"`, `"by_slug"` | No (defaults to `"all"`) |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": [
        {
          "_id": "665f1a2b3c4d5e6f7a8b9c0d",
          "title": "Getting Started with WebGL",
          "slug": "getting-started-with-webgl",
          "content": "Full blog content here...",
          "tags": ["webgl", "graphics"],
          "author": {
            "_id": "665f1a2b3c4d5e6f7a8b9c01",
            "name": "Jane Doe",
            "profileImgUrl": "https://res.cloudinary.com/..."
          },
          "collaborators": [],
          "coverImgUrl": "https://res.cloudinary.com/...",
          "createdAt": "2025-06-01T10:00:00.000Z",
          "updatedAt": "2025-06-02T12:00:00.000Z"
        }
      ]
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["target$ Invalid enum value. Expected 'all' | 'all_as_list' | 'my' | 'by_slug', received 'invalid'"]
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/blog

- **Description:** Creates a new blog post. The authenticated user becomes the author.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `blogValidator.create` — see `src/lib/validators/blog.validator.ts`
- **Expected JSON Body Fields:**

  | Field         | Type       | Rules                                                                      | Required |
  |---------------|------------|----------------------------------------------------------------------------|----------|
  | `title`       | `string`   | Trimmed, max 255 chars                                                     | Yes      |
  | `slug`        | `string`   | Trimmed, max 255 chars, URL-friendly (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`)       | Yes      |
  | `content`     | `string`   | Trimmed, max 50000 chars                                                   | Yes      |
  | `tags`        | `string[]` | Array of strings, each max 31 chars, lowercased                            | Yes      |
  | `coverImgUrl` | `string`   | Max 1023 chars, not nullable (media key reference)                         | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "title": "Getting Started with WebGL",
        "slug": "getting-started-with-webgl",
        "content": "Full blog content here...",
        "tags": ["webgl", "graphics"],
        "author": "665f1a2b3c4d5e6f7a8b9c01",
        "collaborators": [],
        "coverImgUrl": "media/cover-webgl",
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-01T10:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": [
        "slug$ Slug must be URL-friendly (lowercase letters, numbers, and hyphens only)",
        "content$ Required"
      ]
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if the slug is already in use.

    ```json
    {
      "action": false,
      "message": "Slug is already in use."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `GET` /api/blog/view/:slug

- **Description:** Retrieves a single blog post by its URL-friendly slug. Intended for the public-facing blog view page.
- **Authentication Required:** `False`
- **Validator Schema:** `blogValidator.get` — see `src/lib/validators/blog.validator.ts`
- **Data Unifier:** Extracts the `slug` from the URL path segment. Sets `target` to `"by_slug"` automatically.
- **Expected URL Params:**

  | Param  | Type     | Rules                          | Required |
  |--------|----------|--------------------------------|----------|
  | `slug` | `string` | URL path segment, max 255 chars | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "title": "Getting Started with WebGL",
        "slug": "getting-started-with-webgl",
        "content": "Full blog content here...",
        "tags": ["webgl", "graphics"],
        "author": {
          "_id": "665f1a2b3c4d5e6f7a8b9c01",
          "name": "Jane Doe",
          "profileImgUrl": "https://res.cloudinary.com/..."
        },
        "collaborators": [],
        "coverImgUrl": "https://res.cloudinary.com/...",
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-02T12:00:00.000Z"
      }
    }
    ```

  - **Not Found Error ( `404 Not Found` ):** Sent if no blog with the given slug exists.

    ```json
    {
      "action": false,
      "message": "Slug not found."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `PATCH` /api/blog/:_id

- **Description:** Updates an existing blog post by its MongoDB ObjectId. The `_id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `blogValidator.update` — see `src/lib/validators/blog.validator.ts`
- **Data Unifier:** Merges the `_id` from the URL path with the JSON body fields.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:**

  | Field           | Type             | Rules                                                            | Required |
  |-----------------|------------------|------------------------------------------------------------------|----------|
  | `title`         | `string`         | Trimmed, max 255 chars                                           | No       |
  | `slug`          | `string`         | Trimmed, max 255 chars, URL-friendly regex                       | No       |
  | `content`       | `string`         | Trimmed, max 50000 chars                                         | No       |
  | `tags`          | `string[]`       | Array of strings, each max 31 chars, lowercased                  | No       |
  | `collaborators` | `string[]`       | Array of valid 24-char hex MongoDB ObjectIds                     | No       |
  | `coverImgUrl`   | `string \| null` | Max 1023 chars, nullable (set to `null` to remove)               | No       |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "title": "Updated Title",
        "slug": "updated-title",
        "content": "Updated content...",
        "tags": ["updated"],
        "author": "665f1a2b3c4d5e6f7a8b9c01",
        "collaborators": ["665f1a2b3c4d5e6f7a8b9c02"],
        "coverImgUrl": "media/new-cover",
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-03T14:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):** Sent if no blog with the given `_id` exists.

    ```json
    {
      "action": false,
      "message": "Blog not found."
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if the updated slug is already in use by another blog.

    ```json
    {
      "action": false,
      "message": "Slug is already in use."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `DELETE` /api/blog/:_id

- **Description:** Deletes a blog post by its MongoDB ObjectId. The `_id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `blogValidator.remove` — see `src/lib/validators/blog.validator.ts`
- **Data Unifier:** Extracts `_id` from the URL path segment.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:** *None.* The `_id` is taken from the URL.
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "Blog deleted successfully."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Blog not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## Project

---

### `GET` /api/project

- **Description:** Retrieves a list of projects. Supports filtering by `target` (all, as list, or my projects) and by `portfolio` category.
- **Authentication Required:** `False`
- **Validator Schema:** `projectValidator.get` — see `src/lib/validators/project.validator.ts`
- **Data Unifier:** Extracts `target` and `portfolio` from query params. Defaults to `target="all"` and `portfolio="any"`.
- **Expected Query Params:**

  | Param      | Type     | Allowed Values                         | Default  | Required |
  |------------|----------|----------------------------------------|----------|----------|
  | `target`   | `string` | `"all"`, `"all_as_list"`, `"my"`       | `"all"`  | No       |
  | `portfolio`| `string` | `"any"`, `"game"`, `"graphics"`, `"rnd"` | `"any"` | No       |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": [
        {
          "_id": "665f1a2b3c4d5e6f7a8b9c0d",
          "portfolio": "GAME",
          "title": "3D Puzzle Game",
          "description": "An interactive 3D puzzle game...",
          "tags": ["game", "3d", "puzzle"],
          "author": {
            "_id": "665f1a2b3c4d5e6f7a8b9c01",
            "name": "Jane Doe",
            "profileImgUrl": "https://res.cloudinary.com/..."
          },
          "collaborators": [],
          "links": [
            { "text": "Live Demo", "url": "https://example.com/demo" }
          ],
          "coverImgUrl": "https://res.cloudinary.com/...",
          "media": [],
          "createdAt": "2025-06-01T10:00:00.000Z",
          "updatedAt": "2025-06-02T12:00:00.000Z"
        }
      ]
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["target$ Invalid enum value. Expected 'all' | 'all_as_list' | 'my', received 'invalid'"]
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/project

- **Description:** Creates a new project. The authenticated user becomes the author.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `projectValidator.create` — see `src/lib/validators/project.validator.ts`
- **Expected JSON Body Fields:**

  | Field         | Type       | Rules                                                  | Required |
  |---------------|------------|--------------------------------------------------------|----------|
  | `title`       | `string`   | Trimmed, max 255 chars                                 | Yes      |
  | `portfolio`   | `string`   | Enum: `"GAME"`, `"GRAPHICS"`, `"RND"`                  | Yes      |
  | `description` | `string`   | Trimmed, max 4095 chars                                | Yes      |
  | `tags`        | `string[]` | Array of strings, each max 31 chars, lowercased        | Yes      |
  | `links`       | `object[]` | Array of `{ text: string (max 255), url: string (valid URL, max 2048) }` | Yes |
  | `coverImgUrl` | `string`   | Max 1023 chars, not nullable (media key reference)     | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "portfolio": "GAME",
        "title": "3D Puzzle Game",
        "description": "An interactive 3D puzzle game...",
        "tags": ["game", "3d"],
        "author": "665f1a2b3c4d5e6f7a8b9c01",
        "collaborators": [],
        "links": [{ "text": "Live Demo", "url": "https://example.com/demo" }],
        "coverImgUrl": "media/cover-puzzle",
        "media": [],
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-01T10:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": [
        "portfolio$ Invalid enum value. Expected 'GAME' | 'GRAPHICS' | 'RND', received 'OTHER'",
        "links.0.url$ Invalid url"
      ]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `PATCH` /api/project/:_id

- **Description:** Updates an existing project by its MongoDB ObjectId. The `_id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `projectValidator.update` — see `src/lib/validators/project.validator.ts`
- **Data Unifier:** Merges the `_id` from the URL path with the JSON body fields.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:**

  | Field           | Type             | Rules                                                                 | Required |
  |-----------------|------------------|-----------------------------------------------------------------------|----------|
  | `title`         | `string`         | Trimmed, max 255 chars                                                | No       |
  | `portfolio`     | `string`         | Enum: `"GAME"`, `"GRAPHICS"`, `"RND"`                                 | Yes      |
  | `description`   | `string`         | Trimmed, max 4095 chars                                               | No       |
  | `tags`          | `string[]`       | Array of strings, each max 31 chars, lowercased                       | No       |
  | `links`         | `object[]`       | Array of `{ text: string (max 255), url: string (valid URL, max 2048) }` | No    |
  | `collaborators` | `string[]`       | Array of valid 24-char hex MongoDB ObjectIds                          | No       |
  | `coverImgUrl`   | `string \| null` | Max 1023 chars, nullable                                              | No       |
  | `media`         | `string[]`       | Array of valid 24-char hex MongoDB ObjectIds                          | No       |

  > **Note:** `portfolio` is **required** even in update (it is not `.optional()` in the schema).

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "portfolio": "GRAPHICS",
        "title": "Updated Project Title",
        "description": "Updated description...",
        "tags": ["updated"],
        "author": "665f1a2b3c4d5e6f7a8b9c01",
        "collaborators": ["665f1a2b3c4d5e6f7a8b9c02"],
        "links": [],
        "coverImgUrl": null,
        "media": [],
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-03T14:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Project not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `DELETE` /api/project/:_id

- **Description:** Deletes a project by its MongoDB ObjectId. The `_id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `projectValidator.remove` — see `src/lib/validators/project.validator.ts`
- **Data Unifier:** Extracts `_id` from the URL path segment.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:** *None.* The `_id` is taken from the URL.
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "Project deleted successfully."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Project not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## Team

---

### `GET` /api/team

- **Description:** Retrieves a list of all teams. The `target` query param controls the retrieval mode.
- **Authentication Required:** `False`
- **Validator Schema:** `teamValidator.get` — see `src/lib/validators/team.validator.ts`
- **Data Unifier:** Extracts `target` from query params.
- **Expected Query Params:**

  | Param    | Type     | Allowed Values                          | Required |
  |----------|----------|-----------------------------------------|----------|
  | `target` | `string` | `"one"`, `"all"`, `"all_as_list"`       | Yes      |

  > **Note:** If `target` is `"one"`, the `_id` field is required (but for this listing endpoint, `"all"` or `"all_as_list"` are the expected values).

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": [
        {
          "_id": "665f1a2b3c4d5e6f7a8b9c0d",
          "name": "Graphics Team",
          "description": "The team working on graphics and visual effects.",
          "members": [
            {
              "_id": "665f1a2b3c4d5e6f7a8b9c01",
              "name": "Jane Doe",
              "links": [{ "text": "Portfolio", "url": "https://janedoe.com" }],
              "profileImgUrl": "https://res.cloudinary.com/...",
              "designation": "HEAD"
            }
          ],
          "createdAt": "2025-06-01T10:00:00.000Z",
          "updatedAt": "2025-06-02T12:00:00.000Z"
        }
      ]
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["target$ Invalid enum value. Expected 'one' | 'all' | 'all_as_list', received 'invalid'"]
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/team

- **Description:** Creates a new team.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `teamValidator.create` — see `src/lib/validators/team.validator.ts`
- **Expected JSON Body Fields:**

  | Field         | Type     | Rules                   | Required |
  |---------------|----------|-------------------------|----------|
  | `name`        | `string` | Trimmed, max 255 chars  | Yes      |
  | `description` | `string` | Trimmed, max 4095 chars | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "New Team",
        "description": "A newly created team.",
        "members": [],
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-01T10:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["name$ Required", "description$ Required"]
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if a team with the same name already exists.

    ```json
    {
      "action": false,
      "message": "Team name is already taken."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `GET` /api/team/:_id

- **Description:** Retrieves a single team by its MongoDB ObjectId. The `_id` is extracted from the URL path and `target` is auto-set to `"one"`.
- **Authentication Required:** `False`
- **Validator Schema:** `teamValidator.get` — see `src/lib/validators/team.validator.ts`
- **Data Unifier:** Sets `target` to `"one"` and extracts `_id` from the URL path segment.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Graphics Team",
        "description": "The team working on graphics and visual effects.",
        "members": [
          {
            "_id": "665f1a2b3c4d5e6f7a8b9c01",
            "name": "Jane Doe",
            "links": [{ "text": "Portfolio", "url": "https://janedoe.com" }],
            "profileImgUrl": "https://res.cloudinary.com/...",
            "designation": "HEAD"
          }
        ],
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-02T12:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Team not found."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `PATCH` /api/team/:_id

- **Description:** Updates an existing team's name and/or description. The `_id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `teamValidator.update` — see `src/lib/validators/team.validator.ts`
- **Data Unifier:** Merges the `_id` from the URL path with the JSON body fields.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:**

  | Field         | Type     | Rules                   | Required |
  |---------------|----------|-------------------------|----------|
  | `name`        | `string` | Trimmed, max 255 chars  | No       |
  | `description` | `string` | Trimmed, max 4095 chars | No       |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Updated Team Name",
        "description": "Updated description.",
        "members": [],
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-03T14:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Team not found."
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if the updated name is already taken by another team.

    ```json
    {
      "action": false,
      "message": "Team name is already taken."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `DELETE` /api/team/:_id

- **Description:** Deletes a team by its MongoDB ObjectId. The `_id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `teamValidator.remove` — see `src/lib/validators/team.validator.ts`
- **Data Unifier:** Extracts `_id` from the URL path segment.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:** *None.* The `_id` is taken from the URL.
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "Team deleted successfully."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Team not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## User

---

### `GET` /api/user

- **Description:** Retrieves user data. The `target` query param determines the retrieval mode: all users (paginated), a summary, all public users (paginated), or a single public user by ID.
- **Authentication Required:** `False` (handler-level). However, certain `target` values like `"all"` or `"summary"` may internally require an authenticated session with admin/member roles.
- **Validator Schema:** `userValidator.get` — see `src/lib/validators/user.validator.ts`
- **Data Unifier:** Extracts `target`, `page`, `limit`, and `id` from query params. Defaults `target` to `"all"`.
- **Expected Query Params:**

  | Param    | Type     | Allowed Values                                       | Default  | Required |
  |----------|----------|------------------------------------------------------|----------|----------|
  | `target` | `string` | `"all"`, `"summary"`, `"public_all"`, `"public_single"` | `"all"` | No       |
  | `page`   | `string` | Numeric string, parsed to int, min 1                 | —        | Required when `target` is `"all"` or `"public_all"` |
  | `limit`  | `string` | Numeric string, parsed to int, min 1, max 20         | —        | Required when `target` is `"all"` or `"public_all"` |
  | `id`     | `string` | Valid 24-char hex MongoDB ObjectId                   | —        | Required when `target` is `"public_single"` |

  > **Refinement:** A cross-field `.refine()` ensures `page` & `limit` are present for `"all"` / `"public_all"`, and `_id` is present for `"public_single"`.

- **Expected Responses:**

  - **Success ( `200 OK` ):** *(for `target=all` or `target=public_all`)*

    ```json
    {
      "action": true,
      "data": {
        "users": [
          {
            "_id": "665f1a2b3c4d5e6f7a8b9c0d",
            "name": "John Doe",
            "email": "john@example.com",
            "profileImgUrl": "https://res.cloudinary.com/...",
            "phoneNumber": "+919876543210",
            "links": [
              { "text": "GitHub", "url": "https://github.com/johndoe" }
            ],
            "teamId": "665f1a2b3c4d5e6f7a8b9c0e",
            "designation": "SENIOR",
            "roles": ["MEMBER"],
            "createdAt": "2025-06-01T10:00:00.000Z",
            "updatedAt": "2025-06-02T12:00:00.000Z"
          }
        ],
        "totalPages": 5,
        "currentPage": 1
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": [
        "form$ Invalid combination: if target is ALL or PUBLIC_ALL, provide page & limit; if PUBLIC_SINGLE, _id is required; other targets follow specific rules."
      ]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):** Sent when `target=public_single` and the user with the given `_id` doesn't exist.

    ```json
    {
      "action": false,
      "message": "User not found."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `PATCH` /api/user

- **Description:** Updates the currently authenticated user's own profile (name, phone number, links, profile image).
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `userValidator.update` — see `src/lib/validators/user.validator.ts`
- **Expected JSON Body Fields:**

  | Field           | Type       | Rules                                                                 | Required |
  |-----------------|------------|-----------------------------------------------------------------------|----------|
  | `name`          | `string`   | Trimmed, max 255 chars                                                | No       |
  | `phoneNumber`   | `string`   | Trimmed, max 20 chars                                                 | No       |
  | `links`         | `object[]` | Array of `{ text: string (max 255), url: string (valid URL, max 2048) }` | No    |
  | `profileImgUrl` | `string`   | Max 1023 chars, not nullable                                          | No       |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "Updated Name",
        "email": "john@example.com",
        "profileImgUrl": "media/new-avatar",
        "phoneNumber": "+919876543210",
        "links": [
          { "text": "GitHub", "url": "https://github.com/johndoe" }
        ],
        "teamId": "665f1a2b3c4d5e6f7a8b9c0e",
        "designation": "SENIOR",
        "roles": ["MEMBER"],
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-03T14:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["links.0.url$ Invalid url"]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `DELETE` /api/user

- **Description:** Deletes a user account by their MongoDB ObjectId. Typically an admin-level action.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `userValidator.remove` — see `src/lib/validators/user.validator.ts`
- **Expected JSON Body Fields:**

  | Field | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "User deleted successfully."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "User not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `PATCH` /api/user/assign

- **Description:** Updates a user's roles and/or designation. Typically an admin-level action to assign privileges.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `userValidator.updateAssignment` — see `src/lib/validators/user.validator.ts`
- **Expected JSON Body Fields:**

  | Field         | Type       | Rules                                                     | Required |
  |---------------|------------|-----------------------------------------------------------|----------|
  | `_id`         | `string`   | Valid 24-character hex MongoDB ObjectId of the target user | Yes      |
  | `roles`       | `string[]` | Array of enum values: `"GUEST"`, `"MEMBER"`, `"ADMIN"`, `"ROOT"` | No |
  | `designation` | `string`   | Enum: `"NONE"`, `"JUNIOR"`, `"SENIOR"`, `"EXECUTIVE"`, `"HEAD"`, `"ADVISOR"` | No |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "John Doe",
        "roles": ["MEMBER", "ADMIN"],
        "designation": "HEAD"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["roles.0$ Invalid enum value. Expected 'GUEST' | 'MEMBER' | 'ADMIN' | 'ROOT', received 'SUPERUSER'"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "User not found."
    }
    ```

  - **Forbidden Error ( `403 Forbidden` ):** Sent if the authenticated user doesn't have permission to assign roles.

    ```json
    {
      "action": false,
      "message": "Forbidden."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `PATCH` /api/user/team

- **Description:** Assigns a user to a team or removes them from their current team by setting `teamId` to `null`.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `userValidator.updateTeam` — see `src/lib/validators/user.validator.ts`
- **Expected JSON Body Fields:**

  | Field    | Type              | Rules                                                                      | Required |
  |----------|-------------------|----------------------------------------------------------------------------|----------|
  | `_id`    | `string`          | Valid 24-character hex MongoDB ObjectId of the target user                  | Yes      |
  | `teamId` | `string \| null`  | Valid 24-char hex MongoDB ObjectId or `null` to unassign from team         | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "name": "John Doe",
        "teamId": "665f1a2b3c4d5e6f7a8b9c0e"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["teamId$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):** Sent if the user or the target team doesn't exist.

    ```json
    {
      "action": false,
      "message": "User not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## Featured

---

### `GET` /api/featured

- **Description:** Retrieves featured content. The `target` query param filters by featured type or retrieves highlights.
- **Authentication Required:** `False`
- **Validator Schema:** `featuredValidator.get` — see `src/lib/validators/featured.validator.ts`
- **Data Unifier:** Extracts `target` from query params.
- **Expected Query Params:**

  | Param    | Type     | Allowed Values                                                      | Required |
  |----------|----------|---------------------------------------------------------------------|----------|
  | `target` | `string` | `"highlight"`, `"all_as_list"`, `"blog"`, `"game"`, `"graphics"`, `"rnd"` | Yes |

- **Expected Responses:**

  - **Success ( `200 OK` ):** *(for `target=highlight`)*

    ```json
    {
      "action": true,
      "data": [
        {
          "_id": "665f1a2b3c4d5e6f7a8b9c0d",
          "type": "BLOG",
          "title": "Getting Started with WebGL",
          "coverImgUrl": "https://res.cloudinary.com/...",
          "tags": ["webgl", "graphics"],
          "readUrl": "/blog/getting-started-with-webgl"
        },
        {
          "_id": "665f1a2b3c4d5e6f7a8b9c0e",
          "type": "GAME",
          "title": "3D Puzzle Game",
          "coverImgUrl": "https://res.cloudinary.com/...",
          "tags": ["game", "3d"],
          "liveDemoLink": "https://example.com/demo",
          "githubLink": "https://github.com/example/puzzle"
        }
      ]
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["target$ Invalid enum value. Expected 'highlight' | 'all_as_list' | 'blog' | 'game' | 'graphics' | 'rnd', received 'invalid'"]
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/featured

- **Description:** Marks an existing piece of content (blog or project) as featured.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `featuredValidator.create` — see `src/lib/validators/featured.validator.ts`
- **Expected JSON Body Fields:**

  | Field         | Type      | Rules                                                  | Required |
  |---------------|-----------|--------------------------------------------------------|----------|
  | `contentType` | `string`  | Enum: `"BLOG"`, `"GAME"`, `"GRAPHICS"`, `"RND"`       | Yes      |
  | `contentId`   | `string`  | Valid 24-character hex MongoDB ObjectId                 | Yes      |
  | `isHighlight` | `boolean` | Whether this featured item should appear in highlights  | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "contentType": "BLOG",
        "contentId": "665f1a2b3c4d5e6f7a8b9c01",
        "isHighlight": true,
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-01T10:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["contentType$ Invalid enum value. Expected 'BLOG' | 'GAME' | 'GRAPHICS' | 'RND', received 'OTHER'"]
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if the content is already featured.

    ```json
    {
      "action": false,
      "message": "Content is already featured."
    }
    ```

  - **Not Found Error ( `404 Not Found` ):** Sent if the content referenced by `contentId` doesn't exist.

    ```json
    {
      "action": false,
      "message": "Featured not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `DELETE` /api/featured/:_id

- **Description:** Removes a featured entry by its MongoDB ObjectId. The `_id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `featuredValidator.remove` — see `src/lib/validators/featured.validator.ts`
- **Data Unifier:** Extracts `_id` from the URL path segment.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `_id` | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:** *None.* The `_id` is taken from the URL.
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "Featured entry removed successfully."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Featured not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## Media

---

### `GET` /api/media

- **Description:** Retrieves all media files uploaded by the authenticated user (or all media if admin). Returns metadata about each media entry.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `mediaValidator.get` → `z.object({})` *(no body required)*
- **Expected Inputs:** *None.*
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": [
        {
          "_id": "665f1a2b3c4d5e6f7a8b9c0d",
          "key": "media/cover-image-abc123",
          "url": "https://res.cloudinary.com/...",
          "sizeBytes": 204800,
          "format": "png",
          "resourceType": "image",
          "uploadedBy": {
            "_id": "665f1a2b3c4d5e6f7a8b9c01",
            "name": "Jane Doe"
          },
          "createdAt": "2025-06-01T10:00:00.000Z",
          "updatedAt": "2025-06-01T10:00:00.000Z"
        }
      ]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/media

- **Description:** Registers a new media entry in the database after a file has been uploaded to the cloud storage provider (e.g. Cloudinary).
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `mediaValidator.create` — see `src/lib/validators/media.validator.ts`
- **Expected JSON Body Fields:**

  | Field      | Type     | Rules                                       | Required |
  |------------|----------|---------------------------------------------|----------|
  | `publicId` | `string` | Trimmed, max 255 chars (Cloudinary public ID) | Yes    |
  | `url`      | `string` | Valid URL, max 2048 chars                    | Yes      |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "_id": "665f1a2b3c4d5e6f7a8b9c0d",
        "key": "media/cover-image-abc123",
        "url": "https://res.cloudinary.com/...",
        "sizeBytes": 0,
        "format": "",
        "resourceType": "",
        "uploadedBy": "665f1a2b3c4d5e6f7a8b9c01",
        "createdAt": "2025-06-01T10:00:00.000Z",
        "updatedAt": "2025-06-01T10:00:00.000Z"
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["url$ Invalid url", "publicId$ Required"]
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if a media entry with the same `publicId` already exists.

    ```json
    {
      "action": false,
      "message": "Media public ID already exists."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/media/sign

- **Description:** Generates a signed upload URL/signature for the client to directly upload a file to the cloud storage provider (e.g. Cloudinary). This pre-signs the upload request.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `mediaValidator.sign` → `z.object()` *(empty object, no body fields required)*
- **Expected JSON Body Fields:** *Empty object `{}` required (POST body must be valid JSON).*
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "signature": "a1b2c3d4e5f6...",
        "timestamp": 1717200000,
        "cloudName": "your-cloud-name",
        "apiKey": "123456789012345"
      }
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `DELETE` /api/media/:id

- **Description:** Deletes a media entry by its MongoDB ObjectId. Also removes the file from the cloud storage provider. The `id` is extracted from the URL path.
- **Authentication Required:** `True` — The client must pass their active session cookie with `withCredentials: true`.
- **Validator Schema:** `mediaValidator.remove` — see `src/lib/validators/media.validator.ts`
- **Data Unifier:** Extracts `_id` from the URL path segment.
- **Expected URL Params:**

  | Param | Type     | Rules                                      | Required |
  |-------|----------|--------------------------------------------|----------|
  | `id`  | `string` | Valid 24-character hex MongoDB ObjectId     | Yes      |

- **Expected JSON Body Fields:** *None.* The `_id` is taken from the URL.
- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "Media deleted successfully."
      }
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["_id$ Invalid MongoDB ObjectId"]
    }
    ```

  - **Not Found Error ( `404 Not Found` ):**

    ```json
    {
      "action": false,
      "message": "Media not found."
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## Misc

---

### `GET` /api/misc/health

- **Description:** Health check endpoint. Returns the status of the server, database connection (MongoDB), and SMTP connection. This is a **raw** Next.js handler — it does **not** use the `createHandler` pipeline and always returns a JSON response directly.
- **Authentication Required:** `False`
- **Expected Inputs:** *None.*
- **Expected Responses:**

  - **Success ( `200 OK` ):** Always returns `200` regardless of connection states.

    ```json
    {
      "serverStatus": "ONLINE",
      "databaseConnection": "CONNECTED",
      "smtpConnected": "CONNECTED"
    }
    ```

  - **Degraded ( `200 OK` ):** If database or SMTP is down, their status changes:

    ```json
    {
      "serverStatus": "ONLINE",
      "databaseConnection": "DISCONNECTED",
      "smtpConnected": "DISCONNECTED"
    }
    ```

  > **Note:** This endpoint does **not** follow the standard `{ action, data, message }` envelope. It returns raw status fields directly.

---

## Game

> For the complete spec including the anti-cheat signature formula, environment variable requirements, and implementation gaps, see [`docs/backend/LEADERBOARD_BACKEND_MAP.md`](file:///c:/Vajraksh%20new/Web_dev/achi-wali-website/docs/backend/LEADERBOARD_BACKEND_MAP.md).

---

### `POST` /api/game/login

- **Description:** Authenticates a game player using their `GameUser` credentials (separate model from website `User`). Returns an explicit `gameToken` JWT in the response body. This token must be stored in memory by the game client and passed in score-submission requests. HTTP cookies are intentionally not used (itch.io cross-origin iframe restriction).
- **Authentication Required:** `False`
- **Validator Schema:** `gameValidator.login` → `src/lib/validators/game.validator.ts`
- **Expected JSON Body Fields:**

  | Field | Type | Rules | Required |
  |-------|------|-------|----------|
  | `identifier` | `string` | Trimmed, max 255 chars. Matched against `username` OR `email` (both lowercased). | Yes |
  | `password` | `string` | Max 255 chars. | Yes |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

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

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["identifier$ Required"]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):** Identifier not found, or password mismatch.

    ```json
    {
      "action": false,
      "message": "Invalid credentials."
    }
    ```

  - **Rate Limit Error ( `429 Too Many Requests` ):** Returned if a login attempt arrives within **3 seconds** of the previous attempt for the same player (`TOO_MANY_REQUESTS`).

    ```json
    {
      "action": false,
      "message": "Please wait a moment before trying again."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/game/score

- **Description:** Submits a game score. The `gameToken` from login is verified server-side. An SHA-256 anti-cheat signature is required (see `docs/backend/LEADERBOARD_BACKEND_MAP.md` for the exact formula). If the submitted score is not higher than the player's existing score for the game, the DB write is silently skipped and `200 OK` is still returned.
- **Authentication Required:** `False` (token verification is manual inside the service, not via the standard session cookie).
- **Validator Schema:** `gameValidator.createScore` → `src/lib/validators/game.validator.ts`
- **Expected JSON Body Fields:**

  | Field | Type | Rules | Required |
  |-------|------|-------|----------|
  | `gameId` | `string` | Trimmed, max 255 chars. | Yes |
  | `score` | `number` | Integer. Used for numerical ranking. | Yes |
  | `scoreStr` | `string` | Trimmed, max 255 chars. **Free-form** — formatted string to display (e.g. `"1500"`, `"14m 43s"`, `"200pts"`). | Yes |
  | `timestamp` | `number` | Positive integer. Unix epoch ms. Must match value used to compute `signature`. | Yes |
  | `gameToken` | `string` | Trimmed, max 4095 chars. JWT from login. | Yes |
  | `signature` | `string` | Trimmed, max 255 chars. Hex SHA-256 of `"userId:score:timestamp:GAME_SECRET"`. | Yes |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {}
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["score$ Required"]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):** `gameToken` invalid, expired, or signed with the wrong secret (`INVALID_GAME_TOKEN`).

    ```json
    {
      "action": false,
      "message": "Invalid or expired game session."
    }
    ```

  - **Forbidden ( `403 Forbidden` ):** Anti-cheat SHA-256 mismatch (`INVALID_SCORE_SIGNATURE`).

    ```json
    {
      "action": false,
      "message": "Anti-cheat signature validation failed."
    }
    ```

  - **Rate Limit Error ( `429 Too Many Requests` ):** Returned if a score submission arrives within **3 seconds** of the previous attempt for the same player (`TOO_MANY_REQUESTS`).

    ```json
    {
      "action": false,
      "message": "Please wait a moment before trying again."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `GET` /api/game/score

- **Description:** Fetches leaderboard scores for a given `gameId`. When `target=leaderboard`, returns the top-10 scores sorted descending (served from a 10-second server-side cache). When `target=my_scores`, requires a valid `gameToken` and returns 0 or 1 items — the requesting player's own score for that game.
- **Authentication Required:** `False`
- **Validator Schema:** `gameValidator.getScore` → `src/lib/validators/game.validator.ts`
- **Data Unifier:** Extracts `target` and `gameId` from URL query parameters.
- **Expected Query Params:**

  | Param | Type | Allowed Values | Required |
  |-------|------|----------------|----------|
  | `target` | `string` | `"leaderboard"`, `"my_scores"` | Yes |
  | `gameId` | `string` | Trimmed, max 255 chars. | Yes |
  | `gameToken` | `string` | Trimmed, max 4095 chars. JWT from login. | Yes if `target=my_scores` |

- **Expected Responses:**

  - **Success ( `200 OK` ):** Returns an array of up to 10 score entries, sorted by `score` descending.

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
          "scoreStr": "1500",
          "createdAt": "2026-08-09T01:23:42.000Z",
          "updatedAt": "2026-08-09T01:23:42.000Z"
        }
      ]
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["target$ Invalid enum value. Expected 'leaderboard' | 'my_scores', received 'bad'"]
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `GET` /api/game/list

- **Description:** Returns an array of all distinct `gameId` strings that currently have at least one score record in the `Score` collection. Use this to drive game search bars and selection tabs in the leaderboard UI dynamically — so only games with real data are displayed.
- **Authentication Required:** `False`
- **Validator Schema:** `gameValidator.getGameList` → `z.object({})` *(no query params required)*
- **Expected Query Params:** *None.*
- **Expected Responses:**

  - **Success ( `200 OK` ):** Returns a plain `string[]` of distinct game IDs. Order is not guaranteed.

    ```json
    {
      "action": true,
      "data": ["space-runner", "possessed", "cookie-runner"]
    }
    ```

    Returns `[]` (empty array, not an error) if no scores have been submitted yet.

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `GET` /api/game/profile

- **Description:** Checks whether the currently authenticated website user has set up their linked `GameUser` credentials.
- **Authentication Required:** `True` — active website session cookie required (`withCredentials: true`).
- **Validator Schema:** `gameValidator.getProfile` → `z.object({})` *(no body required)*
- **Expected JSON Body Fields:** *None.*
- **Expected Responses:**

  - **Success ( `200 OK` - Not Linked Yet ):**

    ```json
    {
      "action": true,
      "data": {
        "linked": false
      }
    }
    ```

  - **Success ( `200 OK` - Already Linked ):**

    ```json
    {
      "action": true,
      "data": {
        "linked": true,
        "username": "playerone"
      }
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

### `POST` /api/game/profile

- **Description:** Creates a new `GameUser` record linked to the authenticated website account (`websiteUserId`), or updates the username/password if already linked. Email is attached server-side from the session `User` record.
- **Authentication Required:** `True` — active website session cookie required (`withCredentials: true`).
- **Validator Schema:** `gameValidator.upsertProfile` → `src/lib/validators/game.validator.ts`
- **Expected JSON Body Fields:**

  | Field | Type | Rules | Required |
  |-------|------|-------|----------|
  | `username` | `string` | Trimmed, max 255 chars. | Yes |
  | `password` | `string` | Max 255 chars. Plaintext password for game login. | Yes |

- **Expected Responses:**

  - **Success ( `200 OK` ):**

    ```json
    {
      "action": true,
      "data": {
        "message": "Game profile created successfully."
      }
    }
    ```

  - **Conflict Error ( `409 Conflict` ):** Sent if the username is already in use by another game user (`GAME_USERNAME_TAKEN`).

    ```json
    {
      "action": false,
      "message": "That username is already taken."
    }
    ```

  - **Validation Error ( `400 Bad Request` ):**

    ```json
    {
      "action": false,
      "message": "Bad Request.",
      "errors": ["username$ Required"]
    }
    ```

  - **Authentication Error ( `401 Unauthorized` ):**

    ```json
    {
      "action": false,
      "message": "Authentication required."
    }
    ```

  - **Server Error ( `500 Internal Server Error` ):**

    ```json
    {
      "action": null
    }
    ```

---

## Quick Reference: Error Code Map


The handler's `serviceErrorCodeHandler` maps internal service error codes (`ESECs`) to HTTP status codes:

| HTTP Status | Service Error Codes |
|-------------|---------------------|
| `404 Not Found` | `USER_NOT_FOUND`, `SIGNUP_REQUEST_NOT_FOUND`, `TEAM_NOT_FOUND`, `PROJECT_NOT_FOUND`, `BLOG_NOT_FOUND`, `SLUG_NOT_FOUND`, `FEATURED_NOT_FOUND`, `MEDIA_NOT_FOUND` |
| `401 Unauthorized` | `INVALID_CREDENTIALS`, `INVALID_JWT`, `INVALID_OTP`, `UNAUTHORIZED`, `GOOGLE_OAUTH_FAILED`, `INVALID_GAME_TOKEN` |
| `403 Forbidden` | `FORBIDDEN`, `NOT_TEAM_MEMBER`, `INVALID_SCORE_SIGNATURE` |
| `409 Conflict` | `EMAIL_TAKEN`, `TEAM_NAME_TAKEN`, `SLUG_ALREADY_IN_USE`, `ALREADY_FEATURED`, `MEDIA_PUBLIC_ID_ALREADY_EXISTS`, `GAME_USERNAME_TAKEN` |
| `429 Too Many Requests` | `TOO_MANY_REQUESTS` |
| `500 Internal Server Error` | Any unhandled error or thrown `AppError` |

---

## Quick Reference: Shared Validator Fields

From `src/lib/validators/core.validator.ts` — `allIbDField`:

| Field Key             | Zod Type                           | Constraints                                                      |
|-----------------------|------------------------------------|------------------------------------------------------------------|
| `_id`                 | `z.string()` → `ObjectId`         | 24-char hex string, validated with `Types.ObjectId.isValid()`    |
| `teamId`              | `z.string().nullable()` → `ObjectId \| null` | Same as `_id` but allows `null`                      |
| `shortString`         | `z.string()`                       | Trimmed, max 255 chars                                           |
| `longString`          | `z.string()`                       | Trimmed, max 4095 chars                                          |
| `bigString`           | `z.string()`                       | Trimmed, max 50000 chars                                         |
| `boolean`             | `z.boolean()`                      | —                                                                |
| `email`               | `z.email()`                        | Max 255 chars, lowercased                                        |
| `password`            | `z.string()`                       | Max 255 chars                                                    |
| `otp`                 | `z.string()`                       | Regex: `/^\d{6}$/` (exactly 6 digits)                            |
| `token`               | `z.string()`                       | Regex: `/^[a-f0-9]{64}$/` (64-char hex)                         |
| `roles`               | `z.array(z.nativeEnum(EUserRole))` | `"GUEST"`, `"MEMBER"`, `"ADMIN"`, `"ROOT"`                      |
| `designation`         | `z.nativeEnum(EUserDesignation)`   | `"NONE"`, `"JUNIOR"`, `"SENIOR"`, `"EXECUTIVE"`, `"HEAD"`, `"ADVISOR"` |
| `mediaKey`            | `z.string().nullable()`            | Max 1023 chars, nullable                                         |
| `mediaKeyNotNullable` | `z.string()`                       | Max 1023 chars, not nullable                                     |
| `phoneNumber`         | `z.string()`                       | Trimmed, max 20 chars                                            |
| `projectPortfolio`    | `z.nativeEnum(EProjectPortfolio)`  | `"GAME"`, `"GRAPHICS"`, `"RND"`                                  |
| `url`                 | `z.string().url()`                 | Valid URL, max 2048 chars                                        |
| `link`                | `z.object()`                       | `{ text: shortString, url: url }`                                |
| `tags`                | `z.array(z.string())`             | Each max 31 chars, lowercased                                    |
| `slug`                | `z.string()`                       | Trimmed, max 255 chars, regex: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`   |
| `paginationPage`      | `z.string()` → `number`           | Parsed to int, min 1                                             |
| `paginationLimit`     | `z.string()` → `number`           | Parsed to int, min 1, max 20                                     |
