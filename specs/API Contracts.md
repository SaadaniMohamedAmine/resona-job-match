# Résona — API Contracts

| | |
|---|---|
| **Base URL** | `/api` (Next.js Route Handlers, same origin as the app) |
| **Format** | JSON (`Content-Type: application/json`) |
| **Last updated** | 2026-07-16 |
| **Related docs** | [Architecture.md](./Architecture.md) · [Data Models.md](./Data%20Models.md) |

---

## 1. Conventions

- All authenticated endpoints require a valid NextAuth session cookie — there is no separate API token/bearer-auth scheme in v1 (the API is consumed by Résona's own frontend, not exposed as a public developer API).
- All request/response bodies are JSON.
- All timestamps are ISO 8601 strings.
- All endpoints that mutate or read user-owned data re-verify `resource.userId === session.user.id` server-side before proceeding — never trust an ID in the URL alone.

### Standard error shape

Every error response (any non-2xx) follows this shape:

```json
{
  "error": "Human-readable message, or a zod flatten() object for validation errors"
}
```

| Status | Meaning |
|---|---|
| `400` | Validation failed (malformed/missing fields) |
| `401` | No valid session |
| `404` | Resource not found, or found but not owned by the current user (same response either way — do not leak existence) |
| `409` | Conflict (e.g. email already registered) |
| `429` | Rate limit exceeded |
| `500` | Unhandled server error (captured in Sentry) |

## 2. Authentication

Handled by NextAuth v5 at `app/api/auth/[...nextauth]/route.ts` (catch-all — do not document as a conventional REST resource). Supported flows:

- **Credentials:** `POST` via NextAuth's internal `signIn("credentials", { email, password })` client call — not a hand-rolled endpoint.
- **OAuth:** Google and LinkedIn, initiated via `signIn("google" | "linkedin")`.
- **Registration** (credentials only — OAuth users don't need this) is a dedicated endpoint, since NextAuth itself has no "create account" concept:

### `POST /api/register`

Creates a new credentials-based user. Does not log the user in — the client calls `signIn("credentials", …)` immediately after a successful response.

**Auth required:** No

**Request:**
```json
{ "email": "user@example.com", "password": "at-least-8-chars" }
```

**Response `200`:**
```json
{ "id": "clx1a2b3c..." }
```

**Errors:** `400` (validation), `409` (email already in use)

## 3. Resumes & Analysis

### `POST /api/analyze`

The core endpoint. Extracts the resume text, runs the GPT-4o analysis, generates and stores embeddings, and persists `Resume`, `JobPost`, and `Analysis` records.

**Auth required:** Yes
**Rate limit:** Yes — plan-aware (Free: 3/30 days, Pro: 200/30 days), keyed on `userId`

**Request:**
```json
{
  "fileUrl": "https://uploadthing.com/f/abc123.pdf",
  "fileName": "resume.pdf",
  "jobTitle": "Senior Frontend Engineer",
  "company": "Acme Corp",
  "jobDescription": "We are looking for a Senior Frontend Engineer with React and TypeScript experience..."
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `fileUrl` | string (URL) | Yes | Must be a valid, already-uploaded UploadThing file URL |
| `fileName` | string | Yes | |
| `jobTitle` | string | Yes | |
| `company` | string | No | |
| `jobDescription` | string | Yes | Min 50 characters |

**Response `200`:**
```json
{
  "analysisId": "clx9z8y7...",
  "matchScore": 87,
  "matchingSkills": ["React", "TypeScript", "Next.js"],
  "missingSkills": ["GraphQL", "Kubernetes"],
  "suggestions": [
    { "section": "summary", "issue": "Too generic", "recommendation": "Lead with your React/TS specialization" }
  ]
}
```

**Errors:** `400` (validation), `401`, `429` (quota exceeded — message is user-facing: "You've reached your analysis limit for today.")

---

### `GET /api/resumes`

Lists all of the current user's analyses (name notwithstanding — this returns `Analysis` records with their related `Resume`/`JobPost`, not raw resume files, since that's what the Resume History page actually needs).

**Auth required:** Yes

**Response `200`:**
```json
{
  "analyses": [
    {
      "id": "clx9z8y7...",
      "matchScore": 87,
      "createdAt": "2026-07-10T14:32:00.000Z",
      "resume": { "id": "...", "fileName": "resume.pdf" },
      "jobPost": { "id": "...", "title": "Senior Frontend Engineer", "company": "Acme Corp" }
    }
  ]
}
```

---

### `DELETE /api/resumes/{id}`

Deletes a resume (and, via cascade, its analyses).

**Auth required:** Yes

**Response `200`:**
```json
{ "success": true }
```

**Errors:** `401`, `404` (not found or not owned)

## 4. Rewriting

### `POST /api/rewrite`

**Auth required:** Yes
**Plan gating:** Pro only — enforce in the route handler; return `403` with a clear upgrade message for Free users attempting this (not currently itemized in the Phase 2 delegation code — add this check during implementation, see note below).

**Request:**
```json
{
  "analysisId": "clx9z8y7...",
  "section": "summary",
  "originalText": "Experienced frontend developer with a passion for clean code..."
}
```

| Field | Type | Notes |
|---|---|---|
| `analysisId` | string | Must belong to the requesting user |
| `section` | `"summary"` \| `"experience"` \| `"skills"` | |
| `originalText` | string | The section text to rewrite |

**Response `200`:**
```json
{ "rewritten": "Senior frontend engineer with 6 years building React/TypeScript products at scale..." }
```

**Errors:** `400`, `401`, `404` (analysis not found/not owned)

> **Implementation note:** the Phase 2 delegation doc's reference implementation does not yet enforce the Pro-only gate on this route — Phase 4 introduces the `Plan` field but the gate itself must be added to `app/api/rewrite/route.ts` and `app/api/cover-letter/route.ts` during Phase 4 implementation. Flagging explicitly here so it isn't missed.

## 5. Cover Letters

### `POST /api/cover-letter`

**Auth required:** Yes
**Plan gating:** Pro only (same note as above)

**Request:**
```json
{ "analysisId": "clx9z8y7..." }
```

**Response `200`:**
```json
{ "coverLetter": "Dear Hiring Manager,\n\nI'm writing to apply for the Senior Frontend Engineer role at Acme Corp..." }
```

**Errors:** `400`, `401`, `404`

## 6. Applications (Tracker)

### `GET /api/applications`

**Auth required:** Yes

**Response `200`:**
```json
{
  "applications": [
    {
      "id": "clxa1b2...",
      "company": "Acme Corp",
      "role": "Senior Frontend Engineer",
      "status": "INTERVIEW",
      "appliedAt": "2026-07-01T09:00:00.000Z",
      "analysis": { "id": "clx9z8y7...", "matchScore": 87 }
    }
  ]
}
```

---

### `POST /api/applications`

**Auth required:** Yes

**Request:**
```json
{ "company": "Globex", "role": "Frontend Lead", "analysisId": "clx9z8y7..." }
```

`analysisId` is optional — an application can be tracked without ever having run an analysis.

**Response `200`:**
```json
{ "application": { "id": "clxb3c4...", "company": "Globex", "role": "Frontend Lead", "status": "APPLIED" } }
```

**Errors:** `400`, `401`

---

### `PATCH /api/applications/{id}`

Used by the kanban board when a card moves columns.

**Auth required:** Yes

**Request:**
```json
{ "status": "INTERVIEW" }
```

`status` must be one of `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`.

**Response `200`:**
```json
{ "application": { "id": "clxb3c4...", "status": "INTERVIEW", "updatedAt": "2026-07-16T10:00:00.000Z" } }
```

**Errors:** `400`, `401`, `404`

---

### `DELETE /api/applications/{id}`

**Auth required:** Yes

**Response `200`:**
```json
{ "success": true }
```

**Errors:** `401`, `404`

## 7. Billing

### `POST /api/stripe/checkout`

Creates (or reuses) a Stripe customer for the current user and starts a Checkout Session for the Pro plan.

**Auth required:** Yes

**Request:** empty body

**Response `200`:**
```json
{ "url": "https://checkout.stripe.com/c/pay/cs_test_..." }
```

The client redirects the browser to `url`.

---

### `POST /api/stripe/webhook`

Stripe → Résona server-to-server event delivery. Not called by the frontend.

**Auth required:** No session auth — authenticated instead via Stripe signature verification (`stripe-signature` header + `STRIPE_WEBHOOK_SECRET`).

**Handled events:**

| Event | Effect |
|---|---|
| `checkout.session.completed` | Creates/updates `Subscription`, sets `User.plan = PRO` |
| `customer.subscription.deleted` | Sets `Subscription.status = "canceled"`, `User.plan = FREE` |

**Response:** `{ "received": true }` on success, `400` on invalid signature.

---

### `POST /api/stripe/portal`

Redirects the user into Stripe's hosted customer portal to manage/cancel their subscription.

**Auth required:** Yes

**Response:** `302` redirect to the Stripe portal URL.

**Errors:** `401`, `404` (no subscription on file)

## 8. Rate Limiting Reference

| Scope | Limit | Window | Backing store |
|---|---|---|---|
| `/api/analyze` — Free plan | 3 requests | 30 days | Upstash Redis, keyed `resona:analyze:free:{userId}` |
| `/api/analyze` — Pro plan | 200 requests | 30 days | Upstash Redis, keyed `resona:analyze:pro:{userId}` |
| General API (all routes, safety net) | 30 requests | 1 minute | Upstash Redis, keyed `resona:api:{userId}` — not yet wired into individual routes in the Phase 2 reference code beyond `/api/analyze`; apply `globalApiLimiter` (defined in `lib/rate-limit.ts`) to the remaining mutating routes during implementation. |

A `429` response always includes a plain-language `error` message — never a bare status code with no explanation, consistent with the product's "reassuring expert" voice even in failure states.
