# Auth User Flow

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


