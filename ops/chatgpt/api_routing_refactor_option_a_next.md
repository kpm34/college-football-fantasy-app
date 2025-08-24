# API Routing Refactor – Option A (Next.js App Router)

Organize `app/api` by **purpose**—without changing public URLs—using **Route Groups**. This keeps `/api/*` paths stable while giving you clean, enforceable boundaries for Frontend, Backend, and External endpoints.

---

## 1) Target Directory Structure

```
app/
  api/
    (frontend)/            # Endpoints triggered by UI (user-facing)
      users/
        route.ts
      teams/
        route.ts
      lineups/
        route.ts

    (backend)/             # Internal/system endpoints (jobs, webhooks, ingest)
      ingest/
        route.ts
      jobs/
        route.ts
      webhooks/
        vercel/
          route.ts
        appwrite/
          route.ts

    (external)/            # Proxies/clients for 3rd parties (data/features)
      espn/
        players/
          route.ts
      twentyfourseven/
        recruiting/
          route.ts
      openai/
        embeddings/
          route.ts

    _lib/                  # Shared utilities used by all groups
      auth.ts
      http.ts
      errors.ts
      schema.ts
      cache.ts
      logger.ts
      clients/
        espn.ts
        twentyfourseven.ts
        openai.ts

    README.md              # High-level index and conventions
```

> **Route Groups** like `(frontend)` are invisible in URLs. `app/api/(frontend)/users/route.ts` still serves `/api/users`.

---

## 2) Step-by-Step Migration (Safe & Reversible)

1. **Create route groups:** `(frontend)`, `(backend)`, `(external)` under `app/api/`.
2. **Move existing route folders** into the right group **without renaming the leaf** (so URLs remain the same).
   - `app/api/users/route.ts` → `app/api/(frontend)/users/route.ts`
   - `app/api/ingest/route.ts` → `app/api/(backend)/ingest/route.ts`
   - `app/api/espn/players/route.ts` → `app/api/(external)/espn/players/route.ts`
3. **Add **`` and copy the scaffolds below (auth/http/errors/schema/cache/logger/clients).
4. **Refactor imports** in route files to use `_lib` (e.g., `import { ok } from "@/app/api/_lib/http"`).
5. **Harden boundaries:**
   - `(frontend)`: require user session.
   - `(backend)`: require internal key/HMAC.
   - `(external)`: forbid direct `fetch` to 3rd parties; go through `_lib/clients/*` wrappers only.
6. **Run locally** and hit top endpoints; confirm identical URLs/status codes/payload shapes.
7. **Add smoke tests** (schema parsing + 200/401, see below) and merge.

---

## 3) Route Templates

### 3.1 Frontend route (UI-triggered)

```ts
// app/api/(frontend)/users/route.ts
import { z } from "zod";
import { requireSession } from "@/app/api/_lib/auth";
import { ok, badRequest } from "@/app/api/_lib/http";
import { log } from "@/app/api/_lib/logger";

const Query = z.object({ q: z.string().optional() });

export async function GET(request: Request) {
  const user = await requireSession(request); // 401 if not authenticated
  const { searchParams } = new URL(request.url);
  const parsed = Query.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return badRequest(parsed.error);

  log("frontend.users.list", { userId: user.id, q: parsed.data.q });
  // TODO: fetch user-facing data
  return ok({ userId: user.id, results: [] });
}
```

### 3.2 Backend route (internal job/webhook)

```ts
// app/api/(backend)/ingest/route.ts
import { requireInternal } from "@/app/api/_lib/auth";
import { ok } from "@/app/api/_lib/http";
import { log } from "@/app/api/_lib/logger";

export async function POST(request: Request) {
  await requireInternal(request); // 401 if x-internal-key invalid
  log("backend.ingest.run");
  // TODO: perform ingest work
  return ok({ status: "started" });
}
```

### 3.3 External route (third-party proxy)

```ts
// app/api/(external)/espn/players/route.ts
import { z } from "zod";
import { ok, badGateway, badRequest } from "@/app/api/_lib/http";
import { espnClient } from "@/app/api/_lib/clients/espn";

const Query = z.object({ teamId: z.string() });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = Query.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) return badRequest(parsed.error);

  const { teamId } = parsed.data;
  const resp = await espnClient.getPlayers({ teamId });
  if (!resp.ok) return badGateway("ESPN unavailable");
  return ok(resp.data);
}
```

---

## 4) `_lib` Updates (Add/Replace as Needed)

> Drop these files into `app/api/_lib/`. They are thin, dependency-light, and safe to evolve.

### 4.1 `auth.ts`

```ts
// app/api/_lib/auth.ts

// Example session gate (swap for your actual auth/session provider)
export async function requireSession(request: Request): Promise<{ id: string }>
{
  // TODO: integrate with your Auth (Appwrite/NextAuth/custom)
  // Throw 401 Response on failure to keep handlers simple
  const authorized = true; // replace with real check
  if (!authorized) throw new Response("Unauthorized", { status: 401 });
  return { id: "user_123" };
}

export function requireInternal(request: Request) {
  const key = request.headers.get("x-internal-key");
  if (!key || key !== process.env.INTERNAL_API_KEY) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
```

### 4.2 `http.ts`

```ts
// app/api/_lib/http.ts
import { ZodError } from "zod";

export function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json" },
    ...init,
  });
}

export const ok = (data: unknown) => json({ ok: true, data }, { status: 200 });
export const created = (data: unknown) => json({ ok: true, data }, { status: 201 });
export const badRequest = (err: unknown) =>
  json({ ok: false, error: serializeErr(err) }, { status: 400 });
export const unauthorized = () => json({ ok: false, error: "unauthorized" }, { status: 401 });
export const forbidden = () => json({ ok: false, error: "forbidden" }, { status: 403 });
export const notFound = (msg = "not found") => json({ ok: false, error: msg }, { status: 404 });
export const badGateway = (msg = "upstream error") => json({ ok: false, error: msg }, { status: 502 });
export const error = (err: unknown, status = 500) => json({ ok: false, error: serializeErr(err) }, { status });

function serializeErr(err: unknown) {
  if (!err) return "unknown";
  if (err instanceof ZodError) return err.flatten();
  if (err instanceof Error) return { name: err.name, message: err.message };
  if (typeof err === "string") return err;
  return "unknown";
}
```

### 4.3 `errors.ts`

```ts
// app/api/_lib/errors.ts
export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export class UpstreamError extends AppError {
  constructor(message = "Upstream service error", status = 502) {
    super(message, status);
  }
}
```

### 4.4 `schema.ts`

```ts
// app/api/_lib/schema.ts
export * as z from "zod";
// Optionally export common schemas here
// export const Id = z.string().min(1);
```

### 4.5 `cache.ts`

```ts
// app/api/_lib/cache.ts

// Minimal fetch wrapper with retry + (optional) Next.js caching hints
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit = {},
  { retries = 2, backoffMs = 200 }: { retries?: number; backoffMs?: number } = {}
) {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(input, init);
      return res;
    } catch (e) {
      lastErr = e;
      if (i < retries) await new Promise(r => setTimeout(r, backoffMs * (i + 1)));
    }
  }
  throw lastErr;
}
```

### 4.6 `logger.ts`

```ts
// app/api/_lib/logger.ts
export function log(event: string, payload?: unknown) {
  try {
    // Replace with your logger/telemetry
    console.log(`[api] ${event}`, payload ?? "");
  } catch {}
}
```

### 4.7 `clients/espn.ts` (pattern for all clients)

```ts
// app/api/_lib/clients/espn.ts
import { fetchWithRetry } from "@/app/api/_lib/cache";

const ESPN_BASE = "https://site.api.espn.com"; // example

async function getJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; error: string }>{
  const res = await fetchWithRetry(url, { method: "GET" });
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  const data = (await res.json()) as T;
  return { ok: true, data };
}

export const espnClient = {
  async getPlayers({ teamId }: { teamId: string }) {
    const url = `${ESPN_BASE}/apis/v3/sports/football/college-football/teams/${teamId}/roster`;
    return getJson<any>(url);
  },
};
```

> **Rule of thumb:** all third‑party requests live in `_lib/clients/*`. Routes import these clients; no route should call external `fetch` directly.

---

## 5) Testing (lightweight but useful)

- **Schema tests:** verify your `zod` parses for common/edge cases.
- **Auth guards:** ensure `(frontend)` 401s without session and `(backend)` 401s without internal key.
- **Contract tests:** snapshot the JSON shapes for top endpoints.

Example (Jest/Vitest pseudo):

```ts
import { badRequest, ok } from "@/app/api/_lib/http";

test("ok() wraps payload", async () => {
  const res = ok({ a: 1 });
  expect(res.status).toBe(200);
});
```

---

## 6) Lint/CI Guardrails

**.eslintrc.cjs** (example rule via comments/grep in CI if you don’t want a custom rule):

```js
module.exports = {
  rules: {
    // Disallow direct external fetch in routes (enforce using clients/*)
    // You can implement with eslint-plugin-path or a custom rule; or use CI grep to fail PRs.
  },
};
```

**CI (Danger.js or simple script):**

- Fail if files under `app/api/(external)/**/route.ts` import any URL literal (e.g., `/^https?:\/\//`).
- Fail if any `route.ts` imports from outside `@/app/api/_lib` for client calls.

---

## 7) README.md (conventions)

```
# app/api conventions

- (frontend): endpoints initiated by UI; must require session.
- (backend): internal jobs/webhooks; require x-internal-key or signature.
- (external): proxy layer for third-party services; **no direct fetch in routes**.
- _lib/: shared helpers; add clients/* wrappers for each integration.
- Responses: use http.ts helpers for consistent shapes.
```

---

## 8) Optional: Git moves (batch)

```bash
# Example moves (adjust to your actual routes)
git mv app/api/users app/api/(frontend)/users
git mv app/api/teams app/api/(frontend)/teams

git mv app/api/ingest app/api/(backend)/ingest
git mv app/api/webhooks app/api/(backend)/webhooks

git mv app/api/espn app/api/(external)/espn
```

---

### Done

- URLs remain unchanged.
- Purpose-driven folders improve discoverability and security.
- `_lib` centralizes auth, HTTP, errors, caching, logging, and third‑party clients.

