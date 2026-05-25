# DEVELOPMENT WORKFLOW

> **For:** Backend & Frontend Engineers
> **Stack:** Next.js (App Router), TypeScript, Mongoose, Zod
> **Last Updated:** 2026-05-26

This document is the **single source of truth** for adding a new feature to the backend. Follow every step in order. Do not skip steps or invent shortcuts.

---

## 1. Architectural Overview

Our backend enforces a strict **Repository → Service → Handler** pipeline. Every layer has exactly one responsibility.

```
[HTTP Request]
      │
      ▼
[API Route / createHandler]  ← Parses, validates, extracts session, calls service
      │
      ▼
[Service]                    ← Business logic, role/auth checks, data shaping
      │
      ▼
[Repository]                 ← Pure Mongoose/DB queries — NOTHING ELSE
      │
      ▼
[MongoDB via Mongoose Model]
```

### Why this separation?

| Layer | What it owns | What it NEVER does |
|---|---|---|
| **Repository** | All Mongoose queries (`find`, `insert`, `updateById`, …) | Business logic, auth checks, data transformation |
| **Service** | Role checks, conflict checks, data mapping (ObjectId → string), orchestrating multiple repos | Raw Mongoose calls, HTTP concerns |
| **Handler** | Session extraction, request parsing, Zod validation, HTTP response | Business logic |

This means a service function is **100% testable** without knowing anything about HTTP. A repository can be swapped to a different database without touching a single service file.

---

## 2. The 7-Step Implementation Guide

> **Running example throughout this document:** a new `Events` feature.
> The hypothetical API endpoint will be `POST /api/event` (create an event) and `GET /api/event` (list events).

---

### Step 1 — Model (`src/lib/database/models/`)

The model is your Mongoose Schema. It maps 1-to-1 to the domain interface you will define in Step 2. Always import your interface from `@/lib/types/index.types` (the barrel file — explained in Step 6).

**File:** `src/lib/database/models/event.model.ts`

```typescript
import { Schema, model, models } from 'mongoose';
import { IEvent } from '@/lib/types/index.types';

const EventSchema = new Schema<IEvent>({
    title: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    slug: {
        type: Schema.Types.String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: Schema.Types.String,
        required: true,
        trim: true,
    },
    tags: [{
        type: Schema.Types.String,
        trim: true,
    }],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    coverImgUrl: {
        type: Schema.Types.String,
        default: null,
    },
    eventDate: {
        type: Schema.Types.Date,
        required: true,
    },
}, {
    timestamps: true, // Always include this — it adds createdAt and updatedAt.
});

// IMPORTANT: The `models.Event || model(...)` guard prevents Mongoose from
// re-registering the model on every hot-reload in Next.js development mode.
const EventModel = models.Event || model<IEvent>("Event", EventSchema);

export default EventModel;
```

**Rules:**
- Use `Schema.Types.ObjectId` + `ref` for any foreign key. Never store raw strings for references.
- Always add `timestamps: true`.
- Always use the `models.ModelName || model(...)` hot-reload guard.

---

### Step 2 — Types (`src/lib/types/`)

All domain types live in `src/lib/types/`. This directory has a dedicated file for each concern:

| File | What goes here |
|---|---|
| `domain.types.ts` | Raw DB interfaces (`IEvent`), Exportable interfaces (`IEventExportable`), domain Enums |
| `api.types.ts` | `APIControl` namespace — the `enum Target` for GET variants |
| `service.types.ts` | `SDIn` (Service Data In) and `SDOut` (Service Data Out) namespaces |
| `index.types.ts` | **The barrel file — re-exports everything. You NEVER import from individual type files directly.** |

#### 2a. Add to `domain.types.ts`

Define the raw Mongoose document interface and any "exportable" variants (populated documents).

```typescript
// In: src/lib/types/domain.types.ts

export interface IEvent {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    tags: string[];
    author: Types.ObjectId;        // Raw ObjectId — the DB stores the ref
    coverImgUrl: string | null;
    eventDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

// The "Exportable" version reflects what the repo returns AFTER .populate()
// — populated fields become objects, not raw ObjectIds.
export interface IEventExportable extends Omit<IEvent, 'author'> {
    author: {
        _id: Types.ObjectId;
        name: string;
        profileImgUrl: string | null;
    };
}
```

#### 2b. Add the `APIControl` target enum to `api.types.ts`

```typescript
// In: src/lib/types/api.types.ts (add inside the APIControl namespace)

export namespace Event {
    export namespace Get {
        export enum Target {
            ALL = "all",
            MY  = "my",
        }
    }
}
```

#### 2c. Add `SDIn` and `SDOut` namespaces to `service.types.ts`

`SDIn` = the **typed, validated input** the service receives from the handler.
`SDOut` = the **serialized output** the service returns (all ObjectIds must be `string`, not `Types.ObjectId`).

```typescript
// In: src/lib/types/service.types.ts

// ── Inside the `SDIn` namespace ──────────────────────────────────────────────
export namespace Event {
    export type Get = {
        target: APIControl.Event.Get.Target;
    };

    export type Create = {
        title: string;
        slug: string;
        description: string;
        tags: string[];
        coverImgUrl: string | null;
        eventDate: string; // ISO 8601 string from the client
    };

    export type Update = {
        _id: Types.ObjectId;
        title?: string;
        description?: string;
        tags?: string[];
        coverImgUrl?: string | null;
        eventDate?: string;
    };

    export type Remove = {
        _id: Types.ObjectId;
    };
}

// ── Inside the `SDOut` namespace ─────────────────────────────────────────────
export namespace Event {
    export type Get = GetList;

    export type GetList = {
        _id: string;
        title: string;
        slug: string;
        description: string;
        tags: string[];
        author: {
            _id: string;
            name: string;
            profileImgUrl: string | null;
        };
        coverImgUrl: string | null;
        eventDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }[];

    export type Create = EmptyObject;
    export type Update = EmptyObject;
    export type Remove = EmptyObject;
}
```

#### 2d. The `index.types.ts` export rule

> ⚠️ **CRITICAL RULE:** Every file in `src/lib/types/` is already re-exported by `src/lib/types/index.types.ts`. You **do not need to add a new line** to `index.types.ts` for `domain.types.ts`, `api.types.ts`, or `service.types.ts` — they are already included via `export *`.

The current barrel file looks like this and covers all type files:

```typescript
// src/lib/types/index.types.ts  ← DO NOT MODIFY THIS FILE
export * from "./core.types";
export * from "./domain.types";
export * from "./response.types";
export * from "./service.types";
export * from "./api.types";

export type EmptyObject = {
    [key: string]: unknown;
}
```

Every consumer (models, repos, services) imports from `@/lib/types/index.types`:

```typescript
// ✅ CORRECT — always import from the barrel
import { IEvent, IEventExportable, SDIn, SDOut, ESECs } from '@/lib/types/index.types';

// ❌ WRONG — never import from individual type files
import { IEvent } from '@/lib/types/domain.types';
```

---

### Step 3 — Validator (`src/lib/validators/`)

Validators use **Zod** and are the gatekeeper for all incoming HTTP data. Use the pre-built field definitions in `allIbDField` from `core.validator.ts` instead of re-defining common shapes.

**File:** `src/lib/validators/event.validator.ts`

```typescript
import { z } from "zod";
import { allIbDField } from "./core.validator";
import { APIControl } from "../types/api.types";

const eventValidator = {
    // For GET requests — data comes from query params (the dataUnifier in the route
    // will parse them into this shape before validation runs).
    get: z.object({
        target: z.enum(APIControl.Event.Get.Target),
    }),

    // For POST requests — data comes from the JSON body.
    create: z.object({
        title: allIbDField.shortString,
        slug: allIbDField.slug,
        description: allIbDField.longString,
        tags: allIbDField.tags,
        coverImgUrl: allIbDField.mediaKey, // nullable
        eventDate: z.string().datetime({ message: "Must be a valid ISO 8601 datetime" }),
    }),

    // For PATCH requests.
    update: z.object({
        _id: allIbDField._id,
        title: allIbDField.shortString.optional(),
        description: allIbDField.longString.optional(),
        tags: allIbDField.tags.optional(),
        coverImgUrl: allIbDField.mediaKey.optional(),
        eventDate: z.string().datetime().optional(),
    }),

    // For DELETE requests.
    remove: z.object({
        _id: allIbDField._id,
    }),
};

export default eventValidator;
```

**Available `allIbDField` primitives** (defined in `core.validator.ts`):

| Field | Type | Notes |
|---|---|---|
| `_id` | `Types.ObjectId` | Validates hex string + transforms to ObjectId |
| `shortString` | `string` | max 255 chars, trimmed |
| `longString` | `string` | max 4095 chars, trimmed |
| `bigString` | `string` | max 32767 chars, trimmed |
| `slug` | `string` | URL-safe, lowercase, hyphens only |
| `tags` | `string[]` | Lowercased automatically |
| `mediaKey` | `string \| null` | max 1023 chars, nullable |
| `mediaKeyNotNullable` | `string` | max 1023 chars, NOT null |
| `email` | `string` | Validated + lowercased |
| `url` | `string` | Full URL, max 2048 |
| `link` | `{ text, url }` | Pre-built link object |
| `boolean` | `boolean` | Plain boolean |

---

### Step 4 — Repository (`src/lib/database/repos/`)

The repository is a **pure data access layer**. It extends `GenericRepository` which already provides: `insert`, `insertMany`, `findById`, `findOne`, `findAll`, `findAllPaginated`, `updateById`, `updateMany`, `removeById`, `count`.

Only add custom methods when you need **custom queries or populations** (like populating `author`). Anything expressible with the generic methods does not need a custom override.

**File:** `src/lib/database/repos/event.repo.ts`

```typescript
import GenericRepository from "./generic.repo";
import EventModel from "@/lib/database/models/event.model";
import { IEvent, IEventExportable } from "@/lib/types/index.types";
import AppError from "@/lib/utils/error";
import { ClientSession, FilterQuery } from "mongoose";

class EventRepository extends GenericRepository<
    IEvent,
    // CreateT — fields required to insert a new document
    Pick<IEvent, "title" | "slug" | "description" | "tags" | "author" | "coverImgUrl" | "eventDate">,
    // UpdateT — fields allowed in an update
    Pick<IEvent, "title" | "description" | "tags" | "coverImgUrl" | "eventDate">
> {
    constructor() {
        super(EventModel);
    }

    // Custom method: returns events with the `author` field populated.
    async findAllExportable(
        filter: FilterQuery<IEvent> = {},
        session?: ClientSession
    ): Promise<IEventExportable[]> {
        await this.ensureDbConnection(); // Always call this first in custom methods.

        try {
            return await this.model
                .find(filter)
                .populate({
                    path: "author",
                    select: "name profileImgUrl",
                })
                .session(session || null)
                .lean<IEventExportable[]>()
                .exec();
        } catch (error) {
            throw new AppError('Failed to find events.', { error });
        }
    }
}

// Export a singleton instance — the rest of the app always imports this instance.
const eventRepository = new EventRepository();

export default eventRepository;
```

**Rules:**
- Always call `await this.ensureDbConnection()` as the first line of every custom method.
- Always use `.lean<T>()` — it returns a plain JS object, not a Mongoose Document, which is what the service layer expects.
- Always wrap Mongoose calls in `try/catch` and throw `new AppError(message, { context })`.
- Export a **singleton instance**, not the class.

---

### Step 5 — Service (`src/lib/services/`)

The service is where all business logic lives. It receives **typed, validated data** from the handler and a **session** (`ISession | null` or `ISession` if auth is required).

**File:** `src/lib/services/event.service.ts`

```typescript
import eventRepository from "../database/repos/event.repo";
import {
    ESECs,
    ServiceSignature,
    EUserRole,
    SDOut,
    SDIn,
    APIControl,
} from "@/lib/types/index.types";
import AppError from "../utils/error";

// ── GET ──────────────────────────────────────────────────────────────────────
// RequireAuth = false: session MAY be present but is not guaranteed.
// Use this when a route is publicly accessible.
const get: ServiceSignature<
    SDIn.Event.Get,
    SDOut.Event.Get,
    false // <-- change to `true` if this action ALWAYS requires a logged-in user
> = async (data, session) => {
    let events;

    if (data.target === APIControl.Event.Get.Target.MY) {
        // Runtime check for session even though requireAuth is false.
        // This mirrors how Blog.Get.MY is handled.
        if (session === null) {
            return {
                success: false,
                errorCode: ESECs.UNAUTHORIZED,
                errorMessage: "Must be signed-in to see your events.",
            };
        }
        events = await eventRepository.findAllExportable({ author: session.userId });
    } else if (data.target === APIControl.Event.Get.Target.ALL) {
        events = await eventRepository.findAllExportable();
    } else {
        // This branch should never be reached if the validator is correct.
        // Throw AppError so the error handler logs it as an internal bug.
        throw new AppError(
            "APIControl.Event.Get.Target has an unhandled variant",
            { data }
        );
    }

    return {
        success: true,
        data: events.map((event) => ({
            ...event,
            _id: event._id.toHexString(),     // ObjectId → string
            author: {
                ...event.author,
                _id: event.author._id.toHexString(),
            },
        })),
    };
};

// ── CREATE ────────────────────────────────────────────────────────────────────
// RequireAuth = true: session is GUARANTEED non-null. The handler enforces this.
// The `session` parameter type becomes `ISession` (not `ISession | null`).
const create: ServiceSignature<
    SDIn.Event.Create,
    SDOut.Event.Create,
    true
> = async (data, session) => {
    // Role check: only MEMBERs may create an event.
    if (!session.userRoles.includes(EUserRole.MEMBER)) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only members can create an event.",
        };
    }

    // Conflict check: slug must be unique.
    const existingEvent = await eventRepository.findOne({ slug: data.slug });
    if (existingEvent) {
        return {
            success: false,
            errorCode: ESECs.SLUG_ALREADY_IN_USE,
            errorMessage: "An event with this slug already exists.",
        };
    }

    await eventRepository.insert({
        title: data.title,
        slug: data.slug,
        description: data.description,
        tags: data.tags,
        author: session.userId, // Use the session, never trust client-provided author IDs.
        coverImgUrl: data.coverImgUrl,
        eventDate: new Date(data.eventDate),
    });

    return { success: true, data: {} };
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
const update: ServiceSignature<
    SDIn.Event.Update,
    SDOut.Event.Update,
    true
> = async (data, session) => {
    const event = await eventRepository.findById(data._id);
    if (!event) {
        return {
            success: false,
            errorCode: ESECs.EVENT_NOT_FOUND, // Add EVENT_NOT_FOUND to ESECs — see Step 6.
            errorMessage: "Event not found.",
        };
    }

    // ADMIN can update anyone's event; regular MEMBER can only update their own.
    if (
        !session.userRoles.includes(EUserRole.ADMIN) &&
        event.author.toHexString() !== session.userId.toHexString()
    ) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only an admin or the author can update this event.",
        };
    }

    const { _id, ...updateDoc } = data;
    await eventRepository.updateById(_id, updateDoc);

    return { success: true, data: {} };
};

// ── REMOVE ────────────────────────────────────────────────────────────────────
const remove: ServiceSignature<
    SDIn.Event.Remove,
    SDOut.Event.Remove,
    true
> = async (data, session) => {
    const event = await eventRepository.findById(data._id);
    if (!event) {
        return {
            success: false,
            errorCode: ESECs.EVENT_NOT_FOUND,
            errorMessage: "Event not found.",
        };
    }

    if (
        !session.userRoles.includes(EUserRole.ADMIN) &&
        event.author.toHexString() !== session.userId.toHexString()
    ) {
        return {
            success: false,
            errorCode: ESECs.FORBIDDEN,
            errorMessage: "Only an admin or the author can delete this event.",
        };
    }

    await eventRepository.removeById(data._id);

    return { success: true, data: {} };
};

// Export a single default object — the handler imports named methods from this object.
const eventServices = { get, create, update, remove };

export default eventServices;
```

**Auth pattern summary:**

| Scenario | `RequireAuth` | `session` type in service | Pattern |
|---|---|---|---|
| Fully public route | `false` | `ISession \| null` | No session check needed |
| Partially public (e.g., `MY` vs `ALL`) | `false` | `ISession \| null` | Check `if (session === null)` at runtime for the guarded branch |
| Always requires login | `true` | `ISession` (non-null, enforced by handler) | Can use `session.*` directly — no null check needed |
| Requires a specific role | `true` | `ISession` | `if (!session.userRoles.includes(EUserRole.ADMIN)) { return { errorCode: ESECs.FORBIDDEN } }` |

---

### Step 6 — Centralized Imports (Registering Your New Feature)

This step involves adding your new error code and wiring up your new types. There are **exactly two files** you must update.

#### 6a. Add your error code to `ESECs` (in `service.types.ts`)

`ESECs` (Service Error Codes) is a numeric enum in `src/lib/types/service.types.ts`. Add a new entry for your feature's "not found" case. Then register it in the switch inside `src/lib/handler.ts`.

```typescript
// In: src/lib/types/service.types.ts — inside the `ESECs` enum
export enum ESECs {
    // ... existing codes ...
    MEDIA_NOT_FOUND,
    MEDIA_PUBLIC_ID_ALREADY_EXISTS,

    EVENT_NOT_FOUND, // ← Add this line
}
```

Then open `src/lib/handler.ts` and add your new code to the `serviceErrorCodeHandler` switch statement:

```typescript
// In: src/lib/handler.ts — inside serviceErrorCodeHandler's switch
case ESECs.USER_NOT_FOUND:
case ESECs.BLOG_NOT_FOUND:
case ESECs.EVENT_NOT_FOUND: // ← Add this case to the NOT_FOUND group
    return responseHandler.sendFailed(FailedResponseCodeEnum.NOT_FOUND, errorMessage);
```

#### 6b. The `index.types.ts` barrel — nothing to add

As explained in Step 2d, `index.types.ts` already re-exports `service.types.ts`, `domain.types.ts`, and `api.types.ts` via `export *`. Your new types (`IEvent`, `SDIn.Event`, `SDOut.Event`, `APIControl.Event`) are **automatically available** to any file that imports from `@/lib/types/index.types` the moment you add them to their respective source files.

> There is **no "dummy file" or manual registration step** for types — the barrel covers them. The only manual wiring is the `ESECs` enum entry and the handler switch case described above.

---

### Step 7 — API Route (`src/app/api/`)

The API route is intentionally minimal. It delegates all logic to `createHandler`. **Never put business logic here.**

Create a new directory: `src/app/api/event/`

**File:** `src/app/api/event/route.ts`

```typescript
import createHandler from '@/lib/handler';
import eventValidator from '@/lib/validators/event.validator';
import eventServices from '@/lib/services/event.service';
import { APIControl } from '@/lib/types/api.types';

// ── GET /api/event ────────────────────────────────────────────────────────────
// `requireAuth: false` — publicly accessible, but the service handles the MY target.
export const GET = createHandler({
    requireAuth: false,
    validationSchema: eventValidator.get,
    // `dataUnifier` is used when data comes from query params (GET requests)
    // rather than the request body. Parse the URL here and return a plain object
    // that matches your validator's schema.
    dataUnifier: (req) => {
        const { searchParams } = new URL(req.url);
        const target = searchParams.get('target');
        return {
            target: target ?? APIControl.Event.Get.Target.ALL,
        };
    },
    options: {
        service: eventServices.get,
    },
});

// ── POST /api/event ───────────────────────────────────────────────────────────
// `requireAuth: true` — the handler will reject the request with 401 before the
// service is ever called if there is no valid session cookie.
export const POST = createHandler({
    requireAuth: true,
    validationSchema: eventValidator.create,
    // No `dataUnifier` needed — POST body is parsed automatically from JSON.
    options: {
        service: eventServices.create,
    },
});

// ── PATCH /api/event ──────────────────────────────────────────────────────────
export const PATCH = createHandler({
    requireAuth: true,
    validationSchema: eventValidator.update,
    options: {
        service: eventServices.update,
    },
});

// ── DELETE /api/event ─────────────────────────────────────────────────────────
export const DELETE = createHandler({
    requireAuth: true,
    validationSchema: eventValidator.remove,
    options: {
        service: eventServices.remove,
    },
});
```

**`createHandler` config reference:**

| Property | Type | Required | Description |
|---|---|---|---|
| `requireAuth` | `boolean` | ✅ | If `true`, requests without a valid session cookie receive `401` before the service runs |
| `validationSchema` | `ZodSchema` | ✅ | The Zod schema from your validator — validated data is passed to the service |
| `dataUnifier` | `(req, parsedBody) => unknown` | Only for GET | Maps query params to the input shape. GET requests have no body |
| `options.service` | `ServiceSignature` | ✅ (unless using controller) | The service function to call |
| `options.successCode` | `SuccessResponseCodesEnum` | ❌ | Defaults to `200 OK`. Use `CREATED` (201) for resource-creating endpoints |
| `options.onSuccess` | `(data) => { responseData, cookies?, redirectUrl? }` | ❌ | Override the default response shape or set cookies |

---

## 3. Strict Rules & Conventions

### 3.1 File Naming

All files follow the `<feature>.<layer>.ts` pattern. Deviating from this will cause inconsistency and confusion.

| Layer | Naming Convention | Example |
|---|---|---|
| Model | `<feature>.model.ts` | `event.model.ts` |
| Repository | `<feature>.repo.ts` | `event.repo.ts` |
| Service | `<feature>.service.ts` | `event.service.ts` |
| Validator | `<feature>.validator.ts` | `event.validator.ts` |
| API Route | `src/app/api/<feature>/route.ts` | `src/app/api/event/route.ts` |

For nested endpoints (e.g., updating a single resource by ID):

```
src/app/api/event/[_id]/route.ts   → PATCH /api/event/:id
```

### 3.2 The `ServiceSignature` generic — get it right

```typescript
// Signature:
ServiceSignature<SDIn, SDOut, RequireSession extends boolean>

// RequireSession = true  → session is `ISession`       (never null, safe to use directly)
// RequireSession = false → session is `ISession | null` (must null-check before using)
```

**Never** set `RequireAuth: false` on a handler and then set `RequireSession: true` on its service — they will be type-incompatible.

### 3.3 ObjectId serialization in services

The service layer is responsible for converting `Types.ObjectId` to `string` before returning data. The API route and frontend should **never** receive a raw `Types.ObjectId`.

```typescript
// ✅ Always convert in the service's return statement
_id: event._id.toHexString(),
author: {
    _id: event.author._id.toHexString(),
},
```

### 3.4 How to call a new secure route from the frontend

All frontend HTTP calls use the global `api()` wrapper defined in `src/app/axiosApi.ts`. It handles:
- Base URL (`NEXT_PUBLIC_API_BASE_URL`)
- Credentials (session cookie) — sent automatically via `withCredentials: true`
- Response normalization to `IResponse`

**`api()` signature reference:**

```typescript
api(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    url: string,               // Relative to NEXT_PUBLIC_API_BASE_URL (e.g., "/event")
    data?: {
        body?: object;         // Sent as JSON body (POST/PATCH/DELETE)
        query?: object;        // Serialized as URL query params (GET)
    }
): Promise<IResponse>
```

`IResponse` has three variants — **always type-narrow on `action`** before accessing data:

```typescript
type IResponse =
    | { action: true;  data: object; statusCode: number }                     // Success
    | { action: false; message: string; errors: object; statusCode: number }  // Client error (4xx)
    | { action: null;  statusCode: number }                                   // Network / server failure (5xx)
```

---

#### 3.4.1 React State Typing

When you fetch data from a backend route, you **must** type your React state using the corresponding `SDOut` type from `@/lib/types/index.types`. This gives you IntelliSense on the response shape and catches mismatches at compile time.

Import `SDOut` directly from the backend type barrel — it is the single source of truth for what the API returns.

```typescript
'use client';

import { useState, useEffect } from 'react';
import api from '@/axiosApi';
// Import the SDOut namespace to type your state exactly as the service returns it.
import { SDOut } from '@/lib/types/index.types';

export default function EventListPage() {
    // ✅ Type the state strictly using SDOut — never use `any` or guess the shape.
    const [events, setEvents] = useState<SDOut.Event.GetList | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const response = await api('GET', '/event', {
                query: { target: 'all' },
            });

            if (response.action === true) {
                // `response.data` is `object` — cast it to the known SDOut type.
                setEvents(response.data as SDOut.Event.GetList);
            } else if (response.action === false) {
                setError(response.message);
            } else {
                setError('A server error occurred. Please try again.');
            }
            setLoading(false);
        };

        fetchEvents();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error)   return <p>Error: {error}</p>;

    return (
        <ul>
            {events?.map((event) => (
                // TypeScript now knows exactly what properties `event` has.
                <li key={event._id}>{event.title} — {event.slug}</li>
            ))}
        </ul>
    );
}
```

---

#### 3.4.2 Form Submissions & Zod Error Handling

When the backend's Zod validator rejects incoming data (e.g., a field is missing or too short), the server responds with `action: false` **and** an `errors` object containing per-field error messages. This is different from a service-level rejection (e.g., slug already taken), which also returns `action: false` but only has `message` — not field-level `errors`.

You must handle **both** failure modes in your form components.

```typescript
'use client';

import { useState } from 'react';
import api from '@/axiosApi';

export default function CreateEventForm() {
    // Store per-field validation errors from the Zod response.
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    // Store a top-level service error (e.g., "Slug already in use").
    const [serverError, setServerError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Reset errors before every submission attempt.
        setFieldErrors({});
        setServerError(null);

        const response = await api('POST', '/event', {
            body: {
                title: 'Annual Hackathon',
                slug: 'annual-hackathon-2026',
                description: 'Our yearly 48-hour coding marathon.',
                tags: ['hackathon', 'coding'],
                coverImgUrl: null,
                eventDate: new Date('2026-09-01').toISOString(),
            },
        });

        if (response.action === true) {
            // The request succeeded — reset the form or redirect.
            setSuccess(true);
            return;
        }

        if (response.action === false) {
            // Check for Zod validation errors first.
            // `errors` is populated by the handler when schema.safeParse() fails.
            if (response.errors && Object.keys(response.errors).length > 0) {
                // `errors` is a Record<fieldName, string[]>
                // e.g. { "title": ["String must contain at least 3 characters"] }
                setFieldErrors(response.errors as Record<string, string[]>);
            } else {
                // No field errors — this is a service-level rejection
                // (e.g., FORBIDDEN, SLUG_ALREADY_IN_USE, UNAUTHORIZED).
                // `response.message` contains a human-readable explanation.
                setServerError(response.message);
            }
            return;
        }

        // action === null → network failure or 5xx — no structured message available.
        setServerError('A server error occurred. Please try again later.');
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Display top-level service errors */}
            {serverError && <p style={{ color: 'red' }}>{serverError}</p>}

            <label>
                Title
                <input name="title" type="text" />
                {/* Display per-field Zod errors under the relevant input */}
                {fieldErrors.title?.map((msg) => (
                    <span key={msg} style={{ color: 'red' }}>{msg}</span>
                ))}
            </label>

            {success && <p style={{ color: 'green' }}>Event created!</p>}
            <button type="submit">Create Event</button>
        </form>
    );
}
```

**Rule:** Never show a raw `response.errors` dump to the user. Map each error to its corresponding input field so the user knows exactly what to fix.

---

#### 3.4.3 Dynamic URLs (Updating & Deleting)

When you are modifying or deleting a **specific** resource, the resource's `_id` must go directly into the **URL path** as a path segment — not into the `query` or `body` objects.

This is because the API route lives at `src/app/api/event/[_id]/route.ts`, where `[_id]` is a Next.js dynamic segment. The server reads it from the URL path, not from query params.

```typescript
// ✅ CORRECT — inject the _id into the URL path using a template literal.
const eventId = 'abc123def456abc123def456'; // A 24-character MongoDB ObjectId string.

// PATCH /api/event/abc123def456abc123def456
const updateResponse = await api('PATCH', `/event/${eventId}`, {
    body: {
        title: 'Annual Hackathon 2026 (Updated)',
        description: 'Updated description for the hackathon.',
    },
    // ❌ Do NOT pass _id here — the server reads it from the URL segment, not the body.
});

// DELETE /api/event/abc123def456abc123def456
const deleteResponse = await api('DELETE', `/event/${eventId}`, {
    body: {
        _id: eventId, // The DELETE validator still expects _id in the body for verification.
    },
});

if (updateResponse.action === true) {
    console.log('Event updated successfully.');
} else if (updateResponse.action === false) {
    // Could be 403 FORBIDDEN, 404 NOT_FOUND, or a Zod validation error.
    console.error(updateResponse.message);
}
```

```typescript
// ❌ WRONG — never put the resource _id in the query object for a PATCH/DELETE.
// This will fail because the dynamic route segment [_id] won't be populated.
const badResponse = await api('PATCH', '/event', {
    query: { _id: eventId }, // ← This does NOT route to /event/[_id]
    body: { title: 'Updated title' },
});
```

**Rule summary for URL construction:**

| Action | URL Pattern | `_id` location |
|---|---|---|
| List all events | `/event` | Not needed |
| Create an event | `/event` | Not needed (author from session) |
| Update a specific event | `` `/event/${eventId}` `` | URL path segment |
| Delete a specific event | `` `/event/${eventId}` `` | URL path segment |

---

### 3.5 Where does the Frontend Code go?

When you are ready to build the UI, your React components must go inside the App Router's route groups. Do not put UI components in the `api` folder.

* **Standard Pages:** `src/app/(routes)/[feature-name]/page.tsx`
* **Dynamic Pages (e.g., Edit Event):** `src/app/(routes)/[feature-name]/[id]/page.tsx`

## 4. Complete Checklist for a New Feature

Copy this checklist into your PR description and check off each item.

### Backend
- [ ] Step 1: Created `src/lib/database/models/<feature>.model.ts`
- [ ] Step 2a: Added `I<Feature>` and `I<Feature>Exportable` to `domain.types.ts`
- [ ] Step 2b: Added `APIControl.<Feature>.Get.Target` enum to `api.types.ts`
- [ ] Step 2c: Added `SDIn.<Feature>.*` and `SDOut.<Feature>.*` to `service.types.ts`
- [ ] Step 3: Created `src/lib/validators/<feature>.validator.ts`
- [ ] Step 4: Created `src/lib/database/repos/<feature>.repo.ts`
- [ ] Step 5: Created `src/lib/services/<feature>.service.ts`
- [ ] Step 6a: Added `<FEATURE>_NOT_FOUND` to `ESECs` enum in `service.types.ts`
- [ ] Step 6b: Added `ESECs.<FEATURE>_NOT_FOUND` case to switch in `src/lib/handler.ts`
- [ ] Step 7: Created `src/app/api/<feature>/route.ts`

### Frontend & Verification
- [ ] Created UI Component in `src/app/(routes)/<feature>/page.tsx`
- [ ] GET endpoint tested (public)
- [ ] POST endpoint tested (with valid session cookie)
- [ ] POST endpoint rejects unauthenticated requests with 401
- [ ] POST endpoint rejects insufficient roles with 403
- [ ] Duplicate slug/conflict returns 409
- [ ] Missing resource returns 404
- [ ] Zod validation field errors map cleanly to the frontend UI inputs