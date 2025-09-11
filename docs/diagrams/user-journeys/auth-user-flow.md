# Auth User Flow

High‑level guide to how users enter authentication flows from UI buttons and where they land. Detailed flows are split into focused diagrams for readability and troubleshooting.

## Buttons → Flows

| Button               | Route              | Flow Diagram                                    |
| -------------------- | ------------------ | ----------------------------------------------- |
| Login                | /login             | `user-journeys:auth:sign-in-up`                 |
| Sign up              | /signup            | `user-journeys:auth:sign-in-up`                 |
| Continue with Google | /login → OAuth     | `user-journeys:auth:oauth-callback`             |
| Invite link          | /invite/[leagueId] | `user-journeys:auth:invite-join-and-draft-room` |
| Join League          | /league/join       | `user-journeys:auth:invite-join-and-draft-room` |
| DRAFT ROOM           | /draft/[leagueId]  | `user-journeys:auth:invite-join-and-draft-room` |
| Admin                | /admin             | `user-journeys:auth:sign-in-up` (guarded)       |

## Guards & Redirects (authoritative)

- Protected routes redirect to `/login?returnTo=…` when no session.
- OAuth callback establishes session, then redirects to `returnTo` or `/dashboard`.
- Admin access: allowlist (e.g., `kashpm2002@gmail.com`).
- Draft Room: visible 1h before → active → hidden 3h after; commissioner override.

## Map of sub‑flows

```mermaid
flowchart TD
  A([Start]) --> B{Entry Point}
  B -->|/login or /signup| S1[Auth — Sign In/Up]
  B -->|Google OAuth| S2[Auth — OAuth Callback]
  %% Mermaid link labels do not like square brackets; use :leagueId for legibility
  B -->|/invite/:leagueId or /league/join or /draft/:leagueId| S3[Auth — Invite/Join & Draft Room]

  S1 --> E[Session Ready]
  S2 --> E
  S3 --> E
  E --> R[Redirect to returnTo or /dashboard]
```

## Notes

- Diagrams use swimlanes for User | App (Next.js) | Appwrite | External.
- Edge labels are verbs; dashed lines indicate async operations.
- Keep diagrams ≤ ~80 nodes and readable on one screen.

1. Visit login → choose provider (email, Google)
2. Authenticate → Appwrite session cookie set
3. Redirect to dashboard or intended page
4. Session refresh on navigation; logout clears session

Related: ../overview/auth.md

```mermaid
flowchart LR
  %% === Classes (shared standard) ===
  classDef legend fill:#F3F4F6,stroke:#CBD5E1,color:#111827,rx:6,ry:6;
  classDef terminator fill:#93C5FD,stroke:#1D4ED8,stroke-width:2,color:#0B1020,rx:12,ry:12;
  classDef decision fill:#EDE9FE,stroke:#7C3AED,stroke-width:2,color:#111827;
  classDef process fill:#E5E7EB,stroke:#6B7280,color:#111827;

  %% === Legend ===
  subgraph L[Journey flow key]
    direction LR
    leg1([Terminator]):::terminator
    leg2{Decision}:::decision
    leg3[Process]:::process
  end

  %% === Flow: Auth — Login or Sign‑Up ===
  A([Log in or sign up]):::terminator --> B{Already signed up?}:::decision
  B -- Yes --> C[Enter email address]:::process --> D[Enter password]:::process --> E([Continue]):::terminator
  B -- No --> F[Set up free account]:::process --> G[Enter name]:::process --> C
```
